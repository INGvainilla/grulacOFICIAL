'use server'

import { createClient } from '@/lib/supabase/server'

export async function obtenerPedidos(page = 1, pageSize = 20, filtros = {}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'No autenticado', data: [], total: 0 }

  try {
    let query = supabase
      .from('pedidos_ventas')
      .select('*, clientes(id_cliente, razon_social, nit_facturacion), usuarios!pedidos_ventas_id_vendedor_fkey(id_usuario, email_corporativo, empleados(nombre_completo))', { count: 'exact' })

    if (filtros.estado_reserva) query = query.eq('estado_reserva', filtros.estado_reserva)
    if (filtros.id_cliente) query = query.eq('id_cliente', parseInt(filtros.id_cliente))
    if (filtros.fecha_desde) query = query.gte('fecha_reserva', filtros.fecha_desde)
    if (filtros.fecha_hasta) query = query.lte('fecha_reserva', filtros.fecha_hasta + 'T23:59:59Z')

    const from = (page - 1) * pageSize
    const to = from + pageSize - 1

    const { data, error, count } = await query
      .order('fecha_reserva', { ascending: false })
      .range(from, to)

    if (error) throw error
    return { success: true, data: data || [], total: count || 0, page, pageSize }
  } catch (err) {
    return { success: false, error: err.message, data: [], total: 0 }
  }
}

export async function obtenerClientes() {
  const supabase = await createClient()
  const { data } = await supabase.from('clientes').select('id_cliente, razon_social, nit_facturacion').order('razon_social')
  return data || []
}

export async function obtenerProductosTerminados() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('catalogo_items')
    .select('id_item, codigo_sku, nombre_producto, precio_referencia')
    .eq('tipo_item', 'PRODUCTO_TERMINADO')
    .order('nombre_producto')
  return data || []
}

export async function obtenerStockDisponible(idItem) {
  const supabase = await createClient()
  try {
    const { data: lotes } = await supabase
      .from('lote_produccion')
      .select('id_lote')
      .eq('id_item', idItem)
      .eq('estado', 'Liberado_Comercial')

    if (!lotes || lotes.length === 0) return 0

    const idsLotes = lotes.map(l => l.id_lote)
    const { data: movimientos } = await supabase
      .from('movimientos_kardex')
      .select('tipo_operacion, cantidad_kilos')
      .in('id_lote', idsLotes)

    const stock = (movimientos || []).reduce((acc, m) => {
      if (m.tipo_operacion === 'IN') return acc + Number(m.cantidad_kilos)
      if (m.tipo_operacion === 'OUT') return acc - Number(m.cantidad_kilos)
      return acc
    }, 0)

    return Math.max(0, stock)
  } catch {
    return 0
  }
}

export async function crearPedido(formData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'No autenticado' }

  const { data: usuarioDb } = await supabase
    .from('usuarios')
    .select('id_usuario, roles!inner(permisos_json)')
    .eq('auth_uid', user.id)
    .maybeSingle()

  if (!usuarioDb) return { success: false, error: 'Usuario no vinculado' }

  const modulos = usuarioDb.roles?.permisos_json?.modulos || []
  if (!modulos.includes('ALL') && !modulos.includes('pedidos') && !modulos.includes('ventas')) {
    return { success: false, error: 'Acceso denegado' }
  }

  try {
    const { id_cliente, metodo_pago, fecha_entrega_programada, observaciones, lineas } = formData

    if (!id_cliente) return { success: false, error: 'Debe seleccionar un cliente — E5' }
    if (!lineas || lineas.length === 0) return { success: false, error: 'Debe agregar al menos un producto — E5' }
    if (!metodo_pago) return { success: false, error: 'Debe seleccionar un método de pago — E5' }

    for (const linea of lineas) {
      if (!linea.cantidad || Number(linea.cantidad) <= 0) {
        return { success: false, error: `Cantidad inválida en línea ${linea.id_item} — E4` }
      }
    }

    // Doble validación de stock (E6) — solo si hay datos de stock
    const itemsSinStock = []
    for (const linea of lineas) {
      const stock = await obtenerStockDisponible(linea.id_item)
      if (stock > 0 && Number(linea.cantidad) > stock) {
        itemsSinStock.push({ id_item: linea.id_item, nombre: linea.nombre_producto, stock, solicitado: Number(linea.cantidad) })
      }
    }

    if (itemsSinStock.length > 0) {
      return {
        success: false,
        error: 'Stock insuficiente al emitir — E6',
        faltantes: itemsSinStock
      }
    }

    const montoTotal = lineas.reduce((sum, l) => sum + (Number(l.cantidad) * Number(l.precio_unitario)), 0)

    // Insertar pedido
    const { data: pedido, error: pedidoError } = await supabase
      .from('pedidos_ventas')
      .insert({
        id_cliente: parseInt(id_cliente),
        id_vendedor: usuarioDb.id_usuario,
        estado_reserva: 'Pendiente',
        monto_total_bs: montoTotal,
        fecha_entrega_programada: fecha_entrega_programada || null,
        metodo_pago,
        observaciones: observaciones || null,
      })
      .select('id_pedido')
      .single()

    if (pedidoError) throw pedidoError

    // Insertar detalle
    const detalles = lineas.map(l => ({
      id_pedido: pedido.id_pedido,
      id_item: parseInt(l.id_item),
      cantidad_pedida: Number(l.cantidad),
      precio_unitario: Number(l.precio_unitario),
    }))

    const { error: detError } = await supabase.from('detalle_pedidos').insert(detalles)
    if (detError) {
      await supabase.from('pedidos_ventas').delete().eq('id_pedido', pedido.id_pedido)
      throw detError
    }

    // Bitácora
    await supabase.from('bitacora_auditoria').insert({
      id_usuario: usuarioDb.id_usuario,
      accion_sql: 'INSERT',
      tabla_afectada: 'pedidos_ventas',
      registro_id: pedido.id_pedido,
      new_data: {
        accion: 'Pedido de venta generado',
        id_cliente: parseInt(id_cliente),
        total: montoTotal,
        items: lineas.length,
      }
    })

    return { success: true, id_pedido: pedido.id_pedido }
  } catch (err) {
    return { success: false, error: err.message }
  }
}

export async function cancelarPedido(idPedido) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'No autenticado' }

  const { data: u } = await supabase
    .from('usuarios')
    .select('id_usuario, roles!inner(permisos_json)')
    .eq('auth_uid', user.id)
    .maybeSingle()

  if (!u) return { success: false, error: 'Usuario no vinculado' }

  try {
    const { error } = await supabase
      .from('pedidos_ventas')
      .update({ estado_reserva: 'Cancelado' })
      .eq('id_pedido', idPedido)

    if (error) throw error

    await supabase.from('bitacora_auditoria').insert({
      id_usuario: u.id_usuario,
      accion_sql: 'UPDATE',
      tabla_afectada: 'pedidos_ventas',
      registro_id: idPedido,
      new_data: { accion: 'Pedido cancelado' }
    })

    return { success: true }
  } catch (err) {
    return { success: false, error: err.message }
  }
}

export async function obtenerDetallePedido(idPedido) {
  const supabase = await createClient()
  const { data } = await supabase
    .from('detalle_pedidos')
    .select('*, catalogo_items(id_item, codigo_sku, nombre_producto)')
    .eq('id_pedido', idPedido)
  return data || []
}
