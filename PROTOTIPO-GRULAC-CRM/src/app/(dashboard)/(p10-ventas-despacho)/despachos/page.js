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
import { toast } from 'sonner'
import { PackageCheck, Search, ChevronLeft, ChevronRight, RefreshCw, Truck, Thermometer, User, ClipboardList, Loader2, AlertTriangle, CheckCircle2, ArrowLeft, ArrowRight } from 'lucide-react'

import {
  asegurarTablaDespachos, obtenerPedidosConfirmados, obtenerDespachosEnRuta,
  obtenerHistorialDespachos, obtenerLotesDisponibles, obtenerUsuariosConPermisoDespacho, ejecutarDespacho
} from './actions'

const badgeEstado = (estado) => {
  const map = {
    'Confirmado': 'bg-blue-500/10 text-blue-500 border-blue-500/20',
    'En_Despacho': 'bg-cyan-500/10 text-cyan-500 border-cyan-500/20',
    'Entregado_Completo': 'bg-green-500/10 text-green-500 border-green-500/20',
    'Cancelado': 'bg-red-500/10 text-red-500 border-red-500/20',
  }
  return map[estado] || 'bg-zinc-500/10 text-zinc-400'
}

const fmt = (n) => Number(n || 0).toLocaleString('es-BO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

function calcularFEFO(items) {
  return items.map((item) => {
    let remaining = item.cantidad_pedida
    const lotes = item.lotes.map((lote) => {
      const asignar = Math.min(remaining, lote.stock_real)
      remaining -= asignar
      return { ...lote, cantidad_asignar: asignar }
    })
    return { ...item, lotes }
  })
}

export default function DespachosPage() {
  const [tablaLista, setTablaLista] = useState(false)

  // Sección A: pedidos confirmados
  const [pedidos, setPedidos] = useState([])
  const [loadingPedidos, setLoadingPedidos] = useState(true)

  // Sección B: despachos en ruta
  const [enRuta, setEnRuta] = useState([])
  const [loadingRuta, setLoadingRuta] = useState(true)

  // Sección C: historial
  const [historial, setHistorial] = useState([])
  const [totalHistorial, setTotalHistorial] = useState(0)
  const [pageHistorial, setPageHistorial] = useState(1)
  const [loadingHistorial, setLoadingHistorial] = useState(true)
  const [filtros, setFiltros] = useState({ fecha_desde: '', fecha_hasta: '', id_cliente: '' })

  // Modal despacho
  const [modalOpen, setModalOpen] = useState(false)
  const [paso, setPaso] = useState(1)
  const [pedidoSel, setPedidoSel] = useState(null)
  const [itemsDisponibles, setItemsDisponibles] = useState([])
  const [asignaciones, setAsignaciones] = useState([])
  const [loadingLotes, setLoadingLotes] = useState(false)
  const [usuariosDespacho, setUsuariosDespacho] = useState([])
  const [placa, setPlaca] = useState('')
  const [chofer, setChofer] = useState('')
  const [temperatura, setTemperatura] = useState('')
  const [observaciones, setObservaciones] = useState('')
  const [idEncargado, setIdEncargado] = useState('')
  const [despachando, setDespachando] = useState(false)
  const [tempAdvertencia, setTempAdvertencia] = useState(false)
  const [confirmTemp, setConfirmTemp] = useState(false)

  const fetchAll = useCallback(() => {
    setLoadingPedidos(true); setLoadingRuta(true)
    Promise.all([
      obtenerPedidosConfirmados().then(setPedidos).catch(() => {}),
      obtenerDespachosEnRuta().then(setEnRuta).catch(() => {}),
    ]).finally(() => { setLoadingPedidos(false); setLoadingRuta(false) })
  }, [])

  const fetchHistorial = useCallback(async (p = pageHistorial) => {
    setLoadingHistorial(true)
    const r = await obtenerHistorialDespachos(p, 20, filtros)
    if (r.success) { setHistorial(r.data); setTotalHistorial(r.total) }
    else toast.error('Error', { description: r.error })
    setLoadingHistorial(false)
  }, [pageHistorial, filtros])

  useEffect(() => {
    asegurarTablaDespachos().then((r) => {
      if (r.success) { setTablaLista(true) }
      else toast.error('Error de setup', { description: r.error })
    })
    fetchAll()
  }, [])

  useEffect(() => { if (tablaLista) fetchHistorial() }, [tablaLista, fetchHistorial])

  const abrirDespacho = async (pedido) => {
    setLoadingLotes(true)
    setModalOpen(true)
    setPaso(1)
    setPedidoSel(pedido)
    setPlaca(''); setChofer(''); setTemperatura(''); setObservaciones(''); setIdEncargado('')
    setTempAdvertencia(false); setConfirmTemp(false)

    const [items, usuarios] = await Promise.all([
      obtenerLotesDisponibles(pedido.id_pedido),
      obtenerUsuariosConPermisoDespacho(),
    ])

    const fefo = calcularFEFO(items)
    setItemsDisponibles(fefo)
    setAsignaciones(fefo.flatMap((item) => item.lotes.map((l) => ({ id_lote: l.id_lote, cantidad: l.cantidad_asignar }))))
    setUsuariosDespacho(usuarios)
    setLoadingLotes(false)
  }

  const actualizarAsignacion = (idLote, valor) => {
    const n = parseFloat(valor) || 0
    setAsignaciones((prev) => prev.map((a) => (a.id_lote === idLote ? { ...a, cantidad: Math.max(0, n) } : a)))
  }

  const totalKilos = asignaciones.reduce((s, a) => s + (parseFloat(a.cantidad) || 0), 0)

  const stockSuficiente = itemsDisponibles.every((item) => {
    const totalAsignado = item.lotes.reduce((s, l) => {
      const asig = asignaciones.find((a) => a.id_lote === l.id_lote)
      return s + (parseFloat(asig?.cantidad) || 0)
    }, 0)
    return totalAsignado >= item.cantidad_pedida
  })

  const handleSiguiente = () => {
    if (paso === 1 && !stockSuficiente) {
      toast.error('Stock insuficiente', { description: 'Verifique las asignaciones antes de continuar.' })
      return
    }
    if (paso === 2) {
      const t = parseFloat(temperatura)
      if (!isNaN(t) && t > 8 && !confirmTemp) {
        setTempAdvertencia(true)
        return
      }
      if (!isNaN(t) && (t < -2 || t > 12)) {
        toast.error('Temperatura fuera de rango crítico', { description: `La temperatura (${t}°C) está fuera de -2°C a 12°C.` })
        return
      }
      if (!placa.trim() || !chofer.trim()) {
        toast.error('Campos obligatorios', { description: 'Complete placa del camión y nombre del chofer.' })
        return
      }
      setTempAdvertencia(false)
    }
    setPaso((p) => Math.min(p + 1, 3))
  }

  const handleConfirmar = async () => {
    setDespachando(true)
    const asignacionesFinal = asignaciones.filter((a) => parseFloat(a.cantidad) > 0)
    const r = await ejecutarDespacho({
      id_pedido: pedidoSel.id_pedido,
      id_encargado: idEncargado ? parseInt(idEncargado) : null,
      placa_camion: placa.trim(),
      nombre_chofer: chofer.trim(),
      temperatura_salida: temperatura ? parseFloat(temperatura) : null,
      observaciones,
      asignaciones: asignacionesFinal,
    })
    setDespachando(false)
    if (r.success) {
      toast.success(`Despacho #${r.id_despacho} registrado. ${asignacionesFinal.length} lote(s) seleccionados por FEFO.`, {
        description: `Pedido en estado: ${r.estado_final}.`
      })
      setModalOpen(false)
      fetchAll()
      fetchHistorial(1)
      setPageHistorial(1)
    } else {
      toast.error('Error al registrar despacho', { description: r.error })
    }
  }

  const histPageCount = Math.max(1, Math.ceil(totalHistorial / 20))

  const diasParaVen = (fecha) => {
    if (!fecha) return 999
    const diff = new Date(fecha) - new Date()
    return Math.ceil(diff / (1000 * 60 * 60 * 24))
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <PackageCheck className="w-6 h-6 text-primary" />
        <h1 className="text-2xl font-bold">Despachos FEFO</h1>
      </div>

      {/* Sección A: Pedidos listos para despachar */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">Pedidos Listos para Despachar</CardTitle>
              <CardDescription>Pedidos en estado Confirmado (facturados) pendientes de despacho</CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={fetchAll}><RefreshCw className="w-3.5 h-3.5 mr-1" /> Actualizar</Button>
          </div>
        </CardHeader>
        <CardContent>
          {loadingPedidos ? (
            <div className="flex items-center justify-center py-8"><Loader2 className="w-5 h-5 animate-spin text-muted-foreground" /></div>
          ) : pedidos.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">No hay pedidos confirmados pendientes de despacho.</p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead># Pedido</TableHead>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Fecha Programada</TableHead>
                    <TableHead>Total Bs</TableHead>
                    <TableHead>Items</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Acción</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pedidos.map((p) => (
                    <TableRow key={p.id_pedido}>
                      <TableCell className="font-medium">#{p.id_pedido}</TableCell>
                      <TableCell>{p.clientes?.razon_social || '-'}</TableCell>
                      <TableCell>
                        {p.fecha_entrega_programada
                          ? new Date(p.fecha_entrega_programada).toLocaleDateString('es-BO')
                          : new Date(p.fecha_reserva).toLocaleDateString('es-BO')}
                      </TableCell>
                      <TableCell className="text-right font-mono">{fmt(p.total_pedido)}</TableCell>
                      <TableCell className="text-center">{p.detalle_pedidos?.length || 0}</TableCell>
                      <TableCell><Badge className={badgeEstado(p.estado_reserva)}>{p.estado_reserva}</Badge></TableCell>
                      <TableCell>
                        <Button size="sm" onClick={() => abrirDespacho(p)}>
                          <Truck className="w-3.5 h-3.5 mr-1" /> Iniciar Despacho
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Sección B: Despachos en Ruta */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Despachos en Ruta</CardTitle>
          <CardDescription>Pedidos con despacho iniciado, parcialmente cargados</CardDescription>
        </CardHeader>
        <CardContent>
          {loadingRuta ? (
            <div className="flex items-center justify-center py-8"><Loader2 className="w-5 h-5 animate-spin text-muted-foreground" /></div>
          ) : enRuta.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">No hay despachos en ruta.</p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead># Despacho</TableHead>
                    <TableHead>Pedido</TableHead>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Placa</TableHead>
                    <TableHead>Chofer</TableHead>
                    <TableHead>Temp. Salida</TableHead>
                    <TableHead>Fecha</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {enRuta.map((d) => (
                    <TableRow key={d.id_despacho}>
                      <TableCell className="font-medium">#{d.id_despacho}</TableCell>
                      <TableCell>#{d.pedidos_ventas?.id_pedido}</TableCell>
                      <TableCell>{d.pedidos_ventas?.clientes?.razon_social || '-'}</TableCell>
                      <TableCell>{d.placa_camion || '-'}</TableCell>
                      <TableCell>{d.nombre_chofer || '-'}</TableCell>
                      <TableCell className="font-mono">{d.temperatura_salida != null ? `${d.temperatura_salida}°C` : '-'}</TableCell>
                      <TableCell>{new Date(d.fecha_despacho).toLocaleString('es-BO')}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Sección C: Historial */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <CardTitle className="text-lg">Historial de Despachos</CardTitle>
              <CardDescription>{totalHistorial} registro(s)</CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={() => fetchHistorial()}><RefreshCw className="w-3.5 h-3.5 mr-1" /> Actualizar</Button>
          </div>
          <div className="flex flex-wrap gap-2 mt-3">
            <div className="flex-1 min-w-[140px]">
              <Input type="date" value={filtros.fecha_desde} onChange={(e) => setFiltros((f) => ({ ...f, fecha_desde: e.target.value }))} placeholder="Desde" />
            </div>
            <div className="flex-1 min-w-[140px]">
              <Input type="date" value={filtros.fecha_hasta} onChange={(e) => setFiltros((f) => ({ ...f, fecha_hasta: e.target.value }))} placeholder="Hasta" />
            </div>
            <Button variant="secondary" size="sm" onClick={() => fetchHistorial(1)}><Search className="w-3.5 h-3.5 mr-1" /> Buscar</Button>
          </div>
        </CardHeader>
        <CardContent>
          {loadingHistorial ? (
            <div className="flex items-center justify-center py-8"><Loader2 className="w-5 h-5 animate-spin text-muted-foreground" /></div>
          ) : historial.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">No se encontraron despachos.</p>
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead># Despacho</TableHead>
                      <TableHead>Pedido</TableHead>
                      <TableHead>Cliente</TableHead>
                      <TableHead>Placa</TableHead>
                      <TableHead>Chofer</TableHead>
                      <TableHead>Temp.</TableHead>
                      <TableHead>Estado Pedido</TableHead>
                      <TableHead>Fecha</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {historial.map((d) => (
                      <TableRow key={d.id_despacho}>
                        <TableCell className="font-medium">#{d.id_despacho}</TableCell>
                        <TableCell>#{d.pedidos_ventas?.id_pedido}</TableCell>
                        <TableCell>{d.pedidos_ventas?.clientes?.razon_social || '-'}</TableCell>
                        <TableCell>{d.placa_camion || '-'}</TableCell>
                        <TableCell>{d.nombre_chofer || '-'}</TableCell>
                        <TableCell className="font-mono">{d.temperatura_salida != null ? `${d.temperatura_salida}°C` : '-'}</TableCell>
                        <TableCell><Badge className={badgeEstado(d.pedidos_ventas?.estado_reserva)}>{d.pedidos_ventas?.estado_reserva}</Badge></TableCell>
                        <TableCell>{new Date(d.fecha_despacho).toLocaleString('es-BO')}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              <div className="flex items-center justify-between mt-4 text-sm text-muted-foreground">
                <span>Página {pageHistorial} de {histPageCount}</span>
                <div className="flex gap-1">
                  <Button variant="outline" size="sm" disabled={pageHistorial <= 1} onClick={() => { setPageHistorial((p) => Math.max(1, p - 1)) }}><ChevronLeft className="w-3.5 h-3.5" /></Button>
                  <Button variant="outline" size="sm" disabled={pageHistorial >= histPageCount} onClick={() => { setPageHistorial((p) => Math.min(histPageCount, p + 1)) }}><ChevronRight className="w-3.5 h-3.5" /></Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Modal: Iniciar Despacho (3 pasos) */}
      <Dialog open={modalOpen} onOpenChange={(o) => { if (!o) { setModalOpen(false); setPaso(1) } }}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Despacho FEFO — Pedido #{pedidoSel?.id_pedido}
              <span className="text-sm font-normal text-muted-foreground ml-2">(Paso {paso} de 3)</span>
            </DialogTitle>
            <DialogDescription>
              {paso === 1 && 'Asignación de lotes por FEFO (vencimiento más próximo primero)'}
              {paso === 2 && 'Datos del transporte y condiciones de salida'}
              {paso === 3 && 'Resumen y confirmación del despacho'}
            </DialogDescription>
          </DialogHeader>

          {/* PASO 1: Asignación FEFO */}
          {paso === 1 && (
            <div className="space-y-4">
              {loadingLotes ? (
                <div className="flex items-center justify-center py-8"><Loader2 className="w-5 h-5 animate-spin" /></div>
              ) : itemsDisponibles.length === 0 ? (
                <p className="text-sm text-muted-foreground py-4 text-center">No hay lotes disponibles para este pedido.</p>
              ) : (
                itemsDisponibles.map((item) => {
                  const totalAsignado = item.lotes.reduce((s, l) => {
                    const a = asignaciones.find((x) => x.id_lote === l.id_lote)
                    return s + (parseFloat(a?.cantidad) || 0)
                  }, 0)
                  const suficiente = totalAsignado >= item.cantidad_pedida

                  return (
                    <div key={item.id_item} className="border rounded-lg p-3 space-y-2">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="font-medium">{item.nombre_producto}</span>
                          <span className="text-xs text-muted-foreground ml-2">SKU: {item.codigo_sku}</span>
                        </div>
                        <div className="text-sm">
                          <span>Pedido: <strong>{fmt(item.cantidad_pedida)} {item.unidad_medida}</strong></span>
                          <span className="ml-3">Asignado: <strong className={suficiente ? 'text-green-500' : 'text-red-500'}>{fmt(totalAsignado)}</strong></span>
                          {!suficiente && (
                            <span className="ml-2 text-xs text-red-500">Faltan {fmt(item.cantidad_pedida - totalAsignado)}</span>
                          )}
                        </div>
                      </div>
                      <div className="overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Código Lote</TableHead>
                              <TableHead>F. Fabricación</TableHead>
                              <TableHead>F. Vencimiento</TableHead>
                              <TableHead>Stock Disp.</TableHead>
                              <TableHead>Cant. a Despachar</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {item.lotes.map((lote) => {
                              const dv = diasParaVen(lote.fecha_vencimiento)
                              const asig = asignaciones.find((a) => a.id_lote === lote.id_lote)
                              const valor = asig?.cantidad || 0
                              return (
                                <TableRow key={lote.id_lote}>
                                  <TableCell className="font-mono text-xs">{lote.codigo_lote}</TableCell>
                                  <TableCell className="text-xs">{lote.fecha_fabricacion ? new Date(lote.fecha_fabricacion).toLocaleDateString('es-BO') : '-'}</TableCell>
                                  <TableCell>
                                    <span className={dv <= 15 ? 'text-red-500 font-bold' : ''}>
                                      {lote.fecha_vencimiento ? new Date(lote.fecha_vencimiento).toLocaleDateString('es-BO') : 'Sin fecha'}
                                    </span>
                                    {dv <= 15 && dv > 0 && <span className="text-red-500 text-xs ml-1">({dv} días)</span>}
                                    {dv <= 0 && <span className="text-red-500 text-xs ml-1 font-bold">VENCIDO</span>}
                                  </TableCell>
                                  <TableCell className="font-mono">{fmt(lote.stock_real)}</TableCell>
                                  <TableCell>
                                    <Input
                                      type="number"
                                      step="0.01"
                                      min="0"
                                      max={lote.stock_real}
                                      value={valor}
                                      onChange={(e) => actualizarAsignacion(lote.id_lote, e.target.value)}
                                      className="w-24 text-right font-mono"
                                    />
                                  </TableCell>
                                </TableRow>
                              )
                            })}
                          </TableBody>
                        </Table>
                      </div>
                    </div>
                  )
                })
              )}

              <div className="flex justify-between items-center pt-2 border-t">
                <div className="text-sm text-muted-foreground">
                  Total kilos a despachar: <strong>{fmt(totalKilos)} kg</strong>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => { setModalOpen(false); setPaso(1) }}>Cancelar</Button>
                  <Button onClick={handleSiguiente} disabled={!stockSuficiente || loadingLotes}>
                    Siguiente <ArrowRight className="w-3.5 h-3.5 ml-1" />
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* PASO 2: Transporte */}
          {paso === 2 && (
            <div className="space-y-4">
              <div className="bg-muted/30 rounded-lg p-3 text-sm">
                <p><strong>Pedido #{pedidoSel?.id_pedido}</strong> — Cliente: {pedidoSel?.clientes?.razon_social}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label>Placa del Camión *</Label>
                  <Input placeholder="Ej: 1234-ABC" value={placa} onChange={(e) => setPlaca(e.target.value)} />
                </div>
                <div className="space-y-1">
                  <Label>Nombre del Chofer *</Label>
                  <Input placeholder="Nombre completo" value={chofer} onChange={(e) => setChofer(e.target.value)} />
                </div>
                <div className="space-y-1">
                  <Label>Temperatura de Salida (°C) <span className="text-xs text-muted-foreground">(0-8 °C recomendado)</span></Label>
                  <Input
                    type="number"
                    step="0.1"
                    placeholder="Ej: 4.0"
                    value={temperatura}
                    onChange={(e) => { setTemperatura(e.target.value); setConfirmTemp(false) }}
                  />
                </div>
                <div className="space-y-1">
                  <Label>Encargado del Despacho</Label>
                  <Select value={idEncargado} onValueChange={setIdEncargado}>
                    <SelectTrigger><SelectValue placeholder="Seleccionar" /></SelectTrigger>
                    <SelectContent>
                      {usuariosDespacho.map((u) => (
                        <SelectItem key={u.id_usuario} value={String(u.id_usuario)}>
                          {u.empleados?.nombre_completo || u.email_corporativo}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-1">
                <Label>Observaciones</Label>
                <Textarea placeholder="Condiciones del vehículo, novedades, etc." value={observaciones} onChange={(e) => setObservaciones(e.target.value)} />
              </div>

              {tempAdvertencia && (
                <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-3 flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-amber-600">Advertencia de temperatura</p>
                    <p className="text-xs text-amber-600/80">La temperatura ({temperatura}°C) supera el límite recomendado de 8°C para productos lácteos. ¿Desea continuar?</p>
                    <Button size="sm" variant="outline" className="mt-2 text-amber-600 border-amber-500/30" onClick={() => { setConfirmTemp(true); setTempAdvertencia(false) }}>
                      Continuar de todas formas
                    </Button>
                  </div>
                </div>
              )}

              <div className="flex justify-between pt-2 border-t">
                <Button variant="outline" onClick={() => setPaso(1)}><ArrowLeft className="w-3.5 h-3.5 mr-1" /> Atrás</Button>
                <Button onClick={handleSiguiente}>
                  Siguiente <ArrowRight className="w-3.5 h-3.5 ml-1" />
                </Button>
              </div>
            </div>
          )}

          {/* PASO 3: Resumen y Confirmación */}
          {paso === 3 && (
            <div className="space-y-4">
              <div className="bg-primary/5 border border-primary/10 rounded-lg p-4 space-y-2">
                <p className="text-sm"><strong>Pedido #{pedidoSel?.id_pedido}</strong> → Cliente: <strong>{pedidoSel?.clientes?.razon_social}</strong></p>
                <p className="text-sm">Items: <strong>{itemsDisponibles.length}</strong> | Kilos totales: <strong>{fmt(totalKilos)} kg</strong></p>
                <p className="text-sm">
                  Lotes:{' '}
                  <strong>
                    {itemsDisponibles.flatMap((i) => i.lotes)
                      .filter((l) => (asignaciones.find((a) => a.id_lote === l.id_lote && parseFloat(a.cantidad) > 0)))
                      .map((l) => l.codigo_lote)
                      .join(', ') || 'Ninguno'}
                  </strong>
                </p>
              </div>

              <div className="bg-muted/30 rounded-lg p-4 space-y-1 text-sm">
                <p><Truck className="w-3.5 h-3.5 inline mr-1" /> Camión: <strong>{placa}</strong> — Chofer: <strong>{chofer}</strong></p>
                <p><Thermometer className="w-3.5 h-3.5 inline mr-1" /> Temperatura: <strong>{temperatura ? `${temperatura}°C` : 'No registrada'}</strong></p>
                {observaciones && <p className="text-muted-foreground">Obs: {observaciones}</p>}
              </div>

              <div className="space-y-2">
                {itemsDisponibles.map((item) => {
                  const itemAsigs = item.lotes
                    .map((l) => ({ ...l, asig: asignaciones.find((a) => a.id_lote === l.id_lote) }))
                    .filter((l) => l.asig && parseFloat(l.asig.cantidad) > 0)
                  if (itemAsigs.length === 0) return null
                  return (
                    <div key={item.id_item} className="border rounded-lg p-3">
                      <p className="text-sm font-medium mb-1">{item.nombre_producto} — Pedido: {fmt(item.cantidad_pedida)} {item.unidad_medida}</p>
                      <div className="text-xs text-muted-foreground space-y-0.5">
                        {itemAsigs.map((l) => (
                          <p key={l.id_lote}>
                            → Lote {l.codigo_lote}: {fmt(parseFloat(l.asig.cantidad))} kg
                            {l.fecha_vencimiento ? ` (Vence: ${new Date(l.fecha_vencimiento).toLocaleDateString('es-BO')})` : ''}
                          </p>
                        ))}
                      </div>
                    </div>
                  )
                })}
              </div>

              <div className="flex justify-between pt-2 border-t">
                <Button variant="outline" onClick={() => setPaso(2)}><ArrowLeft className="w-3.5 h-3.5 mr-1" /> Atrás</Button>
                <Button onClick={handleConfirmar} disabled={despachando}>
                  {despachando ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <CheckCircle2 className="w-4 h-4 mr-1" />}
                  Confirmar Despacho
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
