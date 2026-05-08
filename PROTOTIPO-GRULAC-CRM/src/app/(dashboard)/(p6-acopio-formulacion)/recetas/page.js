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
import { PlusCircle, FlaskRound, Trash2 } from 'lucide-react'

export default function RecetasPage() {
  const [recetas, setRecetas] = useState([])
  const [catalogo, setCatalogo] = useState([])
  const [productosTerminados, setProductosTerminados] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const supabase = createClient()

  const [showNuevaReceta, setShowNuevaReceta] = useState(false)
  
  const [formReceta, setFormReceta] = useState({
    id_item_resultado: '', nombre_receta: '', base_litros_leche: '', rendimiento_esperado_pct: '', ingredientes: []
  })
  
  const [ingredienteTemp, setIngredienteTemp] = useState({
    id_item_ingrediente: '', cantidad_por_base: '', unidad_medida: 'Kg', es_obligatorio: 'true', tolerancia_pct: '5'
  })

  const fetchDatos = async () => {
    setLoading(true)
    const { data: rData, error: rError } = await supabase
      .from('recetas_bom')
      .select('*, catalogo_items(nombre_producto), receta_ingredientes(*, catalogo_items(nombre_producto))')
      .order('id_receta', { ascending: false })
    
    const { data: cData } = await supabase.from('catalogo_items').select('*')

    if (rError) toast.error('Error al cargar recetas', { description: rError.message })
    else setRecetas(rData || [])
    
    if (cData) {
      setCatalogo(cData)
      setProductosTerminados(cData.filter(c => c.tipo_item === 'PRODUCTO_TERMINADO'))
    }
    setLoading(false)
  }

  useEffect(() => { fetchDatos() }, [])

  // ==========================================
  // CU19: Registrar Receta Base BOM
  // ==========================================
  const handleAgregarIngrediente = () => {
    if (!ingredienteTemp.id_item_ingrediente || !ingredienteTemp.cantidad_por_base) return
    const itm = catalogo.find(c => c.id_item.toString() === ingredienteTemp.id_item_ingrediente)
    
    // Evitar duplicados
    if (formReceta.ingredientes.some(i => i.id_item_ingrediente === ingredienteTemp.id_item_ingrediente)) {
        toast.error('Ítem ya agregado', { description: 'Este ingrediente ya está en la receta.' })
        return
    }

    setFormReceta({
      ...formReceta,
      ingredientes: [...formReceta.ingredientes, { 
        ...ingredienteTemp, 
        nombre: itm.nombre_producto,
        unidad_medida: itm.unidad_medida // Override from catalog
      }]
    })
    setIngredienteTemp({ id_item_ingrediente: '', cantidad_por_base: '', unidad_medida: 'Kg', es_obligatorio: 'true', tolerancia_pct: '5' })
  }

  const handleRemoverIngrediente = (id) => {
      setFormReceta({
          ...formReceta,
          ingredientes: formReceta.ingredientes.filter(i => i.id_item_ingrediente !== id)
      })
  }

  const handleCrearReceta = async () => {
    if (!formReceta.id_item_resultado || !formReceta.nombre_receta || formReceta.ingredientes.length === 0) {
      toast.error('Datos incompletos', { description: 'Faltan datos de cabecera o ingredientes.' })
      return
    }
    setSaving(true)

    // 1. Insertar Cabecera Receta
    const { data: nuevaReceta, error: insError } = await supabase.from('recetas_bom').insert([{
      id_item_resultado: parseInt(formReceta.id_item_resultado),
      nombre_receta: formReceta.nombre_receta,
      base_litros_leche: parseFloat(formReceta.base_litros_leche) || 1000,
      rendimiento_esperado_pct: parseFloat(formReceta.rendimiento_esperado_pct) || 10
    }]).select().single()

    if (insError) {
      toast.error('Error al guardar', { description: insError.message }); setSaving(false); return
    }

    // 2. Insertar Ingredientes
    const ingredientesToInsert = formReceta.ingredientes.map(ing => ({
        id_receta: nuevaReceta.id_receta,
        id_item_ingrediente: parseInt(ing.id_item_ingrediente),
        cantidad_por_base: parseFloat(ing.cantidad_por_base),
        unidad_medida: ing.unidad_medida,
        es_obligatorio: ing.es_obligatorio === 'true',
        tolerancia_pct: parseFloat(ing.tolerancia_pct)
    }))

    const { error: detError } = await supabase.from('receta_ingredientes').insert(ingredientesToInsert)

    if (detError) {
      toast.error('Error en ingredientes', { description: detError.message })
    } else {
      // Auditoría: Creación de Receta BOM
      const { data: { user } } = await supabase.auth.getUser()
      const { data: usuario } = await supabase.from('usuarios').select('id_usuario').eq('auth_uid', user.id).single()
      
      await supabase.from('bitacora_auditoria').insert([{
        id_usuario: usuario?.id_usuario || 1,
        accion_sql: 'INSERT',
        tabla_afectada: 'recetas_bom',
        registro_id: nuevaReceta.id_receta,
        new_data: { accion: 'Creación de Receta BOM', nombre: formReceta.nombre_receta, rendimiento: formReceta.rendimiento_esperado_pct, cant_ingredientes: formReceta.ingredientes.length }
      }])

      toast.success('Receta Creada', { description: `BOM ${nuevaReceta.nombre_receta} registrado exitosamente.` })
      setShowNuevaReceta(false)
      setFormReceta({ id_item_resultado: '', nombre_receta: '', base_litros_leche: '', rendimiento_esperado_pct: '', ingredientes: [] })
      fetchDatos()
    }
    setSaving(false)
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Formulación y Recetas BOM</h2>
          <p className="text-muted-foreground">Estructura de materiales para productos terminados.</p>
        </div>
        <Button onClick={() => setShowNuevaReceta(true)} className="bg-blue-600 hover:bg-blue-700">
          <FlaskRound className="w-4 h-4 mr-2" /> Crear Receta BOM
        </Button>
      </div>

      <Card className="bg-zinc-900 border-border/50">
        <CardContent className="pt-6">
          <Table>
            <TableHeader className="bg-zinc-950/50">
              <TableRow>
                <TableHead>Nombre Receta</TableHead>
                <TableHead>Producto Final</TableHead>
                <TableHead>Base (L Leche)</TableHead>
                <TableHead>Rend. Esperado</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Ingredientes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={6} className="text-center">Cargando...</TableCell></TableRow>
              ) : recetas.map(r => (
                <TableRow key={r.id_receta}>
                  <TableCell className="font-semibold text-white">{r.nombre_receta} (v{r.version_receta})</TableCell>
                  <TableCell>{r.catalogo_items?.nombre_producto}</TableCell>
                  <TableCell>{r.base_litros_leche} L</TableCell>
                  <TableCell>{r.rendimiento_esperado_pct}%</TableCell>
                  <TableCell>
                      <Badge className={r.estado_activa ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}>
                          {r.estado_activa ? 'Activa' : 'Inactiva'}
                      </Badge>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                      {r.receta_ingredientes.map(i => `${i.catalogo_items?.nombre_producto} (${i.cantidad_por_base}${i.unidad_medida})`).join(', ')}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* MODAL CU19: NUEVA RECETA */}
      <Dialog open={showNuevaReceta} onOpenChange={setShowNuevaReceta}>
        <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Elaborar Receta Base BOM</DialogTitle>
            <DialogDescription>Define los ingredientes y proporciones para manufactura.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Producto Final (Resultado)</Label>
                <Select value={formReceta.id_item_resultado} onValueChange={(v) => setFormReceta({...formReceta, id_item_resultado: v})}>
                  <SelectTrigger><SelectValue placeholder="Seleccione producto" /></SelectTrigger>
                  <SelectContent>
                    {productosTerminados.map(p => <SelectItem key={p.id_item} value={p.id_item.toString()}>{p.nombre_producto}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Nombre de la Receta</Label>
                <Input value={formReceta.nombre_receta} onChange={(e) => setFormReceta({...formReceta, nombre_receta: e.target.value})} placeholder="Ej: Queso Fresco Estándar" />
              </div>
              <div className="space-y-2">
                <Label>Base de Cálculo (Litros de Leche)</Label>
                <Input type="number" value={formReceta.base_litros_leche} onChange={(e) => setFormReceta({...formReceta, base_litros_leche: e.target.value})} placeholder="Ej: 1000" />
              </div>
              <div className="space-y-2">
                <Label>Rendimiento Esperado (%)</Label>
                <Input type="number" step="0.1" value={formReceta.rendimiento_esperado_pct} onChange={(e) => setFormReceta({...formReceta, rendimiento_esperado_pct: e.target.value})} placeholder="Ej: 10" />
              </div>
            </div>

            <div className="border border-border/50 rounded-md p-4 bg-zinc-950/30 space-y-4 mt-4">
              <h4 className="font-medium">Agregar Ingredientes (Aditivos/Cuajo/Sal)</h4>
              <div className="grid grid-cols-12 gap-2">
                <div className="col-span-5">
                  <Select value={ingredienteTemp.id_item_ingrediente} onValueChange={(val) => setIngredienteTemp({...ingredienteTemp, id_item_ingrediente: val})}>
                    <SelectTrigger><SelectValue placeholder="Seleccione Insumo" /></SelectTrigger>
                    <SelectContent>
                      {catalogo.filter(c => c.tipo_item === 'INSUMO' || c.tipo_item === 'MATERIA_PRIMA').map(c => 
                        <SelectItem key={c.id_item} value={c.id_item.toString()}>{c.nombre_producto} ({c.unidad_medida})</SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>
                <div className="col-span-3">
                  <Input type="number" step="0.01" placeholder="Cant. por Base" value={ingredienteTemp.cantidad_por_base} onChange={(e) => setIngredienteTemp({...ingredienteTemp, cantidad_por_base: e.target.value})} />
                </div>
                <div className="col-span-3">
                  <Select value={ingredienteTemp.es_obligatorio} onValueChange={(v) => setIngredienteTemp({...ingredienteTemp, es_obligatorio: v})}>
                    <SelectTrigger><SelectValue/></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="true">Obligatorio</SelectItem>
                      <SelectItem value="false">Opcional</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="col-span-1">
                  <Button onClick={handleAgregarIngrediente} size="icon" className="w-full bg-secondary"><PlusCircle className="w-4 h-4" /></Button>
                </div>
              </div>

              {formReceta.ingredientes.length > 0 && (
                <Table className="mt-4">
                  <TableHeader><TableRow><TableHead>Insumo</TableHead><TableHead>Cantidad</TableHead><TableHead>Tipo</TableHead><TableHead></TableHead></TableRow></TableHeader>
                  <TableBody>
                    {formReceta.ingredientes.map((it) => (
                      <TableRow key={it.id_item_ingrediente}>
                        <TableCell>{it.nombre}</TableCell>
                        <TableCell>{it.cantidad_por_base} {it.unidad_medida}</TableCell>
                        <TableCell><Badge variant="outline">{it.es_obligatorio === 'true' ? 'Fijo' : 'Opcional'}</Badge></TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-700 hover:bg-red-500/10" onClick={() => handleRemoverIngrediente(it.id_item_ingrediente)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNuevaReceta(false)}>Cancelar</Button>
            <Button onClick={handleCrearReceta} disabled={saving || formReceta.ingredientes.length === 0}>{saving ? 'Guardando...' : 'Crear Receta'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
