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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from '@/components/ui/dialog'
import { toast } from 'sonner'
import { PlusCircle, Trash2, ShoppingCart, Search, ChevronLeft, ChevronRight, RefreshCw, Eye, XCircle, Loader2 } from 'lucide-react'

import { obtenerPedidos, obtenerClientes, obtenerProductosTerminados, obtenerStockDisponible, crearPedido, cancelarPedido, obtenerDetallePedido } from './actions'

const ESTADOS = ['Pendiente', 'Confirmado', 'En_Despacho', 'Entregado_Completo', 'Cancelado']

const badgeEstado = (estado) => {
  const map = {
    'Pendiente': 'bg-amber-500/10 text-amber-500 border-amber-500/20',
    'Confirmado': 'bg-blue-500/10 text-blue-500 border-blue-500/20',
    'En_Despacho': 'bg-cyan-500/10 text-cyan-500 border-cyan-500/20',
    'Entregado_Completo': 'bg-green-500/10 text-green-500 border-green-500/20',
    'Cancelado': 'bg-red-500/10 text-red-500 border-red-500/20',
  }
  return map[estado] || 'bg-zinc-500/10 text-zinc-400'
}

export default function PedidosPage() {
  const [pedidos, setPedidos] = useState([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [filtros, setFiltros] = useState({ estado_reserva: '', id_cliente: '', fecha_desde: '', fecha_hasta: '' })
  const [clientes, setClientes] = useState([])
  const [modalOpen, setModalOpen] = useState(false)
  const [detalleModal, setDetalleModal] = useState(null)
  const [detalleLines, setDetalleLines] = useState([])

  // Form state
  const [formCliente, setFormCliente] = useState('')
  const [formMetodo, setFormMetodo] = useState('')
  const [formFecha, setFormFecha] = useState(() => {
    const d = new Date(); d.setDate(d.getDate() + 3)
    return d.toISOString().split('T')[0]
  })
  const [formObs, setFormObs] = useState('')
  const [formLineas, setFormLineas] = useState([{ id_item: '', cantidad: '', precio_unitario: '', stock: -1 }])
  const [productos, setProductos] = useState([])
  const [generando, setGenerando] = useState(false)
  const [stockCache, setStockCache] = useState({})

  const fetchPedidos = useCallback(async (p = page) => {
    setLoading(true)
    const r = await obtenerPedidos(p, 20, filtros)
    if (r.success) { setPedidos(r.data); setTotal(r.total) }
    else toast.error('Error', { description: r.error })
    setLoading(false)
  }, [page, filtros])

  useEffect(() => { fetchPedidos(page) }, [page])

  useEffect(() => {
    obtenerClientes().then(setClientes)
    obtenerProductosTerminados().then(setProductos)
  }, [])

  const handleVerDetalle = async (id) => {
    const lines = await obtenerDetallePedido(id)
    setDetalleLines(lines)
    setDetalleModal(id)
  }

  const totalPages = Math.ceil(total / 20)

  const subtotal = formLineas.reduce((s, l) => s + (Number(l.cantidad || 0) * Number(l.precio_unitario || 0)), 0)

  const actualizarLinea = (idx, campo, valor) => {
    const nuevas = [...formLineas]
    nuevas[idx] = { ...nuevas[idx], [campo]: valor }

    if (campo === 'id_item' && valor) {
      nuevas[idx].stock = -2
      obtenerStockDisponible(parseInt(valor)).then(stock => {
        setFormLineas(prev => {
          const upd = [...prev]
          upd[idx] = { ...upd[idx], stock }
          return upd
        })
      })
    }

    setFormLineas(nuevas)
  }

  const agregarLinea = () => {
    setFormLineas([...formLineas, { id_item: '', cantidad: '', precio_unitario: '', stock: -1 }])
  }

  const quitarLinea = (idx) => {
    if (formLineas.length <= 1) return
    setFormLineas(formLineas.filter((_, i) => i !== idx))
  }

  const formValido = () => {
    if (!formCliente) return false
    if (!formMetodo) return false
    if (formLineas.length === 0) return false
    for (const l of formLineas) {
      if (!l.id_item || !l.cantidad || Number(l.cantidad) <= 0) return false
      if (l.stock > 0 && Number(l.cantidad) > l.stock) return false
    }
    return true
  }

  const handleCrearPedido = async () => {
    setGenerando(true)
    const r = await crearPedido({
      id_cliente: formCliente,
      metodo_pago: formMetodo,
      fecha_entrega_programada: formFecha,
      observaciones: formObs,
      lineas: formLineas.map(l => ({
        id_item: l.id_item,
        nombre_producto: productos.find(p => p.id_item === parseInt(l.id_item))?.nombre_producto || '',
        cantidad: Number(l.cantidad),
        precio_unitario: Number(l.precio_unitario),
      }))
    })

    if (r.success) {
      toast.success(`Pedido #${r.id_pedido} generado con éxito`, {
        description: 'Pase a facturación (CU28) para formalizar la transacción.'
      })
      setModalOpen(false)
      resetForm()
      fetchPedidos(1)
    } else {
      if (r.faltantes) {
        toast.error('Stock insuficiente — E6', {
          description: r.faltantes.map(f => `${f.nombre}: disponible ${f.stock} kg, solicitado ${f.solicitado} kg`).join(', ')
        })
      } else {
        toast.error('Error al crear pedido', { description: r.error })
      }
    }
    setGenerando(false)
  }

  const resetForm = () => {
    setFormCliente('')
    setFormMetodo('')
    const d = new Date(); d.setDate(d.getDate() + 3)
    setFormFecha(d.toISOString().split('T')[0])
    setFormObs('')
    setFormLineas([{ id_item: '', cantidad: '', precio_unitario: '', stock: -1 }])
  }

  const handleCancelar = async (id) => {
    if (!confirm('¿Cancelar este pedido?')) return
    const r = await cancelarPedido(id)
    if (r.success) { toast.success('Pedido cancelado'); fetchPedidos(page) }
    else toast.error('Error', { description: r.error })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <ShoppingCart className="h-6 w-6 text-primary" />
            Pedidos y Ventas
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Gestione los pedidos de clientes, verifique stock y emita reservas.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => fetchPedidos(page)}>
            <RefreshCw className="h-4 w-4 mr-1" /> Refrescar
          </Button>
          <Dialog open={modalOpen} onOpenChange={setModalOpen}>
            <DialogTrigger render={<Button><PlusCircle className="h-4 w-4 mr-1" /> Nuevo Pedido</Button>} />
            <DialogContent className="max-w-4xl" style={{ maxHeight: '90vh', overflow: 'hidden' }}>
              <DialogHeader>
                <DialogTitle>Nuevo Pedido / Reserva</DialogTitle>
                <DialogDescription>
                  Complete los datos del cliente, productos y configure la entrega.
                  <span className="block mt-1 font-semibold text-right">Total estimado: Bs {subtotal.toFixed(2)}</span>
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-6 overflow-y-auto pr-1" style={{ maxHeight: 'calc(90vh - 110px)' }}>
                {/* Sección A — Cliente */}
                <div>
                  <h3 className="text-sm font-semibold mb-2 text-muted-foreground uppercase tracking-wider">A. Datos del Cliente</h3>
                  <Select value={formCliente} onValueChange={setFormCliente}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar cliente..." />
                    </SelectTrigger>
                    <SelectContent>
                      {clientes.map(c => (
                        <SelectItem key={c.id_cliente} value={String(c.id_cliente)}>
                          {c.razon_social} ({c.nit_facturacion || 'sin NIT'})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Sección B — Líneas */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">B. Líneas de Detalle</h3>
                    <Button variant="outline" size="sm" onClick={agregarLinea}>
                      <PlusCircle className="h-4 w-4 mr-1" /> Agregar
                    </Button>
                  </div>
                  <div className="space-y-3">
                    {formLineas.map((linea, idx) => (
                      <div key={idx} className="flex gap-2 items-start p-3 rounded-md border border-zinc-800">
                        <div className="flex-1 space-y-1">
                          <Label className="text-xs">Producto</Label>
                          <Select value={linea.id_item} onValueChange={(v) => actualizarLinea(idx, 'id_item', v)}>
                            <SelectTrigger>
                              <SelectValue placeholder="Seleccionar..." />
                            </SelectTrigger>
                            <SelectContent>
                              {productos.map(p => (
                                <SelectItem key={p.id_item} value={String(p.id_item)}>
                                  {p.nombre_producto} ({p.codigo_sku})
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="w-28 space-y-1">
                          <Label className="text-xs">Cant. (Kg)</Label>
                          <Input
                            type="number" step="0.1" min="0"
                            value={linea.cantidad}
                            onChange={(e) => actualizarLinea(idx, 'cantidad', e.target.value)}
                            className={Number(linea.cantidad) <= 0 && linea.cantidad !== '' ? 'border-red-500' : ''}
                          />
                        </div>
                        <div className="w-28 space-y-1">
                          <Label className="text-xs">Precio (Bs)</Label>
                          <Input
                            type="number" step="0.01" min="0"
                            value={linea.precio_unitario}
                            onChange={(e) => actualizarLinea(idx, 'precio_unitario', e.target.value)}
                          />
                        </div>
                        <div className="w-28 space-y-1">
                          <Label className="text-xs">Stock</Label>
                          <div className="h-10 flex items-center">
                            {linea.stock === -1 ? (
                              <span className="text-xs text-muted-foreground">—</span>
                            ) : linea.stock === -2 ? (
                              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                            ) : Number(linea.cantidad) > 0 && Number(linea.cantidad) > linea.stock ? (
                              <Badge variant="outline" className="bg-red-500/10 text-red-500 border-red-500/20 text-[10px]">
                                Stock: {linea.stock} kg
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20 text-[10px]">
                                Stock: {linea.stock} kg
                              </Badge>
                            )}
                          </div>
                        </div>
                        <Button variant="ghost" size="icon" className="h-10 w-10 mt-5 shrink-0 text-red-400" onClick={() => quitarLinea(idx)} disabled={formLineas.length <= 1}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Sección C — Configuración */}
                <div>
                  <h3 className="text-sm font-semibold mb-2 text-muted-foreground uppercase tracking-wider">C. Configuración del Pedido</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <Label>Método de Pago</Label>
                      <Select value={formMetodo} onValueChange={setFormMetodo}>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Efectivo">Efectivo</SelectItem>
                          <SelectItem value="Transferencia">Transferencia</SelectItem>
                          <SelectItem value="QR">QR</SelectItem>
                          <SelectItem value="Credito">Crédito</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1">
                      <Label>Fecha Entrega Programada</Label>
                      <Input type="date" value={formFecha} onChange={(e) => setFormFecha(e.target.value)} />
                    </div>
                  </div>
                  <div className="space-y-1 mt-3">
                    <Label>Observaciones</Label>
                    <Textarea value={formObs} onChange={(e) => setFormObs(e.target.value)} placeholder="Notas internas (opcional)" rows={2} />
                  </div>
                </div>

                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setModalOpen(false)}>Cancelar</Button>
                  <Button onClick={handleCrearPedido} disabled={!formValido() || generando}>
                    {generando ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Emitiendo...</> : 'Emitir Reserva / Pedido'}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2 text-muted-foreground">
            <Search className="h-4 w-4" /> Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="space-y-1">
              <Label className="text-xs">Estado</Label>
              <Select value={filtros.estado_reserva} onValueChange={(v) => setFiltros({ ...filtros, estado_reserva: v })}>
                <SelectTrigger><SelectValue placeholder="Todos" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todos</SelectItem>
                  {ESTADOS.map(e => <SelectItem key={e} value={e}>{e}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Cliente</Label>
              <Select value={filtros.id_cliente} onValueChange={(v) => setFiltros({ ...filtros, id_cliente: v })}>
                <SelectTrigger><SelectValue placeholder="Todos" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todos</SelectItem>
                  {clientes.map(c => <SelectItem key={c.id_cliente} value={String(c.id_cliente)}>{c.razon_social}</SelectItem>)}
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
          <div className="flex mt-3">
            <Button size="sm" variant="secondary" onClick={() => { setPage(1); fetchPedidos(1) }}>
              <Search className="h-4 w-4 mr-1" /> Buscar
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Tabla */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Pedidos Registrados</CardTitle>
          <CardDescription>{total > 0 ? `${total} pedido${total !== 1 ? 's' : ''}` : 'Sin pedidos'}</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-12 text-muted-foreground">
              <Loader2 className="h-6 w-6 animate-spin mr-2" /> Cargando...
            </div>
          ) : pedidos.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <ShoppingCart className="h-8 w-8 mx-auto mb-2 opacity-30" />
              No se encontraron pedidos.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>#</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Método Pago</TableHead>
                  <TableHead className="hidden md:table-cell">Fecha</TableHead>
                  <TableHead className="w-28"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pedidos.map(p => (
                  <TableRow key={p.id_pedido}>
                    <TableCell className="font-mono text-xs">{p.id_pedido}</TableCell>
                    <TableCell className="text-sm">{p.clientes?.razon_social || '—'}</TableCell>
                    <TableCell className="font-mono text-sm">Bs {Number(p.monto_total_bs || 0).toFixed(2)}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={`text-xs ${badgeEstado(p.estado_reserva)}`}>{p.estado_reserva}</Badge>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">{p.metodo_pago || '—'}</TableCell>
                    <TableCell className="hidden md:table-cell text-xs text-muted-foreground">
                      {new Date(p.fecha_reserva).toLocaleDateString('es-BO')}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleVerDetalle(p.id_pedido)} title="Ver Detalle">
                          <Eye className="h-4 w-4" />
                        </Button>
                        {p.estado_reserva === 'Pendiente' && (
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-red-400" onClick={() => handleCancelar(p.id_pedido)} title="Cancelar">
                            <XCircle className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
          {totalPages > 1 && (
            <div className="flex items-center justify-between p-4">
              <span className="text-sm text-muted-foreground">Pág. {page} de {totalPages}</span>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)}><ChevronLeft className="h-4 w-4" /></Button>
                <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(page + 1)}><ChevronRight className="h-4 w-4" /></Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal de detalle */}
      <Dialog open={!!detalleModal} onOpenChange={(o) => { if (!o) setDetalleModal(null) }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Detalle del Pedido #{detalleModal}</DialogTitle>
          </DialogHeader>
          {detalleLines.length === 0 ? (
            <p className="text-sm text-muted-foreground">Cargando...</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Producto</TableHead>
                  <TableHead>Cantidad</TableHead>
                  <TableHead>Precio Unit.</TableHead>
                  <TableHead>Subtotal</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {detalleLines.map((l, i) => (
                  <TableRow key={i}>
                    <TableCell>{l.catalogo_items?.nombre_producto || '—'}</TableCell>
                    <TableCell>{l.cantidad_pedida} kg</TableCell>
                    <TableCell>Bs {Number(l.precio_unitario).toFixed(2)}</TableCell>
                    <TableCell>Bs {(l.cantidad_pedida * l.precio_unitario).toFixed(2)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
          <Button variant="outline" onClick={() => setDetalleModal(null)}>Cerrar</Button>
        </DialogContent>
      </Dialog>
    </div>
  )
}
