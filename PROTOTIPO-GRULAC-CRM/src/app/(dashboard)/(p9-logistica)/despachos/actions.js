'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

const SQL_CREATE_TABLE = `
CREATE TABLE IF NOT EXISTS despachos_logisticos (
  id_despacho SERIAL PRIMARY KEY,
  id_pedido INTEGER NOT NULL REFERENCES pedidos_ventas(id_pedido) ON DELETE RESTRICT,
  id_encargado INTEGER REFERENCES usuarios(id_usuario),
  placa_camion VARCHAR(20) NOT NULL DEFAULT '',
  nombre_chofer VARCHAR(150) NOT NULL DEFAULT '',
  temperatura_salida DECIMAL(5,2),
  observaciones TEXT DEFAULT '',
  fecha_despacho TIMESTAMPTZ DEFAULT NOW()
);
`

export async function asegurarTablaDespachos() {
  try {
    const admin = createAdminClient()
    const { error } = await admin.rpc('exec_sql', { sql: SQL_CREATE_TABLE })
    if (error) {
      const { error: err2 } = await admin.from('despachos_logisticos').select('id_despacho').limit(1)
      if (err2 && err2.message?.includes('relation') && err2.message?.includes('does not exist')) {
        throw new Error('No se pudo crear la tabla. Ejecute el SQL manualmente o verifique los permisos del service_role.')
      }
    }
    return { success: true }
  } catch (e) {
    return { success: false, error: e.message }
  }
}

export async function obtenerPedidosConfirmados() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('pedidos_ventas')
    .select(`
      id_pedido, fecha_reserva, fecha_entrega_programada, total_pedido, metodo_pago, estado_reserva,
      clientes(id_cliente, razon_social, nit_facturacion, direccion),
      detalle_pedidos(id_detalle, id_item, cantidad_pedida, precio_unitario,
        catalogo_items(id_item, codigo_sku, nombre_producto, unidad_medida))
    `)
    .eq('estado_reserva', 'Confirmado')
    .order('fecha_entrega_programada', { ascending: true, nullsLast: true })
    .order('fecha_reserva', { ascending: true })

  return data || []
}

export async function obtenerDespachosEnRuta() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('despachos_logisticos')
    .select(`
      id_despacho, placa_camion, nombre_chofer, temperatura_salida, observaciones, fecha_despacho,
      pedidos_ventas!inner(id_pedido, estado_reserva, total_pedido,
        clientes(id_cliente, razon_social))
    `)
    .in('pedidos_ventas.estado_reserva', ['En_Despacho'])
    .order('fecha_despacho', { ascending: false })

  return data || []
}

export async function obtenerHistorialDespachos(page = 1, pageSize = 20, filtros = {}) {
  const supabase = await createClient()
  try {
    let query = supabase
      .from('despachos_logisticos')
      .select(`
        id_despacho, placa_camion, nombre_chofer, temperatura_salida, observaciones, fecha_despacho,
        pedidos_ventas!inner(id_pedido, estado_reserva, total_pedido, fecha_reserva,
          clientes!inner(id_cliente, razon_social))
      `, { count: 'exact' })

    if (filtros.fecha_desde) query = query.gte('fecha_despacho', filtros.fecha_desde)
    if (filtros.fecha_hasta) query = query.lte('fecha_despacho', filtros.fecha_hasta + 'T23:59:59Z')
    if (filtros.id_cliente) query = query.eq('pedidos_ventas.id_cliente', parseInt(filtros.id_cliente))

    const from = (page - 1) * pageSize
    const { data, error, count } = await query
      .order('fecha_despacho', { ascending: false })
      .range(from, from + pageSize - 1)
    if (error) throw error
    return { success: true, data: data || [], total: count || 0 }
  } catch (err) {
    return { success: false, error: err.message, data: [], total: 0 }
  }
}

export async function obtenerLotesDisponibles(idPedido) {
  const supabase = await createClient()
  const { data: lineas } = await supabase
    .from('detalle_pedidos')
    .select('id_detalle, id_item, cantidad_pedida, catalogo_items(id_item, codigo_sku, nombre_producto, unidad_medida)')
    .eq('id_pedido', idPedido)

  if (!lineas || lineas.length === 0) return []

  const resultado = []
  for (const linea of lineas) {
    const { data: lotes } = await supabase
      .from('lote_produccion')
      .select(`
        id_lote, codigo_lote, cantidad_producida, fecha_vencimiento, fecha_fabricacion,
        (SELECT COALESCE(SUM(movimientos_kardex.cantidad_kilos), 0) FROM movimientos_kardex WHERE movimientos_kardex.id_lote = lote_produccion.id_lote) as kardex_total
      `)
      .eq('id_item', linea.id_item)
      .eq('estado', 'Liberado_Comercial')
      .order('fecha_vencimiento', { ascending: true, nullsLast: true })

    const lotesConStock = (lotes || [])
      .map((l) => {
        const kardexTotal = parseFloat(l.kardex_total || 0)
        const producido = parseFloat(l.cantidad_producida || 0)
        const stockReal = producido + kardexTotal
        return { ...l, stock_real: Math.max(0, stockReal), kardex_total: kardexTotal }
      })
      .filter((l) => l.stock_real > 0)

    resultado.push({
      id_item: linea.id_item,
      codigo_sku: linea.catalogo_items?.codigo_sku,
      nombre_producto: linea.catalogo_items?.nombre_producto,
      unidad_medida: linea.catalogo_items?.unidad_medida || 'kg',
      cantidad_pedida: parseFloat(linea.cantidad_pedida),
      lotes: lotesConStock,
    })
  }

  return resultado
}

export async function obtenerUsuariosConPermisoDespacho() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('usuarios')
    .select('id_usuario, email_corporativo, empleados!inner(id_empleado, nombre_completo), roles!inner(permisos_json)')
    .not('roles.permisos_json', 'is', null)
  return (data || []).filter((u) => {
    const modulos = u.roles?.permisos_json?.modulos || []
    return modulos.includes('despacho') || modulos.includes('ALL') || modulos.includes('almacen')
  })
}

export async function ejecutarDespacho({
  id_pedido,
  id_encargado,
  placa_camion,
  nombre_chofer,
  temperatura_salida,
  observaciones,
  asignaciones,
}) {
  const supabase = await createClient()
  const admin = createAdminClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'No autenticado' }

  const { data: u } = await supabase
    .from('usuarios')
    .select('id_usuario')
    .eq('auth_uid', user.id)
    .maybeSingle()
  if (!u) return { success: false, error: 'Usuario no vinculado' }

  try {
    // E1: validar estado del pedido
    const { data: pedido } = await supabase
      .from('pedidos_ventas')
      .select('estado_reserva')
      .eq('id_pedido', id_pedido)
      .single()

    if (!pedido) return { success: false, error: 'Pedido no encontrado' }
    if (pedido.estado_reserva !== 'Confirmado') {
      return { success: false, error: `El pedido debe tener estado 'Confirmado'. Estado actual: ${pedido.estado_reserva} — E1` }
    }

    // E6: verificar condición de carrera (pedido ya procesado)
    const { data: despachoExistente } = await supabase
      .from('despachos_logisticos')
      .select('id_despacho')
      .eq('id_pedido', id_pedido)
      .maybeSingle()
    if (despachoExistente) {
      return { success: false, error: 'El pedido ya fue despachado por otro operador. Recargue la página. — E6' }
    }

    // E4: validar temperatura
    const temp = parseFloat(temperatura_salida)
    if (!isNaN(temp) && (temp < -2 || temp > 12)) {
      return { success: false, error: `La temperatura (${temp}°C) está fuera del rango de seguridad (-2°C a 12°C). — E4` }
    }

    // Validar asignaciones contra stock actual (E5)
    for (const asig of asignaciones) {
      const { data: lotes } = await supabase
        .from('lote_produccion')
        .select(`
          id_lote, codigo_lote, cantidad_producida,
          (SELECT COALESCE(SUM(movimientos_kardex.cantidad_kilos), 0) FROM movimientos_kardex WHERE movimientos_kardex.id_lote = lote_produccion.id_lote) as kardex_total
        `)
        .eq('id_lote', asig.id_lote)
        .single()

      if (!lotes) {
        return { success: false, error: `Lote ID ${asig.id_lote} no encontrado — E5` }
      }

      const kardexTotal = parseFloat(lotes.kardex_total || 0)
      const producido = parseFloat(lotes.cantidad_producida || 0)
      const stockActual = producido + kardexTotal
      const cantidadDespachar = parseFloat(asig.cantidad)

      if (stockActual < cantidadDespachar) {
        return {
          success: false,
          error: `Conflicto de concurrencia: el lote "${lotes.codigo_lote}" fue agotado por otro despacho (disponible: ${stockActual.toFixed(2)} kg, solicitado: ${cantidadDespachar.toFixed(2)} kg). Reasigne e intente. — E5`
        }
      }
    }

    // Insertar despacho
    const { data: despacho, error: despError } = await supabase
      .from('despachos_logisticos')
      .insert({
        id_pedido,
        id_encargado: id_encargado || u.id_usuario,
        placa_camion,
        nombre_chofer,
        temperatura_salida: isNaN(temp) ? null : temp,
        observaciones,
      })
      .select('id_despacho')
      .single()

    if (despError) throw despError

    // Insertar movimientos kardex por cada lote asignado
    for (const asig of asignaciones) {
      const cantidad = parseFloat(asig.cantidad)
      if (cantidad <= 0) continue

      const { data: lote } = await supabase
        .from('lote_produccion')
        .select('codigo_lote, id_item')
        .eq('id_lote', asig.id_lote)
        .single()

      const { error: kardexError } = await supabase.from('movimientos_kardex').insert({
        id_item: lote.id_item,
        id_lote: asig.id_lote,
        id_orden_asociada: despacho.id_despacho,
        id_usuario: u.id_usuario,
        tipo_operacion: 'OUT',
        cantidad_kilos: -Math.abs(cantidad),
        concepto_operacion: `[DESPACHO] Pedido #${id_pedido} — Lote: ${lote.codigo_lote}`,
      })

      if (kardexError) throw kardexError

      // Verificar si el lote se agotó
      const { data: lotesCheck } = await supabase
        .from('lote_produccion')
        .select(`
          cantidad_producida,
          (SELECT COALESCE(SUM(movimientos_kardex.cantidad_kilos), 0) FROM movimientos_kardex WHERE movimientos_kardex.id_lote = lote_produccion.id_lote) as kardex_total
        `)
        .eq('id_lote', asig.id_lote)
        .single()

      if (lotesCheck) {
        const stockRestante = parseFloat(lotesCheck.cantidad_producida || 0) + parseFloat(lotesCheck.kardex_total || 0)
        if (stockRestante <= 0) {
          await supabase.from('lote_produccion').update({ estado: 'Agotado' }).eq('id_lote', asig.id_lote)
        }
      }
    }

    // Verificar si todos los items del pedido están cubiertos
    const { data: lineasPedido } = await supabase
      .from('detalle_pedidos')
      .select('id_detalle, id_item, cantidad_pedida')
      .eq('id_pedido', id_pedido)

    const totalKardexPorItem = {}
    for (const asig of asignaciones) {
      const { data: lote } = await supabase
        .from('lote_produccion')
        .select('id_item')
        .eq('id_lote', asig.id_lote)
        .single()

      const itemId = lote?.id_item
      if (itemId) {
        totalKardexPorItem[itemId] = (totalKardexPorItem[itemId] || 0) + parseFloat(asig.cantidad)
      }
    }

    let todosCubiertos = true
    for (const linea of lineasPedido || []) {
      const despachado = totalKardexPorItem[linea.id_item] || 0
      if (despachado < parseFloat(linea.cantidad_pedida)) {
        todosCubiertos = false
        break
      }
    }

    const nuevoEstado = todosCubiertos ? 'Entregado_Completo' : 'En_Despacho'
    await supabase.from('pedidos_ventas').update({ estado_reserva: nuevoEstado }).eq('id_pedido', id_pedido)

    // Bitácora
    await supabase.from('bitacora_auditoria').insert({
      id_usuario: u.id_usuario,
      accion_sql: 'INSERT',
      tabla_afectada: 'despachos_logisticos',
      registro_id: despacho.id_despacho,
      new_data: {
        accion: 'Despacho FEFO ejecutado',
        id_pedido,
        placa_camion,
        nombre_chofer,
        temperatura_salida,
        lotes_asignados: asignaciones.length,
        estado_final: nuevoEstado,
      }
    })

    return { success: true, id_despacho: despacho.id_despacho, estado_final: nuevoEstado }
  } catch (err) {
    return { success: false, error: err.message }
  }
}
