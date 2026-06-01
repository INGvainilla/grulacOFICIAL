'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

// =========================================================================================
// CTR_Proceso — Controlador de Parámetros Físicos en Planta (P7)
// =========================================================================================
// Métodos según Diagrama de Clases y Secuencia CU21 (OFICIAL.md):
//   + registrarParametros(idOrden, parametrosJSON)
//   + validarRangosPermitidos(params)
//   + calcularCompletitud(registros)
//   + verificarOrdenActiva(idOrden)
// Entidades: CE_OrdenProduccion, CE_ParametrosProceso, CE_Bitacora
// =========================================================================================

// Rangos microbiológicos y físicos de inocuidad alimentaria (Estándares lácteos)
const RANGOS_PERMITIDOS = {
  temperatura: { min: 0, max: 95, unidad: '°C' },
  ph: { min: 3.0, max: 8.0, unidad: '' },
  brix: { min: 0, max: 40, unidad: '°Bx' },
  presion: { min: 0, max: 15, unidad: 'bar' }
}

/**
 * =========================================================================================
 * CU21: Registrar Parámetros Físicos del Proceso
 * Secuencia: Actor (Jefe) -> IU_Parametros -> CTR_Proceso -> CE_OrdenProduccion 
 *   -> CE_ParametrosProceso -> CE_Bitacora
 * =========================================================================================
 */
export async function registrarParametros(idOrden, parametrosJSON) {
  // PASO 1 (Frontera): El Jefe de Producción selecciona la tina/orden activa e inicia el cargado (IU_Parametros)
  // PASO 2 (Frontera -> Control): IU_Parametros invoca a CTR_Proceso.registrarParametros(...)
  const supabase = await createClient()
  const supabaseAdmin = createAdminClient()

  try {
    // PASO 3 (Lectura Entidad): CTR_Proceso consulta CE_OrdenProduccion para verificar el estado activo
    // Método: verificarOrdenActiva(id_orden)
    // (Excepción: Bloquea si la orden no está en estado "En Proceso")
    const orden = await verificarOrdenActiva(idOrden)

    // PASO 4 (Lógica de Validación): CTR_Proceso ejecuta validarRangosPermitidos()
    // Compara cada lectura contra los límites microbiológicos/físicos del caldero/tina
    // (Excepción E1 en Secuencia: Si hay anomalías de pesaje/calor, se emite una advertencia visual al operador)
    const advertencias = validarRangosPermitidos(parametrosJSON)

    // PASO 5 (Creación Entidad): CTR_Proceso instancia un nuevo registro en CE_ParametrosProceso
    // Instanciación: <<create>> (id_orden, parametros[], timestamps)
    // Nota: El modelo físico consolidado persiste la bitácora de parámetros como JSON en observaciones
    let obsAnteriores = {}
    try {
      if (orden.observaciones && orden.observaciones.startsWith('{')) {
        obsAnteriores = JSON.parse(orden.observaciones)
      }
    } catch (e) { /* observaciones no es JSON, se ignora */ }

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

    // Guardar cambios físicos en la base de datos (CE_ParametrosProceso persistencia)
    const { error: updateError } = await supabaseAdmin
      .from('ordenes_produccion')
      .update({ observaciones: JSON.stringify(nuevasObservaciones) })
      .eq('id_orden', idOrden)

    if (updateError) throw new Error('Error al registrar las lecturas físicas del lote: ' + updateError.message)

    // PASO 6 (Lógica del Controlador): CTR_Proceso ejecuta calcularCompletitud()
    // Determina el porcentaje de avance/lectura del lote para la ayuda al operario
    const completitud = calcularCompletitud(registrosParametros)

    // PASO 7 (Trigger de Persistencia): CE_ParametrosProceso ejecuta el trigger automático hacia CE_Bitacora
    // Registro físico del trigger de auditoría forense inmutable de calidad en tina
    const { data: { user } } = await supabase.auth.getUser()
    const { data: usuarioDb } = user ? await supabaseAdmin.from('usuarios').select('id_usuario').eq('auth_uid', user.id).single() : { data: null }
    
    await supabaseAdmin.from('bitacora_auditoria').insert([{
      id_usuario: usuarioDb?.id_usuario || 1,
      accion_sql: 'UPDATE',
      tabla_afectada: 'ordenes_produccion',
      registro_id: idOrden,
      new_data: {
        accion: 'Registro de Parámetros Físicos de Tina',
        etapa: parametrosJSON.etapa || 'General',
        valores: parametrosJSON,
        orden: idOrden
      }
    }])

    // PASO 8 (Retorno): CTR_Proceso devuelve el resumen con indicador de completitud y advertencias a IU_Parametros
    return {
      success: true,
      message: 'Parámetros del lote actualizados correctamente en la bitácora física.',
      advertencias,
      completitud
    }
  } catch (error) {
    console.error('[CU21 - ERROR]:', error.message)
    return { success: false, error: error.message }
  }
}

// =========================================================================================
// MÉTODOS INTERNOS Y REGLAS DE NEGOCIO DEL CONTROLADOR
// =========================================================================================

/**
 * Verifica secuencialmente que la orden seleccionada se encuentre activa en planta (CU21 - Paso 3)
 */
async function verificarOrdenActiva(idOrden) {
  const supabaseAdmin = createAdminClient()

  const { data: orden, error: ordenError } = await supabaseAdmin
    .from('ordenes_produccion')
    .select('id_orden, estado_lote, observaciones, id_receta')
    .eq('id_orden', idOrden)
    .single()

  if (ordenError || !orden) throw new Error('La orden de producción seleccionada no existe')
  if (orden.estado_lote !== 'En_Proceso') {
    throw new Error(`La orden N° ${idOrden} no se encuentra en estado "En Proceso" (Estado actual: ${orden.estado_lote}).`)
  }
  return orden
}

/**
 * Valida que cada parámetro registrado esté dentro de los rangos de tolerancia esperados (CU21 - Paso 4)
 */
function validarRangosPermitidos(params) {
  const advertencias = []

  for (const [nombre, rango] of Object.entries(RANGOS_PERMITIDOS)) {
    const valor = parseFloat(params[nombre])
    if (!isNaN(valor)) {
      if (valor < rango.min || valor > rango.max) {
        advertencias.push(
          `¡Alerta Física!: La variable de ${nombre} registrada es de ${valor}${rango.unidad}. Está fuera del rango esperado de bioseguridad [${rango.min}–${rango.max}${rango.unidad}].`
        )
      }
    }
  }

  return advertencias
}

/**
 * Calcula el nivel de completitud de las variables físicas recopiladas en la tina (CU21 - Paso 6)
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
