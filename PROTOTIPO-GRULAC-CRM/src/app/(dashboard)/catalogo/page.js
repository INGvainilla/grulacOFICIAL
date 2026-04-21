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
import { PackagePlus } from 'lucide-react'

// CU08: Registrar Nuevo Producto/Insumo en Catálogo
export default function CatalogoPage() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [saving, setSaving] = useState(false)
  const supabase = createClient()

  const [form, setForm] = useState({
    codigo_sku: '', nombre_producto: '', tipo_item: '', categoria: '',
    unidad_medida: '', precio_referencia: '', stock_minimo: '', vida_util_dias: ''
  })
  const [formErrors, setFormErrors] = useState({})

  const fetchItems = async () => {
    setLoading(true)
    const { data, error } = await supabase.from('catalogo_items').select('*').order('codigo_sku')
    if (error) toast.error('Error al cargar catálogo')
    else setItems(data)
    setLoading(false)
  }

  useEffect(() => { fetchItems() }, [])

  const validateForm = () => {
    const errors = {}
    if (!form.codigo_sku.trim()) errors.codigo_sku = 'Este campo es obligatorio'
    if (!form.nombre_producto.trim()) errors.nombre_producto = 'Este campo es obligatorio'
    if (!form.tipo_item) errors.tipo_item = 'Debe seleccionar el tipo de ítem'
    if (!form.unidad_medida.trim()) errors.unidad_medida = 'Este campo es obligatorio'
    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleCrearItem = async () => {
    if (!validateForm()) return
    setSaving(true)

    const { error } = await supabase.from('catalogo_items').insert([{
      codigo_sku: form.codigo_sku.trim().toUpperCase(),
      nombre_producto: form.nombre_producto.trim(),
      tipo_item: form.tipo_item,
      categoria: form.categoria.trim() || null,
      unidad_medida: form.unidad_medida.trim(),
      precio_referencia: parseFloat(form.precio_referencia) || 0,
      stock_minimo: parseFloat(form.stock_minimo) || 0,
      vida_util_dias: parseInt(form.vida_util_dias) || null,
    }])

    if (error) {
      if (error.message.includes('duplicate') || error.message.includes('unique')) {
        setFormErrors({ codigo_sku: 'Este SKU ya existe en el catálogo' })
      } else {
        toast.error('Error al crear ítem', { description: error.message })
      }
      setSaving(false)
      return
    }

    toast.success('Ítem registrado en el catálogo', { description: `${form.nombre_producto} con SKU ${form.codigo_sku}` })
    setShowModal(false)
    setForm({ codigo_sku: '', nombre_producto: '', tipo_item: '', categoria: '', unidad_medida: '', precio_referencia: '', stock_minimo: '', vida_util_dias: '' })
    setFormErrors({})
    fetchItems()
    setSaving(false)
  }

  const TIPO_BADGES = {
    'MATERIA_PRIMA': 'bg-amber-900/20 text-amber-400 border-amber-900/50',
    'INSUMO': 'bg-blue-900/20 text-blue-400 border-blue-900/50',
    'PRODUCTO_TERMINADO': 'bg-emerald-900/20 text-emerald-400 border-emerald-900/50',
    'EMPAQUE': 'bg-purple-900/20 text-purple-400 border-purple-900/50',
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Catálogo Maestro (WMS)</h2>
          <p className="text-muted-foreground">Listado general de insumos, materia prima y productos lácteos terminados.</p>
        </div>
        <Button onClick={() => setShowModal(true)} className="gap-2 bg-emerald-600 hover:bg-emerald-700">
          <PackagePlus className="w-4 h-4" />
          Crear Identidad de Ítem
        </Button>
      </div>

      <Card className="bg-zinc-900 border-border/50">
        <CardHeader>
          <CardTitle>Inventario Identificado</CardTitle>
          <CardDescription>Solo definiciones. El control de Kilos / Litros se ve en el Kárdex.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border border-border/50">
            <Table>
              <TableHeader className="bg-zinc-950/50">
                <TableRow>
                  <TableHead>SKU</TableHead>
                  <TableHead>Nombre del Ítem</TableHead>
                  <TableHead>Naturaleza</TableHead>
                  <TableHead>Unidad</TableHead>
                  <TableHead className="text-right">Stock Mín.</TableHead>
                  <TableHead className="text-right">Precio Ref. (Bs)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow><TableCell colSpan={6} className="text-center py-4">Sincronizando...</TableCell></TableRow>
                ) : items.length === 0 ? (
                  <TableRow><TableCell colSpan={6} className="text-center py-4">No hay ítems registrados.</TableCell></TableRow>
                ) : items.map((item) => (
                  <TableRow key={item.id_item}>
                    <TableCell className="font-mono text-zinc-400 font-semibold">{item.codigo_sku}</TableCell>
                    <TableCell className="font-semibold text-white">{item.nombre_producto}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={TIPO_BADGES[item.tipo_item] || ''}>
                        {item.tipo_item.replace('_', ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{item.unidad_medida}</TableCell>
                    <TableCell className="text-right font-mono text-red-400">{item.stock_minimo}</TableCell>
                    <TableCell className="text-right font-mono text-zinc-300">{item.precio_referencia}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* ========== MODAL CU08: Crear Identidad de Ítem ========== */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Crear Nueva Identidad de Ítem</DialogTitle>
            <DialogDescription>Registre un insumo, materia prima o producto terminado en el catálogo maestro.</DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-4">
            <div className="space-y-2">
              <Label>Código SKU *</Label>
              <Input 
                placeholder="Ej: INS-CUAJO-01"
                value={form.codigo_sku}
                onChange={(e) => { setForm({...form, codigo_sku: e.target.value}); setFormErrors({...formErrors, codigo_sku: ''}) }}
                className={formErrors.codigo_sku ? 'border-red-500' : ''}
              />
              {formErrors.codigo_sku && <p className="text-xs text-red-500">{formErrors.codigo_sku}</p>}
            </div>
            <div className="space-y-2">
              <Label>Tipo de Ítem *</Label>
              <Select value={form.tipo_item} onValueChange={(val) => { setForm({...form, tipo_item: val}); setFormErrors({...formErrors, tipo_item: ''}) }}>
                <SelectTrigger className={formErrors.tipo_item ? 'border-red-500' : ''}>
                  <SelectValue placeholder="Seleccione..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MATERIA_PRIMA">Materia Prima</SelectItem>
                  <SelectItem value="INSUMO">Insumo Químico</SelectItem>
                  <SelectItem value="PRODUCTO_TERMINADO">Producto Terminado</SelectItem>
                  <SelectItem value="EMPAQUE">Empaque</SelectItem>
                </SelectContent>
              </Select>
              {formErrors.tipo_item && <p className="text-xs text-red-500">{formErrors.tipo_item}</p>}
            </div>
            <div className="col-span-2 space-y-2">
              <Label>Nombre del Producto *</Label>
              <Input 
                placeholder="Ej: Cloruro de Calcio Industrial"
                value={form.nombre_producto}
                onChange={(e) => { setForm({...form, nombre_producto: e.target.value}); setFormErrors({...formErrors, nombre_producto: ''}) }}
                className={formErrors.nombre_producto ? 'border-red-500' : ''}
              />
              {formErrors.nombre_producto && <p className="text-xs text-red-500">{formErrors.nombre_producto}</p>}
            </div>
            <div className="space-y-2">
              <Label>Unidad de Medida *</Label>
              <Select value={form.unidad_medida} onValueChange={(val) => { setForm({...form, unidad_medida: val}); setFormErrors({...formErrors, unidad_medida: ''}) }}>
                <SelectTrigger className={formErrors.unidad_medida ? 'border-red-500' : ''}>
                  <SelectValue placeholder="Seleccione..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Kilogramos">Kilogramos (Kg)</SelectItem>
                  <SelectItem value="Litros">Litros (Lt)</SelectItem>
                  <SelectItem value="Unidades">Unidades (Un)</SelectItem>
                  <SelectItem value="Gramos">Gramos (g)</SelectItem>
                </SelectContent>
              </Select>
              {formErrors.unidad_medida && <p className="text-xs text-red-500">{formErrors.unidad_medida}</p>}
            </div>
            <div className="space-y-2">
              <Label>Categoría</Label>
              <Input placeholder="Ej: Producción" value={form.categoria} onChange={(e) => setForm({...form, categoria: e.target.value})} />
            </div>
            <div className="space-y-2">
              <Label>Stock Mínimo Alerta</Label>
              <Input type="number" step="0.01" placeholder="0.00" value={form.stock_minimo} onChange={(e) => setForm({...form, stock_minimo: e.target.value})} />
            </div>
            <div className="space-y-2">
              <Label>Precio Ref. (Bs)</Label>
              <Input type="number" step="0.01" placeholder="0.00" value={form.precio_referencia} onChange={(e) => setForm({...form, precio_referencia: e.target.value})} />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setShowModal(false)} disabled={saving}>Cancelar</Button>
            <Button onClick={handleCrearItem} className="bg-emerald-600 hover:bg-emerald-700" disabled={saving}>
              {saving ? 'Guardando...' : 'Guardar en Sistema Central'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
