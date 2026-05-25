'use client'

import { useState, useEffect } from 'react'
import { aperturarOrden, obtenerRecetas } from '@/lib/controllers/CTR_Produccion'
import { toast } from 'sonner'
import { Beaker, FlaskConical, Calculator } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'

export default function AperturaOrdenPage() {
  const [recetas, setRecetas] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    idReceta: '',
    litros: ''
  })
  const [preview, setPreview] = useState(null)

  useEffect(() => {
    async function loadRecetas() {
      const data = await obtenerRecetas()
      setRecetas(data || [])
    }
    loadRecetas()
  }, [])

  useEffect(() => {
    if (formData.idReceta && formData.litros) {
      const recetaSeleccionada = recetas.find(r => r.id_receta === parseInt(formData.idReceta))
      if (recetaSeleccionada) {
        const factor = parseFloat(formData.litros) / parseFloat(recetaSeleccionada.base_litros_leche || 1)
        setPreview({ receta: recetaSeleccionada, factor })
      }
    } else {
      setPreview(null)
    }
  }, [formData, recetas])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)

    const res = await aperturarOrden(formData.idReceta, formData.litros)

    setIsLoading(false)

    if (res.success) {
      toast.success(res.message)
      setFormData({ idReceta: '', litros: '' })
    } else {
      toast.error(res.error || 'Error al aperturar orden')
    }
  }

  return (
    <div className="space-y-6 animate-fade-in max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Aperturar Orden de Producción</h2>
          <p className="text-muted-foreground">Selecciona una receta estandarizada y define el volumen de leche a procesar.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Formulario */}
        <div className="lg:col-span-1">
          <Card className="bg-zinc-900 border-border/50 h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Beaker className="h-5 w-5 text-indigo-400" />
                Nueva Orden
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="idReceta">Receta BOM</Label>
                  <Select 
                    value={formData.idReceta} 
                    onValueChange={(val) => setFormData({ ...formData, idReceta: val })}
                    required
                  >
                    <SelectTrigger id="idReceta">
                      <SelectValue placeholder="Seleccione una receta..." />
                    </SelectTrigger>
                    <SelectContent>
                      {recetas.map(r => (
                        <SelectItem key={r.id_receta} value={r.id_receta.toString()}>
                          {r.nombre_receta} ({r.catalogo_items?.nombre_producto})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="litros">Volumen a procesar (Litros)</Label>
                  <Input
                    type="number"
                    id="litros"
                    step="0.1"
                    min="1"
                    required
                    value={formData.litros}
                    onChange={(e) => setFormData({ ...formData, litros: e.target.value })}
                    placeholder="Ej: 500"
                  />
                </div>

                <div className="pt-4 border-t border-border/50">
                  <Button
                    type="submit"
                    disabled={isLoading || !formData.idReceta || !formData.litros}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 gap-2"
                  >
                    <FlaskConical className="h-4 w-4" />
                    {isLoading ? 'Procesando...' : 'Generar y Deducir Kardex'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Vista previa de proporciones */}
        <div className="lg:col-span-2">
          {preview ? (
            <Card className="bg-zinc-900 border-border/50 h-full">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2 text-indigo-400">
                    <Calculator className="h-5 w-5" />
                    Cálculo de Proporciones
                  </CardTitle>
                  <CardDescription>Simulación de rendimiento para el volumen definido</CardDescription>
                </div>
                <Badge variant="outline" className="bg-blue-500/10 text-blue-400 border-blue-400/20">
                  Factor: {preview.factor.toFixed(2)}x (Base: {preview.receta.base_litros_leche}L)
                </Badge>
              </CardHeader>
              <CardContent className="space-y-4 text-sm text-zinc-400">
                <p>Al confirmar, se deducirán atómicamente los ingredientes calculados del Kardex y la Orden pasará a estado <strong>En Proceso</strong>.</p>
                <div className="p-4 rounded-lg bg-zinc-950/50 border border-zinc-800 font-mono text-xs">
                  <p className="text-zinc-500 mb-2">// El cálculo detallado de insumos se realiza a nivel servidor para evitar manipulaciones.</p>
                  <p className="text-zinc-500 mb-2">// Se verificará el stock disponible antes de la deducción.</p>
                  <p className="text-emerald-400 mt-4">
                    {'>'} Rendimiento Base Esperado: {preview.receta.rendimiento_esperado_pct}%
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="bg-zinc-900/50 border-dashed border-2 border-zinc-800 h-full flex items-center justify-center min-h-[300px]">
              <div className="text-center">
                <Calculator className="mx-auto h-12 w-12 text-zinc-600 mb-2" />
                <h3 className="text-sm font-semibold text-zinc-300">Sin datos de simulación</h3>
                <p className="text-sm text-zinc-500">Selecciona una receta y un volumen.</p>
              </div>
            </Card>
          )}
        </div>
        
      </div>
    </div>
  )
}
