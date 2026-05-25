'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

// ============================================================
// CTR_Proceso — Controlador de Parámetros Físicos (P7)
// Métodos según Diagrama de Clases CU21 (OFICIAL.md):
//   + registrarParametros(orden, params)
//   + validarRangosPermitidos()
//   + calcularCompletitud()
//   + verificarOrdenActiva()
// Entidades: CE_OrdenProduccion, CE_ParametrosProceso, CE_Bitacora
// Nota: La BD oficial no posee tabla "parametros_proceso".
//       Se almacenan como JSON en la columna 'observaciones' de ordenes_produccion.
// ============================================================

// Rangos permitidos por tipo de parámetro (según estándares lácteos)
const RANGOS_PERMITIDOS = {
  temperatura: { min: 0, max: 95, unidad: '°C' },
  ph: { min: 3.0, max: 8.0, unidad: '' },
  brix: { min: 0, max: 40, unidad: '°Bx' },
  presion: { min: 0, max: 15, unidad: 'bar' }
}

/**
 * CU21: Registrar Parámetros Físicos del Proceso
 * Diagrama de Comunicación:
 *   Actor→IU_Parametros→CTR_Proceso→CE_OrdenProduccion→CE_ParametrosProceso→CE_Bitacora
 */
export async function registrarParametros(idOrden, parametrosJSON) {
  const supabase = await createClient()
  const supabaseAdmin = createAdminClient()

  try {
    // Paso 1: verificarOrdenActiva() — CE_OrdenProduccion
    const orden = await verificarOrdenActiva(idOrden)

    // Paso 2: validarRangosPermitidos(params)
    const advertencias = validarRangosPermitidos(parametrosJSON)

    // Paso 3: Construir registro con timestamp (CE_ParametrosProceso simulado)
    let obsAnteriores = {}
    try {
      if (orden.observaciones && orden.observaciones.startsWith('{')) {
        obsAnteriores = JSON.parse(orden.observaciones)
      }
    } catch (e) { /* observaciones no es JSON, se sobrescribe */ }

    const registrosParametros = obsAnteriores.parametros_proceso || []
    registrosParametros.push({
      timestamp: new Date().toISOString(),
      etapa_proceso: parametrosJSON.etapa || 'General',
      valores: {
        temperatura: parseFloat(parametrosJSON.temperatura) || null,
        ph: parseFloat(parametrosJSON.ph) || null,
        brix: parseFloat(parametrosJSON.brix) || null,
        presion: parseFloat(parametrosJSON.presion) || null
      }
    })

    const nuevasObservaciones = {
      ...obsAnteriores,
      parametros_proceso: registrosParametros
    }

    // Paso 4: insert(parametros, timestamp) — persistir en BD
    const { error: updateError } = await supabaseAdmin
      .from('ordenes_produccion')
      .update({ observaciones: JSON.stringify(nuevasObservaciones) })
      .eq('id_orden', idOrden)

    if (updateError) throw updateError

    // Paso 5: calcularCompletitud()
    const completitud = calcularCompletitud(registrosParametros)

    // Paso 6: CE_Bitacora
    const { data: { user } } = await supabase.auth.getUser()
    const { data: usuarioDb } = user ? await supabaseAdmin.from('usuarios').select('id_usuario').eq('auth_uid', user.id).single() : { data: null }
    await supabaseAdmin.from('bitacora_auditoria').insert([{
      id_usuario: usuarioDb?.id_usuario || 1,
      accion_sql: 'UPDATE',
      tabla_afectada: 'ordenes_produccion',
      registro_id: idOrden,
      new_data: { accion: `Registro parámetros etapa: ${parametrosJSON.etapa || 'General'} (Orden #${idOrden})` }
    }])

    return {
      success: true,
      message: 'Parámetros guardados correctamente',
      advertencias,
      completitud
    }
  } catch (error) {
    console.error('Error en registrarParametros:', error.message)
    return { success: false, error: error.message }
  }
}

// ===================== MÉTODOS INTERNOS DEL CONTROLADOR =====================

/**
 * verificarOrdenActiva() — Verifica que la orden esté en estado 'En_Proceso'
 */
async function verificarOrdenActiva(idOrden) {
  const supabaseAdmin = createAdminClient()

  const { data: orden, error: ordenError } = await supabaseAdmin
    .from('ordenes_produccion')
    .select('id_orden, estado_lote, observaciones, id_receta')
    .eq('id_orden', idOrden)
    .single()

  if (ordenError || !orden) throw new Error('Orden no encontrada')
  if (orden.estado_lote !== 'En_Proceso') {
    throw new Error('La orden no está en estado "En Proceso". Estado actual: ' + orden.estado_lote)
  }
  return orden
}

/**
 * validarRangosPermitidos() — Valida cada parámetro contra rangos configurados
 * Retorna un array de advertencias (no bloquea, solo advierte según secuencia CU21)
 */
function validarRangosPermitidos(params) {
  const advertencias = []

  for (const [nombre, rango] of Object.entries(RANGOS_PERMITIDOS)) {
    const valor = parseFloat(params[nombre])
    if (!isNaN(valor)) {
      if (valor < rango.min || valor > rango.max) {
        advertencias.push(
          `${nombre}: ${valor}${rango.unidad} está fuera del rango esperado [${rango.min}–${rango.max}${rango.unidad}]`
        )
      }
    }
  }

  return advertencias
}

/**
 * calcularCompletitud() — Calcula el porcentaje de completitud de los parámetros
 * Basado en la cantidad de registros con todos los campos llenos
 */
function calcularCompletitud(registros) {
  if (!registros || registros.length === 0) return { porcentaje: 0, registros: 0 }

  const totalCampos = Object.keys(RANGOS_PERMITIDOS).length
  const ultimoRegistro = registros[registros.length - 1]
  const camposLlenos = Object.values(ultimoRegistro.valores || {}).filter(v => v !== null).length

  return {
    porcentaje: Math.round((camposLlenos / totalCampos) * 100),
    registros: registros.length,
    camposLlenos,
    totalCampos
  }
}
