'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

const SQL_CREATE_TABLE = `
CREATE TABLE IF NOT EXISTS devoluciones_qa (
  id_devolucion SERIAL PRIMARY KEY,
  id_despacho INTEGER NOT NULL REFERENCES despachos_logisticos(id_despacho) ON DELETE RESTRICT,
  id_lote INTEGER REFERENCES lote_produccion(id_lote) ON DELETE SET NULL,
  id_asesor INTEGER NOT NULL REFERENCES usuarios(id_usuario),
  motivo_rechazo TEXT NOT NULL,
  kilos_devueltos DECIMAL(10,2) NOT NULL CHECK (kilos_devueltos > 0),
  requiere_reposicion BOOLEAN NOT NULL DEFAULT false,
  id_pedido_reposicion INTEGER REFERENCES pedidos_ventas(id_pedido) ON DELETE SET NULL,
  estado_devolucion VARCHAR(20) NOT NULL DEFAULT 'Registrada' CHECK (estado_devolucion IN ('Registrada','Procesada','Cerrada')),
  observaciones TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW()
);
`

export async function asegurarTablaDevoluciones() {
  try {
    const admin = createAdminClient()
    const { error } = await admin.rpc('exec_sql', { sql: SQL_CREATE_TABLE })
    if (error) {
      const { error: err2 } = await admin.from('devoluciones_qa').select('id_devolucion').limit(1)
      if (err2 && err2.message?.includes('relation') && err2.message?.includes('does not exist')) {
        return { success: false, error: 'No se pudo crear la tabla. Ejecute el SQL manualmente.' }
      }
    }
    return { success: true }
  } catch (e) {
    return { success: false, error: e.message }
  }
}

export async function obtenerDespachosEntregados(filtros = {}) {
  const supabase = await createClient()
  try {
    let query = supabase
      .from('despachos_logisticos')
      .select(`
        id_despacho, placa_camion, nombre_chofer, temperatura_salida, fecha_despacho,
        pedidos_ventas!inner(
          id_pedido, estado_reserva, total_pedido, fecha_reserva,
          clientes!inner(id_cliente, razon_social, nit_facturacion)
        )
      `)
      .in('pedidos_ventas.estado_reserva', ['Entregado_Completo', 'En_Despacho'])

    if (filtros.desde) query = query.gte('fecha_despacho', filtros.desde)
    if (filtros.hasta) query = query.lte('fecha_despacho', filtros.hasta + 'T23:59:59Z')
    if (filtros.cliente) {
      query = query.ilike('pedidos_ventas.clientes.razon_social', `%${filtros.cliente}%`)
    }

    const { data } = await query.order('fecha_despacho', { ascending: false }).limit(50)
    return { success: true, data: data || [] }
  } catch (err) {
    return { success: false, error: err.message, data: [] }
  }
}

export async function obtenerLotesDelDespacho(idDespacho) {
  const supabase = await createClient()
  const { data } = await supabase
    .from('movimientos_kardex')
    .select(`
      id_log, id_lote, id_item, cantidad_kilos, concepto_operacion,
      lote_produccion!inner(id_lote, codigo_lote, fecha_vencimiento, fecha_fabricacion),
      catalogo_items!inner(id_item, nombre_producto, codigo_sku, unidad_medida)
    `)
    .eq('id_orden_asociada', idDespacho)
    .eq('tipo_operacion', 'OUT')
    .contains('concepto_operacion', '[DESPACHO]')

  return (data || []).filter((m) => m.lote_produccion)
}

export async function obtenerDetallePedidoOriginal(idPedido) {
  const supabase = await createClient()
  const { data } = await supabase
    .from('detalle_pedidos')
    .select('id_detalle, id_item, cantidad_pedida, precio_unitario, catalogo_items(id_item, codigo_sku, nombre_producto, unidad_medida)')
    .eq('id_pedido', idPedido)
  return data || []
}

export async function obtenerDevoluciones(page = 1, pageSize = 20, filtros = {}) {
  const supabase = await createClient()
  try {
    let query = supabase
      .from('devoluciones_qa')
      .select(`
        *,
        despachos_logisticos!inner(id_despacho, placa_camion, nombre_chofer, fecha_despacho,
          pedidos_ventas!inner(id_pedido, estado_reserva,
            clientes!inner(id_cliente, razon_social, nit_facturacion))),
        lote_produccion(id_lote, codigo_lote, fecha_vencimiento)
      `, { count: 'exact' })

    if (filtros.estado) query = query.eq('estado_devolucion', filtros.estado)
    if (filtros.desde) query = query.gte('created_at', filtros.desde)
    if (filtros.hasta) query = query.lte('created_at', filtros.hasta + 'T23:59:59Z')
    if (filtros.id_cliente) query = query.eq('despachos_logisticos.pedidos_ventas.id_cliente', parseInt(filtros.id_cliente))

    const from = (page - 1) * pageSize
    const { data, error, count } = await query.order('created_at', { ascending: false }).range(from, from + pageSize - 1)
    if (error) throw error
    return { success: true, data: data || [], total: count || 0 }
  } catch (err) {
    return { success: false, error: err.message, data: [], total: 0 }
  }
}

export async function registrarDevolucion({
  id_despacho, id_lote, motivo_rechazo, kilos_devueltos,
  requiere_reposicion, observaciones,
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'No autenticado' }

  const { data: u } = await supabase
    .from('usuarios')
    .select('id_usuario')
    .eq('auth_uid', user.id)
    .maybeSingle()
  if (!u) return { success: false, error: 'Usuario no vinculado' }

  try {
    // E1: validar despacho
    const { data: despacho } = await supabase
      .from('despachos_logisticos')
      .select('id_despacho, id_pedido, pedidos_ventas!inner(estado_reserva)')
      .eq('id_despacho', id_despacho)
      .single()
    if (!despacho) return { success: false, error: 'Despacho no encontrado — E6' }

    const estadoPedido = despacho.pedidos_ventas?.estado_reserva
    if (!['Entregado_Completo', 'En_Despacho'].includes(estadoPedido)) {
      return { success: false, error: `No es posible registrar devoluciones sobre despachos en estado ${estadoPedido}. — E1` }
    }

    // E3: validar motivo
    if (!motivo_rechazo || motivo_rechazo.trim().length < 5) {
      return { success: false, error: 'El motivo de rechazo debe tener al menos 5 caracteres. — E3' }
    }

    // E2 + E4: validar kilos
    const kilos = parseFloat(kilos_devueltos)
    if (isNaN(kilos) || kilos <= 0) {
      return { success: false, error: 'Los kilos devueltos deben ser un número positivo.' }
    }

    // Calcular entregado desde kardex
    const { data: movs } = await supabase
      .from('movimientos_kardex')
      .select('cantidad_kilos')
      .eq('id_orden_asociada', id_despacho)
      .eq('tipo_operacion', 'OUT')
      .contains('concepto_operacion', '[DESPACHO]')

    const totalEntregado = (movs || []).reduce((s, m) => s + Math.abs(parseFloat(m.cantidad_kilos || 0)), 0)
    if (kilos > totalEntregado) {
      return { success: false, error: `Los kilos devueltos (${kilos.toFixed(2)}) exceden la cantidad entregada (${totalEntregado.toFixed(2)}). — E2` }
    }

    // E4: si id_lote, verificar total previamente devuelto
    if (id_lote) {
      const { data: previas } = await supabase
        .from('devoluciones_qa')
        .select('kilos_devueltos')
        .eq('id_despacho', id_despacho)
        .eq('id_lote', id_lote)

      const previoDevuelto = (previas || []).reduce((s, d) => s + parseFloat(d.kilos_devueltos), 0)
      if (previoDevuelto + kilos > totalEntregado) {
        return {
          success: false,
          error: `El lote ya fue parcialmente devuelto (${previoDevuelto.toFixed(2)} kg previos). Total: ${(previoDevuelto + kilos).toFixed(2)} kg supera lo entregado. — E4`
        }
      }
    }

    // Insertar devolución
    const { data: devolucion, error: devError } = await supabase
      .from('devoluciones_qa')
      .insert({
        id_despacho,
        id_lote: id_lote || null,
        id_asesor: u.id_usuario,
        motivo_rechazo: motivo_rechazo.trim(),
        kilos_devueltos: kilos,
        requiere_reposicion,
        observaciones: observaciones || '',
        estado_devolucion: 'Registrada',
      })
      .select('id_devolucion')
      .single()
    if (devError) throw devError

    // Kardex: entrada por devolución
    const { data: loteInfo } = id_lote
      ? await supabase.from('lote_produccion').select('id_item, codigo_lote').eq('id_lote', id_lote).single()
      : { data: null }

    await supabase.from('movimientos_kardex').insert({
      id_item: loteInfo?.id_item || null,
      id_lote: id_lote || null,
      id_orden_asociada: devolucion.id_devolucion,
      id_usuario: u.id_usuario,
      tipo_operacion: 'DEVOLUCION',
      cantidad_kilos: kilos,
      concepto_operacion: loteInfo
        ? `[DEVOLUCION] Despacho #${id_despacho} — Lote: ${loteInfo.codigo_lote} — Dev #${devolucion.id_devolucion}`
        : `[DEVOLUCION] Despacho #${id_despacho} — Lote no identificado — Dev #${devolucion.id_devolucion}`,
    })

    let idPedidoReposicion = null

    // Reposición caliente
    if (requiere_reposicion) {
      const { data: pedido } = await supabase
        .from('pedidos_ventas')
        .select('id_cliente, id_vendedor, metodo_pago, fecha_entrega_programada')
        .eq('id_pedido', despacho.id_pedido)
        .single()

      const lineasOrig = await obtenerDetallePedidoOriginal(despacho.id_pedido)
      if (!lineasOrig || lineasOrig.length === 0) {
        return { success: false, error: 'No se encontraron líneas del pedido original para generar reposición.' }
      }

      // Calcular total del nuevo pedido (mismos precios, cantidades originales)
      let totalReposicion = 0
      for (const linea of lineasOrig) {
        totalReposicion += parseFloat(linea.cantidad_pedida) * parseFloat(linea.precio_unitario)
      }

      const { data: nuevoPedido, error: pedError } = await supabase
        .from('pedidos_ventas')
        .insert({
          id_cliente: pedido.id_cliente,
          id_vendedor: pedido.id_vendedor,
          metodo_pago: pedido.metodo_pago || 'Efectivo',
          fecha_reserva: new Date().toISOString(),
          fecha_entrega_programada: pedido.fecha_entrega_programada || new Date(Date.now() + 86400000 * 3).toISOString(),
          total_pedido: totalReposicion,
          estado_reserva: 'Pendiente',
          observaciones: `REPOSICIÓN CALIENTE — Dev #${devolucion.id_devolucion} — Cliente solicitó reemplazo inmediato`,
        })
        .select('id_pedido')
        .single()
      if (pedError) throw pedError

      idPedidoReposicion = nuevoPedido.id_pedido

      // Copiar líneas de detalle
      for (const linea of lineasOrig) {
        const { error: detError } = await supabase.from('detalle_pedidos').insert({
          id_pedido: nuevoPedido.id_pedido,
          id_item: linea.id_item,
          cantidad_pedida: parseFloat(linea.cantidad_pedida),
          precio_unitario: parseFloat(linea.precio_unitario),
        })
        if (detError) throw detError
      }

      // Actualizar devolución con id_pedido_reposicion
      await supabase.from('devoluciones_qa').update({ id_pedido_reposicion: idPedidoReposicion }).eq('id_devolucion', devolucion.id_devolucion)
    }

    // Bitácora
    await supabase.from('bitacora_auditoria').insert({
      id_usuario: u.id_usuario,
      accion_sql: 'INSERT',
      tabla_afectada: 'devoluciones_qa',
      registro_id: devolucion.id_devolucion,
      new_data: {
        accion: 'Devolución registrada',
        id_despacho,
        kilos_devueltos: kilos,
        requiere_reposicion,
        id_pedido_reposicion,
        motivo: motivo_rechazo.trim(),
      }
    })

    return {
      success: true,
      id_devolucion: devolucion.id_devolucion,
      id_pedido_reposicion,
      con_reposicion: requiere_reposicion,
    }
  } catch (err) {
    return { success: false, error: err.message }
  }
}
