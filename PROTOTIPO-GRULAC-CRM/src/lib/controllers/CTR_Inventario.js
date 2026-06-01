'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

// =========================================================================================
// CTR_Inventario — Controlador de Gestión de Inventario (P3)
// =========================================================================================
// Métodos según Diagrama de Clases de Diseño (OFICIAL.md):
//   + registrarAjuste(item, tipo, cantidad, motivo, observacion)
//   + validarStockResultante(stockActual, cantidadAjuste)
//   + generarMovimientoKardex() -> [Mapeado internamente en movimientos_kardex]
//   + configurarAlerta(item, umbral)
//   + evaluarEstadoAlerta(stock_actual, nuevoUmbral)
//   + validarUmbralPositivo(nuevoUmbral)
// =========================================================================================

/**
 * =========================================================================================
 * CU10: Registrar Ajuste Manual o Merma Aislada
 * Secuencia: Actor (Jefe) -> IU_Ajustes -> CTR_Inventario -> CE_Catalogo_Items -> CE_Kardex -> CE_Bitacora
 * =========================================================================================
 */
export async function registrarAjuste(idItem, tipoAjuste, cantidad, motivo, observacion) {
  // PASO 1 (Frontera): El Jefe de Producción inicia la acción en la interfaz reactiva (IU_Ajustes)
  // PASO 2 (Frontera -> Control): IU_Ajustes invoca a CTR_Inventario.registrarAjuste(...)
  const supabase = await createClient()
  const supabaseAdmin = createAdminClient()

  try {
    // 2.1. Obtener la sesión activa del operador para garantizar la trazabilidad forense
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Operador no autenticado en el sistema')

    const { data: usuarioDb } = await supabaseAdmin
      .from('usuarios')
      .select('id_usuario')
      .eq('auth_uid', user.id)
      .single()

    if (!usuarioDb) throw new Error('El operador no cuenta con un registro físico de usuario')

    // PASO 3 (Validación Lógica): El controlador valida que la justificación/observación sea obligatoria
    // (Excepción E2 en Secuencia CU10: "La observación detallada es obligatoria para auditorías")
    validarJustificacion(observacion || motivo)

    // PASO 4 (Lectura Entidad): CTR_Inventario invoca a CE_Catalogo_Items para obtener el stock actual
    // Método: getStockActual(id_item)
    const { data: item, error: itemError } = await supabase
      .from('catalogo_items')
      .select('stock_minimo, nombre_producto')
      .eq('id_item', idItem)
      .single()

    if (itemError || !item) throw new Error('El ítem no existe en el Catálogo Maestro')

    const cantidadAjuste = parseFloat(cantidad)
    if (isNaN(cantidadAjuste) || cantidadAjuste <= 0) {
      throw new Error('La cantidad del ajuste debe ser un valor numérico superior a cero')
    }

    const stockActual = await computarStockDesdeKardex(idItem)

    // PASO 5 (Condicional - Ajuste Negativo): Evaluar si el ajuste resta inventario (Merma)
    if (tipoAjuste === 'OUT') {
      // PASO 5.1 (Validación): CTR_Inventario invoca a validarStockResultante()
      // (Excepción E1 en Secuencia: Si stockResultante < 0, se bloquea la operación para evitar stock negativo)
      validarStockResultante(stockActual, cantidadAjuste)
    }

    // PASO 6 (Creación Entidad): CTR_Inventario crea un registro en CE_Kardex_Movimientos (generarMovimientoKardex)
    // Instanciación física: <<create>> (tipo, item, cantidad, motivo, obs)
    const { data: kardex, error: kardexError } = await supabaseAdmin
      .from('movimientos_kardex')
      .insert([{
        id_item: idItem,
        id_usuario: usuarioDb.id_usuario,
        tipo_operacion: 'AJUSTE',
        // Si es OUT se registra como negativo, si es IN como positivo
        cantidad_kilos: tipoAjuste === 'IN' ? Math.abs(cantidadAjuste) : -Math.abs(cantidadAjuste),
        concepto_operacion: `[AJUSTE_${tipoAjuste}] ${motivo} — ${observacion || ''}`
      }])
      .select()
      .single()

    if (kardexError) throw new Error('Error al registrar el movimiento en el Kardex físico: ' + kardexError.message)

    // PASO 7 (Trigger de Persistencia): La base de datos ejecuta el trigger automático hacia CE_Bitacora
    // Simulación del disparador físico de PostgreSQL en el servidor de aplicación para auditoría forense
    await supabaseAdmin.from('bitacora_auditoria').insert([{
      id_usuario: usuarioDb.id_usuario,
      accion_sql: 'INSERT',
      tabla_afectada: 'movimientos_kardex',
      registro_id: kardex.id_log,
      new_data: {
        accion: `Ajuste manual de inventario (${tipoAjuste})`,
        cantidad: cantidadAjuste,
        motivo: motivo,
        item: item.nombre_producto
      }
    }])

    // PASO 8 (Retorno): CTR_Inventario recalcula el stock y retorna el resultado exitoso a IU_Ajustes
    const nuevoStock = await computarStockDesdeKardex(idItem)
    return {
      success: true,
      message: `Ajuste por ${motivo} registrado con éxito en el Kardex.`,
      stock_resultante: nuevoStock
    }
  } catch (error) {
    console.error('[CU10 - ERROR]:', error.message)
    return { success: false, error: error.message }
  }
}

/**
 * =========================================================================================
 * CU11: Configurar Alertas de Stock Mínimo
 * Secuencia: Actor (Admin) -> IU_Alertas -> CTR_Inventario -> CE_Catalogo_Items -> CE_Bitacora
 * =========================================================================================
 */
export async function configurarAlerta(idItem, nuevoUmbral) {
  // PASO 1 (Frontera): El Administrador inicia la edición en el panel de control (IU_Alertas)
  // PASO 2 (Frontera -> Control): IU_Alertas invoca a CTR_Inventario.configurarAlerta(...)
  const supabase = await createClient()
  const supabaseAdmin = createAdminClient()

  try {
    // PASO 3 (Validación Lógica): CTR_Inventario invoca a validarUmbralPositivo()
    // (Excepción E1 en Secuencia CU11: Si umbral <= 0, se deniega la configuración de la alerta)
    const umbralNum = validarUmbralPositivo(nuevoUmbral)

    // PASO 4 (Edición Entidad): CTR_Inventario realiza el update en la tabla física de CE_Catalogo_Items
    // Sentencia: update(stock_minimo = nuevoUmbral)
    const { error: updateError } = await supabaseAdmin
      .from('catalogo_items')
      .update({ stock_minimo: umbralNum, updated_at: new Date().toISOString() })
      .eq('id_item', idItem)

    if (updateError) throw new Error('Error al actualizar el umbral en el catálogo: ' + updateError.message)

    // PASO 5 (Trigger de Persistencia): CE_Catalogo_Items ejecuta el trigger hacia la entidad CE_Bitacora
    // Registro físico del trigger en el controlador de aplicación Next.js
    const { data: { user } } = await supabase.auth.getUser()
    const { data: usuarioDb } = user ? await supabaseAdmin.from('usuarios').select('id_usuario').eq('auth_uid', user.id).single() : { data: null }
    
    await supabaseAdmin.from('bitacora_auditoria').insert([{
      id_usuario: usuarioDb?.id_usuario || 1,
      accion_sql: 'UPDATE',
      tabla_afectada: 'catalogo_items',
      registro_id: idItem,
      new_data: { accion: `Modificación de umbral de stock mínimo para el ítem #${idItem} a ${umbralNum} unidades` }
    }])

    // PASO 6 (Lectura de Validación): CTR_Inventario consulta el stock actual para evaluar la alerta
    const stockActual = await computarStockDesdeKardex(idItem)

    // PASO 7 (Lógica del Badge): CTR_Inventario invoca a evaluarEstadoAlerta()
    // Si stock_actual <= umbral -> Retorna "Stock Bajo" (Badge Rojo)
    // Si stock_actual > umbral  -> Retorna "OK" (Badge Verde)
    const estadoAlerta = await evaluarEstadoAlerta(idItem, umbralNum, stockActual)

    // PASO 8 (Retorno de Interfaz): CTR_Inventario devuelve la confirmación y el estado visual a IU_Alertas
    return {
      success: true,
      message: 'Umbral de stock mínimo actualizado correctamente.',
      estado: estadoAlerta === 'Stock Bajo' ? '¡Stock Bajo!' : 'OK'
    }
  } catch (error) {
    console.error('[CU11 - ERROR]:', error.message)
    return { success: false, error: error.message }
  }
}

// =========================================================================================
// MÉTODOS INTERNOS Y REGLAS DE NEGOCIO DEL CONTROLADOR
// =========================================================================================

/**
 * Valida la existencia y longitud de la justificación de auditoría obligatoria (CU10 - Paso 3)
 */
function validarJustificacion(observacion) {
  if (!observacion || observacion.trim().length < 3) {
    throw new Error('La justificación de auditoría es obligatoria y debe contener al menos 3 caracteres.')
  }
}

/**
 * Valida que el stock resultante de una merma/ajuste negativo no sea menor a cero (CU10 - Paso 5.1)
 */
function validarStockResultante(stockActual, cantidadAjuste) {
  const stockResultante = stockActual - cantidadAjuste
  if (stockResultante < 0) {
    throw new Error(`Excepción de Inventario: El ajuste negativo de ${cantidadAjuste} kg excede las existencias físicas disponibles en Kardex (${stockActual} kg).`)
  }
}

/**
 * Valida que el umbral de alerta de stock mínimo ingresado sea un valor positivo (CU11 - Paso 3)
 */
function validarUmbralPositivo(umbral) {
  const num = parseFloat(umbral)
  if (isNaN(num) || num <= 0) {
    throw new Error('Regla de Negocio: El umbral de stock mínimo configurado debe ser un valor numérico estrictamente positivo (mayor a cero).')
  }
  return num
}

/**
 * Evalúa dinámicamente si el stock actual está por debajo del stock mínimo configurado (CU11 - Paso 7)
 */
async function evaluarEstadoAlerta(idItem, umbralMinimo, stockActualPrecalculado) {
  const stock = stockActualPrecalculado !== undefined ? stockActualPrecalculado : await computarStockDesdeKardex(idItem)
  if (stock <= umbralMinimo) {
    return 'Stock Bajo'
  }
  return 'OK'
}

/**
 * Consulta y consolida todos los movimientos físicos (IN/OUT) en el Kardex para calcular el stock real
 */
async function computarStockDesdeKardex(idItem) {
  const supabaseAdmin = createAdminClient()
  const { data: movimientos } = await supabaseAdmin
    .from('movimientos_kardex')
    .select('cantidad_kilos')
    .eq('id_item', idItem)

  if (!movimientos || movimientos.length === 0) return 0
  return movimientos.reduce((acc, m) => acc + parseFloat(m.cantidad_kilos || 0), 0)
}

// =========================================================================================
// FUNCIONES AUXILIARES EXPORTADAS PARA PRESENTACIÓN
// =========================================================================================

/**
 * Recupera el catálogo completo de insumos de GRULAC con su stock consolidado en tiempo real
 */
export async function obtenerItemsCatalogo() {
  const supabaseAdmin = createAdminClient()
  const { data, error } = await supabaseAdmin
    .from('catalogo_items')
    .select('id_item, nombre_producto, tipo_item, stock_minimo, unidad_medida, codigo_sku')
    .order('nombre_producto')
    
  if (error) {
    console.error('Error al recuperar catálogo:', error.message)
    return []
  }

  const itemsConStock = await Promise.all(data.map(async (item) => {
    const stockActual = await computarStockDesdeKardex(item.id_item)
    return { ...item, stock_actual: stockActual }
  }))

  return itemsConStock
}
