'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

// ============================================================
// CTR_Produccion — Controlador de Producción en Planta (P7)
// Métodos según Diagramas de Clases CU20 y CU22 (OFICIAL.md):
//   CU20: + aperturarOrden(receta, litros)
//           + calcularProporcionesInsumos()
//           + validarStockDisponible()
//           + deducirInsumosKardex()
//           + generarNumeroLote()
//   CU22: + codificarLote(orden, peso, moldes, presentaciones[])
//           + calcularRendimiento()
//           + validarConsistenciaPesos()
//           + cerrarOrdenProduccion()
// Entidades: CE_RecetaBOM, CE_DetalleReceta, CE_OrdenProduccion,
//            CE_LoteProduccion, CE_PresentacionesLote, CE_Kardex, CE_Bitacora
// ============================================================

/**
 * CU20: Aperturar Orden de Producción
 * Diagrama Comunicación: Actor→IU_Produccion→CTR_Produccion
 *   →CE_RecetaBOM→CE_DetalleReceta→CE_Kardex→CE_OrdenProduccion→CE_Bitacora
 */
export async function aperturarOrden(idReceta, litrosInvertidos) {
  const supabase = await createClient()
  const supabaseAdmin = createAdminClient()

  try {
    const litrosNum = parseFloat(litrosInvertidos)
    if (isNaN(litrosNum) || litrosNum <= 0) throw new Error('Los litros invertidos deben ser un número positivo')

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('No autorizado')

    const { data: usuarioDb } = await supabaseAdmin
      .from('usuarios')
      .select('id_usuario')
      .eq('auth_uid', user.id)
      .single()

    // Paso 3: getRecetaActiva(id) — CE_RecetaBOM
    const { data: receta, error: recetaError } = await supabaseAdmin
      .from('recetas_bom')
      .select('id_receta, base_litros_leche, nombre_receta, rendimiento_esperado_pct')
      .eq('id_receta', idReceta)
      .eq('estado_activa', true)
      .single()

    if (recetaError || !receta) throw new Error('No se encontró la receta activa seleccionada')

    // Paso 5: calcularProporcionesInsumos() — CE_DetalleReceta
    const { data: ingredientes, error: ingError } = await supabaseAdmin
      .from('receta_ingredientes')
      .select('id_item_ingrediente, cantidad_por_base, unidad_medida, es_obligatorio')
      .eq('id_receta', idReceta)

    if (ingError) throw ingError

    const insumosCalculados = calcularProporcionesInsumos(ingredientes, litrosNum, receta.base_litros_leche)

    // Paso 7: validarStockDisponible(items[]) — CE_Kardex
    await validarStockDisponible(insumosCalculados)

    // Paso 9: insert(orden, estado='En Proceso') — CE_OrdenProduccion
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

    if (ordenError) throw ordenError

    // Paso 10: deducirInsumosKardex() — insert(EGRESO_PRODUCCION, items[])
    await deducirInsumosKardex(insumosCalculados, orden.id_orden, usuarioDb.id_usuario)

    // Paso 11: CE_Bitacora
    await supabaseAdmin.from('bitacora_auditoria').insert([{
      id_usuario: usuarioDb.id_usuario,
      accion_sql: 'INSERT',
      tabla_afectada: 'ordenes_produccion',
      registro_id: orden.id_orden,
      new_data: { accion: `Apertura Orden #${orden.id_orden} (${litrosNum}L)` }
    }])

    return { success: true, message: `Orden #${orden.id_orden} aperturada correctamente`, orden }
  } catch (error) {
    console.error('Error en aperturarOrden:', error.message)
    return { success: false, error: error.message }
  }
}

/**
 * CU22: Codificar Lote Físico Terminado
 * Diagrama Comunicación: Actor→IU_CierreLote→CTR_Produccion
 *   →CE_OrdenProduccion→CE_LoteProduccion→CE_PresentacionesLote→CE_Bitacora
 * Firma: codificarLote(orden, peso, moldes, presentaciones[])
 */
export async function codificarLote(idOrden, pesoBrutoKg, numMoldes, presentaciones) {
  const supabase = await createClient()
  const supabaseAdmin = createAdminClient()

  try {
    const pesoNum = parseFloat(pesoBrutoKg)
    if (isNaN(pesoNum) || pesoNum <= 0) throw new Error('El peso bruto debe ser un número positivo')

    const { data: { user } } = await supabase.auth.getUser()
    const { data: usuarioDb } = user ? await supabaseAdmin.from('usuarios').select('id_usuario').eq('auth_uid', user.id).single() : { data: null }
    const idUsuario = usuarioDb?.id_usuario || 1

    // Paso 3: getVolumenLeche(orden) — CE_OrdenProduccion
    const { data: orden, error: ordenError } = await supabaseAdmin
      .from('ordenes_produccion')
      .select('*, recetas_bom ( id_item_resultado )')
      .eq('id_orden', idOrden)
      .single()

    if (ordenError) throw ordenError
    if (orden.estado_lote !== 'En_Proceso') throw new Error('La orden no está en proceso')

    // Paso 5: calcularRendimiento(peso/litros)
    const rendimientoPct = calcularRendimiento(pesoNum, orden.litros_invertidos)

    // validarConsistenciaPesos() — verifica que suma de presentaciones ≈ peso bruto
    if (presentaciones && presentaciones.length > 0) {
      validarConsistenciaPesos(pesoNum, presentaciones)
    }

    // Paso 6: insert(lote, estado='Pendiente QA') — CE_LoteProduccion
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

    if (loteError) throw loteError

    // Paso 7: insert(presentaciones[]) — CE_PresentacionesLote
    // Nota: La BD no tiene tabla presentaciones_lote, se almacenan en observaciones del lote
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

    // Paso 8: cerrarOrdenProduccion() — update(estado='Cerrada')
    await cerrarOrdenProduccion(idOrden, pesoNum, rendimientoPct)

    // Registro Bitácora
    await supabaseAdmin.from('bitacora_auditoria').insert([{
      id_usuario: idUsuario,
      accion_sql: 'INSERT',
      tabla_afectada: 'lote_produccion',
      registro_id: lote.id_lote,
      new_data: { accion: `Cierre Lote ${codigoLote} (Orden #${idOrden})` }
    }])

    return {
      success: true,
      message: `Lote ${codigoLote} generado con rendimiento ${rendimientoPct.toFixed(2)}%`,
      lote,
      rendimiento: rendimientoPct
    }
  } catch (error) {
    console.error('Error en codificarLote:', error.message)
    return { success: false, error: error.message }
  }
}

// ===================== MÉTODOS INTERNOS =====================

/**
 * calcularProporcionesInsumos() — Calcula cantidades requeridas según factor de escala
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
 * validarStockDisponible() — Verifica stock en Kardex para cada insumo
 */
async function validarStockDisponible(insumosCalculados) {
  const supabaseAdmin = createAdminClient()

  const { data: itemsCatalogo } = await supabaseAdmin
    .from('catalogo_items')
    .select('id_item, nombre_producto')
    .in('id_item', insumosCalculados.map(i => i.id_item))

  for (const req of insumosCalculados) {
    const dbItem = itemsCatalogo?.find(i => i.id_item === req.id_item)
    // Calcular stock desde Kardex
    const { data: movimientos } = await supabaseAdmin
      .from('movimientos_kardex')
      .select('cantidad_kilos')
      .eq('id_item', req.id_item)

    const stockActual = (movimientos || []).reduce((acc, m) => acc + parseFloat(m.cantidad_kilos || 0), 0)

    if (stockActual < req.cantidad_requerida) {
      throw new Error(`Stock insuficiente para: ${dbItem?.nombre_producto || req.id_item}. Disponible: ${stockActual.toFixed(2)}, Requerido: ${req.cantidad_requerida.toFixed(2)}`)
    }
  }
}

/**
 * deducirInsumosKardex() — Genera movimientos de egreso masivos
 */
async function deducirInsumosKardex(insumosCalculados, idOrden, idUsuario) {
  const supabaseAdmin = createAdminClient()

  for (const req of insumosCalculados) {
    await supabaseAdmin.from('movimientos_kardex').insert([{
      id_item: req.id_item,
      id_orden_asociada: idOrden,
      id_usuario: idUsuario,
      tipo_operacion: 'OUT',
      cantidad_kilos: -Math.abs(req.cantidad_requerida),
      concepto_operacion: `Egreso por Orden de Producción N° ${idOrden}`
    }])
  }
}

/**
 * generarNumeroLote() — Genera código único de lote
 */
function generarNumeroLote(idOrden) {
  const fecha = new Date().toISOString().slice(0, 10).replace(/-/g, '')
  return `LOTE-${fecha}-${idOrden}`
}

/**
 * calcularRendimiento() — (peso_obtenido / litros_invertidos) * 100
 */
function calcularRendimiento(pesoKg, litros) {
  return (pesoKg / parseFloat(litros)) * 100
}

/**
 * validarConsistenciaPesos() — Verifica que la suma de presentaciones ≈ peso bruto
 */
function validarConsistenciaPesos(pesoBruto, presentaciones) {
  const sumaPresentaciones = presentaciones.reduce((acc, p) => {
    return acc + (parseFloat(p.unidades || 0) * parseFloat(p.pesoUnitario || 0))
  }, 0)

  const tolerancia = pesoBruto * 0.05 // 5% de tolerancia
  if (Math.abs(pesoBruto - sumaPresentaciones) > tolerancia) {
    throw new Error(
      `Inconsistencia de pesos: Peso bruto=${pesoBruto}kg vs Suma presentaciones=${sumaPresentaciones.toFixed(2)}kg. ` +
      `Diferencia excede tolerancia del 5%.`
    )
  }
}

/**
 * cerrarOrdenProduccion() — Actualiza estado de la orden al cierre
 */
async function cerrarOrdenProduccion(idOrden, pesoObtenido, rendimientoPct) {
  const supabaseAdmin = createAdminClient()
  await supabaseAdmin.from('ordenes_produccion').update({
    kilos_obtenidos_brutos: pesoObtenido,
    rendimiento_real_pct: rendimientoPct,
    estado_lote: 'Completado_Pendiente_QA',
    fecha_cierre: new Date().toISOString()
  }).eq('id_orden', idOrden)
}

// ===================== FUNCIONES AUXILIARES EXPORTADAS =====================

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
