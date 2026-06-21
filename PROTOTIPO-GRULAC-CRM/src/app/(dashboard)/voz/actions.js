'use server'

import { createClient } from '@/lib/supabase/server'

export async function ejecutarConsultaVoz(parsed) {
  const supabase = await createClient()

  if (!parsed.valido || !parsed.entity) {
    return { success: false, error: 'comando_no_reconocido', data: [], total: 0 }
  }

  const { entity, aggType, timeFilter, stateFilter, searchText } = parsed

  try {
    let resultados = []
    let total = 0
    let resumen = {}

    switch (entity.id) {
      case 'pedidos_ventas': {
        let q = supabase
          .from('pedidos_ventas')
          .select('id_pedido, fecha_reserva, total_pedido, estado_reserva, metodo_pago, clientes(razon_social, nit_facturacion), usuarios!pedidos_ventas_id_vendedor_fkey(email_corporativo)')

        if (timeFilter) q = q.gte('fecha_reserva', timeFilter.gte).lte('fecha_reserva', timeFilter.lte)
        if (stateFilter) q = q.eq(stateFilter.column, stateFilter.value)
        if (searchText) q = q.ilike('clientes.razon_social', `%${searchText}%`)

        const { data, error: qErr } = await q.order('fecha_reserva', { ascending: false }).limit(20)
        if (qErr) throw qErr
        resultados = data || []
        total = resultados.length
        resumen = { total_pedidos: total, monto_total: resultados.reduce((s, r) => s + parseFloat(r.total_pedido || 0), 0) }
        break
      }

      case 'factura': {
        let q = supabase
          .from('factura')
          .select('id_factura, numero_factura, subtotal, impuesto, total_factura, estado, fecha_emision, pedidos_ventas(clientes(razon_social, nit_facturacion))')

        if (timeFilter) q = q.gte('fecha_emision', timeFilter.gte).lte('fecha_emision', timeFilter.lte)
        if (stateFilter) q = q.eq(stateFilter.column, stateFilter.value)

        const { data, error: qErr } = await q.order('fecha_emision', { ascending: false }).limit(20)
        if (qErr) throw qErr
        resultados = data || []
        total = resultados.length
        resumen = { total_facturas: total, monto_total: resultados.reduce((s, r) => s + parseFloat(r.total_factura || 0), 0) }
        break
      }

      case 'movimientos_kardex': {
        let q = supabase
          .from('movimientos_kardex')
          .select('id_log, tipo_operacion, cantidad_kilos, concepto_operacion, fecha_hora, catalogo_items(nombre_producto, codigo_sku)')

        if (timeFilter) q = q.gte('fecha_hora', timeFilter.gte).lte('fecha_hora', timeFilter.lte)
        if (searchText) q = q.ilike('catalogo_items.nombre_producto', `%${searchText}%`)

        const { data, error: qErr } = await q.order('fecha_hora', { ascending: false }).limit(20)
        if (qErr) throw qErr
        resultados = data || []
        total = resultados.length
        const entrada = resultados.filter((r) => r.tipo_operacion === 'IN' || r.tipo_operacion === 'DEVOLUCION').reduce((s, r) => s + parseFloat(r.cantidad_kilos || 0), 0)
        const salida = resultados.filter((r) => r.tipo_operacion === 'OUT').reduce((s, r) => s + Math.abs(parseFloat(r.cantidad_kilos || 0)), 0)
        resumen = { total_movimientos: total, kilos_entrada: entrada, kilos_salida: salida }
        break
      }

      case 'lote_produccion': {
        let q = supabase
          .from('lote_produccion')
          .select('id_lote, codigo_lote, cantidad_producida, fecha_fabricacion, fecha_vencimiento, estado, catalogo_items(nombre_producto, codigo_sku)')

        if (timeFilter) q = q.gte('fecha_fabricacion', timeFilter.gte).lte('fecha_fabricacion', timeFilter.lte)
        if (stateFilter) q = q.eq(stateFilter.column, stateFilter.value)
        if (searchText) q = q.ilike('catalogo_items.nombre_producto', `%${searchText}%`)

        const { data, error: qErr } = await q.order('fecha_fabricacion', { ascending: false }).limit(20)
        if (qErr) throw qErr
        resultados = data || []
        total = resultados.length
        const proximosAVencer = resultados.filter((r) => r.fecha_vencimiento && new Date(r.fecha_vencimiento) <= new Date(Date.now() + 15 * 86400000))
        resumen = { total_lotes: total, cantidad_total: resultados.reduce((s, r) => s + parseFloat(r.cantidad_producida || 0), 0), proximos_a_vencer: proximosAVencer.length }
        break
      }

      case 'fichas_calidad': {
        let q = supabase
          .from('fichas_calidad')
          .select('id_ficha, fecha_evaluacion, dictamen_qa, lote_produccion(codigo_lote, catalogo_items(nombre_producto))')

        if (timeFilter) q = q.gte('fecha_evaluacion', timeFilter.gte).lte('fecha_evaluacion', timeFilter.lte)

        const { data, error: qErr } = await q.order('fecha_evaluacion', { ascending: false }).limit(20)
        if (qErr) throw qErr
        resultados = data || []
        total = resultados.length
        const aprobadas = resultados.filter((r) => r.dictamen_qa === 'Aprobado').length
        resumen = { total_fichas: total, aprobadas, rechazadas: resultados.filter((r) => r.dictamen_qa === 'Rechazado').length }
        break
      }

      case 'bitacora_auditoria': {
        let q = supabase
          .from('bitacora_auditoria')
          .select('id_log, accion_sql, tabla_afectada, fecha_hora, usuarios(email_corporativo)')

        if (timeFilter) q = q.gte('fecha_hora', timeFilter.gte).lte('fecha_hora', timeFilter.lte)

        const { data, error: qErr } = await q.order('fecha_hora', { ascending: false }).limit(20)
        if (qErr) throw qErr
        resultados = data || []
        total = resultados.length
        resumen = { total_registros: total }
        break
      }

      case 'catalogo_items': {
        let q = supabase
          .from('catalogo_items')
          .select('id_item, codigo_sku, nombre_producto, tipo_item, unidad_medida')

        if (searchText) q = q.ilike('nombre_producto', `%${searchText}%`)

        const { data, error: qErr } = await q.order('nombre_producto', { ascending: true }).limit(20)
        if (qErr) throw qErr
        resultados = data || []
        total = resultados.length
        resumen = { total_productos: total }
        break
      }

      case 'clientes': {
        let q = supabase
          .from('clientes')
          .select('id_cliente, razon_social, nit_facturacion, tipo_cliente, ciudad')

        if (searchText) q = q.ilike('razon_social', `%${searchText}%`)

        const { data, error: qErr } = await q.order('razon_social', { ascending: true }).limit(20)
        if (qErr) throw qErr
        resultados = data || []
        total = resultados.length
        resumen = { total_clientes: total }
        break
      }

      case 'despachos_logisticos': {
        let q = supabase
          .from('despachos_logisticos')
          .select('id_despacho, placa_camion, nombre_chofer, temperatura_salida, fecha_despacho, pedidos_ventas(estado_reserva, clientes(razon_social))')

        if (timeFilter) q = q.gte('fecha_despacho', timeFilter.gte).lte('fecha_despacho', timeFilter.lte)
        if (stateFilter) q = q.eq('pedidos_ventas.' + stateFilter.column, stateFilter.value)

        const { data, error: qErr } = await q.order('fecha_despacho', { ascending: false }).limit(20)
        if (qErr) throw qErr
        resultados = data || []
        total = resultados.length
        resumen = { total_despachos: total }
        break
      }

      case 'devoluciones_qa': {
        let q = supabase
          .from('devoluciones_qa')
          .select('id_devolucion, kilos_devueltos, motivo_rechazo, estado_devolucion, requiere_reposicion, created_at, despachos_logisticos(pedidos_ventas(clientes(razon_social)))')

        if (timeFilter) q = q.gte('created_at', timeFilter.gte).lte('created_at', timeFilter.lte)
        if (stateFilter) q = q.eq(stateFilter.column, stateFilter.value)

        const { data, error: qErr } = await q.order('created_at', { ascending: false }).limit(20)
        if (qErr) throw qErr
        resultados = data || []
        total = resultados.length
        resumen = { total_devoluciones: total, kilos_devueltos: resultados.reduce((s, r) => s + parseFloat(r.kilos_devueltos || 0), 0) }
        break
      }

      default:
        return { success: false, error: 'entidad_no_soportada', data: [], total: 0 }
    }

    return { success: true, data: resultados, total, resumen, entity: entity.id, entityLabel: entity.label, confianza: parsed.confianza }
  } catch (err) {
    const msg = err.message || ''
    if (msg.includes('relation') && msg.includes('does not exist')) {
      return { success: false, error: 'tabla_no_existe', data: [], total: 0 }
    }
    return { success: false, error: err.message, data: [], total: 0 }
  }
}
