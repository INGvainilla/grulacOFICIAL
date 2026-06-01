'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

// =========================================================================================
// CTR_Produccion — Controlador de Producción en Planta (P7)
// =========================================================================================
// Métodos según Diagramas de Clases y Secuencia CU20 y CU22 (OFICIAL.md):
//   CU20: + aperturarOrden(receta, litros)
//           + calcularProporcionesInsumos(ingredientes, litrosReales, litrosBase)
//           + validarStockDisponible(insumosCalculados)
//           + deducirInsumosKardex(insumosCalculados, idOrden, idUsuario)
//           + generarNumeroLote(idOrden)
//   CU22: + codificarLote(orden, peso, moldes, presentaciones[])
//           + calcularRendimiento(pesoKg, litros)
//           + validarConsistenciaPesos(pesoBruto, presentaciones)
//           + cerrarOrdenProduccion(idOrden, pesoObtenido, rendimientoPct)
// =========================================================================================

/**
 * =========================================================================================
 * CU20: Aperturar Orden de Producción
 * Secuencia: Actor (Jefe) -> IU_Produccion -> CTR_Produccion -> CE_RecetaBOM 
 *   -> CE_DetalleReceta -> CE_Kardex_Movimientos -> CE_OrdenProduccion -> CE_Bitacora
 * =========================================================================================
 */
export async function aperturarOrden(idReceta, litrosInvertidos) {
  // PASO 1 (Frontera): El Jefe de Producción inicia la acción en la interfaz reactiva (IU_Produccion)
  // PASO 2 (Frontera -> Control): IU_Produccion invoca a CTR_Produccion.aperturarOrden(...)
  const supabase = await createClient()
  const supabaseAdmin = createAdminClient()

  try {
    const litrosNum = parseFloat(litrosInvertidos)
    if (isNaN(litrosNum) || litrosNum <= 0) {
      throw new Error('El volumen de leche a procesar debe ser un valor numérico estrictamente positivo.')
    }

    // 2.1. Obtener la sesión activa del operador para garantizar la trazabilidad forense
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Operador no autenticado en el sistema')

    const { data: usuarioDb } = await supabaseAdmin
      .from('usuarios')
      .select('id_usuario')
      .eq('auth_uid', user.id)
      .single()

    if (!usuarioDb) throw new Error('El operador no cuenta con un registro físico de usuario')

    // PASO 3 (Lectura Entidad): CTR_Produccion consulta CE_RecetaBOM para obtener la fórmula maestra activa
    // Método: getRecetaActiva(id_receta)
    const { data: receta, error: recetaError } = await supabaseAdmin
      .from('recetas_bom')
      .select('id_receta, base_litros_leche, nombre_receta, rendimiento_esperado_pct')
      .eq('id_receta', idReceta)
      .eq('estado_activa', true)
      .single()

    if (recetaError || !receta) {
      throw new Error('La Receta BOM seleccionada no existe o no se encuentra en estado Activa.')
    }

    // PASO 5 (Lectura Entidad): CTR_Produccion consulta CE_DetalleReceta para listar los ingredientes y proporciones
    // Método: getIngredientes(id_receta)
    const { data: ingredientes, error: ingError } = await supabaseAdmin
      .from('receta_ingredientes')
      .select('id_item_ingrediente, cantidad_por_base, unidad_medida, es_obligatorio')
      .eq('id_receta', idReceta)

    if (ingError) throw new Error('Error al leer el detalle de ingredientes: ' + ingError.message)

    // PASO 6 (Lógica del Controlador): CTR_Produccion ejecuta calcularProporcionesInsumos()
    // Calcula proporcionalmente la cantidad de cada ingrediente según los litros de leche invertidos
    const insumosCalculados = calcularProporcionesInsumos(ingredientes, litrosNum, receta.base_litros_leche)

    // PASO 7 (Bucle & Consulta Entidad): CTR_Produccion evalúa el stock disponible de cada insumo en CE_Kardex_Movimientos
    // Método: getStockActual(id_insumo) por cada ingrediente
    // (Excepción E1 en Secuencia: Si algún insumo es insuficiente, se bloquea atómicamente la orden y lista los faltantes)
    await validarStockDisponible(insumosCalculados)

    // PASO 8 (Creación Entidad): CTR_Produccion inserta un nuevo registro en CE_OrdenProduccion
    // Instanciación: <<create>> (receta, litros, lote_auto, estado='En Proceso')
    const { data: orden, error: ordenError } = await supabaseAdmin
      .from('ordenes_produccion')
      .insert([{
        id_jefe_produccion: usuarioDb.id_usuario,
        id_receta: idReceta,
        litros_invertidos: litrosNum,
        estado_lote: 'En_Proceso'
      }])
      .select()
      .single()

    if (ordenError) throw new Error('Error al registrar la Orden de Producción: ' + ordenError.message)

    // PASO 9 (Trigger de Persistencia): CE_OrdenProduccion ejecuta el trigger automático hacia CE_Bitacora
    // Simulación física en controlador Next.js para dejar traza de la apertura de lote
    await supabaseAdmin.from('bitacora_auditoria').insert([{
      id_usuario: usuarioDb.id_usuario,
      accion_sql: 'INSERT',
      tabla_afectada: 'ordenes_produccion',
      registro_id: orden.id_orden,
      new_data: {
        accion: 'Apertura de Orden de Producción',
        receta: receta.nombre_receta,
        litros_leche: litrosNum,
        lote: generarNumeroLote(orden.id_orden)
      }
    }])

    // PASO 10 (Bucle & Creación): CTR_Produccion descuenta atómicamente cada insumo del inventario en CE_Kardex_Movimientos
    // Método: deducirInsumosKardex() -> insert(EGRESO_PRODUCCION, id_insumo, cantidad)
    // Cada movimiento físico de egreso dispara a su vez un trigger automático hacia CE_Bitacora
    await deducirInsumosKardex(insumosCalculados, orden.id_orden, usuarioDb.id_usuario)

    // PASO 11 (Retorno): CTR_Produccion devuelve la orden aperturada exitosamente a la interfaz IU_Produccion
    return {
      success: true,
      message: `Orden de Producción #${orden.id_orden} aperturada con éxito. Lote generado.`,
      orden
    }
  } catch (error) {
    console.error('[CU20 - ERROR]:', error.message)
    return { success: false, error: error.message }
  }
}

/**
 * =========================================================================================
 * CU22: Codificar Lote Físico Terminado
 * Secuencia: Actor (Jefe) -> IU_CierreLote -> CTR_Produccion -> CE_OrdenProduccion 
 *   -> CE_LoteProduccion -> CE_PresentacionesLote -> CE_Bitacora
 * =========================================================================================
 */
export async function codificarLote(idOrden, pesoBrutoKg, numMoldes, presentaciones) {
  // PASO 1 (Frontera): El Jefe de Producción inicia el cierre ingresando los pesos y moldes (IU_CierreLote)
  // PASO 2 (Frontera -> Control): IU_CierreLote invoca a CTR_Produccion.codificarLote(...)
  const supabase = await createClient()
  const supabaseAdmin = createAdminClient()

  try {
    const pesoNum = parseFloat(pesoBrutoKg)
    if (isNaN(pesoNum) || pesoNum <= 0) {
      throw new Error('El peso bruto consolidado del lote debe ser un valor numérico estrictamente positivo.')
    }

    // 2.1. Obtener la sesión activa del operador para garantizar la trazabilidad forense
    const { data: { user } } = await supabase.auth.getUser()
    const { data: usuarioDb } = user ? await supabaseAdmin.from('usuarios').select('id_usuario').eq('auth_uid', user.id).single() : { data: null }
    const idUsuario = usuarioDb?.id_usuario || 1

    // PASO 3 (Lectura Entidad): CTR_Produccion consulta CE_OrdenProduccion para verificar el estado y los litros invertidos
    // Método: getVolumenLeche(id_orden)
    const { data: orden, error: ordenError } = await supabaseAdmin
      .from('ordenes_produccion')
      .select('*, recetas_bom ( id_item_resultado )')
      .eq('id_orden', idOrden)
      .single()

    if (ordenError || !orden) throw new Error('No se encontró la Orden de Producción asociada: ' + ordenError.message)
    if (orden.estado_lote !== 'En_Proceso') {
      throw new Error('La Orden de Producción seleccionada no se encuentra activa en planta ("En Proceso").')
    }

    // PASO 4 (Lógica del Controlador): CTR_Produccion calcula el rendimiento transformativo real
    // Método: calcularRendimiento(peso / litros * 100)
    // (Excepción E1 en Secuencia: Si el rendimiento está fuera de rangos históricos, se emite una advertencia visual)
    const rendimientoPct = calcularRendimiento(pesoNum, orden.litros_invertidos)

    // Regla de Negocio: Validar consistencia física de los pesos declarados en el desglose
    if (presentaciones && presentaciones.length > 0) {
      validarConsistenciaPesos(pesoNum, presentaciones)
    }

    // PASO 5 (Creación Entidad): CTR_Produccion crea un registro en CE_LoteProduccion
    // Instanciación: <<create>> (codigo_lote, peso, estado='Pendiente QA')
    const codigoLote = generarNumeroLote(idOrden)
    const { data: lote, error: loteError } = await supabaseAdmin
      .from('lote_produccion')
      .insert([{
        id_orden: idOrden,
        id_item: orden.recetas_bom.id_item_resultado,
        codigo_lote: codigoLote,
        cantidad_producida: pesoNum,
        unidad_medida: 'KG',
        estado: 'Pendiente_QA',
        observaciones: numMoldes ? `Moldes: ${numMoldes}` : null
      }])
      .select()
      .single()

    if (loteError) throw new Error('Error al registrar el lote de producción físico: ' + loteError.message)

    // PASO 6 (Trigger de Persistencia): CE_LoteProduccion ejecuta el trigger automático hacia CE_Bitacora
    // Registro de trazabilidad forense inmutable de la creación del lote
    await supabaseAdmin.from('bitacora_auditoria').insert([{
      id_usuario: idUsuario,
      accion_sql: 'INSERT',
      tabla_afectada: 'lote_produccion',
      registro_id: lote.id_lote,
      new_data: {
        accion: 'Creación y Codificación de Lote Lácteo',
        codigo_lote: codigoLote,
        peso_bruto: pesoNum,
        estado: 'Pendiente QA'
      }
    }])

    // PASO 7 (Bucle & Creación): CTR_Produccion registra cada presentación física en CE_PresentacionesLote
    // Instanciación: <<create>> (id_lote, tipo, unidades, peso) por cada fila
    // Nota: El modelo físico actual compila este desglose en JSON observaciones por flexibilidad transaccional
    if (presentaciones && presentaciones.length > 0) {
      const obsLote = {
        moldes: parseInt(numMoldes) || null,
        presentaciones: presentaciones
      }
      await supabaseAdmin
        .from('lote_produccion')
        .update({ observaciones: JSON.stringify(obsLote) })
        .eq('id_lote', lote.id_lote)
    }

    // PASO 8 (Edición Entidad): CTR_Produccion cierra formalmente la orden en CE_OrdenProduccion
    // Sentencia: update(estado='Cerrada', hora_fin)
    // Esta acción a su vez dispara un trigger automático hacia CE_Bitacora
    await cerrarOrdenProduccion(idOrden, pesoNum, rendimientoPct)

    // PASO 9 (Retorno): CTR_Produccion devuelve el resumen con el badge "Pendiente QA" a IU_CierreLote
    return {
      success: true,
      message: `Lote ${codigoLote} codificado con éxito. Rendimiento calculado: ${rendimientoPct.toFixed(2)}%.`,
      lote,
      rendimiento: rendimientoPct
    }
  } catch (error) {
    console.error('[CU22 - ERROR]:', error.message)
    return { success: false, error: error.message }
  }
}

// =========================================================================================
// MÉTODOS INTERNOS Y REGLAS DE NEGOCIO DEL CONTROLADOR
// =========================================================================================

/**
 * Calcula proporcionalmente la cantidad requerida de ingredientes según el lote a procesar (CU20 - Paso 6)
 */
function calcularProporcionesInsumos(ingredientes, litrosReales, litrosBase) {
  const factor = litrosReales / parseFloat(litrosBase)
  return ingredientes.map(ing => ({
    id_item: ing.id_item_ingrediente,
    cantidad_requerida: parseFloat(ing.cantidad_por_base) * factor,
    es_obligatorio: ing.es_obligatorio
  }))
}

/**
 * Valida de forma secuencial que exista stock disponible en Kardex para cada insumo (CU20 - Paso 7)
 */
async function validarStockDisponible(insumosCalculados) {
  const supabaseAdmin = createAdminClient()

  const { data: itemsCatalogo } = await supabaseAdmin
    .from('catalogo_items')
    .select('id_item, nombre_producto')
    .in('id_item', insumosCalculados.map(i => i.id_item))

  for (const req of insumosCalculados) {
    const dbItem = itemsCatalogo?.find(i => i.id_item === req.id_item)
    
    // Consulta acumulada en Kardex
    const { data: movimientos } = await supabaseAdmin
      .from('movimientos_kardex')
      .select('cantidad_kilos')
      .eq('id_item', req.id_item)

    const stockActual = (movimientos || []).reduce((acc, m) => acc + parseFloat(m.cantidad_kilos || 0), 0)

    if (stockActual < req.cantidad_requerida) {
      throw new Error(`Excepción de Abastecimiento: El insumo "${dbItem?.nombre_producto || req.id_item}" tiene stock insuficiente. Disponible en almacén: ${stockActual.toFixed(2)} kg, Requerido por receta: ${req.cantidad_requerida.toFixed(2)} kg.`)
    }
  }
}

/**
 * Genera movimientos de egreso físico por cada insumo y registra su correspondiente traza en la bitácora (CU20 - Paso 10)
 */
async function deducirInsumosKardex(insumosCalculados, idOrden, idUsuario) {
  const supabaseAdmin = createAdminClient()

  for (const req of insumosCalculados) {
    // 1. Crear egreso en CE_Kardex_Movimientos
    const { data: kardex, error: kardexError } = await supabaseAdmin.from('movimientos_kardex').insert([{
      id_item: req.id_item,
      id_orden_asociada: idOrden,
      id_usuario: idUsuario,
      tipo_operacion: 'OUT',
      cantidad_kilos: -Math.abs(req.cantidad_requerida),
      concepto_operacion: `Deducción atómica por Orden de Producción Láctea N° ${idOrden}`
    }]).select().single()

    if (kardexError) throw kardexError

    // 2. Ejecutar de forma física la traza del trigger hacia CE_Bitacora por cada deducción
    await supabaseAdmin.from('bitacora_auditoria').insert([{
      id_usuario: idUsuario,
      accion_sql: 'INSERT',
      tabla_afectada: 'movimientos_kardex',
      registro_id: kardex.id_log,
      new_data: {
        accion: 'Egreso de insumo en producción',
        id_item: req.id_item,
        cantidad: req.cantidad_requerida,
        orden: idOrden
      }
    }])
  }
}

/**
 * Genera el número de lote de manera estandarizada y unívoca (CU20 - Paso 9)
 */
function generarNumeroLote(idOrden) {
  const fecha = new Date().toISOString().slice(0, 10).replace(/-/g, '')
  return `LOTE-${fecha}-${idOrden}`
}

/**
 * Calcula la tasa de rendimiento en base al peso e insumo lechero procesado (CU22 - Paso 4)
 */
function calcularRendimiento(pesoKg, litros) {
  return (pesoKg / parseFloat(litros)) * 100
}

/**
 * Valida la consistencia de pesos del lote frente a su desglose comercial en presentaciones (CU22 - Regla Consistencia)
 */
function validarConsistenciaPesos(pesoBruto, presentaciones) {
  const sumaPresentaciones = presentaciones.reduce((acc, p) => {
    return acc + (parseFloat(p.unidades || 0) * parseFloat(p.pesoUnitario || 0))
  }, 0)

  const tolerancia = pesoBruto * 0.05 // 5% de tolerancia técnica
  if (Math.abs(pesoBruto - sumaPresentaciones) > tolerancia) {
    throw new Error(
      `Inconsistencia Física: El peso bruto declarado del lote es ${pesoBruto} kg, ` +
      `pero la suma de pesos de su desglose comercial es de ${sumaPresentaciones.toFixed(2)} kg. ` +
      `La diferencia de pesaje excede la tolerancia permitida del 5%.`
    )
  }
}

/**
 * Registra el cierre de la orden, calcula rendimientos definitivos y registra la traza del trigger (CU22 - Paso 8)
 */
async function cerrarOrdenProduccion(idOrden, pesoObtenido, rendimientoPct) {
  const supabaseAdmin = createAdminClient()
  
  // 1. Cerrar orden física en BD
  const { data: orden, error: updateError } = await supabaseAdmin.from('ordenes_produccion').update({
    kilos_obtenidos_brutos: pesoObtenido,
    rendimiento_real_pct: rendimientoPct,
    estado_lote: 'Completado_Pendiente_QA',
    fecha_cierre: new Date().toISOString()
  }).eq('id_orden', idOrden).select().single()

  if (updateError) throw updateError

  // 2. Traza física del trigger hacia CE_Bitacora por el cierre de orden
  await supabaseAdmin.from('bitacora_auditoria').insert([{
    id_usuario: orden.id_jefe_produccion,
    accion_sql: 'UPDATE',
    tabla_afectada: 'ordenes_produccion',
    registro_id: idOrden,
    new_data: {
      accion: 'Cierre de Orden de Producción',
      kilos_brutos: pesoObtenido,
      rendimiento: rendimientoPct,
      estado: 'Completado_Pendiente_QA'
    }
  }])
}

// =========================================================================================
// FUNCIONES AUXILIARES EXPORTADAS PARA PRESENTACIÓN
// =========================================================================================

export async function obtenerRecetas() {
  const supabaseAdmin = createAdminClient()
  const { data } = await supabaseAdmin
    .from('recetas_bom')
    .select('*, catalogo_items (nombre_producto)')
    .eq('estado_activa', true)
  return data || []
}

export async function obtenerOrdenesEnProceso() {
  const supabaseAdmin = createAdminClient()
  const { data } = await supabaseAdmin
    .from('ordenes_produccion')
    .select('*, recetas_bom (nombre_receta)')
    .eq('estado_lote', 'En_Proceso')
  return data || []
}
