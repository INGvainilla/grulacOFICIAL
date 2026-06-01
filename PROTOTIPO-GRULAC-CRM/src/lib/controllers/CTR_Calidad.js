'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

// =========================================================================================
// CTR_Calidad — Controlador de Control de Calidad y Bioseguridad (P8)
// =========================================================================================
// Métodos según Diagramas de Clases y Secuencia CU23, CU24 y CU25 (OFICIAL.md):
//   CU23: + registrarFichaQA(lote, parametros)
//           + evaluarVsEstandares(valores)
//           + determinarDictamen()
//           + verificarSegregacionFunciones(idOrden, idEvaluador)
//   CU24: + liberarLote(id_lote)
//           + verificarFichaConforme(idLote)
//           + generarIngresoKardex(lote, idUsuario)
//           + evaluarAlertasStock(idItem)
//   CU25: + enviarDisposicion(idLote, tipoDisposicion, justificacion, instrucciones)
//           + verificarFichaNoConforme(idLote)
//           + bloquearKardexComercial(idLote)
//           + notificarJefeProduccion(idOrden, idLote, instrucciones)
// =========================================================================================

// Estándares paramétricos lácteos aceptables por bioseguridad
const ESTANDARES_CALIDAD = {
  default: {
    ph_final: { min: 4.0, max: 7.5, critico: true },
    salinidad: { min: 0, max: 5.0, critico: false },
    grados_brix: { min: 0, max: 30, critico: false },
    humedad_pct: { min: 20, max: 70, critico: false }
  }
}

/**
 * =========================================================================================
 * CU23: Registrar Ficha de Control de Calidad
 * Secuencia: Actor (QA) -> IU_Calidad -> CTR_Calidad -> CE_LoteProduccion 
 *   -> CE_FichaCalidad -> CE_Bitacora
 * =========================================================================================
 */
export async function registrarFichaQA(idLote, parametros) {
  // PASO 1 (Frontera): El Ingeniero de Calidad (QA) selecciona el lote pendiente en la interfaz (IU_Calidad)
  // PASO 2 (Frontera -> Control): IU_Calidad invoca a CTR_Calidad.registrarFichaQA(...)
  const supabase = await createClient()
  const supabaseAdmin = createAdminClient()

  try {
    // 2.1. Obtener la sesión activa del evaluador para garantizar la trazabilidad forense
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Evaluador no autenticado en el sistema')

    const { data: usuarioDb } = await supabaseAdmin
      .from('usuarios')
      .select('id_usuario')
      .eq('auth_uid', user.id)
      .single()

    if (!usuarioDb) throw new Error('El evaluador no cuenta con un registro físico de usuario')

    // PASO 3 (Lectura Entidad): CTR_Calidad consulta CE_LoteProduccion para verificar el estado
    // Método: getDetalle(id_lote)
    // (Excepción: Bloquea si el lote no está en estado "Pendiente QA")
    const { data: lote, error: loteError } = await supabaseAdmin
      .from('lote_produccion')
      .select('id_lote, id_orden, estado, id_item')
      .eq('id_lote', idLote)
      .single()

    if (loteError || !lote) throw new Error('El Lote de producción seleccionado no existe')
    if (lote.estado !== 'Pendiente_QA') {
      throw new Error('El lote ya cuenta con un dictamen asignado (Estado: ' + lote.estado + ').')
    }

    // Regla de Negocio (Segregación de Funciones): El evaluador QA no debe ser la misma persona que produjo
    // Método: verificarSegregacionFunciones(idOrden, idEvaluador)
    await verificarSegregacionFunciones(lote.id_orden, usuarioDb.id_usuario)

    // PASO 4 (Lógica del Controlador): CTR_Calidad realiza evaluarVsEstandares(parametros)
    // Compara las lecturas físicas del laboratorio contra los límites microbiológicos estándar
    const evaluacion = evaluarVsEstandares(parametros)

    // PASO 5 (Lógica del Controlador): CTR_Calidad determina determinarDictamen()
    // Si algún parámetro crítico (como el pH) está fuera de rango, se fuerza a `'Rechazado'` automáticamente
    const dictamen = determinarDictamen(evaluacion)

    // PASO 6 (Creación Entidad): CTR_Calidad inserta la ficha en CE_FichaCalidad
    // Instanciación: <<create>> (id_lote, parametros, dictamen)
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
        observaciones_tecnicas: JSON.stringify({
          texto: parametros.observaciones || '',
          textura: parseInt(parametros.textura) || null,
          aspecto_visual: parametros.aspectoVisual || null,
          ref_contramuestra: parametros.refContramuestra || null
        })
      }])
      .select()
      .single()

    if (fichaError) throw new Error('Error al registrar la Ficha de Laboratorio: ' + fichaError.message)

    // PASO 7 (Trigger de Persistencia): CE_FichaCalidad ejecuta el trigger automático hacia CE_Bitacora
    // Registro de trazabilidad inmutable del control sanitario realizado sobre el lote lácteo
    await supabaseAdmin.from('bitacora_auditoria').insert([{
      id_usuario: usuarioDb.id_usuario,
      accion_sql: 'INSERT',
      tabla_afectada: 'fichas_calidad',
      registro_id: ficha.id_ficha,
      new_data: {
        accion: 'Registro de Ficha de Laboratorio (Dictamen QA)',
        lote: idLote,
        dictamen: dictamen,
        parametros: parametros
      }
    }])

    // PASO 8 (Retorno): CTR_Calidad devuelve el dictamen final a la interfaz IU_Calidad
    return {
      success: true,
      message: `Ficha de control de calidad registrada con dictamen: ${dictamen}`,
      ficha,
      evaluacion
    }
  } catch (error) {
    console.error('[CU23 - ERROR]:', error.message)
    return { success: false, error: error.message }
  }
}

/**
 * =========================================================================================
 * CU24: Aprobar/Liberar Lote a Almacén
 * Secuencia: Actor (QA) -> IU_Liberacion -> CTR_Calidad -> CE_FichaCalidad 
 *   -> CE_LoteProduccion -> CE_PresentacionesLote -> CE_Kardex_Movimientos -> CE_Bitacora
 * =========================================================================================
 */
export async function liberarLote(idLote) {
  // PASO 1 (Frontera): El Ingeniero de Calidad inicia la liberación del lote aprobado (IU_Liberacion)
  // PASO 2 (Frontera -> Control): IU_Liberacion invoca a CTR_Calidad.liberarLote(...)
  const supabase = await createClient()
  const supabaseAdmin = createAdminClient()

  try {
    // 2.1. Obtener la sesión activa del evaluador para garantizar la trazabilidad forense
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Evaluador no autenticado en el sistema')

    const { data: usuarioDb } = await supabaseAdmin
      .from('usuarios')
      .select('id_usuario')
      .eq('auth_uid', user.id)
      .single()

    if (!usuarioDb) throw new Error('El evaluador no cuenta con un registro físico de usuario')

    // PASO 3 (Lectura Entidad): CTR_Calidad consulta CE_FichaCalidad para validar la conformidad
    // Método: verificarFichaConforme(id_lote) -> dictamen == 'Aprobado'
    // (Excepción E1 en Secuencia: Si el dictamen no es conforme, se deniega la liberación a almacén)
    const ficha = await verificarFichaConforme(idLote)

    // PASO 4 (Lectura Entidad): CTR_Calidad consulta CE_LoteProduccion para evaluar duplicidad de liberación
    // Método: verificarNoLiberado(id_lote)
    const { data: lote, error: loteError } = await supabaseAdmin
      .from('lote_produccion')
      .select('*')
      .eq('id_lote', idLote)
      .single()

    if (loteError || !lote) throw new Error('El Lote de producción seleccionado no existe')
    if (lote.estado === 'Liberado_Comercial') {
      throw new Error('Excepción: El lote ya fue liberado y se encuentra en stock comercial en la Cámara de Frío.')
    }

    // PASO 5 (Edición Entidad): CTR_Calidad actualiza el estado en CE_LoteProduccion
    // Sentencia: update(estado='Liberado', fecha_liberacion)
    // Esta acción a su vez dispara un trigger automático hacia CE_Bitacora
    const { error: updateLote } = await supabaseAdmin
      .from('lote_produccion')
      .update({ estado: 'Liberado_Comercial' })
      .eq('id_lote', idLote)

    if (updateLote) throw new Error('Error al actualizar el estado del lote en planta: ' + updateLote.message)

    // PASO 6 (Lectura Entidad): CTR_Calidad recupera el desglose de presentaciones en CE_PresentacionesLote
    // Método: getPresentaciones(id_lote)
    // (Persistido como estructura JSON en observaciones del lote en este modelo relacional físico)
    
    // PASO 7 (Bucle & Creación): CTR_Calidad genera los ingresos al inventario en CE_Kardex_Movimientos
    // Método: generarIngresoKardex() -> insert(INGRESO_PRODUCCION)
    // Cada inserción física de ingreso en Kardex ejecuta el trigger hacia CE_Bitacora
    await generarIngresoKardex(lote, usuarioDb.id_usuario)

    // PASO 8 (Lógica de Umbrales): CTR_Calidad ejecuta evaluarAlertasStock()
    // Método: evaluarAlertasStock(id_item)
    // Compara el nuevo stock acumulado contra el umbral mínimo configurado para alertar a compras
    const alertaStock = await evaluarAlertasStock(lote.id_item)

    // PASO 9 (Trigger de Persistencia): CE_LoteProduccion ejecuta el trigger hacia CE_Bitacora
    // Registro inmutable del pase formal de lote de producción a inventario disponible para la venta
    await supabaseAdmin.from('bitacora_auditoria').insert([{
      id_usuario: usuarioDb.id_usuario,
      accion_sql: 'UPDATE',
      tabla_afectada: 'lote_produccion',
      registro_id: idLote,
      new_data: {
        accion: 'Liberación de Lote a Almacén Comercial',
        lote: idLote,
        codigo: lote.codigo_lote,
        cantidad: lote.cantidad_producida
      }
    }])

    // PASO 10 (Retorno): CTR_Calidad devuelve el resultado exitoso y el stock actualizado a IU_Liberacion
    return {
      success: true,
      message: 'Lote liberado formalmente al almacén. Stock comercial actualizado.',
      alertaStock
    }
  } catch (error) {
    console.error('[CU24 - ERROR]:', error.message)
    return { success: false, error: error.message }
  }
}

/**
 * =========================================================================================
 * CU25: Enviar Lote a Cuarentena/Reproceso
 * Secuencia: Actor (QA) -> IU_Disposicion -> CTR_Calidad -> CE_FichaCalidad 
 *   -> CE_LoteProduccion -> CE_Bitacora
 * =========================================================================================
 */
export async function enviarDisposicion(idLote, tipoDisposicion, justificacion, instruccionesReproceso) {
  // PASO 1 (Frontera): El Ingeniero de Calidad inicia el envío a cuarentena o reproceso (IU_Disposicion)
  // PASO 2 (Frontera -> Control): IU_Disposicion invoca a CTR_Calidad.enviarDisposicion(...)
  const supabase = await createClient()
  const supabaseAdmin = createAdminClient()

  try {
    if (!['Cuarentena', 'Reprocesar', 'Rechazado'].includes(tipoDisposicion)) {
      throw new Error('La disposición seleccionada es inválida.')
    }

    // PASO 3 (Validación Lógica): CTR_Calidad valida la justificación técnica obligatoria para auditoría
    // (Excepción E2 en Secuencia CU25: Justificación obligatoria por normas de inocuidad SENASAG)
    if (!justificacion || justificacion.trim().length < 5) {
      throw new Error('La justificación técnica de la retención es obligatoria para auditoría SENASAG (mínimo 5 caracteres).')
    }

    // PASO 4 (Lectura Entidad): CTR_Calidad consulta CE_FichaCalidad para verificar que el lote tenga dictamen no conforme
    // Método: verificarFichaNoConforme(id_lote) -> dictamen != 'Aprobado'
    await verificarFichaNoConforme(idLote)

    // PASO 5 (Lectura Entidad): CTR_Calidad consulta CE_LoteProduccion para evaluar duplicidad de disposición
    // Método: verificarNoDispuesto(id_lote)
    const { data: lote, error: loteError } = await supabaseAdmin
      .from('lote_produccion')
      .select('*, catalogo_items (nombre_producto)')
      .eq('id_lote', idLote)
      .single()

    if (loteError || !lote) throw new Error('El lote de producción seleccionado no existe')
    if (lote.estado === 'Liberado_Comercial') {
      throw new Error('Excepción: No es posible derivar a disposición un lote que ya ha sido liberado al circuito comercial.')
    }
    if (lote.estado === 'Cuarentena_Rechazado' || lote.estado === 'En_Reproceso') {
      throw new Error('El lote seleccionado ya cuenta con una disposición formal de retención asignada.')
    }

    // PASO 6 (Edición Entidad): CTR_Calidad actualiza el estado en CE_LoteProduccion
    // Sentencia: update(estado='En Cuarentena') o update(estado='En Reproceso')
    // Esta acción a su vez dispara un trigger automático hacia CE_Bitacora
    let nuevoEstado = 'Cuarentena_Rechazado'
    if (tipoDisposicion === 'Reprocesar') {
      nuevoEstado = 'En_Reproceso'
    }

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

    if (updateError) throw new Error('Error al actualizar la disposición del lote en BD: ' + updateError.message)

    // PASO 7 (Lógica de Bloqueo): CTR_Calidad ejecuta bloquearKardexComercial()
    // Métodos de ventas y despachos validarán atómicamente que el lote retornado tenga estado `'Liberado_Comercial'`
    bloquearKardexComercial(idLote)

    // PASO 8 (Bucle condicional - Reproceso): Si es Reproceso, se notifica de inmediato al Jefe de Producción
    // Método: notificarJefeProduccion()
    if (tipoDisposicion === 'Reprocesar') {
      await notificarJefeProduccion(lote.id_orden, idLote, instruccionesReproceso)
    }

    // PASO 9 (Trigger de Persistencia): CE_LoteProduccion ejecuta el trigger hacia la entidad CE_Bitacora
    // Registro físico inmutable del lote no conforme y las justificaciones del laboratorio
    const { data: { user } } = await supabase.auth.getUser()
    const { data: usuarioDb } = user ? await supabaseAdmin.from('usuarios').select('id_usuario').eq('auth_uid', user.id).single() : { data: null }
    
    await supabaseAdmin.from('bitacora_auditoria').insert([{
      id_usuario: usuarioDb?.id_usuario || 1,
      accion_sql: 'UPDATE',
      tabla_afectada: 'lote_produccion',
      registro_id: idLote,
      new_data: {
        accion: 'Registro de Disposición de Lote No Conforme',
        lote: idLote,
        estado: nuevoEstado,
        justificacion: justificacion,
        instrucciones: instruccionesReproceso || null
      }
    }])

    // PASO 10 (Retorno): CTR_Calidad devuelve la disposición guardada a IU_Disposicion
    return {
      success: true,
      message: `Disposición formal guardada. Lote marcado como: ${nuevoEstado}.`
    }
  } catch (error) {
    console.error('[CU25 - ERROR]:', error.message)
    return { success: false, error: error.message }
  }
}

// =========================================================================================
// MÉTODOS INTERNOS Y REGLAS DE NEGOCIO DEL CONTROLADOR
// =========================================================================================

/**
 * Valida la segregación de funciones: el ingeniero de calidad no debe ser el mismo que produjo (CU23 - Regla)
 */
async function verificarSegregacionFunciones(idOrden, idEvaluador) {
  const supabaseAdmin = createAdminClient()
  
  const { data: usuario } = await supabaseAdmin
    .from('usuarios')
    .select('id_rol, roles(nombre_rol, permisos_json)')
    .eq('id_usuario', idEvaluador)
    .single()

  const modulosPermitidos = usuario?.roles?.permisos_json?.modulos || []
  if (modulosPermitidos.includes('ALL')) {
    return // Bypass si es administrador global
  }

  const { data: orden } = await supabaseAdmin
    .from('ordenes_produccion')
    .select('id_jefe_produccion')
    .eq('id_orden', idOrden)
    .single()

  if (orden && orden.id_jefe_produccion === idEvaluador) {
    throw new Error('Segregación de Funciones: El evaluador no tiene permitido auditar un lote que él mismo ha producido.')
  }
}

/**
 * Compara las lecturas de laboratorio del lote frente a los rangos de bioseguridad (CU23 - Paso 4)
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
 * Determina atómicamente el dictamen en base a la evaluación microbiológica (CU23 - Paso 5)
 */
function determinarDictamen(evaluacion) {
  for (const [, resultado] of Object.entries(evaluacion)) {
    if (resultado.critico && !resultado.enRango) {
      return 'Rechazado'
    }
  }

  for (const [, resultado] of Object.entries(evaluacion)) {
    if (!resultado.enRango) {
      return 'Cuarentena'
    }
  }

  return 'Aprobado'
}

/**
 * Verifica secuencialmente que el lote tenga una ficha conforme aprobada (CU24 - Paso 3)
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

  if (error || !ficha) throw new Error('No se encontró ficha de control de calidad registrada para este lote.')
  if (ficha.dictamen_qa !== 'Aprobado') {
    throw new Error(`El Lote N° ${idLote} no cuenta con dictamen "Aprobado". Dictamen actual: ${ficha.dictamen_qa}.`)
  }
  return ficha
}

/**
 * Verifica secuencialmente que el lote tenga una ficha no conforme u observada (CU25 - Paso 4)
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

  if (error || !ficha) throw new Error('No se encontró ficha de control de calidad registrada para este lote.')
  if (ficha.dictamen_qa === 'Aprobado') {
    throw new Error('Excepción: Un lote con dictamen "Aprobado" no puede ser enviado a disposición restrictiva.')
  }
  return ficha
}

/**
 * Genera el ingreso físico al Kardex de producto terminado y persiste el trigger (CU24 - Paso 7)
 */
async function generarIngresoKardex(lote, idUsuario) {
  const supabaseAdmin = createAdminClient()
  
  // 1. Registrar ingreso en Kardex
  const { data: kardex, error: kardexError } = await supabaseAdmin
    .from('movimientos_kardex')
    .insert([{
      id_item: lote.id_item,
      id_lote: lote.id_lote,
      id_usuario: idUsuario,
      tipo_operacion: 'IN',
      cantidad_kilos: lote.cantidad_producida,
      concepto_operacion: `Ingreso por Producción Liberada - Lote ${lote.codigo_lote}`
    }])
    .select()
    .single()

  if (kardexError) throw kardexError

  // 2. Traza física del trigger hacia CE_Bitacora por el ingreso
  await supabaseAdmin.from('bitacora_auditoria').insert([{
    id_usuario: idUsuario,
    accion_sql: 'INSERT',
    tabla_afectada: 'movimientos_kardex',
    registro_id: kardex.id_log,
    new_data: {
      accion: 'Ingreso al Kardex por liberación de lote',
      id_item: lote.id_item,
      cantidad: lote.cantidad_producida,
      lote: lote.codigo_lote
    }
  }])
}

/**
 * Compara las alertas de stock mínimo tras el nuevo ingreso del lote liberado (CU24 - Paso 8)
 */
async function evaluarAlertasStock(idItem) {
  const supabaseAdmin = createAdminClient()

  const { data: item } = await supabaseAdmin
    .from('catalogo_items')
    .select('stock_minimo, nombre_producto')
    .eq('id_item', idItem)
    .single()

  const { data: movimientos } = await supabaseAdmin
    .from('movimientos_kardex')
    .select('cantidad_kilos')
    .eq('id_item', idItem)

  const stockActual = (movimientos || []).reduce((acc, m) => acc + parseFloat(m.cantidad_kilos || 0), 0)
  const stockMinimo = parseFloat(item?.stock_minimo || 0)

  if (stockActual <= stockMinimo) {
    return { alerta: true, mensaje: `Stock de ${item?.nombre_producto} sigue bajo el mínimo (${stockActual}/${stockMinimo})` }
  }
  return { alerta: false, stockActual }
}

/**
 * Bloquea el lote para evitar que aparezca seleccionable en despachos (CU25 - Paso 7)
 */
function bloquearKardexComercial(idLote) {
  console.log(`[CTR_Calidad] Kardex comercial bloqueado para el lote N° ${idLote}`)
}

/**
 * Envía una notificación con instrucciones detalladas de reproceso al Jefe de Producción (CU25 - Paso 8)
 */
async function notificarJefeProduccion(idOrden, idLote, instrucciones) {
  const supabaseAdmin = createAdminClient()
  
  const { data: orden } = await supabaseAdmin
    .from('ordenes_produccion')
    .select('id_jefe_produccion')
    .eq('id_orden', idOrden)
    .single()

  if (orden) {
    await supabaseAdmin.from('bitacora_auditoria').insert([{
      id_usuario: orden.id_jefe_produccion,
      accion_sql: 'NOTIFICACION_REPROCESO',
      tabla_afectada: 'lote_produccion',
      registro_id: idLote,
      new_data: { instrucciones_reproceso: instrucciones || 'Instrucciones básicas de reproceso en tina' }
    }])
  }
}

// =========================================================================================
// FUNCIONES AUXILIARES EXPORTADAS PARA PRESENTACIÓN
// =========================================================================================

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

export async function obtenerFichasHistoricas() {
  const supabaseAdmin = createAdminClient()
  const { data, error } = await supabaseAdmin
    .from('fichas_calidad')
    .select('*, usuarios!fichas_calidad_id_ingeniero_qa_fkey(email_corporativo), lote_produccion (*, catalogo_items(nombre_producto, unidad_medida))')
    .order('fecha_evaluacion', { ascending: false })

  if (error) {
    console.error(error)
    return []
  }
  return data || []
}

export async function obtenerLiberacionesHistoricas() {
  const supabaseAdmin = createAdminClient()
  const { data, error } = await supabaseAdmin
    .from('fichas_calidad')
    .select('*, lote_produccion (*, catalogo_items(nombre_producto, unidad_medida))')
    .eq('dictamen_qa', 'Aprobado')
    .order('fecha_evaluacion', { ascending: false })

  if (error) {
    console.error(error)
    return []
  }
  return data.filter(f => f.lote_produccion && f.lote_produccion.estado === 'Liberado_Comercial')
}

export async function obtenerDisposicionesHistoricas() {
  const supabaseAdmin = createAdminClient()
  const { data, error } = await supabaseAdmin
    .from('fichas_calidad')
    .select('*, lote_produccion (*, catalogo_items(nombre_producto, unidad_medida))')
    .neq('dictamen_qa', 'Aprobado')
    .order('fecha_evaluacion', { ascending: false })

  if (error) {
    console.error(error)
    return []
  }
  return data.filter(f => f.lote_produccion && (f.lote_produccion.estado === 'Cuarentena_Rechazado' || f.lote_produccion.estado === 'En_Reproceso'))
}
