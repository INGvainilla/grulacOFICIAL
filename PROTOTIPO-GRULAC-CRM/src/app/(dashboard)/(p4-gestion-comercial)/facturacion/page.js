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
import { Receipt, Search, ChevronLeft, ChevronRight, RefreshCw, FileText, DollarSign, Ban, Loader2, Eye, Printer } from 'lucide-react'

import { obtenerPedidosPendientes, obtenerFacturas, obtenerDetallePedido, obtenerTasaImpuesto, emitirFactura, anularFactura, registrarPago } from './actions'
import { createPayPalOrder, capturePayPalOrder } from './paypal-actions'
import { PayPalScriptProvider, PayPalButtons } from '@paypal/react-paypal-js'

const badgeEstadoFactura = (estado) => {
  const map = {
    'Emitida': 'bg-blue-500/10 text-blue-500 border-blue-500/20',
    'Pagado': 'bg-green-500/10 text-green-500 border-green-500/20',
    'Parcial': 'bg-amber-500/10 text-amber-500 border-amber-500/20',
    'Anulada': 'bg-red-500/10 text-red-500 border-red-500/20',
  }
  return map[estado] || 'bg-zinc-500/10 text-zinc-400'
}

const badgeEstadoPedido = (estado) => {
  const map = {
    'Pendiente': 'bg-amber-500/10 text-amber-500 border-amber-500/20',
    'Confirmado': 'bg-blue-500/10 text-blue-500 border-blue-500/20',
    'En_Despacho': 'bg-cyan-500/10 text-cyan-500 border-cyan-500/20',
    'Entregado_Completo': 'bg-green-500/10 text-green-500 border-green-500/20',
    'Cancelado': 'bg-red-500/10 text-red-500 border-red-500/20',
  }
  return map[estado] || 'bg-zinc-500/10 text-zinc-400'
}

const fmt = (n) => Number(n || 0).toLocaleString('es-BO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

export default function FacturacionPage() {
  // Pedidos pendientes
  const [pedidos, setPedidos] = useState([])
  const [loadingPedidos, setLoadingPedidos] = useState(true)

  // Facturas emitidas
  const [facturas, setFacturas] = useState([])
  const [totalFacturas, setTotalFacturas] = useState(0)
  const [pageFacturas, setPageFacturas] = useState(1)
  const [loadingFacturas, setLoadingFacturas] = useState(true)
  const [filtros, setFiltros] = useState({ estado: '', id_cliente: '', fecha_desde: '', fecha_hasta: '' })

  // Modal emisión
  const [modalOpen, setModalOpen] = useState(false)
  const [modalPedido, setModalPedido] = useState(null)
  const [modalLineas, setModalLineas] = useState([])
  const [modalDetalle, setModalDetalle] = useState(null)
  const [numeroFactura, setNumeroFactura] = useState('')
  const [tasaImpuesto, setTasaImpuesto] = useState(16)
  const [metodoPago, setMetodoPago] = useState('')
  const [observaciones, setObservaciones] = useState('')
  const [emitiendo, setEmitiendo] = useState(false)
  const [errorNumero, setErrorNumero] = useState(false)
  const [paypalOrderId, setPaypalOrderId] = useState(null)
  const [paypalLoading, setPaypalLoading] = useState(false)

  // Modal PayPal (independiente del detalle)
  const [pagarModalFactura, setPagarModalFactura] = useState(null)

  // Modal detalle factura / impresión
  const [detalleFactura, setDetalleFactura] = useState(null)

  const subtotal = modalLineas.reduce((s, l) => s + Number(l.cantidad_pedida) * Number(l.precio_unitario), 0)
  const impuesto = subtotal * (tasaImpuesto / 100)
  const totalFactura = subtotal + impuesto

  const fetchPedidosPendientes = useCallback(async () => {
    setLoadingPedidos(true)
    const data = await obtenerPedidosPendientes()
    setPedidos(data)
    setLoadingPedidos(false)
  }, [])

  const fetchFacturas = useCallback(async (p = pageFacturas) => {
    setLoadingFacturas(true)
    const r = await obtenerFacturas(p, 20, filtros)
    if (r.success) { setFacturas(r.data); setTotalFacturas(r.total) }
    else toast.error('Error', { description: r.error })
    setLoadingFacturas(false)
  }, [pageFacturas, filtros])

  useEffect(() => { fetchPedidosPendientes(); fetchFacturas() }, [])

  useEffect(() => {
    if (modalOpen) { setErrorNumero(false) }
  }, [modalOpen])

  const abrirEmitir = async (pedido) => {
    const r = await obtenerDetallePedido(pedido.id_pedido)
    if (!r.lineas || r.lineas.length === 0) {
      toast.error('Pedido sin detalle', { description: 'El pedido seleccionado no contiene líneas de detalle.' })
      return
    }
    const tasa = await obtenerTasaImpuesto()
    setModalPedido(pedido)
    setModalLineas(r.lineas)
    setModalDetalle(r.pedido)
    setNumeroFactura('')
    setTasaImpuesto(Number(tasa))
    setMetodoPago(pedido.metodo_pago || '')
    setObservaciones('')
    setErrorNumero(false)
    setModalOpen(true)
  }

  const handleEmitir = async () => {
    if (!numeroFactura.trim()) return
    if (tasaImpuesto < 0 || tasaImpuesto > 100) {
      toast.error('Impuesto fuera de rango', { description: 'La tasa debe estar entre 0% y 100%.' })
      return
    }
    setEmitiendo(true)
    const r = await emitirFactura({
      id_pedido: modalPedido.id_pedido,
      numero_factura: numeroFactura.trim(),
      tasa_impuesto: tasaImpuesto,
      metodo_pago: metodoPago || modalPedido.metodo_pago,
      observaciones,
    })
    setEmitiendo(false)
    if (r.success) {
      toast.success(`Factura N° ${r.numero_factura} emitida con éxito. Total: ${fmt(r.total)} Bs.`, {
        description: `El pedido #${modalPedido.id_pedido} ha pasado a estado Confirmado.`
      })
      setModalOpen(false)
      fetchPedidosPendientes()
      fetchFacturas(1)
      setPageFacturas(1)
    } else {
      toast.error('Error al emitir factura', { description: r.error })
      if (r.error.includes('E2')) setErrorNumero(true)
    }
  }

  const handleAnular = async (factura, e) => {
    e.stopPropagation()
    const just = prompt('Ingrese la justificación para anular la factura:')
    if (!just) return
    const r = await anularFactura(factura.id_factura, just)
    if (r.success) { toast.success('Factura anulada'); fetchFacturas() }
    else toast.error('Error', { description: r.error })
  }

  const handlePago = async (factura, e) => {
    e.stopPropagation()
    if (!confirm('¿Registrar pago completo de esta factura?')) return
    const r = await registrarPago(factura.id_factura)
    if (r.success) { toast.success('Pago registrado'); fetchFacturas() }
    else toast.error('Error', { description: r.error })
  }

  const abrirDetalle = (factura) => setDetalleFactura(factura)

  const pageCount = Math.max(1, Math.ceil(totalFacturas / 20))

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Receipt className="w-6 h-6 text-primary" />
        <h1 className="text-2xl font-bold">Facturación Comercial</h1>
      </div>

      {/* Sección 1: Pedidos pendientes de facturar */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Pedidos Pendientes de Facturar</CardTitle>
          <CardDescription>Pedidos en estado Pendiente o Confirmado listos para emisión de factura</CardDescription>
        </CardHeader>
        <CardContent>
          {loadingPedidos ? (
            <div className="flex items-center justify-center py-8"><Loader2 className="w-5 h-5 animate-spin text-muted-foreground" /></div>
          ) : pedidos.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">No hay pedidos pendientes de facturar.</p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead># Pedido</TableHead>
                    <TableHead>Cliente</TableHead>
                    <TableHead>NIT</TableHead>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Total Bs</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Acción</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pedidos.map((p) => (
                    <TableRow key={p.id_pedido}>
                      <TableCell className="font-medium">#{p.id_pedido}</TableCell>
                      <TableCell>{p.clientes?.razon_social || '-'}</TableCell>
                      <TableCell className="font-mono text-xs">{p.clientes?.nit_facturacion || '-'}</TableCell>
                      <TableCell>{new Date(p.fecha_reserva).toLocaleDateString('es-BO')}</TableCell>
                      <TableCell className="text-right font-mono">{fmt(p.total_pedido || 0)}</TableCell>
                      <TableCell><Badge className={badgeEstadoPedido(p.estado_reserva)}>{p.estado_reserva}</Badge></TableCell>
                      <TableCell>
                        <Button size="sm" onClick={() => abrirEmitir(p)}>
                          <FileText className="w-3.5 h-3.5 mr-1" /> Emitir Factura
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

      {/* Sección 2: Facturas emitidas */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <CardTitle className="text-lg">Facturas Emitidas</CardTitle>
              <CardDescription>{totalFacturas} registro(s) encontrado(s)</CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={() => fetchFacturas()}><RefreshCw className="w-3.5 h-3.5 mr-1" /> Actualizar</Button>
          </div>
          <div className="flex flex-wrap gap-2 mt-3">
            <div className="flex-1 min-w-[140px]">
              <Select value={filtros.estado} onValueChange={(v) => setFiltros((f) => ({ ...f, estado: v === 'todos' ? '' : v }))}>
                <SelectTrigger><SelectValue placeholder="Estado" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  <SelectItem value="Emitida">Emitida</SelectItem>
                  <SelectItem value="Pagado">Pagado</SelectItem>
                  <SelectItem value="Parcial">Parcial</SelectItem>
                  <SelectItem value="Anulada">Anulada</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1 min-w-[140px]">
              <Input type="date" value={filtros.fecha_desde} onChange={(e) => setFiltros((f) => ({ ...f, fecha_desde: e.target.value }))} placeholder="Desde" />
            </div>
            <div className="flex-1 min-w-[140px]">
              <Input type="date" value={filtros.fecha_hasta} onChange={(e) => setFiltros((f) => ({ ...f, fecha_hasta: e.target.value }))} placeholder="Hasta" />
            </div>
            <Button variant="secondary" size="sm" onClick={() => fetchFacturas(1)}><Search className="w-3.5 h-3.5 mr-1" /> Buscar</Button>
          </div>
        </CardHeader>
        <CardContent>
          {loadingFacturas ? (
            <div className="flex items-center justify-center py-8"><Loader2 className="w-5 h-5 animate-spin text-muted-foreground" /></div>
          ) : facturas.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">No se encontraron facturas.</p>
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead># Factura</TableHead>
                      <TableHead>N° Factura</TableHead>
                      <TableHead>Cliente</TableHead>
                      <TableHead>Fecha Emisión</TableHead>
                      <TableHead>Subtotal</TableHead>
                      <TableHead>Impuesto</TableHead>
                      <TableHead>Total Bs</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead>Acción</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {facturas.map((f) => (
                      <TableRow key={f.id_factura} className="cursor-pointer" onClick={() => abrirDetalle(f)}>
                        <TableCell className="font-medium">#{f.id_factura}</TableCell>
                        <TableCell className="font-mono">{f.numero_factura}</TableCell>
                        <TableCell>{f.pedidos_ventas?.clientes?.razon_social || '-'}</TableCell>
                        <TableCell>{new Date(f.fecha_emision).toLocaleString('es-BO')}</TableCell>
                        <TableCell className="text-right font-mono">{fmt(f.subtotal)}</TableCell>
                        <TableCell className="text-right font-mono">{fmt(f.impuesto)}</TableCell>
                        <TableCell className="text-right font-mono font-bold">{fmt(f.total_factura)}</TableCell>
                        <TableCell><Badge className={badgeEstadoFactura(f.estado)}>{f.estado}</Badge></TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button size="sm" variant="ghost" onClick={(e) => { e.stopPropagation(); abrirDetalle(f) }} title="Ver factura"><Eye className="w-3.5 h-3.5" /></Button>
                            <Button size="sm" variant="ghost" onClick={(e) => { e.stopPropagation(); abrirDetalle(f) }} title="Imprimir / PDF"><Printer className="w-3.5 h-3.5" /></Button>
                            {f.estado === 'Emitida' && (
                              <>
                                <Button size="sm" variant="ghost" onClick={(e) => handlePago(f, e)} title="Registrar Pago"><DollarSign className="w-3.5 h-3.5" /></Button>
                                <Button size="sm" variant="outline" onClick={(e) => { e.stopPropagation(); setPagarModalFactura(f) }} title="Pagar con PayPal" className="text-xs px-2 h-7 border-blue-300 text-blue-600 hover:bg-blue-50">
                                  PayPal
                                </Button>
                              </>
                            )}
                            {f.estado !== 'Anulada' && (
                              <Button size="sm" variant="ghost" className="text-red-500 hover:text-red-600" onClick={(e) => handleAnular(f, e)} title="Anular"><Ban className="w-3.5 h-3.5" /></Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              <div className="flex items-center justify-between mt-4 text-sm text-muted-foreground">
                <span>Página {pageFacturas} de {pageCount}</span>
                <div className="flex gap-1">
                  <Button variant="outline" size="sm" disabled={pageFacturas <= 1} onClick={() => { setPageFacturas((p) => Math.max(1, p - 1)) }}><ChevronLeft className="w-3.5 h-3.5" /></Button>
                  <Button variant="outline" size="sm" disabled={pageFacturas >= pageCount} onClick={() => { setPageFacturas((p) => Math.min(pageCount, p + 1)) }}><ChevronRight className="w-3.5 h-3.5" /></Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Modal: Emitir Factura */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-4xl" style={{ maxHeight: '90vh', overflow: 'hidden' }}>
          <DialogHeader>
            <DialogTitle>Emitir Factura — Pedido #{modalPedido?.id_pedido}</DialogTitle>
            <DialogDescription>Complete los datos fiscales para emitir la factura comercial.</DialogDescription>
          </DialogHeader>

          {modalPedido && modalDetalle && (
            <div className="space-y-4 overflow-y-auto pr-1" style={{ maxHeight: 'calc(90vh - 100px)' }}>
              {/* Cabecera informativa */}
              <div className="bg-muted/30 rounded-lg p-3 text-sm space-y-1">
                <p><strong>Pedido #{modalPedido.id_pedido}</strong> — Fecha: {new Date(modalPedido.fecha_reserva).toLocaleDateString('es-BO')}</p>
                <p><strong>Cliente:</strong> {modalDetalle.clientes?.razon_social || '-'} — <strong>NIT:</strong> {modalDetalle.clientes?.nit_facturacion || 'Consumidor Final'} — <strong>Tipo:</strong> {modalDetalle.clientes?.tipo_cliente || '-'}</p>
                <p><strong>Vendedor:</strong> {modalDetalle.usuarios?.empleados?.nombre_completo || modalDetalle.usuarios?.email_corporativo || '-'}</p>
              </div>

              {/* Detalle de productos */}
              <div>
                <Label className="text-sm font-medium mb-1 block">Detalle de Productos</Label>
                <div className="overflow-x-auto border rounded-lg">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Producto</TableHead>
                        <TableHead>Código SKU</TableHead>
                        <TableHead>Cantidad (Kg)</TableHead>
                        <TableHead>Precio Unit. (Bs)</TableHead>
                        <TableHead>Subtotal (Bs)</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {modalLineas.map((l, i) => (
                        <TableRow key={l.id_detalle || i}>
                          <TableCell>{l.catalogo_items?.nombre_producto || '-'}</TableCell>
                          <TableCell className="font-mono text-xs">{l.catalogo_items?.codigo_sku || '-'}</TableCell>
                          <TableCell className="text-right font-mono">{fmt(l.cantidad_pedida)}</TableCell>
                          <TableCell className="text-right font-mono">{fmt(l.precio_unitario)}</TableCell>
                          <TableCell className="text-right font-mono">{fmt(Number(l.cantidad_pedida) * Number(l.precio_unitario))}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>

              {/* Cálculos financieros */}
              <div className="bg-muted/30 rounded-lg p-4 space-y-2">
                <div className="flex justify-between text-sm"><span>Subtotal:</span><span className="font-mono">{fmt(subtotal)} Bs</span></div>
                <div className="flex justify-between text-sm items-center gap-4">
                  <span>Tasa de Impuesto (%):</span>
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      max="100"
                      value={tasaImpuesto}
                      onChange={(e) => {
                        const v = parseFloat(e.target.value)
                        if (!isNaN(v) && v >= 0 && v <= 100) setTasaImpuesto(v)
                        else if (e.target.value === '') setTasaImpuesto(0)
                      }}
                      className="w-24 text-right font-mono"
                    />
                    <span className="font-mono">{fmt(impuesto)} Bs</span>
                  </div>
                </div>
                <div className="flex justify-between text-lg font-bold border-t pt-2">
                  <span>Total Factura (Bs):</span><span className="font-mono">{fmt(totalFactura)} Bs</span>
                </div>
              </div>

              {/* Datos fiscales */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label>Número de Factura *</Label>
                  <Input
                    placeholder="Ej: 1001"
                    value={numeroFactura}
                    onChange={(e) => { setNumeroFactura(e.target.value); setErrorNumero(false) }}
                    className={errorNumero ? 'border-red-500 focus-visible:ring-red-500' : ''}
                  />
                  {errorNumero && <p className="text-xs text-red-500">Número duplicado, verifique el talonario.</p>}
                </div>
                <div className="space-y-1">
                  <Label>Método de Pago</Label>
                  <Select value={metodoPago} onValueChange={setMetodoPago}>
                    <SelectTrigger><SelectValue placeholder="Seleccionar" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Efectivo">Efectivo</SelectItem>
                      <SelectItem value="Transferencia">Transferencia</SelectItem>
                      <SelectItem value="QR">QR</SelectItem>
                      <SelectItem value="Crédito">Crédito</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Barra de acciones */}
              <div className="flex justify-end gap-2 pt-2 border-t">
                <Button variant="outline" onClick={() => setModalOpen(false)}>Cancelar</Button>
                <Button
                  onClick={handleEmitir}
                  disabled={!numeroFactura.trim() || totalFactura <= 0 || emitiendo || tasaImpuesto < 0 || tasaImpuesto > 100}
                >
                  {emitiendo ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <FileText className="w-4 h-4 mr-1" />}
                  Emitir Factura
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Modal: Detalle / Impresión Factura */}
      <Dialog open={!!detalleFactura} onOpenChange={(o) => { if (!o) setDetalleFactura(null) }}>
        <DialogContent className="max-w-3xl" style={{ maxHeight: '90vh', overflow: 'hidden' }}>
          <DialogHeader>
            <DialogTitle>Factura N° {detalleFactura?.numero_factura}</DialogTitle>
            <DialogDescription>Comprobante fiscal — GRULAC S.R.L.</DialogDescription>
          </DialogHeader>
          {detalleFactura && (
            <div className="space-y-4 text-sm overflow-y-auto pr-1" style={{ maxHeight: 'calc(90vh - 100px)' }}>
              <div className="text-center border-b pb-3">
                <p className="text-lg font-bold">GRULAC S.R.L.</p>
                <p className="text-muted-foreground">NIT: 123456789 | Dirección: Av. Principal #123</p>
                <p className="text-muted-foreground">Tel: (591) 2-1234567</p>
                <p className="text-2xl font-bold mt-2">FACTURA</p>
                <p className="text-lg font-mono">N° {detalleFactura.numero_factura}</p>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <p><strong>Cliente:</strong> {detalleFactura.pedidos_ventas?.clientes?.razon_social || '-'}</p>
                  <p><strong>NIT:</strong> {detalleFactura.pedidos_ventas?.clientes?.nit_facturacion || 'Consumidor Final'}</p>
                </div>
                <div className="text-right">
                  <p><strong>Fecha:</strong> {new Date(detalleFactura.fecha_emision).toLocaleString('es-BO')}</p>
                  <p><strong>Método Pago:</strong> {detalleFactura.metodo_pago || '-'}</p>
                </div>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Producto</TableHead>
                    <TableHead>Cant.</TableHead>
                    <TableHead>P. Unit.</TableHead>
                    <TableHead>Subtotal</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell>Según detalle de pedido</TableCell>
                    <TableCell>-</TableCell>
                    <TableCell>-</TableCell>
                    <TableCell className="font-mono text-right">{fmt(detalleFactura.subtotal)}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>

              <div className="flex justify-end">
                <div className="w-64 space-y-1">
                  <div className="flex justify-between"><span>Subtotal:</span><span className="font-mono">{fmt(detalleFactura.subtotal)} Bs</span></div>
                  <div className="flex justify-between"><span>Impuesto ({fmt(detalleFactura.total_factura > 0 ? ((detalleFactura.impuesto / detalleFactura.subtotal) * 100) : 0)}%):</span><span className="font-mono">{fmt(detalleFactura.impuesto)} Bs</span></div>
                  <div className="flex justify-between font-bold text-base border-t pt-1"><span>Total:</span><span className="font-mono">{fmt(detalleFactura.total_factura)} Bs</span></div>
                </div>
              </div>

              <p className="text-xs text-center text-muted-foreground border-t pt-3">
                Documento válido para respaldo fiscal — SIN Bolivia — Original: Cliente | Copia: Emisor
              </p>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setDetalleFactura(null)}>Cerrar</Button>
                <Button onClick={() => window.print()}><Printer className="w-3.5 h-3.5 mr-1" /> Imprimir</Button>
              </div>

            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Modal: Pago PayPal (independiente) */}
      <Dialog open={!!pagarModalFactura} onOpenChange={(o) => { if (!o) setPagarModalFactura(null) }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Pagar con PayPal</DialogTitle>
            <DialogDescription>Factura N° {pagarModalFactura?.numero_factura} — Total: {fmt(pagarModalFactura?.total_factura || 0)} Bs (≈ USD {fmt((pagarModalFactura?.total_factura || 0) / 6.96)})</DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="relative">
              {paypalLoading && (
                <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/80 rounded">
                  <Loader2 className="w-4 h-4 animate-spin mr-2" /> Procesando pago...
                </div>
              )}
              <PayPalScriptProvider options={{
                'client-id': process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || '',
                currency: 'USD',
                intent: 'capture',
              }}>
                <PayPalButtons
                  style={{ layout: 'horizontal', label: 'pay', height: 40 }}
                  createOrder={async () => {
                    setPaypalLoading(true)
                    const r = await createPayPalOrder(pagarModalFactura.id_factura)
                    if (!r.success) { toast.error('PayPal', { description: r.error }); setPaypalLoading(false); throw new Error(r.error) }
                    setPaypalOrderId(r.orderId)
                    setPaypalLoading(false)
                    return r.orderId
                  }}
                  onApprove={async (data) => {
                    setPaypalLoading(true)
                    const r = await capturePayPalOrder(pagarModalFactura.id_factura, data.orderID)
                    if (!r.success) { toast.error('PayPal', { description: r.error }); setPaypalLoading(false); return }
                    toast.success('Pago exitoso', { description: `PayPal capture: ${r.captureId}` })
                    setPaypalLoading(false)
                    setPagarModalFactura(null)
                    fetchFacturas()
                  }}
                  onError={(err) => {
                    toast.error('Error en PayPal', { description: err.message || 'Error desconocido' })
                    setPaypalLoading(false)
                  }}
                />
              </PayPalScriptProvider>
            </div>
            <p className="text-xs text-muted-foreground text-center mt-3">El monto en USD es aproximado (tasa 1 USD ≈ 6.96 Bs). Se cobrará en USD a través de PayPal.</p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
