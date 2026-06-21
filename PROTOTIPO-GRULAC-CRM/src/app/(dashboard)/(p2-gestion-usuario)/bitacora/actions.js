'use server'

import { createClient } from '@/lib/supabase/server'

function extraerDescripcion(log) {
  const accion = log.accion_sql
  const tabla = log.tabla_afectada
  const nd = log.new_data
  if (!nd) return `Operación ${accion} en ${tabla}`

  const d = typeof nd === 'string' ? JSON.parse(nd) : nd

  if (accion === 'LOGIN') return `Inicio de sesión: ${d.email || d.accion || ''}`
  if (accion === 'LOGOUT') return `Cierre de sesión`
  if (accion === 'ACCESS_LOCKED') return `Bloqueo por intentos fallidos — ${d.email_target || ''}`
  if (accion === 'INVITE_USER') return `Invitación enviada a ${d.email || ''}`
  if (accion === 'CAMBIO_PASSWORD') return `Cambio de contraseña — ${d.email || ''}`
  if (accion === 'ACTIVATE_ACCOUNT') return `Activación de cuenta — ${d.email || ''}`
  if (accion === 'RESET_PASSWORD') return `Restablecimiento de contraseña — ${d.email || ''}`

  if (d.accion) return d.accion
  if (d.nombre_producto) return `Producto: ${d.nombre_producto}`
  if (d.razon_social) return `Cliente/Proveedor: ${d.razon_social}`
  if (d.codigo_lote) return `Lote: ${d.codigo_lote}`
  if (d.codigo_sku) return `SKU: ${d.codigo_sku}`
  if (d.nombre_completo) return `Empleado: ${d.nombre_completo}`
  if (d.email_corporativo) return `Email: ${d.email_corporativo}`
  if (d.email) return `Email: ${d.email}`
  if (d.item) return `Ítem: ${d.item}`
  if (d.cantidad) return `Cantidad: ${d.cantidad}`
  if (d.monto_total_bs) return `Monto: Bs ${d.monto_total_bs}`
  if (d.motivo) return `Motivo: ${d.motivo}`
  if (d.estado) return `Estado: ${d.estado}`
  if (d.id_rol) return `Rol asignado ID: ${d.id_rol}`
  if (d.justificacion) return `Justificación: ${d.justificacion}`
  if (d.lote) return `Lote #${d.lote}`
  if (d.numero_factura) return `Factura N°: ${d.numero_factura}`

  const keys = Object.keys(d)
  if (keys.length === 1) return `${keys[0]}: ${d[keys[0]]}`
  if (keys.length > 0) return `${keys[0]}: ${d[keys[0]]} (${keys.length - 1} campos más)`

  return `Operación ${accion} en ${tabla}`
}

export async function obtenerLogs(page = 1, pageSize = 25, filtros = {}) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'No autenticado', logs: [], total: 0 }

  const { data: usuarioDb } = await supabase
    .from('usuarios')
    .select('id_usuario, id_rol, email_corporativo, roles!inner(permisos_json)')
    .eq('auth_uid', user.id)
    .maybeSingle()

  if (!usuarioDb) {
    return { success: false, error: 'Usuario no vinculado al sistema', logs: [], total: 0 }
  }

  const modulos = usuarioDb.roles?.permisos_json?.modulos || []
  const isAdmin = modulos.includes('ALL') || modulos.includes('auditoria')
  const isProduccion = modulos.includes('produccion')
  const isCalidad = modulos.includes('calidad')

  if (!isAdmin && !isProduccion && !isCalidad) {
    return { success: false, error: 'Acceso denegado: no tiene permiso auditoria, produccion o calidad', logs: [], total: 0 }
  }

  try {
    let query = supabase
      .from('bitacora_auditoria')
      .select('*, usuarios!bitacora_auditoria_id_usuario_fkey(id_usuario, email_corporativo, empleados(nombre_completo))', { count: 'exact' })

    if (isProduccion && !isAdmin) {
      query = query.in('tabla_afectada', [
        'ordenes_produccion', 'lote_produccion', 'recetas_bom',
        'receta_ingredientes', 'catalogo_items', 'movimientos_kardex'
      ])
    } else if (isCalidad && !isAdmin) {
      query = query.in('tabla_afectada', [
        'fichas_calidad', 'lote_produccion', 'recepciones_leche'
      ])
    }

    if (filtros.tabla_afectada) query = query.eq('tabla_afectada', filtros.tabla_afectada)
    if (filtros.accion_sql) query = query.eq('accion_sql', filtros.accion_sql)
    if (filtros.fecha_desde) query = query.gte('fecha_hora', filtros.fecha_desde)
    if (filtros.fecha_hasta) query = query.lte('fecha_hora', filtros.fecha_hasta + 'T23:59:59Z')
    if (filtros.id_usuario) query = query.eq('id_usuario', parseInt(filtros.id_usuario))

    const from = (page - 1) * pageSize
    const to = from + pageSize - 1

    const { data, error, count } = await query
      .order('fecha_hora', { ascending: false })
      .range(from, to)

    if (error) throw error

    const logs = (data || []).map(log => ({
      ...log,
      descripcion: extraerDescripcion(log)
    }))

    return { success: true, logs, total: count || 0, page, pageSize }
  } catch (error) {
    console.error('[CU06 - ERROR]:', error.message)
    return { success: false, error: error.message, logs: [], total: 0 }
  }
}

export async function obtenerTablasAfectadas() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('bitacora_auditoria')
    .select('tabla_afectada')
    .order('tabla_afectada')

  const unique = [...new Set((data || []).map(d => d.tabla_afectada))]
  return unique
}

export async function obtenerAccionesSQL() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('bitacora_auditoria')
    .select('accion_sql')
    .order('accion_sql')

  const unique = [...new Set((data || []).map(d => d.accion_sql))]
  return unique
}

export async function obtenerMetricas() {
  const supabase = await createClient()

  const { count: total } = await supabase
    .from('bitacora_auditoria')
    .select('*', { count: 'exact', head: true })

  const hoy = new Date().toISOString().split('T')[0]
  const { count: hoyCount } = await supabase
    .from('bitacora_auditoria')
    .select('*', { count: 'exact', head: true })
    .gte('fecha_hora', hoy)

  const { count: loginCount } = await supabase
    .from('bitacora_auditoria')
    .select('*', { count: 'exact', head: true })
    .eq('accion_sql', 'LOGIN')

  return { total: total || 0, hoy: hoyCount || 0, logins: loginCount || 0 }
}
