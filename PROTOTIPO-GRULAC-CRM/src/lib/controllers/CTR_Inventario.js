'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

// ============================================================
// CTR_Inventario — Controlador de Gestión de Inventario (P3)
// Métodos según Diagrama de Clases de Análisis (OFICIAL.md):
//   + registrarAjuste(item, tipo, cantidad, motivo)
//   + validarStockResultante()
//   + generarMovimientoKardex()
//   + configurarAlerta(item, umbral)
//   + evaluarEstadoAlerta()
//   + validarUmbralPositivo()
// ============================================================

/**
 * CU10: Registrar Ajuste Manual o Merma Aislada
 * Diagrama de Comunicación: Actor→IU_Ajustes→CTR_Inventario→CE_Catalogo_Items→CE_Kardex→CE_Bitacora
 */
export async function registrarAjuste(idItem, tipoAjuste, cantidad, motivo, observacion) {
  const supabase = await createClient()
  const supabaseAdmin = createAdminClient()

  try {
    // Paso 1: Autenticación del operador (trazabilidad)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('No autorizado')

    const { data: usuarioDb } = await supabaseAdmin
      .from('usuarios')
      .select('id_usuario')
      .eq('auth_uid', user.id)
      .single()

    if (!usuarioDb) throw new Error('Usuario no encontrado en la base de datos')

    // Paso 2: Validar justificación obligatoria (secuencia CU10, paso 5: validarJustificacion)
    validarJustificacion(motivo)

    // Paso 3: getStockActual(id_item) — CE_Catalogo_Items
    const { data: item, error: itemError } = await supabase
      .from('catalogo_items')
      .select('stock_minimo, nombre_producto')
      .eq('id_item', idItem)
      .single()

    if (itemError) throw itemError

    const cantidadAjuste = parseFloat(cantidad)

    // Paso 4: validarStockResultante() — solo para ajustes negativos
    if (tipoAjuste === 'OUT') {
      // Se valida contra el Kardex acumulado (no hay campo stock_actual en la tabla)
      const stockActual = await computarStockDesdeKardex(idItem)
      validarStockResultante(stockActual, cantidadAjuste)
    }

    // Paso 5: generarMovimientoKardex() — CE_Kardex_Movimientos
    const { data: kardex, error: kardexError } = await supabaseAdmin
      .from('movimientos_kardex')
      .insert([{
        id_item: idItem,
        id_usuario: usuarioDb.id_usuario,
        tipo_operacion: 'AJUSTE',
        cantidad_kilos: tipoAjuste === 'IN' ? Math.abs(cantidadAjuste) : -Math.abs(cantidadAjuste),
        concepto_operacion: `[${tipoAjuste}] ${motivo} — ${observacion || ''}`
      }])
      .select()
      .single()

    if (kardexError) throw kardexError

    // Paso 6: Obtener nuevo stock calculado para la respuesta visual
    const nuevoStock = await computarStockDesdeKardex(idItem)

    // CE_Bitacora
    await supabaseAdmin.from('bitacora_auditoria').insert([{
      id_usuario: usuarioDb.id_usuario,
      accion_sql: 'INSERT',
      tabla_afectada: 'movimientos_kardex',
      registro_id: kardex.id_log,
      new_data: { accion: `Ajuste Kardex ${tipoAjuste}: ${cantidadAjuste} uds de item ${idItem}` }
    }])

    return { success: true, message: 'Ajuste registrado correctamente', stock_resultante: nuevoStock }
  } catch (error) {
    console.error('Error en registrarAjuste:', error.message)
    return { success: false, error: error.message }
  }
}

/**
 * CU11: Configurar Alertas de Stock Mínimo
 * Diagrama de Comunicación: Actor→IU_Alertas→CTR_Inventario→CE_Catalogo_Items→CE_Bitacora
 */
export async function configurarAlerta(idItem, nuevoUmbral) {
  const supabase = await createClient()
  const supabaseAdmin = createAdminClient()

  try {
    // validarUmbralPositivo()
    const umbralNum = validarUmbralPositivo(nuevoUmbral)

    // update(stock_minimo) — CE_Catalogo_Items
    const { error: updateError } = await supabaseAdmin
      .from('catalogo_items')
      .update({ stock_minimo: umbralNum, updated_at: new Date().toISOString() })
      .eq('id_item', idItem)

    if (updateError) throw updateError

    // evaluarEstadoAlerta() — comparar stock_actual vs umbral
    const estadoAlerta = await evaluarEstadoAlerta(idItem)

    // CE_Bitacora
    const { data: { user } } = await supabase.auth.getUser()
    const { data: usuarioDb } = user ? await supabaseAdmin.from('usuarios').select('id_usuario').eq('auth_uid', user.id).single() : { data: null }
    await supabaseAdmin.from('bitacora_auditoria').insert([{
      id_usuario: usuarioDb?.id_usuario || 1,
      accion_sql: 'UPDATE',
      tabla_afectada: 'catalogo_items',
      registro_id: idItem,
      new_data: { accion: `Configuración de alerta: Umbral ${umbralNum} para item ${idItem}` }
    }])

    return { success: true, message: 'Alerta configurada correctamente', estado: estadoAlerta }
  } catch (error) {
    console.error('Error en configurarAlerta:', error.message)
    return { success: false, error: error.message }
  }
}

// ===================== MÉTODOS INTERNOS =====================

/**
 * Valida que la justificación sea obligatoria (Secuencia CU10, nota: "Obligatoria para auditoría")
 */
function validarJustificacion(motivo) {
  if (!motivo || motivo.trim().length < 3) {
    throw new Error('La justificación es obligatoria para auditoría. Mínimo 3 caracteres.')
  }
}

/**
 * Valida que el stock resultante no sea negativo
 */
function validarStockResultante(stockActual, cantidadAjuste) {
  const resultado = stockActual - cantidadAjuste
  if (resultado < 0) {
    throw new Error(`El ajuste excede el stock disponible. Stock actual: ${stockActual}, ajuste: ${cantidadAjuste}`)
  }
}

/**
 * Valida que el umbral sea un número positivo
 */
function validarUmbralPositivo(umbral) {
  const num = parseFloat(umbral)
  if (isNaN(num) || num < 0) {
    throw new Error('El umbral debe ser un valor numérico positivo.')
  }
  return num
}

/**
 * Evalúa el estado de alerta comparando stock actual vs stock mínimo
 */
async function evaluarEstadoAlerta(idItem) {
  const supabaseAdmin = createAdminClient()
  
  const { data: item } = await supabaseAdmin
    .from('catalogo_items')
    .select('stock_minimo')
    .eq('id_item', idItem)
    .single()

  if (!item) return 'Desconocido'

  const stockActual = await computarStockDesdeKardex(idItem)

  if (stockActual <= 0) return 'Agotado'
  if (stockActual <= parseFloat(item.stock_minimo || 0)) return 'Stock Bajo'
  return 'Suficiente'
}

/**
 * Calcula el stock actual sumando todos los movimientos del Kardex para un ítem
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

// ===================== FUNCIONES AUXILIARES EXPORTADAS =====================

/**
 * Obtener ítems del catálogo con su stock calculado
 */
export async function obtenerItemsCatalogo() {
  const supabaseAdmin = createAdminClient()
  const { data, error } = await supabaseAdmin
    .from('catalogo_items')
    .select('id_item, nombre_producto, tipo_item, stock_minimo, unidad_medida, codigo_sku')
    .order('nombre_producto')
    
  if (error) {
    console.error('Error obteniendo catálogo:', error.message)
    return []
  }

  // Calcular stock actual desde el Kardex para cada ítem
  const itemsConStock = await Promise.all(data.map(async (item) => {
    const stockActual = await computarStockDesdeKardex(item.id_item)
    return { ...item, stock_actual: stockActual }
  }))

  return itemsConStock
}
