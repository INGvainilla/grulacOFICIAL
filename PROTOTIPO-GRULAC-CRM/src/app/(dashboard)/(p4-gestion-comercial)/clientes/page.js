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
import { Building2 } from 'lucide-react'

// CU26: Registrar Cliente Comercial (B2B/B2C)
export default function ClientesPage() {
  const [clientes, setClientes] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [saving, setSaving] = useState(false)
  const supabase = createClient()

  const [form, setForm] = useState({
    nit_facturacion: '', razon_social: '', tipo_cliente: '', telefono: '', email: '', direccion: '', ciudad: ''
  })
  const [formErrors, setFormErrors] = useState({})

  const fetchClientes = async () => {
    setLoading(true)
    const { data, error } = await supabase.from('clientes').select('*').order('razon_social')
    if (error) toast.error('Error al cargar clientes CRM', { description: error.message })
    else setClientes(data)
    setLoading(false)
  }

  useEffect(() => { fetchClientes() }, [])

  const validateForm = () => {
    const errors = {}
    if (!form.nit_facturacion.trim()) errors.nit_facturacion = 'Este campo es obligatorio'
    if (!form.razon_social.trim()) errors.razon_social = 'Este campo es obligatorio'
    if (!form.tipo_cliente) errors.tipo_cliente = 'Debe seleccionar la categoría'
    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleCrearCliente = async (e) => {
    e.preventDefault();
    if (!validateForm()) return
    setSaving(true)

    // E1: Verificar duplicidad de NIT
    const { data: existing } = await supabase
      .from('clientes')
      .select('id_cliente')
      .eq('nit_facturacion', form.nit_facturacion.trim())
      .maybeSingle()

    if (existing) {
      setFormErrors({ nit_facturacion: 'Este NIT ya está registrado en otra cuenta de cliente' })
      setSaving(false)
      return
    }

    const { data: newCliente, error } = await supabase.from('clientes').insert([{
      nit_facturacion: form.nit_facturacion.trim(),
      razon_social: form.razon_social.trim(),
      tipo_cliente: form.tipo_cliente,
      telefono: form.telefono.trim() || null,
      email: form.email.trim() || null,
      direccion: form.direccion.trim() || null,
      ciudad: form.ciudad.trim() || null,
    }]).select().single()

    if (error) {
      toast.error('Error al registrar cliente', { description: error.message })
      setSaving(false)
      return
    }

    const { data: { session } } = await supabase.auth.getSession()
    let idUsuario = 1
    if (session?.user?.id) {
      const { data: userData } = await supabase.from('usuarios').select('id_usuario').eq('auth_uid', session.user.id).single()
      if (userData?.id_usuario) idUsuario = userData.id_usuario
    }

    await supabase.from('bitacora_auditoria').insert([{
      id_usuario: idUsuario,
      accion_sql: 'INSERT',
      tabla_afectada: 'clientes',
      registro_id: newCliente.id_cliente,
      new_data: newCliente
    }])

    toast.success('Cliente apto para despachos', { description: `${form.razon_social} integrado al CRM.` })
    setShowModal(false)
    setForm({ nit_facturacion: '', razon_social: '', tipo_cliente: '', telefono: '', email: '', direccion: '', ciudad: '' })
    setFormErrors({})
    fetchClientes()
    setSaving(false)
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Cartera de Clientes Comerciales</h2>
          <p className="text-muted-foreground">Listado de Supermercados (B2B) y Distribuidores (B2C).</p>
        </div>
        <Button onClick={() => setShowModal(true)} className="bg-blue-600 hover:bg-blue-700">
          <Building2 className="w-4 h-4 mr-2" />
          Agregar Comprador
        </Button>
      </div>

      <Card className="bg-zinc-900 border-border/50">
        <CardHeader>
          <CardTitle>Destinos de Despacho</CardTitle>
          <CardDescription>Para que el chofer pueda llevar producto, el receptor debe estar oficializado.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border border-border/50">
            <Table>
              <TableHeader className="bg-zinc-950/50">
                <TableRow>
                  <TableHead>NIT</TableHead>
                  <TableHead>Razón Social</TableHead>
                  <TableHead>Categoría</TableHead>
                  <TableHead>Ciudad</TableHead>
                  <TableHead>Contacto</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow><TableCell colSpan={5} className="text-center py-4">Buscando carteras activas...</TableCell></TableRow>
                ) : clientes.length === 0 ? (
                  <TableRow><TableCell colSpan={5} className="text-center py-4">Aún no hay clientes registrados.</TableCell></TableRow>
                ) : clientes.map((cli) => (
                  <TableRow key={cli.id_cliente}>
                    <TableCell className="font-mono text-zinc-300">{cli.nit_facturacion}</TableCell>
                    <TableCell className="font-semibold text-white">{cli.razon_social}</TableCell>
                    <TableCell>
                      {cli.tipo_cliente === 'B2B' ? (
                        <Badge variant="outline" className="text-blue-400 border-blue-400/50 bg-blue-900/10">Retail / Mayorista</Badge>
                      ) : (
                        <Badge variant="outline" className="text-purple-400 border-purple-400/50 bg-purple-900/10">Detallista</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-muted-foreground">{cli.ciudad || '—'}</TableCell>
                    <TableCell className="text-muted-foreground text-sm">{cli.telefono || cli.email || '—'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* ========== MODAL CU26: Registro de Nuevo Cliente ========== */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Registro de Nuevo Cliente</DialogTitle>
            <DialogDescription>Integre un comprador al sistema para habilitar pedidos y facturación.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCrearCliente}>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>NIT de Facturación *</Label>
                  <Input
                    required
                    placeholder="Ej: 1023456789"
                    value={form.nit_facturacion}
                  onChange={(e) => { setForm({...form, nit_facturacion: e.target.value}); setFormErrors({...formErrors, nit_facturacion: ''}) }}
                  className={formErrors.nit_facturacion ? 'border-red-500' : ''}
                />
                {formErrors.nit_facturacion && <p className="text-xs text-red-500">{formErrors.nit_facturacion}</p>}
              </div>
              <div className="space-y-2">
                <Label>Categoría Comercial *</Label>
                <Select required value={form.tipo_cliente} onValueChange={(val) => { setForm({...form, tipo_cliente: val}); setFormErrors({...formErrors, tipo_cliente: ''}) }}>
                  <SelectTrigger className={formErrors.tipo_cliente ? 'border-red-500' : ''}>
                    <SelectValue placeholder="Seleccione..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="B2B">B2B — Mayorista / Supermercado</SelectItem>
                    <SelectItem value="B2C">B2C — Minorista / Detallista</SelectItem>
                  </SelectContent>
                </Select>
                {formErrors.tipo_cliente && <p className="text-xs text-red-500">{formErrors.tipo_cliente}</p>}
              </div>
            </div>
            <div className="space-y-2">
              <Label>Razón Social *</Label>
              <Input
                required
                placeholder="Ej: Supermercados Hipermaxi S.A."
                value={form.razon_social}
                onChange={(e) => { setForm({...form, razon_social: e.target.value}); setFormErrors({...formErrors, razon_social: ''}) }}
                className={formErrors.razon_social ? 'border-red-500' : ''}
              />
              {formErrors.razon_social && <p className="text-xs text-red-500">{formErrors.razon_social}</p>}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Teléfono</Label>
                <Input placeholder="Ej: 33445566" value={form.telefono} onChange={(e) => setForm({...form, telefono: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input type="email" placeholder="ventas@empresa.com" value={form.email} onChange={(e) => setForm({...form, email: e.target.value})} />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Ciudad</Label>
                <Input placeholder="Ej: Santa Cruz" value={form.ciudad} onChange={(e) => setForm({...form, ciudad: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label>Dirección</Label>
                <Input placeholder="Ej: Av. Cañoto 3er anillo" value={form.direccion} onChange={(e) => setForm({...form, direccion: e.target.value})} />
              </div>
              </div>
            </div>
            <DialogFooter className="gap-2">
              <Button type="button" variant="outline" onClick={() => setShowModal(false)} disabled={saving}>Cancelar</Button>
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700" disabled={saving}>
                {saving ? 'Guardando...' : 'Confirmar y Guardar'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
