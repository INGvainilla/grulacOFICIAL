'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

// ============================================================
// CTR_Calidad — Controlador de Control de Calidad y Bioseguridad (P8)
// Métodos según Diagramas de Clases CU23, CU24, CU25 (OFICIAL.md):
//   CU23: + registrarFichaQA(lote, parametros)
//           + evaluarVsEstandares()
//           + determinarDictamen()
//           + verificarSegregacionFunciones()
//   CU24: + liberarLote(id_lote)
//           + verificarFichaConforme()
//           + generarIngresoKardex()
//           + evaluarAlertasStock()
//   CU25: + enviarDisposicion(lote, tipo, justificacion)
//           + verificarFichaNoConforme()
//           + bloquearKardexComercial()
//           + notificarJefeProduccion()
// Entidades: CE_LoteProduccion, CE_FichaCalidad, CE_Kardex, CE_Bitacora
// ============================================================

// Estándares de calidad por tipo de producto (rangos aceptables)
const ESTANDARES_CALIDAD = {
  default: {
    ph_final: { min: 4.0, max: 7.5, critico: true },
    salinidad: { min: 0, max: 5.0, critico: false },
    grados_brix: { min: 0, max: 30, critico: false },
    humedad_pct: { min: 20, max: 70, critico: false }
  }
}

/**
 * CU23: Registrar Ficha de Control de Calidad
 * Diagrama Comunicación: Actor→IU_Calidad→CTR_Calidad→CE_LoteProduccion→CE_FichaCalidad→CE_Bitacora
 */
export async function registrarFichaQA(idLote, parametros) {
  const supabase = await createClient()
  const supabaseAdmin = createAdminClient()

  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('No autorizado')

    const { data: usuarioDb } = await supabaseAdmin
      .from('usuarios')
      .select('id_usuario')
      .eq('auth_uid', user.id)
      .single()

    // Paso 3: verificarEstado('Pendiente QA') — CE_LoteProduccion
    const { data: lote, error: loteError } = await supabaseAdmin
      .from('lote_produccion')
      .select('id_lote, id_orden, estado, id_item')
      .eq('id_lote', idLote)
      .single()

    if (loteError || !lote) throw new Error('Lote no encontrado')
    if (lote.estado !== 'Pendiente_QA') throw new Error('El lote no está pendiente de control de calidad')

    // verificarSegregacionFunciones() — El evaluador QA no debe ser el mismo operario que produjo
    await verificarSegregacionFunciones(lote.id_orden, usuarioDb.id_usuario)

    // Paso 5: evaluarVsEstandares(parametros) — comparar contra rangos
    const evaluacion = evaluarVsEstandares(parametros)

    // Paso 6: determinarDictamen()
    const dictamen = determinarDictamen(evaluacion)

    // Paso 7: insert(ficha, dictamen) — CE_FichaCalidad
    // Campos según diagrama de clases CU23: ph_final, brix, humedad, textura,
    // aspecto_visual, dictamen, observaciones, ref_contramuestra
    const { data: ficha, error: fichaError } = await supabaseAdmin
      .from('fichas_calidad')
      .insert([{
        id_orden: lote.id_orden,
        id_lote: idLote,
        id_ingeniero_qa: usuarioDb.id_usuario,
        dictamen_qa: dictamen,
        ph_final: parseFloat(parametros.phFinal) || null,
        salinidad: parseFloat(parametros.salinidad) || null,
        grados_brix: parseFloat(parametros.brix) || null,
        humedad_pct: parseFloat(parametros.humedad) || null,
        temperatura_evaluacion: parseFloat(parametros.temperaturaEvaluacion) || null,
        // Campos adicionales del diagrama de clases que se almacenan en observaciones_tecnicas
        // ya que la BD no posee columnas individuales para textura, aspecto_visual, ref_contramuestra
        observaciones_tecnicas: JSON.stringify({
          texto: parametros.observaciones || '',
          textura: parseInt(parametros.textura) || null,
          aspecto_visual: parametros.aspectoVisual || null,
          ref_contramuestra: parametros.refContramuestra || null
        })
      }])
      .select()
      .single()

    if (fichaError) throw fichaError

    // Paso 8: CE_Bitacora
    await supabaseAdmin.from('bitacora_auditoria').insert([{
      id_usuario: usuarioDb.id_usuario,
      accion_sql: 'INSERT',
      tabla_afectada: 'fichas_calidad',
      registro_id: ficha.id_ficha,
      new_data: { accion: `Inspección de calidad Lote #${idLote}: ${dictamen}` }
    }])

    return {
      success: true,
      message: `Ficha registrada con dictamen: ${dictamen}`,
      ficha,
      evaluacion
    }
  } catch (error) {
    console.error('Error en registrarFichaQA:', error.message)
    return { success: false, error: error.message }
  }
}

/**
 * CU24: Aprobar/Liberar Lote a Almacén
 * Diagrama Comunicación: Actor→IU_Liberacion→CTR_Calidad
 *   →CE_FichaCalidad→CE_LoteProduccion→CE_Kardex→CE_Bitacora
 */
export async function liberarLote(idLote) {
  const supabase = await createClient()
  const supabaseAdmin = createAdminClient()

  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('No autorizado')

    const { data: usuarioDb } = await supabaseAdmin
      .from('usuarios')
      .select('id_usuario')
      .eq('auth_uid', user.id)
      .single()

    // Paso 3: verificarFichaConforme() — verificarDictamen('Conforme')
    const ficha = await verificarFichaConforme(idLote)

    // Paso 4: verificarNoLiberado(id_lote)
    const { data: lote, error: loteError } = await supabaseAdmin
      .from('lote_produccion')
      .select('*')
      .eq('id_lote', idLote)
      .single()

    if (loteError || !lote) throw new Error('Lote no encontrado')
    if (lote.estado === 'Liberado_Comercial') throw new Error('El lote ya ha sido liberado previamente')

    // Paso 5: update(estado='Liberado', fecha_liberacion) — CE_LoteProduccion
    const { error: updateLote } = await supabaseAdmin
      .from('lote_produccion')
      .update({ estado: 'Liberado_Comercial' })
      .eq('id_lote', idLote)

    if (updateLote) throw updateLote

    // Paso 6: generarIngresoKardex() — insert(INGRESO_PRODUCCION)
    await generarIngresoKardex(lote, usuarioDb.id_usuario)

    // Paso adicional: evaluarAlertasStock()
    const alertaStock = await evaluarAlertasStock(lote.id_item)

    // CE_Bitacora
    await supabaseAdmin.from('bitacora_auditoria').insert([{
      id_usuario: usuarioDb.id_usuario,
      accion_sql: 'UPDATE',
      tabla_afectada: 'lote_produccion',
      registro_id: idLote,
      new_data: { accion: `Liberación comercial a Kardex de Lote #${idLote}` }
    }])

    return {
      success: true,
      message: 'Lote liberado e inventario de producto terminado actualizado exitosamente',
      alertaStock
    }
  } catch (error) {
    console.error('Error en liberarLote:', error.message)
    return { success: false, error: error.message }
  }
}

/**
 * CU25: Enviar Lote a Cuarentena/Reproceso
 * Diagrama Comunicación: Actor→IU_Disposicion→CTR_Calidad
 *   →CE_FichaCalidad→CE_LoteProduccion→CE_Bitacora
 */
export async function enviarDisposicion(idLote, tipoDisposicion, justificacion, instruccionesReproceso) {
  const supabase = await createClient()
  const supabaseAdmin = createAdminClient()

  try {
    if (!['Cuarentena', 'Reprocesar', 'Rechazado'].includes(tipoDisposicion)) {
      throw new Error('Tipo de disposición inválido')
    }

    // Validar justificación obligatoria (nota SENASAG en secuencia CU25)
    if (!justificacion || justificacion.trim().length < 5) {
      throw new Error('La justificación técnica es obligatoria para auditoría SENASAG. Mínimo 5 caracteres.')
    }

    // Paso 3: verificarFichaNoConforme()
    await verificarFichaNoConforme(idLote)

    // Obtener info completa del lote para el Kardex
    const { data: lote, error: loteError } = await supabaseAdmin
      .from('lote_produccion')
      .select('*, catalogo_items (nombre_producto)')
      .eq('id_lote', idLote)
      .single()

    if (loteError || !lote) throw new Error('Lote no encontrado')
    if (lote.estado === 'Liberado_Comercial') throw new Error('No se puede disponer un lote ya liberado')
    if (lote.estado === 'Cuarentena_Rechazado' || lote.estado === 'En_Reproceso') {
      throw new Error('El lote ya tiene una disposición asignada')
    }

    // Paso 5: update(estado) — según tipo de disposición
    let nuevoEstado = 'Cuarentena_Rechazado'
    if (tipoDisposicion === 'Reprocesar') {
      nuevoEstado = 'En_Reproceso'
    }

    // Almacenar justificación e instrucciones en observaciones
    const obsDisposicion = JSON.stringify({
      justificacion_disposicion: justificacion,
      instrucciones_reproceso: instruccionesReproceso || null,
      tipo_disposicion: tipoDisposicion,
      fecha_disposicion: new Date().toISOString()
    })

    const { error: updateError } = await supabaseAdmin
      .from('lote_produccion')
      .update({ estado: nuevoEstado, observaciones: obsDisposicion })
      .eq('id_lote', idLote)

    if (updateError) throw updateError

    // Paso 6: bloquearKardexComercial(lote)
    bloquearKardexComercial(idLote)

    // Si reproceso: notificarJefeProduccion()
    if (tipoDisposicion === 'Reprocesar') {
      await notificarJefeProduccion(lote.id_orden, idLote, instruccionesReproceso)
    }

    // CE_Bitacora
    const { data: { user } } = await supabase.auth.getUser()
    const { data: usuarioDb } = user ? await supabaseAdmin.from('usuarios').select('id_usuario').eq('auth_uid', user.id).single() : { data: null }
    await supabaseAdmin.from('bitacora_auditoria').insert([{
      id_usuario: usuarioDb?.id_usuario || 1,
      accion_sql: 'UPDATE',
      tabla_afectada: 'lote_produccion',
      registro_id: idLote,
      new_data: { accion: `Disposición de Lote #${idLote}: ${nuevoEstado}` }
    }])

    return { success: true, message: `Lote marcado como ${nuevoEstado}. Kardex comercial bloqueado.` }
  } catch (error) {
    console.error('Error en enviarDisposicion:', error.message)
    return { success: false, error: error.message }
  }
}

// ===================== MÉTODOS INTERNOS DEL CONTROLADOR =====================

/**
 * verificarSegregacionFunciones() — El evaluador QA no puede ser el mismo que produjo
 */
async function verificarSegregacionFunciones(idOrden, idEvaluador) {
  const supabaseAdmin = createAdminClient()
  
  // 1. Obtener el rol y los permisos del usuario que está evaluando
  const { data: usuario } = await supabaseAdmin
    .from('usuarios')
    .select('id_rol, roles(nombre_rol, permisos_json)')
    .eq('id_usuario', idEvaluador)
    .single()

  // 2. Bypass si tiene permiso a TODO ("ALL" en sus módulos), sin importar si es la misma persona
  const modulosPermitidos = usuario?.roles?.permisos_json?.modulos || []
  if (modulosPermitidos.includes('ALL')) {
    return // Permitir sin restricciones
  }

  // 3. Si no es administrador, aplicar la regla normal de segregación
  const { data: orden } = await supabaseAdmin
    .from('ordenes_produccion')
    .select('id_jefe_produccion')
    .eq('id_orden', idOrden)
    .single()

  if (orden && orden.id_jefe_produccion === idEvaluador) {
    throw new Error('Segregación de funciones: El ingeniero de calidad no puede evaluar un lote que él mismo produjo.')
  }
}

/**
 * evaluarVsEstandares() — Compara cada parámetro contra rangos de calidad
 */
function evaluarVsEstandares(parametros) {
  const rangos = ESTANDARES_CALIDAD.default
  const resultados = {}

  const mapping = {
    phFinal: 'ph_final',
    salinidad: 'salinidad',
    brix: 'grados_brix',
    humedad: 'humedad_pct'
  }

  for (const [campo, nombreEstandar] of Object.entries(mapping)) {
    const valor = parseFloat(parametros[campo])
    const rango = rangos[nombreEstandar]
    if (rango && !isNaN(valor)) {
      const enRango = valor >= rango.min && valor <= rango.max
      resultados[campo] = {
        valor,
        min: rango.min,
        max: rango.max,
        enRango,
        critico: rango.critico
      }
    }
  }

  return resultados
}

/**
 * determinarDictamen() — Determina el dictamen final basado en la evaluación
 */
function determinarDictamen(evaluacion) {
  // Si algún parámetro crítico está fuera de rango → Rechazado
  for (const [, resultado] of Object.entries(evaluacion)) {
    if (resultado.critico && !resultado.enRango) {
      return 'Rechazado'
    }
  }

  // Si algún parámetro no crítico está fuera de rango → Cuarentena
  for (const [, resultado] of Object.entries(evaluacion)) {
    if (!resultado.enRango) {
      return 'Cuarentena'
    }
  }

  return 'Aprobado'
}

/**
 * verificarFichaConforme() — Verifica que el lote tenga dictamen 'Aprobado'
 */
async function verificarFichaConforme(idLote) {
  const supabaseAdmin = createAdminClient()
  const { data: ficha, error } = await supabaseAdmin
    .from('fichas_calidad')
    .select('*')
    .eq('id_lote', idLote)
    .order('fecha_evaluacion', { ascending: false })
    .limit(1)
    .single()

  if (error || !ficha) throw new Error('No se encontró ficha de calidad para este lote')
  if (ficha.dictamen_qa !== 'Aprobado') throw new Error('El lote no cuenta con un dictamen Aprobado')
  return ficha
}

/**
 * verificarFichaNoConforme() — Verifica que el lote tenga dictamen 'No Conforme' u 'Observado'
 */
async function verificarFichaNoConforme(idLote) {
  const supabaseAdmin = createAdminClient()
  const { data: ficha, error } = await supabaseAdmin
    .from('fichas_calidad')
    .select('dictamen_qa')
    .eq('id_lote', idLote)
    .order('fecha_evaluacion', { ascending: false })
    .limit(1)
    .single()

  if (error || !ficha) throw new Error('No se encontró ficha de calidad para este lote')
  if (ficha.dictamen_qa === 'Aprobado') {
    throw new Error('No se puede enviar a disposición un lote con dictamen Aprobado')
  }
  return ficha
}

/**
 * generarIngresoKardex() — Registra ingreso de producto terminado al Kardex
 */
async function generarIngresoKardex(lote, idUsuario) {
  const supabaseAdmin = createAdminClient()
  const { error: kardexError } = await supabaseAdmin
    .from('movimientos_kardex')
    .insert([{
      id_item: lote.id_item,
      id_lote: lote.id_lote,
      id_usuario: idUsuario,
      tipo_operacion: 'IN',
      cantidad_kilos: lote.cantidad_producida,
      concepto_operacion: `Ingreso de Producción Liberada - Lote ${lote.codigo_lote}`
    }])

  if (kardexError) throw kardexError
}

/**
 * evaluarAlertasStock() — Evalúa si el nuevo stock amerita notificación
 */
async function evaluarAlertasStock(idItem) {
  const supabaseAdmin = createAdminClient()

  const { data: item } = await supabaseAdmin
    .from('catalogo_items')
    .select('stock_minimo, nombre_producto')
    .eq('id_item', idItem)
    .single()

  // Calcular stock desde Kardex
  const { data: movimientos } = await supabaseAdmin
    .from('movimientos_kardex')
    .select('cantidad_kilos')
    .eq('id_item', idItem)

  const stockActual = (movimientos || []).reduce((acc, m) => acc + parseFloat(m.cantidad_kilos || 0), 0)
  const stockMinimo = parseFloat(item?.stock_minimo || 0)

  if (stockActual <= stockMinimo) {
    return { alerta: true, mensaje: `Stock de ${item?.nombre_producto} sigue por debajo del mínimo (${stockActual}/${stockMinimo})` }
  }
  return { alerta: false, stockActual }
}

/**
 * bloquearKardexComercial() — Marca el lote como no disponible para movimientos de venta
 * Nota: En la práctica, el estado 'Cuarentena_Rechazado' o 'En_Reproceso' ya bloquea
 * cualquier operación de despacho/venta sobre ese lote en los módulos comerciales.
 */
function bloquearKardexComercial(idLote) {
  // El bloqueo es implícito por el cambio de estado del lote.
  // Los módulos de despacho/venta solo permiten lotes con estado 'Liberado_Comercial'.
  console.log(`[CTR_Calidad] Kardex comercial bloqueado para lote ${idLote}`)
}

/**
 * notificarJefeProduccion() — Genera notificación interna cuando un lote va a reproceso
 */
async function notificarJefeProduccion(idOrden, idLote, instrucciones) {
  const supabaseAdmin = createAdminClient()
  // Obtener el jefe de producción de la orden original
  const { data: orden } = await supabaseAdmin
    .from('ordenes_produccion')
    .select('id_jefe_produccion')
    .eq('id_orden', idOrden)
    .single()

  if (orden) {
    // Registrar la notificación en la bitácora como acción informativa
    await supabaseAdmin.from('bitacora_auditoria').insert([{
      id_usuario: orden.id_jefe_produccion,
      accion_sql: 'NOTIFICACION_REPROCESO',
      tabla_afectada: 'lote_produccion',
      registro_id: idLote,
      new_data: { instrucciones_reproceso: instrucciones || 'Sin instrucciones específicas' }
    }])
  }
}

// ===================== FUNCIONES AUXILIARES EXPORTADAS =====================

export async function obtenerLotesPendientes() {
  const supabaseAdmin = createAdminClient()
  const { data } = await supabaseAdmin
    .from('lote_produccion')
    .select('*, ordenes_produccion (litros_invertidos, id_jefe_produccion), catalogo_items (nombre_producto)')
    .eq('estado', 'Pendiente_QA')
  return data || []
}

export async function obtenerFichasConformesParaLiberacion() {
  const supabaseAdmin = createAdminClient()
  const { data, error } = await supabaseAdmin
    .from('fichas_calidad')
    .select('*, lote_produccion (*, catalogo_items(nombre_producto, unidad_medida))')
    .eq('dictamen_qa', 'Aprobado')

  if (error) {
    console.error(error)
    return []
  }

  const list = data.filter(f => f.lote_produccion && f.lote_produccion.estado === 'Pendiente_QA')
  return list
}

export async function obtenerLotesNoConformes() {
  const supabaseAdmin = createAdminClient()
  const { data, error } = await supabaseAdmin
    .from('fichas_calidad')
    .select('*, lote_produccion (*, catalogo_items(nombre_producto, unidad_medida))')
    .neq('dictamen_qa', 'Aprobado')

  if (error) return []

  const list = data.filter(f => f.lote_produccion && f.lote_produccion.estado === 'Pendiente_QA')
  return list
}
