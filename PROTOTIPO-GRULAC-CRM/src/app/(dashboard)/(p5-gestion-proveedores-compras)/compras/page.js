'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'
import { PlusCircle, ShoppingCart, PackageCheck, Banknote } from 'lucide-react'

export default function ComprasPage() {
  const [ordenes, setOrdenes] = useState([])
  const [proveedores, setProveedores] = useState([])
  const [catalogo, setCatalogo] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const supabase = createClient()

  // Modals state
  const [showNuevaOrden, setShowNuevaOrden] = useState(false)
  const [showRecepcion, setShowRecepcion] = useState(false)
  const [showPago, setShowPago] = useState(false)
  const [ordenSeleccionada, setOrdenSeleccionada] = useState(null)

  // Formularios
  const [formOrden, setFormOrden] = useState({ id_proveedor: '', numero_factura_compra: '', items: [] })
  const [itemTemporal, setItemTemporal] = useState({ id_item: '', cantidad: '', precio_unitario: '' })

  const [formRecepcion, setFormRecepcion] = useState({ lotes: [], observaciones: '' }) // Para CU15
  const [formPago, setFormPago] = useState({ monto_pagado_bs: '', metodo_pago: '', referencia_comprobante: '' }) // Para CU16

  const fetchDatos = async () => {
    setLoading(true)
    const { data: oData, error: oError } = await supabase
      .from('compras_insumos')
      .select('*, proveedores(razon_social), usuarios!compras_insumos_id_usuario_recibe_fkey(email_corporativo), detalle_compras(*, catalogo_items(nombre_producto, unidad_medida)), pagos_proveedores(monto_pagado_bs)')
      .order('fecha_compra', { ascending: false })

    const { data: pData } = await supabase.from('proveedores').select('*').eq('estado_reputacion', 'Activo')
    const { data: cData } = await supabase.from('catalogo_items').select('*').in('tipo_item', ['MATERIA_PRIMA', 'INSUMO', 'EMPAQUE'])

    if (oError) toast.error('Error al cargar órdenes', { description: oError.message })
    else setOrdenes(oData || [])

    setProveedores(pData || [])
    setCatalogo(cData || [])
    setLoading(false)
  }

  useEffect(() => { fetchDatos() }, [])

  // ==========================================
  // CU14: Elaborar Orden de Compra
  // ==========================================
  const handleAgregarItem = () => {
    if (!itemTemporal.id_item || !itemTemporal.cantidad || !itemTemporal.precio_unitario) return
    const itm = catalogo.find(c => c.id_item.toString() === itemTemporal.id_item)
    setFormOrden({
      ...formOrden,
      items: [...formOrden.items, { ...itemTemporal, nombre: itm.nombre_producto, unidad: itm.unidad_medida }]
    })
    setItemTemporal({ id_item: '', cantidad: '', precio_unitario: '' })
  }

  const handleCrearOrden = async () => {
    if (!formOrden.id_proveedor || formOrden.items.length === 0) {
      toast.error('Faltan datos', { description: 'Seleccione un proveedor y agregue al menos un ítem.' })
      return
    }
    setSaving(true)

    // Obtener usuario actual (para auditoria y foreign keys)
    const { data: { user } } = await supabase.auth.getUser()
    let idUsuario = 1
    if (user?.id) {
      const { data: usuario } = await supabase.from('usuarios').select('id_usuario').eq('auth_uid', user.id).single()
      if (usuario?.id_usuario) idUsuario = usuario.id_usuario
    }

    const totalCalculado = formOrden.items.reduce((acc, it) => acc + (parseFloat(it.cantidad) * parseFloat(it.precio_unitario)), 0)

    // 1. Insertar orden (Cabecera)
    const { data: nuevaOrden, error: insertError } = await supabase.from('compras_insumos').insert([{
      id_proveedor: formOrden.id_proveedor,
      id_usuario_recibe: idUsuario,
      numero_factura_compra: formOrden.numero_factura_compra || null,
      estado_compra: 'Pendiente',
      monto_total_bs: totalCalculado
    }]).select().single()

    if (insertError) {
      toast.error('Error al registrar orden', { description: insertError.message })
      setSaving(false)
      return
    }

    // 2. Insertar detalles
    const detallesToInsert = formOrden.items.map(it => ({
      id_compra: nuevaOrden.id_compra,
      id_item: it.id_item,
      cantidad: it.cantidad,
      precio_unitario: it.precio_unitario
    }))

    const { error: detError } = await supabase.from('detalle_compras').insert(detallesToInsert)

    if (detError) {
      toast.error('Error al registrar detalles', { description: detError.message })
    } else {
      // 3. Bitácora de Auditoría
      await supabase.from('bitacora_auditoria').insert([{
        id_usuario: idUsuario,
        accion_sql: 'INSERT',
        tabla_afectada: 'compras_insumos',
        registro_id: nuevaOrden.id_compra,
        new_data: { accion: 'Emisión de Orden de Compra', proveedor: formOrden.id_proveedor, total: totalCalculado, items: formOrden.items.length }
      }])

      toast.success('Orden Creada', { description: `Orden #${nuevaOrden.id_compra} registrada exitosamente.` })
      setShowNuevaOrden(false)
      setFormOrden({ id_proveedor: '', numero_factura_compra: '', items: [] })
      fetchDatos()
    }
    setSaving(false)
  }

  // ==========================================
  // CU15: Registrar Recepción Insumos
  // ==========================================
  const abrirRecepcion = (orden) => {
    setOrdenSeleccionada(orden)
    setFormRecepcion({
      observaciones: '',
      lotes: orden.detalle_compras.map(d => ({
        id_detalle_compra: d.id_detalle_compra,
        id_item: d.id_item,
        lote_proveedor: '',
        fecha_vencimiento: '',
        cantidad_pedida: d.cantidad,
        cantidad_recibida: d.cantidad,
        nombre: d.catalogo_items.nombre_producto
      }))
    })
    setShowRecepcion(true)
  }

  const handleRecepcion = async () => {
    setSaving(true)
    const { data: { user } } = await supabase.auth.getUser()
    let idUsuario = 1
    if (user?.id) {
      const { data: usuario } = await supabase.from('usuarios').select('id_usuario').eq('auth_uid', user.id).single()
      if (usuario?.id_usuario) idUsuario = usuario.id_usuario
    }

    // 1. Actualizar estado de la compra a Recibida
    const { error: updError } = await supabase.from('compras_insumos').update({ estado_compra: 'Recibida' }).eq('id_compra', ordenSeleccionada.id_compra)

    if (updError) {
      toast.error('Error al actualizar orden', { description: updError.message }); setSaving(false); return
    }

    // 2. Actualizar detalles con lote y vencimiento + Insertar en Kardex
    for (const item of formRecepcion.lotes) {
      const cantRecibida = parseFloat(item.cantidad_recibida) || 0;
      if (cantRecibida > 0) {
        // Actualizar detalle
        await supabase.from('detalle_compras').update({
          cantidad: cantRecibida, // Ajustamos a la realidad recibida
          lote_proveedor: item.lote_proveedor || null,
          fecha_vencimiento: item.fecha_vencimiento || null
        }).eq('id_detalle_compra', item.id_detalle_compra)

        // Insertar Kardex
        await supabase.from('movimientos_kardex').insert([{
          id_item: item.id_item,
          id_usuario: idUsuario,
          tipo_operacion: 'IN',
          cantidad_kilos: cantRecibida,
          concepto_operacion: `Recepción Orden de Compra #${ordenSeleccionada.id_compra}. Obs: ${formRecepcion.observaciones || 'Completo'}`,
          id_compra_origen: ordenSeleccionada.id_compra
        }])
      }
    }

    // 3. Bitácora de Auditoría (Literal: el recepcionista hizo algo)
    await supabase.from('bitacora_auditoria').insert([{
      id_usuario: idUsuario,
      accion_sql: 'UPDATE',
      tabla_afectada: 'compras_insumos',
      registro_id: ordenSeleccionada.id_compra,
      new_data: { accion: 'Recepción Física de Insumos', obs: formRecepcion.observaciones, estado: 'Recibida' }
    }])

    toast.success('Recepción Confirmada', { description: 'Los insumos han sido ingresados al Kardex.' })
    setShowRecepcion(false)
    fetchDatos()
    setSaving(false)
  }

  // ==========================================
  // CU16: Registrar Pago a Proveedor
  // ==========================================
  const [saldoActual, setSaldoActual] = useState(0)

  const abrirPago = (orden) => {
    const pagosRealizados = orden.pagos_proveedores?.reduce((acc, p) => acc + parseFloat(p.monto_pagado_bs), 0) || 0
    const saldo = parseFloat(orden.monto_total_bs) - pagosRealizados

    setOrdenSeleccionada(orden)
    setSaldoActual(saldo)
    setFormPago({ monto_pagado_bs: saldo.toString(), metodo_pago: 'Transferencia', referencia_comprobante: '' })
    setShowPago(true)
  }

  const handlePago = async () => {
    const montoIngresado = parseFloat(formPago.monto_pagado_bs)
    if (!montoIngresado || !formPago.metodo_pago) return

    // Validar Monto No Excede
    if (montoIngresado > saldoActual) {
      toast.error('Monto Inválido', { description: `El pago no puede exceder el saldo pendiente de Bs. ${saldoActual.toFixed(2)}` })
      return
    }

    setSaving(true)
    const { data: { user } } = await supabase.auth.getUser()
    let idUsuario = 1
    if (user?.id) {
      const { data: usuario } = await supabase.from('usuarios').select('id_usuario').eq('auth_uid', user.id).single()
      if (usuario?.id_usuario) idUsuario = usuario.id_usuario
    }

    const { error } = await supabase.from('pagos_proveedores').insert([{
      id_proveedor: ordenSeleccionada.id_proveedor,
      id_compra: ordenSeleccionada.id_compra,
      id_usuario_registra: idUsuario,
      monto_pagado_bs: parseFloat(formPago.monto_pagado_bs),
      metodo_pago: formPago.metodo_pago,
      referencia_comprobante: formPago.referencia_comprobante || null
    }])

    if (error) {
      toast.error('Error al registrar pago', { description: error.message }); setSaving(false); return
    }

    // Actualizar Estado Orden si el saldo llega a cero
    if (montoIngresado >= saldoActual) {
      await supabase.from('compras_insumos').update({ estado_compra: 'Pagada' }).eq('id_compra', ordenSeleccionada.id_compra)
    }

    // Auditoría
    await supabase.from('bitacora_auditoria').insert([{
      id_usuario: idUsuario,
      accion_sql: 'INSERT',
      tabla_afectada: 'pagos_proveedores',
      registro_id: ordenSeleccionada.id_compra,
      new_data: { accion: 'Abono a Proveedor', monto: montoIngresado, metodo: formPago.metodo_pago }
    }])

    toast.success('Pago Registrado', { description: 'El comprobante ha sido asociado a la orden.' })
    setShowPago(false)
    fetchDatos()
    setSaving(false)
  }

  const ESTADO_COLORS = {
    'Pendiente': 'bg-yellow-500/10 text-yellow-500',
    'Recibida': 'bg-blue-500/10 text-blue-500',
    'Pagada': 'bg-emerald-500/10 text-emerald-500',
    'Anulada': 'bg-red-500/10 text-red-500'
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Gestión de Compras y Pagos</h2>
          <p className="text-muted-foreground">Ciclo completo: Orden → Recepción → Pago a Proveedor.</p>
        </div>
        <Button onClick={() => setShowNuevaOrden(true)} className="bg-blue-600 hover:bg-blue-700">
          <ShoppingCart className="w-4 h-4 mr-2" /> Nueva Orden
        </Button>
      </div>

      <Card className="bg-zinc-900 border-border/50">
        <CardContent className="pt-6">
          <Table>
            <TableHeader className="bg-zinc-950/50">
              <TableRow>
                <TableHead># Orden</TableHead>
                <TableHead>Proveedor</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead>Monto (Bs.)</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={6} className="text-center">Cargando...</TableCell></TableRow>
              ) : ordenes.map(ord => (
                <TableRow key={ord.id_compra}>
                  <TableCell className="font-mono">#{ord.id_compra}</TableCell>
                  <TableCell className="font-semibold text-white">{ord.proveedores?.razon_social}</TableCell>
                  <TableCell>{new Date(ord.fecha_compra).toLocaleDateString()}</TableCell>
                  <TableCell>Bs. {ord.monto_total_bs}</TableCell>
                  <TableCell><Badge className={ESTADO_COLORS[ord.estado_compra] || ''}>{ord.estado_compra}</Badge></TableCell>
                  <TableCell className="text-right space-x-2">
                    {ord.estado_compra === 'Pendiente' && (
                      <Button variant="outline" size="sm" onClick={() => abrirRecepcion(ord)} className="text-emerald-500 border-emerald-500/50 hover:bg-emerald-500/10">
                        <PackageCheck className="w-4 h-4 mr-1" /> Recibir Insumos
                      </Button>
                    )}
                    {ord.estado_compra === 'Recibida' && (
                      <Button variant="outline" size="sm" onClick={() => abrirPago(ord)} className="text-blue-500 border-blue-500/50 hover:bg-blue-500/10">
                        <Banknote className="w-4 h-4 mr-1" /> Pagar / Abonar
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* MODAL CU14: NUEVA ORDEN */}
      <Dialog open={showNuevaOrden} onOpenChange={setShowNuevaOrden}>
        <DialogContent className="sm:max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Elaborar Orden de Compra</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Proveedor</Label>
                <Select value={formOrden.id_proveedor} onValueChange={(val) => setFormOrden({ ...formOrden, id_proveedor: val })}>
                  <SelectTrigger><SelectValue placeholder="Seleccionar proveedor..." /></SelectTrigger>
                  <SelectContent>
                    {proveedores.map(p => <SelectItem key={p.id_proveedor} value={p.id_proveedor.toString()}>{p.razon_social}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Factura Proforma (Opcional)</Label>
                <Input value={formOrden.numero_factura_compra} onChange={(e) => setFormOrden({ ...formOrden, numero_factura_compra: e.target.value })} placeholder="Nº Documento..." />
              </div>
            </div>

            <div className="border border-border/50 rounded-md p-4 bg-zinc-950/30 space-y-4">
              <h4 className="font-medium">Agregar Ítems</h4>
              <div className="grid grid-cols-12 gap-2">
                <div className="col-span-5">
                  <Select value={itemTemporal.id_item} onValueChange={(val) => setItemTemporal({ ...itemTemporal, id_item: val })}>
                    <SelectTrigger><SelectValue placeholder="Ítem del catálogo" /></SelectTrigger>
                    <SelectContent>
                      {catalogo.map(c => <SelectItem key={c.id_item} value={c.id_item.toString()}>{c.nombre_producto} ({c.unidad_medida})</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="col-span-3">
                  <Input type="number" placeholder="Cantidad" value={itemTemporal.cantidad} onChange={(e) => setItemTemporal({ ...itemTemporal, cantidad: e.target.value })} />
                </div>
                <div className="col-span-3">
                  <Input type="number" placeholder="Precio Unit. Bs" value={itemTemporal.precio_unitario} onChange={(e) => setItemTemporal({ ...itemTemporal, precio_unitario: e.target.value })} />
                </div>
                <div className="col-span-1">
                  <Button onClick={handleAgregarItem} size="icon" className="w-full"><PlusCircle className="w-4 h-4" /></Button>
                </div>
              </div>

              {formOrden.items.length > 0 && (
                <Table className="mt-4">
                  <TableHeader><TableRow><TableHead>Ítem</TableHead><TableHead>Cant.</TableHead><TableHead>P.U.</TableHead><TableHead>Subtotal</TableHead></TableRow></TableHeader>
                  <TableBody>
                    {formOrden.items.map((it, idx) => (
                      <TableRow key={idx}>
                        <TableCell>{it.nombre}</TableCell>
                        <TableCell>{it.cantidad} {it.unidad}</TableCell>
                        <TableCell>Bs. {it.precio_unitario}</TableCell>
                        <TableCell>Bs. {(parseFloat(it.cantidad) * parseFloat(it.precio_unitario)).toFixed(2)}</TableCell>
                      </TableRow>
                    ))}
                    <TableRow className="font-bold">
                      <TableCell colSpan={3} className="text-right">TOTAL:</TableCell>
                      <TableCell>Bs. {formOrden.items.reduce((acc, it) => acc + (parseFloat(it.cantidad) * parseFloat(it.precio_unitario)), 0).toFixed(2)}</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNuevaOrden(false)}>Cancelar</Button>
            <Button onClick={handleCrearOrden} disabled={saving || formOrden.items.length === 0}>{saving ? 'Guardando...' : 'Emitir Orden'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* MODAL CU15: RECEPCION INSUMOS */}
      <Dialog open={showRecepcion} onOpenChange={setShowRecepcion}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Recepción Física de Insumos</DialogTitle>
            <DialogDescription>Confirme la llegada de los ítems para registrarlos en el Kardex.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {formRecepcion.lotes.map((lote, index) => (
              <div key={index} className="grid grid-cols-12 gap-2 items-center border-b border-border/50 pb-2">
                <div className="col-span-4 font-medium">
                  {lote.nombre}
                  <div className="text-xs text-muted-foreground mt-0.5">Pedido: {lote.cantidad_pedida} uds</div>
                </div>
                <div className="col-span-2">
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="Recibido"
                    value={lote.cantidad_recibida}
                    onChange={(e) => {
                      const nl = [...formRecepcion.lotes]; nl[index].cantidad_recibida = e.target.value; setFormRecepcion({ ...formRecepcion, lotes: nl })
                    }} />
                </div>
                <div className="col-span-3">
                  <Input
                    placeholder="Lote Prov."
                    value={lote.lote_proveedor}
                    onChange={(e) => {
                      const nl = [...formRecepcion.lotes]; nl[index].lote_proveedor = e.target.value; setFormRecepcion({ ...formRecepcion, lotes: nl })
                    }} />
                </div>
                <div className="col-span-3">
                  <Input
                    type="date"
                    value={lote.fecha_vencimiento}
                    onChange={(e) => {
                      const nl = [...formRecepcion.lotes]; nl[index].fecha_vencimiento = e.target.value; setFormRecepcion({ ...formRecepcion, lotes: nl })
                    }} />
                </div>
              </div>
            ))}

            <div className="space-y-2 mt-4">
              <Label>Observaciones (Discrepancias, daños, etc.)</Label>
              <Input
                placeholder="Ej: Faltaron 2 cajas, empaque ligeramente dañado..."
                value={formRecepcion.observaciones}
                onChange={(e) => setFormRecepcion({ ...formRecepcion, observaciones: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRecepcion(false)}>Cancelar</Button>
            <Button onClick={handleRecepcion} disabled={saving} className="bg-emerald-600 hover:bg-emerald-700">Confirmar Ingreso a Kardex</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* MODAL CU16: PAGO A PROVEEDOR */}
      <Dialog open={showPago} onOpenChange={setShowPago}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Registrar Pago a Proveedor</DialogTitle>
            <DialogDescription>Abonar a la Orden #{ordenSeleccionada?.id_compra}. Total Orden: Bs. {ordenSeleccionada?.monto_total_bs} | Saldo Pendiente: Bs. {saldoActual.toFixed(2)}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Monto a Pagar (Bs.) - Max: {saldoActual.toFixed(2)}</Label>
              <Input type="number" step="0.01" max={saldoActual} value={formPago.monto_pagado_bs} onChange={(e) => setFormPago({ ...formPago, monto_pagado_bs: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Método de Pago</Label>
              <Select value={formPago.metodo_pago} onValueChange={(v) => setFormPago({ ...formPago, metodo_pago: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Transferencia">Transferencia Bancaria</SelectItem>
                  <SelectItem value="Efectivo">Efectivo</SelectItem>
                  <SelectItem value="QR">QR</SelectItem>
                  <SelectItem value="Cheque">Cheque</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Referencia / Nro Comprobante</Label>
              <Input value={formPago.referencia_comprobante} onChange={(e) => setFormPago({ ...formPago, referencia_comprobante: e.target.value })} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPago(false)}>Cancelar</Button>
            <Button onClick={handlePago} disabled={saving}>Registrar Pago</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
