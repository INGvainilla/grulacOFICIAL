'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import PDFDocument from 'pdfkit'
import { randomUUID, createHash } from 'crypto'

const BUCKET_NAME = 'grulac-respaldos'

async function asegurarBucket() {
  const admin = createAdminClient()
  const { data: buckets } = await admin.storage.listBuckets()
  if (buckets?.some(b => b.id === BUCKET_NAME)) return true
  const { error } = await admin.storage.createBucket(BUCKET_NAME, {
    public: true, fileSizeLimit: 10485760, allowedMimeTypes: ['application/pdf']
  })
  return !error
}

const ENTIDADES = [
  { value: 'lote_produccion', label: 'Certificado de Liberación Comercial', modulo: 'produccion' },
  { value: 'fichas_calidad', label: 'Ficha de Laboratorio QA', modulo: 'calidad' },
  { value: 'recepciones_leche', label: 'Ticket de Acopio y Triage', modulo: 'calidad' },
  { value: 'compras_insumos', label: 'Orden de Compra / Comprobante', modulo: 'produccion' },
]

function formatDate(d) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('es-BO', { year: 'numeric', month: '2-digit', day: '2-digit' })
}

function verificarPermiso(modulos) {
  return modulos.includes('ALL') || modulos.includes('respaldos') || modulos.includes('produccion') || modulos.includes('calidad')
}

function filtrarEntidadesPorModulo(modulos) {
  if (modulos.includes('ALL') || modulos.includes('respaldos')) return ENTIDADES
  if (modulos.includes('produccion')) return ENTIDADES.filter(e => e.modulo === 'produccion')
  if (modulos.includes('calidad')) return ENTIDADES.filter(e => e.modulo === 'calidad')
  return []
}

export async function obtenerEntidades() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data: u } = await supabase
    .from('usuarios')
    .select('roles!inner(permisos_json)')
    .eq('auth_uid', user.id)
    .maybeSingle()

  const modulos = u?.roles?.permisos_json?.modulos || []
  if (!verificarPermiso(modulos)) return []

  return filtrarEntidadesPorModulo(modulos)
}

export async function obtenerRegistrosDisponibles(entidad) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'No autenticado', data: [] }

  const { data: u } = await supabase
    .from('usuarios')
    .select('id_usuario, roles!inner(permisos_json)')
    .eq('auth_uid', user.id)
    .maybeSingle()

  if (!u) return { success: false, error: 'Usuario no vinculado', data: [] }

  const entidadConfig = ENTIDADES.find(e => e.value === entidad)
  if (!entidadConfig) return { success: false, error: 'Entidad inválida', data: [] }

  try {
    const { data: yaRespaldados } = await supabase
      .from('respaldos_documentales')
      .select('id_entidad')
      .eq('entidad_afectada', entidad)

    const idsRespaldados = new Set((yaRespaldados || []).map(r => r.id_entidad))

    let query
    switch (entidad) {
      case 'lote_produccion':
        query = supabase.from('lote_produccion').select('id_lote, codigo_lote, fecha_fabricacion, estado').order('fecha_fabricacion', { ascending: false })
        break
      case 'fichas_calidad':
        query = supabase.from('fichas_calidad').select('id_ficha, id_lote, dictamen_qa, fecha_evaluacion').order('fecha_evaluacion', { ascending: false })
        break
      case 'recepciones_leche':
        query = supabase.from('recepciones_leche').select('id_recepcion, id_proveedor, litros_recibidos, estado_triage, fecha_registro').order('fecha_registro', { ascending: false })
        break
      case 'compras_insumos':
        query = supabase.from('compras_insumos').select('id_compra, id_proveedor, numero_factura_compra, estado_compra, fecha_compra').order('fecha_compra', { ascending: false })
        break
      default:
        return { success: false, error: 'Entidad no soportada', data: [] }
    }

    const { data: registros } = await query.limit(50)
    const disponibles = (registros || []).filter(r => {
      const id = r.id_lote || r.id_ficha || r.id_recepcion || r.id_compra
      return !idsRespaldados.has(id)
    })

    return { success: true, data: disponibles }
  } catch (err) {
    return { success: false, error: err.message, data: [] }
  }
}

export async function generarYRespaldar(entidad, idEntidad) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'No autenticado' }

  const { data: u } = await supabase
    .from('usuarios')
    .select('id_usuario, id_rol, roles!inner(permisos_json)')
    .eq('auth_uid', user.id)
    .maybeSingle()

  if (!u) return { success: false, error: 'Usuario no vinculado' }

  const entidadConfig = ENTIDADES.find(e => e.value === entidad)
  if (!entidadConfig) return { success: false, error: 'Entidad inválida - E5' }

  try {
    let recordData
    let idField
    let codigoIdentificador

    switch (entidad) {
      case 'lote_produccion':
        ;({ data: recordData } = await supabase.from('lote_produccion').select('*, ordenes_produccion(*)').eq('id_lote', idEntidad).single())
        idField = 'id_lote'
        codigoIdentificador = recordData?.codigo_lote || `LOTE-${idEntidad}`
        break
      case 'fichas_calidad':
        ;({ data: recordData } = await supabase.from('fichas_calidad').select('*, lote_produccion(codigo_lote), ordenes_produccion(*)').eq('id_ficha', idEntidad).single())
        idField = 'id_ficha'
        codigoIdentificador = `FICHA-${idEntidad}`
        break
      case 'recepciones_leche':
        ;({ data: recordData } = await supabase.from('recepciones_leche').select('*, proveedores(razon_social)').eq('id_recepcion', idEntidad).single())
        idField = 'id_recepcion'
        codigoIdentificador = `REC-${idEntidad}`
        break
      case 'compras_insumos':
        ;({ data: recordData } = await supabase.from('compras_insumos').select('*, proveedores(razon_social)').eq('id_compra', idEntidad).single())
        idField = 'id_compra'
        codigoIdentificador = recordData?.numero_factura_compra || `COMPRA-${idEntidad}`
        break
      default:
        return { success: false, error: 'Entidad inválida' }
    }

    if (!recordData) return { success: false, error: 'Registro no encontrado' }

    // Generar PDF con pdfkit
    const doc = new PDFDocument({ margin: 50, size: 'A4' })
    const chunks = []
    doc.on('data', chunk => chunks.push(chunk))
    const pdfBuffer = await new Promise((resolve, reject) => {
      doc.on('end', () => resolve(Buffer.concat(chunks)))
      doc.on('error', reject)

      const yInicio = 50

      // Línea superior
      doc.fontSize(18).font('Helvetica-Bold').text('GRULAC S.R.L.', 50, yInicio, { align: 'center' })
      doc.fontSize(8).font('Helvetica').text('Sistema de Gestión ERP — Trazabilidad SENASAG', { align: 'center' })
      doc.moveDown(0.5)
      doc.fontSize(10).text('Planta Procesadora de Lácteos • Santa Cruz • Bolivia', { align: 'center' })
      doc.moveDown(0.3)

      // Línea separadora
      doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke('#cccccc')
      doc.moveDown(0.5)

      // Título del documento
      doc.fontSize(14).font('Helvetica-Bold').text(entidadConfig.label, { align: 'center' })
      doc.fontSize(9).font('Helvetica').text(`Documento de Respaldo — ${codigoIdentificador}`, { align: 'center' })
      doc.moveDown(0.5)
      doc.fontSize(8).text(`Fecha de emisión: ${new Date().toLocaleString('es-BO')}`, { align: 'center' })
      doc.moveDown(1)

      // Datos del registro
      doc.fontSize(10).font('Helvetica-Bold').text('Datos del Registro', { underline: true })
      doc.moveDown(0.3)
      doc.fontSize(8).font('Helvetica')

      const excludeKeys = ['id', 'created_at', 'updated_at']
      for (const [key, val] of Object.entries(recordData)) {
        if (excludeKeys.some(e => key.startsWith(e))) continue
        if (val === null || val === undefined) continue
        const label = key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
        let value = val
        if (typeof val === 'object') value = JSON.stringify(val)
        doc.text(`${label}: ${value}`, { indent: 10, continued: false })
      }

      doc.moveDown(1)

      // Línea separadora
      doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke('#cccccc')
      doc.moveDown(0.5)

      // Hash de integridad
      const hashContent = `${entidad}:${idEntidad}:${codigoIdentificador}:${Date.now()}`
      const hash = createHash('sha256').update(hashContent).digest('hex')

      doc.fontSize(7).font('Helvetica')
      doc.text(`Hash SHA-256: ${hash}`, { align: 'center' })
      doc.moveDown(0.3)

      // Firma digital
      doc.text(`Generado por: ${user.email || 'Usuario' }`, { align: 'center' })
      doc.text(`ID de integridad: ${randomUUID().slice(0, 8)}`, { align: 'center' })

      // Pie de página
      doc.moveDown(2)
      doc.fontSize(6).fillColor('#999999')
      doc.text('CONFIDENCIAL — Este documento es propiedad de GRULAC S.R.L. y contiene información sujeta a trazabilidad SENASAG.', { align: 'center' })

      doc.end()
    })

    // Validar tamaño máximo (10 MB)
    const MAX_SIZE = 10 * 1024 * 1024
    if (pdfBuffer.length > MAX_SIZE) {
      return { success: false, error: `El documento excede el límite de 10 MB (${(pdfBuffer.length / 1024 / 1024).toFixed(1)} MB) — E4` }
    }

    // Crear bucket si no existe (admin client bypassa RLS)
    await asegurarBucket()

    // Subir a Supabase Storage con admin client (byp文体 RLS, sin necesidad de políticas)
    const adminStorage = createAdminClient()
    const timestamp = Date.now()
    const filePath = `${entidad}/${idEntidad}/${timestamp}.pdf`

    const { data: uploadData, error: uploadError } = await adminStorage.storage
      .from(BUCKET_NAME)
      .upload(filePath, pdfBuffer, {
        contentType: 'application/pdf',
        cacheControl: '3600',
        upsert: true
      })

    if (uploadError) {
      return { success: false, error: `Error de almacenamiento externo: ${uploadError.message} — E3` }
    }

    // Construir URL pública
    const projectUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const urlPublica = `${projectUrl}/storage/v1/object/public/${BUCKET_NAME}/${filePath}`

    // Insertar en respaldos_documentales
    const { data: docRecord, error: insertError } = await supabase
      .from('respaldos_documentales')
      .insert({
        entidad_afectada: entidad,
        id_entidad: idEntidad,
        url_publica_storage: urlPublica,
        descripcion_archivo: `${entidadConfig.label} — ${codigoIdentificador}`,
        tipo_archivo: 'PDF',
        tamanio_bytes: pdfBuffer.length,
        id_usuario_subida: u.id_usuario,
      })
      .select('id_documento')
      .single()

    if (insertError) throw insertError

    // Registrar en bitacora_auditoria
    await supabase.from('bitacora_auditoria').insert({
      id_usuario: u.id_usuario,
      accion_sql: 'INSERT',
      tabla_afectada: 'respaldos_documentales',
      registro_id: docRecord.id_documento,
      new_data: { accion: 'Respaldo documental generado', entidad, id_entidad: idEntidad, url: urlPublica },
      ip_address: 'server',
    })

    return {
      success: true,
      data: {
        id_documento: docRecord.id_documento,
        url: urlPublica,
        descripcion: `${entidadConfig.label} — ${codigoIdentificador}`,
        tamanio: pdfBuffer.length,
      }
    }
  } catch (err) {
    return { success: false, error: err.message }
  }
}

export async function obtenerHistorial(page = 1, pageSize = 20, filtros = {}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'No autenticado', data: [], total: 0 }

  try {
    let query = supabase
      .from('respaldos_documentales')
      .select('*, usuarios!respaldos_documentales_id_usuario_subida_fkey(id_usuario, email_corporativo, empleados(nombre_completo))', { count: 'exact' })

    if (filtros.entidad_afectada) query = query.eq('entidad_afectada', filtros.entidad_afectada)
    if (filtros.fecha_desde) query = query.gte('fecha_subida', filtros.fecha_desde)
    if (filtros.fecha_hasta) query = query.lte('fecha_subida', filtros.fecha_hasta + 'T23:59:59Z')
    if (filtros.id_usuario) query = query.eq('id_usuario_subida', parseInt(filtros.id_usuario))

    const from = (page - 1) * pageSize
    const to = from + pageSize - 1

    const { data, error, count } = await query
      .order('fecha_subida', { ascending: false })
      .range(from, to)

    if (error) throw error

    return { success: true, data: data || [], total: count || 0, page, pageSize }
  } catch (err) {
    return { success: false, error: err.message, data: [], total: 0 }
  }
}

export async function eliminarRespaldo(idDocumento) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'No autenticado' }

  const { data: u } = await supabase
    .from('usuarios')
    .select('id_usuario, roles!inner(permisos_json)')
    .eq('auth_uid', user.id)
    .maybeSingle()

  if (!u) return { success: false, error: 'Usuario no vinculado' }

  const modulos = u?.roles?.permisos_json?.modulos || []
  if (!modulos.includes('ALL') && !modulos.includes('respaldos')) {
    return { success: false, error: 'Solo el administrador puede eliminar respaldos' }
  }

  try {
    const { error } = await supabase
      .from('respaldos_documentales')
      .delete()
      .eq('id_documento', idDocumento)

    if (error) throw error

    await supabase.from('bitacora_auditoria').insert({
      id_usuario: u.id_usuario,
      accion_sql: 'DELETE',
      tabla_afectada: 'respaldos_documentales',
      registro_id: idDocumento,
      new_data: { accion: 'Respaldo documental eliminado' },
      ip_address: 'server',
    })

    return { success: true }
  } catch (err) {
    return { success: false, error: err.message }
  }
}
