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
import { PlusCircle, Ban } from 'lucide-react'

// CU12: Registrar Proveedor / Ganadero
export default function ProveedoresPage() {
  const [proveedores, setProveedores] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [saving, setSaving] = useState(false)
  const [providerToDisable, setProviderToDisable] = useState(null)
  const supabase = createClient()

  const [form, setForm] = useState({
    ci_nit: '', razon_social: '', tipo_proveedor: '', telefono: '', direccion: '', colonia_origen: ''
  })
  const [formErrors, setFormErrors] = useState({})

  const fetchProv = async () => {
    setLoading(true)
    const { data, error } = await supabase.from('proveedores').select('*').order('razon_social')
    if (error) toast.error('Error al cargar proveedores', { description: error.message })
    else setProveedores(data)
    setLoading(false)
  }

  useEffect(() => { fetchProv() }, [])

  const validateForm = () => {
    const errors = {}
    if (!form.ci_nit.trim()) errors.ci_nit = 'Este campo es obligatorio'
    if (!form.razon_social.trim()) errors.razon_social = 'Este campo es obligatorio'
    if (!form.tipo_proveedor) errors.tipo_proveedor = 'Debe seleccionar el tipo de proveedor'
    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleCrearProveedor = async () => {
    if (!validateForm()) return
    setSaving(true)

    // E1: Verificar duplicidad de NIT/CI
    const { data: existing } = await supabase
      .from('proveedores')
      .select('id_proveedor')
      .eq('ci_nit', form.ci_nit.trim())
      .maybeSingle()

    if (existing) {
      setFormErrors({ ci_nit: 'Este NIT/CI ya pertenece a un proveedor existente' })
      setSaving(false)
      return
    }

    // INSERT con estado_reputacion='Activo' automático (por DEFAULT)
    const { error } = await supabase.from('proveedores').insert([{
      ci_nit: form.ci_nit.trim(),
      razon_social: form.razon_social.trim(),
      tipo_proveedor: form.tipo_proveedor,
      telefono: form.telefono.trim() || null,
      direccion: form.direccion.trim() || null,
      colonia_origen: form.colonia_origen.trim() || null,
    }])

    if (error) {
      toast.error('Error al registrar proveedor', { description: error.message })
      setSaving(false)
      return
    }

    toast.success('Proveedor registrado exitosamente', { description: `${form.razon_social} está apto para negocios.` })
    setShowModal(false)
    setForm({ ci_nit: '', razon_social: '', tipo_proveedor: '', telefono: '', direccion: '', colonia_origen: '' })
    setFormErrors({})
    fetchProv()
    setSaving(false)
  }

  // CU13: Inhabilitar Proveedor
  const handleInhabilitar = async () => {
    if (!providerToDisable) return
    setSaving(true)

    // 1. Check pending orders
    const { count, error: countError } = await supabase
      .from('compras_insumos')
      .select('*', { count: 'exact', head: true })
      .eq('id_proveedor', providerToDisable.id_proveedor)
      .in('estado_compra', ['Pendiente', 'Parcial'])

    if (countError) {
      toast.error('Error al verificar órdenes', { description: countError.message })
      setSaving(false)
      return
    }

    if (count > 0) {
      toast.error('No se puede inhabilitar', { description: `El proveedor tiene ${count} orden(es) de compra pendientes.` })
      setSaving(false)
      setProviderToDisable(null)
      return
    }

    // 2. Update status
    const { error: updateError } = await supabase
      .from('proveedores')
      .update({ estado_reputacion: 'Suspendido' })
      .eq('id_proveedor', providerToDisable.id_proveedor)

    if (updateError) {
      toast.error('Error al inhabilitar', { description: updateError.message })
      setSaving(false)
      return
    }

    toast.success('Proveedor inhabilitado', { description: 'El proveedor ha sido suspendido exitosamente.' })
    setProviderToDisable(null)
    setSaving(false)
    fetchProv()
  }

  const ESTADO_BADGES = {
    'Activo': 'bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20',
    'Observado': 'bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20',
    'Inhabilitado_Bacteriologico': 'bg-red-500/10 text-red-500 hover:bg-red-500/20',
    'Suspendido': 'bg-zinc-500/10 text-zinc-400 hover:bg-zinc-500/20',
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Gestión de Orígenes (SCM)</h2>
          <p className="text-muted-foreground">Catálogo de Ranchos Lecheros y Proveedores Secundarios.</p>
        </div>
        <Button onClick={() => setShowModal(true)} className="bg-blue-600 hover:bg-blue-700">
          <PlusCircle className="w-4 h-4 mr-2" />
          Dar de Alta Ganadero
        </Button>
      </div>

      <Card className="bg-zinc-900 border-border/50">
        <CardHeader>
          <CardTitle>Proveedores Registrados</CardTitle>
          <CardDescription>Cualquier inhabilitación bacteriológica bloquea acopios futuros de este NIT.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border border-border/50">
            <Table>
              <TableHeader className="bg-zinc-950/50">
                <TableRow>
                  <TableHead>NIT/CI</TableHead>
                  <TableHead>Razón Social</TableHead>
                  <TableHead>Tipo Suministro</TableHead>
                  <TableHead>Colonia/Ruta</TableHead>
                  <TableHead>Reputación</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow><TableCell colSpan={5} className="text-center py-4">Cargando directorio...</TableCell></TableRow>
                ) : proveedores.length === 0 ? (
                  <TableRow><TableCell colSpan={5} className="text-center py-4">Directorio vacío.</TableCell></TableRow>
                ) : proveedores.map((prov) => (
                  <TableRow key={prov.id_proveedor}>
                    <TableCell className="font-mono text-zinc-300">{prov.ci_nit}</TableCell>
                    <TableCell className="font-semibold text-white">{prov.razon_social}</TableCell>
                    <TableCell className="text-muted-foreground">{prov.tipo_proveedor}</TableCell>
                    <TableCell className="text-muted-foreground">{prov.colonia_origen || '—'}</TableCell>
                    <TableCell>
                      <Badge className={ESTADO_BADGES[prov.estado_reputacion] || ''}>
                        {prov.estado_reputacion}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {prov.estado_reputacion !== 'Suspendido' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-500 hover:bg-red-500/10 hover:text-red-600"
                          onClick={() => setProviderToDisable(prov)}
                        >
                          <Ban className="w-4 h-4 mr-1" />
                          Inhabilitar
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* ========== MODAL CU12: Datos del Ganadero/Empresa ========== */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Datos del Ganadero/Empresa</DialogTitle>
            <DialogDescription>Registre un nuevo origen de materia prima o insumos agrarios.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>NIT / Carnet de Identidad *</Label>
                <Input 
                  placeholder="Ej: 1234567014"
                  value={form.ci_nit}
                  onChange={(e) => { setForm({...form, ci_nit: e.target.value}); setFormErrors({...formErrors, ci_nit: ''}) }}
                  className={formErrors.ci_nit ? 'border-red-500' : ''}
                />
                {formErrors.ci_nit && <p className="text-xs text-red-500">{formErrors.ci_nit}</p>}
              </div>
              <div className="space-y-2">
                <Label>Tipo de Suministro *</Label>
                <Select value={form.tipo_proveedor} onValueChange={(val) => { setForm({...form, tipo_proveedor: val}); setFormErrors({...formErrors, tipo_proveedor: ''}) }}>
                  <SelectTrigger className={formErrors.tipo_proveedor ? 'border-red-500' : ''}>
                    <SelectValue placeholder="Seleccione..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="GANADERO">Productor de Leche</SelectItem>
                    <SelectItem value="INSUMOS">Insumos Secos/Químicos</SelectItem>
                    <SelectItem value="SERVICIOS">Servicios</SelectItem>
                  </SelectContent>
                </Select>
                {formErrors.tipo_proveedor && <p className="text-xs text-red-500">{formErrors.tipo_proveedor}</p>}
              </div>
            </div>
            <div className="space-y-2">
              <Label>Razón Social / Nombre *</Label>
              <Input 
                placeholder="Ej: Estancia Valle Nuevo"
                value={form.razon_social}
                onChange={(e) => { setForm({...form, razon_social: e.target.value}); setFormErrors({...formErrors, razon_social: ''}) }}
                className={formErrors.razon_social ? 'border-red-500' : ''}
              />
              {formErrors.razon_social && <p className="text-xs text-red-500">{formErrors.razon_social}</p>}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Teléfono</Label>
                <Input placeholder="Ej: 76543210" value={form.telefono} onChange={(e) => setForm({...form, telefono: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label>Colonia / Ruta de Acopio</Label>
                <Input placeholder="Ej: Km 85 Ruta Norte" value={form.colonia_origen} onChange={(e) => setForm({...form, colonia_origen: e.target.value})} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Dirección Completa</Label>
              <Input placeholder="Ej: Camino a Portachuelo km 3" value={form.direccion} onChange={(e) => setForm({...form, direccion: e.target.value})} />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setShowModal(false)} disabled={saving}>Descartar</Button>
            <Button onClick={handleCrearProveedor} className="bg-emerald-600 hover:bg-emerald-700" disabled={saving}>
              {saving ? 'Registrando...' : 'Registrar Origen'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ========== MODAL CU13: Confirmar Inhabilitación ========== */}
      <Dialog open={!!providerToDisable} onOpenChange={(open) => !open && setProviderToDisable(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-red-500">Inhabilitar Proveedor</DialogTitle>
            <DialogDescription>
              ¿Está seguro que desea suspender a <strong>{providerToDisable?.razon_social}</strong>? 
              Se verificarán órdenes de compra pendientes antes de proceder.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 mt-4">
            <Button variant="outline" onClick={() => setProviderToDisable(null)} disabled={saving}>Cancelar</Button>
            <Button variant="destructive" onClick={handleInhabilitar} disabled={saving}>
              {saving ? 'Verificando...' : 'Confirmar Suspensión'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
