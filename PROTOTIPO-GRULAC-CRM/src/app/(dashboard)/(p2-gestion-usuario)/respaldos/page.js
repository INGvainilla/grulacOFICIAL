'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'
import { FileArchive, Upload, Download, FileText, Search, Loader2, AlertCircle, Trash2, ChevronLeft, ChevronRight, RefreshCw, ExternalLink } from 'lucide-react'

import { obtenerEntidades, obtenerRegistrosDisponibles, generarYRespaldar, obtenerHistorial, eliminarRespaldo } from './actions'

const TIPO_ICON = { PDF: FileText, IMG: FileText, XLSX: FileText, OTRO: FileArchive }

function formatBytes(bytes) {
  if (!bytes) return '—'
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function formatFecha(d) {
  if (!d) return '—'
  return new Date(d).toLocaleString('es-BO', {
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit'
  })
}

export default function RespaldosPage() {
  const [entidades, setEntidades] = useState([])
  const [entidadSel, setEntidadSel] = useState('')
  const [registrosDisp, setRegistrosDisp] = useState([])
  const [loadingRegs, setLoadingRegs] = useState(false)
  const [idEntidadSel, setIdEntidadSel] = useState('')
  const [generando, setGenerando] = useState(false)
  const [historial, setHistorial] = useState([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [loadingHist, setLoadingHist] = useState(true)
  const [filtros, setFiltros] = useState({ entidad_afectada: '', fecha_desde: '', fecha_hasta: '' })

  useEffect(() => {
    obtenerEntidades().then(setEntidades)
  }, [])

  useEffect(() => {
    if (!entidadSel) { setRegistrosDisp([]); return }
    setLoadingRegs(true)
    obtenerRegistrosDisponibles(entidadSel).then(r => {
      setRegistrosDisp(r.success ? r.data : [])
      if (!r.success) toast.error('Error', { description: r.error })
    }).finally(() => setLoadingRegs(false))
  }, [entidadSel])

  const fetchHistorial = async (p = page) => {
    setLoadingHist(true)
    const r = await obtenerHistorial(p, 20, filtros)
    if (r.success) {
      setHistorial(r.data)
      setTotal(r.total)
    } else {
      toast.error('Error al cargar historial', { description: r.error })
    }
    setLoadingHist(false)
  }

  useEffect(() => { fetchHistorial(page) }, [page])

  const handleBuscarHistorial = () => { setPage(1); fetchHistorial(1) }

  const handleGenerar = async () => {
    if (!entidadSel || !idEntidadSel) return
    setGenerando(true)
    const r = await generarYRespaldar(entidadSel, parseInt(idEntidadSel))
    if (r.success) {
      toast.success('Respaldo generado exitosamente', {
        description: r.data.descripcion,
        action: { label: 'Abrir PDF', onClick: () => window.open(r.data.url, '_blank') }
      })
      setRegistrosDisp(prev => prev.filter(r => (r.id_lote || r.id_ficha || r.id_recepcion || r.id_compra) !== parseInt(idEntidadSel)))
      setIdEntidadSel('')
      fetchHistorial(1)
    } else {
      toast.error('Error al generar respaldo', { description: r.error })
    }
    setGenerando(false)
  }

  const handleEliminar = async (idDoc) => {
    if (!confirm('¿Eliminar este respaldo permanentemente?')) return
    const r = await eliminarRespaldo(idDoc)
    if (r.success) {
      toast.success('Respaldo eliminado')
      fetchHistorial(page)
    } else {
      toast.error('Error', { description: r.error })
    }
  }

  const totalPages = Math.ceil(total / 20)
  const Icono = TIPO_ICON.PDF

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <FileArchive className="h-6 w-6 text-primary" />
            Respaldos Documentales
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Genere, almacene y consulte respaldos PDF de documentos críticos del sistema.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Panel izquierdo: Generar respaldo */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Upload className="h-5 w-5" />
                Generar Nuevo Respaldo
              </CardTitle>
              <CardDescription>Seleccione el tipo de documento y el registro a respaldar.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1">
                <Label>Tipo de Documento</Label>
                <Select value={entidadSel} onValueChange={(v) => { setEntidadSel(v); setIdEntidadSel('') }}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar entidad..." />
                  </SelectTrigger>
                  <SelectContent>
                    {entidades.map((e) => (
                      <SelectItem key={e.value} value={e.value}>{e.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {entidadSel && (
                <div className="space-y-1">
                  <Label>Registro a Respaldar</Label>
                  {loadingRegs ? (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground py-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Cargando registros disponibles...
                    </div>
                  ) : registrosDisp.length === 0 ? (
                    <div className="flex items-center gap-2 text-sm text-amber-500 py-2">
                      <AlertCircle className="h-4 w-4" />
                      No hay registros disponibles sin respaldar.
                    </div>
                  ) : (
                    <div className="max-h-60 overflow-y-auto space-y-1">
                      {registrosDisp.map((r) => {
                        const id = r.id_lote || r.id_ficha || r.id_recepcion || r.id_compra
                        const label = r.codigo_lote || r.numero_factura_compra || `ID ${id}`
                        const fecha = r.fecha_fabricacion || r.fecha_evaluacion || r.fecha_registro || r.fecha_compra
                        return (
                          <div
                            key={id}
                            className={`p-2 rounded-md border cursor-pointer text-sm transition-colors ${idEntidadSel === String(id) ? 'border-primary bg-primary/5' : 'border-zinc-800 hover:border-zinc-600'}`}
                            onClick={() => setIdEntidadSel(String(id))}
                          >
                            <div className="font-medium">{label}</div>
                            <div className="text-xs text-muted-foreground">
                              {formatFecha(fecha)} {r.estado || r.dictamen_qa || r.estado_triage || r.estado_compra ? `• ${r.estado || r.dictamen_qa || r.estado_triage || r.estado_compra}` : ''}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              )}

              <Button
                className="w-full"
                disabled={!entidadSel || !idEntidadSel || generando}
                onClick={handleGenerar}
              >
                {generando ? (
                  <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Generando PDF...</>
                ) : (
                  <><FileText className="h-4 w-4 mr-2" /> Generar PDF y Respaldar</>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Panel derecho: Historial */}
        <div className="lg:col-span-3 space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <FileArchive className="h-5 w-5" />
                    Historial de Respaldos
                  </CardTitle>
                  <CardDescription>
                    {total > 0
                      ? `${total} respaldo${total !== 1 ? 's' : ''} almacenado${total !== 1 ? 's' : ''}`
                      : 'Consulte los documentos respaldados'}
                  </CardDescription>
                </div>
                <Button variant="outline" size="sm" onClick={() => fetchHistorial(page)}>
                  <RefreshCw className="h-4 w-4 mr-1" /> Refrescar
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
                <div className="space-y-1">
                  <Label className="text-xs">Entidad</Label>
                  <Select value={filtros.entidad_afectada} onValueChange={(v) => setFiltros({ ...filtros, entidad_afectada: v })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Todas" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Todas</SelectItem>
                      {entidades.map((e) => (
                        <SelectItem key={e.value} value={e.value}>{e.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Fecha Desde</Label>
                  <Input type="date" value={filtros.fecha_desde} onChange={(e) => setFiltros({ ...filtros, fecha_desde: e.target.value })} />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Fecha Hasta</Label>
                  <Input type="date" value={filtros.fecha_hasta} onChange={(e) => setFiltros({ ...filtros, fecha_hasta: e.target.value })} />
                </div>
              </div>
              <Button size="sm" variant="secondary" onClick={handleBuscarHistorial} className="mb-4">
                <Search className="h-4 w-4 mr-1" /> Buscar
              </Button>

              {loadingHist ? (
                <div className="flex items-center justify-center py-12 text-muted-foreground">
                  <Loader2 className="h-6 w-6 animate-spin mr-2" /> Cargando...
                </div>
              ) : historial.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <FileArchive className="h-8 w-8 mx-auto mb-2 opacity-30" />
                  No se encontraron respaldos.
                </div>
              ) : (
                <>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Documento</TableHead>
                        <TableHead className="hidden md:table-cell">Entidad</TableHead>
                        <TableHead>Tamaño</TableHead>
                        <TableHead className="hidden md:table-cell">Usuario</TableHead>
                        <TableHead className="hidden md:table-cell">Fecha</TableHead>
                        <TableHead className="w-24"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {historial.map((h) => (
                        <TableRow key={h.id_documento}>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Icono className="h-4 w-4 text-primary shrink-0" />
                              <div className="min-w-0">
                                <div className="text-sm truncate max-w-[200px]">{h.descripcion_archivo}</div>
                                <Badge variant="outline" className="text-[10px] font-mono">{h.tipo_archivo}</Badge>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="hidden md:table-cell text-xs text-muted-foreground">
                            {h.entidad_afectada}
                          </TableCell>
                          <TableCell className="text-xs font-mono">{formatBytes(h.tamanio_bytes)}</TableCell>
                          <TableCell className="hidden md:table-cell text-xs text-muted-foreground">
                            {h.usuarios?.empleados?.nombre_completo || h.usuarios?.email_corporativo || '—'}
                          </TableCell>
                          <TableCell className="hidden md:table-cell text-xs text-muted-foreground">
                            {formatFecha(h.fecha_subida)}
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-1">
                              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => window.open(h.url_publica_storage, '_blank')} title="Descargar">
                                <Download className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-red-400 hover:text-red-300" onClick={() => handleEliminar(h.id_documento)} title="Eliminar">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  {totalPages > 1 && (
                    <div className="flex items-center justify-between mt-4">
                      <span className="text-sm text-muted-foreground">
                        Pág. {page} de {totalPages}
                      </span>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>
                          <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
