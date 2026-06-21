'use server'

import { createClient } from '@/lib/supabase/server'

export async function obtenerPedidosPendientes() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('pedidos_ventas')
    .select('*, clientes(id_cliente, razon_social, nit_facturacion, tipo_cliente), usuarios!pedidos_ventas_id_vendedor_fkey(id_usuario, email_corporativo, empleados(nombre_completo))')
    .in('estado_reserva', ['Pendiente', 'Confirmado'])
    .order('fecha_reserva', { ascending: true })
  return data || []
}

export async function obtenerFacturas(page = 1, pageSize = 20, filtros = {}) {
  const supabase = await createClient()
  try {
    let query = supabase
      .from('factura')
      .select('*, pedidos_ventas!inner(id_pedido, estado_reserva, clientes!inner(id_cliente, razon_social, nit_facturacion))', { count: 'exact' })

    if (filtros.estado) query = query.eq('estado', filtros.estado)
    if (filtros.id_cliente) query = query.eq('pedidos_ventas.id_cliente', parseInt(filtros.id_cliente))
    if (filtros.fecha_desde) query = query.gte('fecha_emision', filtros.fecha_desde)
    if (filtros.fecha_hasta) query = query.lte('fecha_emision', filtros.fecha_hasta + 'T23:59:59Z')

    const from = (page - 1) * pageSize
    const { data, error, count } = await query.order('fecha_emision', { ascending: false }).range(from, from + pageSize - 1)
    if (error) throw error
    return { success: true, data: data || [], total: count || 0, page, pageSize }
  } catch (err) {
    return { success: false, error: err.message, data: [], total: 0 }
  }
}

export async function obtenerDetallePedido(idPedido) {
  const supabase = await createClient()
  const { data: lineas } = await supabase
    .from('detalle_pedidos')
    .select('*, catalogo_items(id_item, codigo_sku, nombre_producto)')
    .eq('id_pedido', idPedido)

  const { data: pedido } = await supabase
    .from('pedidos_ventas')
    .select('*, clientes(*), usuarios!pedidos_ventas_id_vendedor_fkey(id_usuario, email_corporativo, empleados(nombre_completo))')
    .eq('id_pedido', idPedido)
    .single()

  return { lineas: lineas || [], pedido }
}

export async function obtenerTasaImpuesto() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('config_alertas')
    .select('umbral_valor')
    .eq('nombre_alerta', 'TASA_IMPUESTO')
    .maybeSingle()
  return data?.umbral_valor || 16
}

export async function emitirFactura({ id_pedido, numero_factura, tasa_impuesto, metodo_pago, observaciones }) {
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
    // E2: validar numero_factura único
    const { data: existente } = await supabase
      .from('factura')
      .select('id_factura')
      .eq('numero_factura', numero_factura.trim())
      .maybeSingle()
    if (existente) return { success: false, error: 'El número de factura ya fue registrado — E2' }

    // E3: validar estado del pedido
    const { data: pedido } = await supabase
      .from('pedidos_ventas')
      .select('*, clientes(*)')
      .eq('id_pedido', id_pedido)
      .single()

    if (!pedido) return { success: false, error: 'Pedido no encontrado — E6' }
    if (pedido.estado_reserva === 'Cancelado') return { success: false, error: `El pedido #${id_pedido} está Cancelado — E3` }

    // E1: validar líneas de detalle
    const { data: lineas } = await supabase
      .from('detalle_pedidos')
      .select('*')
      .eq('id_pedido', id_pedido)

    if (!lineas || lineas.length === 0) return { success: false, error: 'El pedido no contiene líneas de detalle — E1' }

    // Calcular montos
    const subtotal = lineas.reduce((s, l) => s + Number(l.cantidad_pedida) * Number(l.precio_unitario), 0)
    const tasa = Number(tasa_impuesto)
    const impuesto = subtotal * (tasa / 100)
    const total = subtotal + impuesto

    // E5: validar tasa
    if (tasa < 0 || tasa > 100) return { success: false, error: 'La tasa de impuesto debe estar entre 0% y 100% — E5' }

    // Insertar factura
    const { data: factura, error: factError } = await supabase
      .from('factura')
      .insert({
        id_pedido,
        numero_factura: numero_factura.trim(),
        subtotal,
        impuesto,
        total_factura: total,
        metodo_pago: metodo_pago || pedido.metodo_pago,
        estado: 'Emitida',
      })
      .select('id_factura')
      .single()

    if (factError) throw factError

    // Actualizar estado del pedido
    const { error: updError } = await supabase
      .from('pedidos_ventas')
      .update({ estado_reserva: 'Confirmado' })
      .eq('id_pedido', id_pedido)

    if (updError) {
      await supabase.from('factura').delete().eq('id_factura', factura.id_factura)
      throw updError
    }

    // Bitácora
    await supabase.from('bitacora_auditoria').insert({
      id_usuario: u.id_usuario,
      accion_sql: 'INSERT',
      tabla_afectada: 'factura',
      registro_id: factura.id_factura,
      new_data: {
        accion: 'Factura comercial emitida',
        numero_factura: numero_factura.trim(),
        cliente: pedido.clientes?.razon_social,
        total,
        metodo_pago: metodo_pago || pedido.metodo_pago,
      }
    })

    return { success: true, id_factura: factura.id_factura, numero_factura: numero_factura.trim(), total }
  } catch (err) {
    return { success: false, error: err.message }
  }
}

export async function anularFactura(idFactura, justificacion) {
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
    const { error } = await supabase
      .from('factura')
      .update({ estado: 'Anulada' })
      .eq('id_factura', idFactura)
    if (error) throw error

    await supabase.from('bitacora_auditoria').insert({
      id_usuario: u.id_usuario,
      accion_sql: 'UPDATE',
      tabla_afectada: 'factura',
      registro_id: idFactura,
      new_data: { accion: 'Factura anulada', justificacion: justificacion || 'Sin justificación' }
    })
    return { success: true }
  } catch (err) {
    return { success: false, error: err.message }
  }
}

export async function registrarPago(idFactura) {
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
    const { error } = await supabase
      .from('factura')
      .update({ estado: 'Pagado' })
      .eq('id_factura', idFactura)
    if (error) throw error

    await supabase.from('bitacora_auditoria').insert({
      id_usuario: u.id_usuario,
      accion_sql: 'UPDATE',
      tabla_afectada: 'factura',
      registro_id: idFactura,
      new_data: { accion: 'Pago registrado en factura' }
    })
    return { success: true }
  } catch (err) {
    return { success: false, error: err.message }
  }
}
