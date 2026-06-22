'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Switch } from '@/components/ui/switch'
import { toast } from 'sonner'
import { Undo2, Search, ChevronLeft, ChevronRight, RefreshCw, Loader2, PlusCircle, AlertTriangle, CheckCircle2 } from 'lucide-react'

import {
  asegurarTablaDevoluciones, obtenerDespachosEntregados, obtenerLotesDelDespacho,
  obtenerDevoluciones, registrarDevolucion
} from './actions'

const badgeEstado = (est) => {
  const map = {
    Registrada: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
    Procesada: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
    Cerrada: 'bg-green-500/10 text-green-500 border-green-500/20',
  }
  return map[est] || 'bg-zinc-500/10 text-zinc-400'
}

const REASONS = [
  'Calidad organoléptica (olor/sabor/textura)',
  'Empaque dañado / fuga',
  'Temperatura inadecuada en ruta',
  'Fecha de vencimiento próxima o vencida',
  'Sobrante de pedido (excedente)',
  'Cliente insatisfecho (sin especificar)',
  'Defecto visible (moho, grietas)',
]

const fmt = (n) => Number(n || 0).toLocaleString('es-BO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

export default function DevolucionesPage() {
  const [tablaLista, setTablaLista] = useState(false)

  // Devoluciones list
  const [devoluciones, setDevoluciones] = useState([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [filtros, setFiltros] = useState({ estado: '', desde: '', hasta: '' })

  // Modal
  const [modalOpen, setModalOpen] = useState(false)

  // Section A — despacho selector
  const [despachos, setDespachos] = useState([])
  const [busquedaCliente, setBusquedaCliente] = useState('')
  const [desdeFiltro, setDesdeFiltro] = useState('')
  const [hastaFiltro, setHastaFiltro] = useState('')
  const [loadingDespachos, setLoadingDespachos] = useState(false)
  const [despachoSeleccionado, setDespachoSeleccionado] = useState(null)
  const [lotesDespacho, setLotesDespacho] = useState([])

  // Section B — devolucion data
  const [loteSeleccionado, setLoteSeleccionado] = useState('')
  const [motivo, setMotivo] = useState('')
  const [kilos, setKilos] = useState('')
  const [requiereReposicion, setRequiereReposicion] = useState(false)
  const [observaciones, setObservaciones] = useState('')
  const [registrando, setRegistrando] = useState(false)

  const fetchDevoluciones = useCallback(async (p = page) => {
    setLoading(true)
    const r = await obtenerDevoluciones(p, 20, filtros)
    if (r.success) { setDevoluciones(r.data); setTotal(r.total) }
    else toast.error('Error', { description: r.error })
    setLoading(false)
  }, [page, filtros])

  useEffect(() => {
    asegurarTablaDevoluciones().then((r) => {
      if (r.success) setTablaLista(true)
      else toast.error('Error de setup', { description: r.error })
    })
  }, [])

  useEffect(() => { if (tablaLista) fetchDevoluciones() }, [tablaLista, fetchDevoluciones])

  const buscarDespachos = async () => {
    setLoadingDespachos(true)
    const r = await obtenerDespachosEntregados({ cliente: busquedaCliente, desde: desdeFiltro, hasta: hastaFiltro })
    setDespachos(r.data || [])
    setLoadingDespachos(false)
  }

  const seleccionarDespacho = async (id) => {
    const d = despachos.find((x) => x.id_despacho === parseInt(id))
    setDespachoSeleccionado(d)
    setLoteSeleccionado('')
    setMotivo('')
    setKilos('')
    setRequiereReposicion(false)
    setObservaciones('')
    const lotes = await obtenerLotesDelDespacho(parseInt(id))
    setLotesDespacho(lotes)
  }

  const abrirModal = () => {
    setModalOpen(true)
    setDespachoSeleccionado(null)
    setLotesDespacho([])
    setDespachos([])
    setBusquedaCliente('')
    setDesdeFiltro('')
    setHastaFiltro('')
    setLoteSeleccionado('')
    setMotivo('')
    setKilos('')
    setRequiereReposicion(false)
    setObservaciones('')
    setTimeout(() => buscarDespachos(), 100)
  }

  const handleRegistrar = async () => {
    if (!despachoSeleccionado) { toast.error('Seleccione un despacho'); return }
    if (!motivo.trim() || motivo.trim().length < 5) { toast.error('Motivo debe tener al menos 5 caracteres'); return }
    const k = parseFloat(kilos)
    if (isNaN(k) || k <= 0) { toast.error('Ingrese kilos devueltos válidos'); return }

    setRegistrando(true)
    const r = await registrarDevolucion({
      id_despacho: despachoSeleccionado.id_despacho,
      id_lote: loteSeleccionado ? parseInt(loteSeleccionado) : null,
      motivo_rechazo: motivo.trim(),
      kilos_devueltos: k,
      requiere_reposicion: requiereReposicion,
      observaciones,
    })
    setRegistrando(false)

    if (r.success) {
      if (r.con_reposicion) {
        toast.success(`Devolución registrada con reposición caliente. Pedido #${r.id_pedido_reposicion} generado.`)
      } else {
        toast.success('Devolución registrada. Pendiente de disposición QA.')
      }
      setModalOpen(false)
      fetchDevoluciones(1)
      setPage(1)
    } else {
      toast.error('Error', { description: r.error })
    }
  }

  const totalEntregado = lotesDespacho.reduce((s, l) => s + Math.abs(parseFloat(l.cantidad_kilos || 0)), 0)
  const kilosExceden = parseFloat(kilos) > totalEntregado && totalEntregado > 0

  const pageCount = Math.max(1, Math.ceil(total / 20))

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Undo2 className="w-6 h-6 text-primary" />
          <h1 className="text-2xl font-bold">Devoluciones (Logística Inversa)</h1>
        </div>
        <Button onClick={abrirModal}>
          <PlusCircle className="w-3.5 h-3.5 mr-1" /> Registrar Devolución
        </Button>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Historial de Devoluciones</CardTitle>
            <Button variant="outline" size="sm" onClick={() => fetchDevoluciones()}><RefreshCw className="w-3.5 h-3.5 mr-1" /> Actualizar</Button>
          </div>
          <div className="flex flex-wrap gap-2 mt-3">
            <div className="flex-1 min-w-[140px]">
              <Select value={filtros.estado} onValueChange={(v) => setFiltros((f) => ({ ...f, estado: v === 'todos' ? '' : v }))}>
                <SelectTrigger><SelectValue placeholder="Estado" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  <SelectItem value="Registrada">Registrada</SelectItem>
                  <SelectItem value="Procesada">Procesada</SelectItem>
                  <SelectItem value="Cerrada">Cerrada</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1 min-w-[140px]"><Input type="date" value={filtros.desde} onChange={(e) => setFiltros((f) => ({ ...f, desde: e.target.value }))} placeholder="Desde" /></div>
            <div className="flex-1 min-w-[140px]"><Input type="date" value={filtros.hasta} onChange={(e) => setFiltros((f) => ({ ...f, hasta: e.target.value }))} placeholder="Hasta" /></div>
            <Button variant="secondary" size="sm" onClick={() => fetchDevoluciones(1)}><Search className="w-3.5 h-3.5 mr-1" /> Buscar</Button>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8"><Loader2 className="w-5 h-5 animate-spin text-muted-foreground" /></div>
          ) : devoluciones.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">No hay devoluciones registradas.</p>
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead># Dev</TableHead>
                      <TableHead>Despacho</TableHead>
                      <TableHead>Cliente</TableHead>
                      <TableHead>Motivo</TableHead>
                      <TableHead>Kilos</TableHead>
                      <TableHead>Lote</TableHead>
                      <TableHead>Reposición</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead>Fecha</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {devoluciones.map((d) => (
                      <TableRow key={d.id_devolucion}>
                        <TableCell className="font-medium">#{d.id_devolucion}</TableCell>
                        <TableCell>#{d.id_despacho}</TableCell>
                        <TableCell>{d.despachos_logisticos?.pedidos_ventas?.clientes?.razon_social || '-'}</TableCell>
                        <TableCell className="max-w-[200px] truncate text-xs" title={d.motivo_rechazo}>{d.motivo_rechazo}</TableCell>
                        <TableCell className="font-mono text-right">{fmt(d.kilos_devueltos)} kg</TableCell>
                        <TableCell className="font-mono text-xs">{d.lote_produccion?.codigo_lote || '-'}</TableCell>
                        <TableCell>
                          {d.requiere_reposicion
                            ? <span className="text-amber-500 text-xs">Pedido #{d.id_pedido_reposicion || '?'}</span>
                            : <span className="text-muted-foreground text-xs">No</span>}
                        </TableCell>
                        <TableCell><Badge className={badgeEstado(d.estado_devolucion)}>{d.estado_devolucion}</Badge></TableCell>
                        <TableCell className="text-xs">{new Date(d.created_at).toLocaleString('es-BO')}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              <div className="flex items-center justify-between mt-4 text-sm text-muted-foreground">
                <span>Página {page} de {pageCount}</span>
                <div className="flex gap-1">
                  <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}><ChevronLeft className="w-3.5 h-3.5" /></Button>
                  <Button variant="outline" size="sm" disabled={page >= pageCount} onClick={() => setPage((p) => Math.min(pageCount, p + 1))}><ChevronRight className="w-3.5 h-3.5" /></Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Modal: Registrar Devolución */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Registrar Devolución</DialogTitle>
            <DialogDescription>Complete los datos de la devolución del cliente.</DialogDescription>
          </DialogHeader>

          <div className="space-y-5">
            {/* Sección A: Despacho */}
            <div className="border rounded-lg p-4 space-y-3">
              <h3 className="text-sm font-semibold flex items-center gap-1"><Search className="w-3.5 h-3.5" /> Despacho de Origen</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                <Input placeholder="Buscar cliente..." value={busquedaCliente} onChange={(e) => setBusquedaCliente(e.target.value)} />
                <Input type="date" value={desdeFiltro} onChange={(e) => setDesdeFiltro(e.target.value)} placeholder="Desde" />
                <div className="flex gap-1">
                  <Input type="date" value={hastaFiltro} onChange={(e) => setHastaFiltro(e.target.value)} placeholder="Hasta" />
                  <Button size="sm" variant="secondary" onClick={buscarDespachos}><Search className="w-3.5 h-3.5" /></Button>
                </div>
              </div>

              {loadingDespachos ? (
                <div className="flex justify-center py-4"><Loader2 className="w-4 h-4 animate-spin" /></div>
              ) : despachos.length > 0 ? (
                <Select onValueChange={(v) => seleccionarDespacho(v)} value={despachoSeleccionado?.id_despacho?.toString() || ''}>
                  <SelectTrigger><SelectValue placeholder="Seleccionar despacho..." /></SelectTrigger>
                  <SelectContent>
                    {despachos.map((d) => (
                      <SelectItem key={d.id_despacho} value={d.id_despacho.toString()}>
                        [#{d.id_despacho}] Pedido #{d.pedidos_ventas?.id_pedido} — {d.pedidos_ventas?.clientes?.razon_social}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <p className="text-xs text-muted-foreground">No se encontraron despachos. Ajuste los filtros.</p>
              )}

              {despachoSeleccionado && (
                <div className="bg-muted/30 rounded p-2 text-xs space-y-1">
                  <p><strong>Despacho #{despachoSeleccionado.id_despacho}</strong> — Pedido #{despachoSeleccionado.pedidos_ventas?.id_pedido}</p>
                  <p>Cliente: {despachoSeleccionado.pedidos_ventas?.clientes?.razon_social}</p>
                  <p>Placa: {despachoSeleccionado.placa_camion} — Chofer: {despachoSeleccionado.nombre_chofer}</p>
                  <p>Fecha: {new Date(despachoSeleccionado.fecha_despacho).toLocaleString('es-BO')}</p>
                  <p className="text-muted-foreground">Total entregado: <strong>{fmt(totalEntregado)} kg</strong></p>
                </div>
              )}

              {lotesDespacho.length > 0 && (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Lote</TableHead>
                        <TableHead>Producto</TableHead>
                        <TableHead>Vencimiento</TableHead>
                        <TableHead>Kgs despachados</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {lotesDespacho.map((m) => (
                        <TableRow key={m.id_log}>
                          <TableCell className="font-mono text-xs">{m.lote_produccion?.codigo_lote || '-'}</TableCell>
                          <TableCell className="text-xs">{m.catalogo_items?.nombre_producto || '-'}</TableCell>
                          <TableCell className="text-xs">{m.lote_produccion?.fecha_vencimiento ? new Date(m.lote_produccion.fecha_vencimiento).toLocaleDateString('es-BO') : '-'}</TableCell>
                          <TableCell className="font-mono text-xs">{fmt(Math.abs(parseFloat(m.cantidad_kilos || 0)))} kg</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </div>

            {/* Sección B: Datos devolución */}
            <div className="border rounded-lg p-4 space-y-3">
              <h3 className="text-sm font-semibold">Registro de la Devolución</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label>Lote devuelto <span className="text-muted-foreground text-xs">(opcional)</span></Label>
                  <Select value={loteSeleccionado} onValueChange={setLoteSeleccionado}>
                    <SelectTrigger><SelectValue placeholder="No identificado" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">No identificado</SelectItem>
                      {lotesDespacho.map((m) => m.lote_produccion && (
                        <SelectItem key={m.id_log} value={m.lote_produccion.id_lote.toString()}>
                          {m.lote_produccion.codigo_lote} — {m.catalogo_items?.nombre_producto || ''}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label>Kilos devueltos (kg) *</Label>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="Ej: 15.50"
                    value={kilos}
                    onChange={(e) => setKilos(e.target.value)}
                    className={kilosExceden ? 'border-red-500' : ''}
                  />
                  {kilosExceden && <p className="text-xs text-red-500">Excede el total entregado ({fmt(totalEntregado)} kg)</p>}
                  {totalEntregado > 0 && <p className="text-xs text-muted-foreground">Máx. devoluble: {fmt(totalEntregado)} kg</p>}
                </div>
              </div>

              <div className="space-y-1">
                <Label>Motivo de rechazo *</Label>
                <div className="flex flex-wrap gap-1 mb-2">
                  {REASONS.map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setMotivo(r)}
                      className="text-xs px-2 py-1 rounded-md border border-border bg-muted/30 hover:bg-muted transition-colors"
                    >
                      {r}
                    </button>
                  ))}
                </div>
                <Textarea
                  placeholder="Describa el motivo de la devolución (mín. 5 caracteres)"
                  value={motivo}
                  onChange={(e) => setMotivo(e.target.value)}
                  rows={2}
                />
              </div>

              <div className="flex items-center gap-3 pt-1">
                <Switch checked={requiereReposicion} onCheckedChange={setRequiereReposicion} id="reposicion" />
                <Label htmlFor="reposicion" className="text-sm">
                  Requiere reposición caliente
                  {requiereReposicion && <span className="ml-1 text-amber-500 font-medium">(se generará pedido prioritario)</span>}
                </Label>
              </div>

              <div className="space-y-1">
                <Label>Observaciones <span className="text-muted-foreground text-xs">(opcional)</span></Label>
                <Textarea placeholder="Notas internas" value={observaciones} onChange={(e) => setObservaciones(e.target.value)} rows={2} />
              </div>
            </div>

            {/* Sección C: Acciones */}
            <div className="flex justify-end gap-2 pt-2 border-t">
              <Button variant="outline" onClick={() => setModalOpen(false)}>Cancelar</Button>
              <Button
                onClick={handleRegistrar}
                disabled={
                  registrando || !despachoSeleccionado || !motivo.trim() || motivo.trim().length < 5 ||
                  !kilos || parseFloat(kilos) <= 0 || kilosExceden
                }
                className={requiereReposicion ? 'bg-orange-600 hover:bg-orange-700' : ''}
              >
                {registrando ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <CheckCircle2 className="w-4 h-4 mr-1" />}
                {requiereReposicion ? 'Registrar Devolución con Reposición Caliente' : 'Registrar Devolución'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
