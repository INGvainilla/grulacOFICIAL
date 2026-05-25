'use client'

import { useState, useEffect } from 'react'
import { codificarLote, obtenerOrdenesEnProceso } from '@/lib/controllers/CTR_Produccion'
import { toast } from 'sonner'
import { PackageCheck, Scale, Hash } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

export default function CierreLotePage() {
  const [ordenes, setOrdenes] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    idOrden: '',
    pesoBruto: '',
    unidad: 'KG',
    moldes: ''
  })
  const [rendimientoSimulado, setRendimientoSimulado] = useState(null)

  useEffect(() => {
    loadOrdenes()
  }, [])

  async function loadOrdenes() {
    const data = await obtenerOrdenesEnProceso()
    setOrdenes(data || [])
  }

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  useEffect(() => {
    if (formData.idOrden && formData.pesoBruto) {
      const orden = ordenes.find(o => o.id_orden === parseInt(formData.idOrden))
      if (orden && orden.litros_invertidos > 0) {
        const pct = (parseFloat(formData.pesoBruto) / parseFloat(orden.litros_invertidos)) * 100
        setRendimientoSimulado(pct)
      }
    } else {
      setRendimientoSimulado(null)
    }
  }, [formData, ordenes])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)

    const res = await codificarLote(formData.idOrden, formData.pesoBruto, formData.moldes)

    setIsLoading(false)

    if (res.success) {
      toast.success(res.message)
      setFormData({ idOrden: '', pesoBruto: '', unidad: 'KG', moldes: '' })
      loadOrdenes()
    } else {
      toast.error(res.error || 'Error al cerrar lote')
    }
  }

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Codificar Lote y Cierre</h2>
          <p className="text-muted-foreground">Finaliza la orden ingresando la producción lograda y genera el Lote físico.</p>
        </div>
      </div>

      <Card className="bg-zinc-900 border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PackageCheck className="h-5 w-5 text-indigo-400" />
            Cierre de Producción
          </CardTitle>
          <CardDescription>
            El lote físico entrará a estado (Pendiente QA) hasta ser liberado.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="idOrden">Seleccionar Orden a Cerrar</Label>
              <Select 
                value={formData.idOrden} 
                onValueChange={(val) => setFormData({ ...formData, idOrden: val })}
                required
              >
                <SelectTrigger id="idOrden">
                  <SelectValue placeholder="Seleccione una orden..." />
                </SelectTrigger>
                <SelectContent>
                  {ordenes.map(o => (
                    <SelectItem key={o.id_orden} value={o.id_orden.toString()}>
                      Orden #{o.id_orden} - Leche Procesada: {o.litros_invertidos}L
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="pesoBruto" className="flex items-center gap-1">
                  <Scale className="h-4 w-4 text-emerald-500" /> Peso Neto Obtenido
                </Label>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    id="pesoBruto"
                    name="pesoBruto"
                    step="0.01"
                    min="0.1"
                    required
                    value={formData.pesoBruto}
                    onChange={handleChange}
                    placeholder="Ej: 52.5"
                    className="flex-1"
                  />
                  <Select 
                    value={formData.unidad} 
                    onValueChange={(val) => setFormData({ ...formData, unidad: val })}
                  >
                    <SelectTrigger className="w-[100px]">
                      <SelectValue placeholder="Unidad" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="KG">KG</SelectItem>
                      <SelectItem value="LITROS">LITROS</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="moldes" className="flex items-center gap-1">
                  <Hash className="h-4 w-4 text-zinc-400" /> Moldes / Unidades Finales
                </Label>
                <Input
                  type="number"
                  id="moldes"
                  name="moldes"
                  min="1"
                  value={formData.moldes}
                  onChange={handleChange}
                  placeholder="Ej: 20"
                />
              </div>
            </div>

            {rendimientoSimulado !== null && (
              <div className={`p-4 rounded-lg border ${rendimientoSimulado > 10 ? 'bg-emerald-950/30 border-emerald-900/50' : 'bg-yellow-950/30 border-yellow-900/50'}`}>
                <h4 className="text-sm font-medium text-zinc-300 mb-1">Rendimiento Transformativo</h4>
                <div className="flex items-end gap-2">
                  <span className={`text-3xl font-bold ${rendimientoSimulado > 10 ? 'text-emerald-400' : 'text-yellow-400'}`}>
                    {rendimientoSimulado.toFixed(2)}%
                  </span>
                  <span className="text-sm text-zinc-500 mb-1">
                    {rendimientoSimulado > 10 ? '(Óptimo esperado)' : '(Por debajo del promedio)'}
                  </span>
                </div>
              </div>
            )}

            <div className="flex items-center justify-end pt-4 border-t border-border/50">
              <Button
                type="submit"
                disabled={isLoading || !formData.idOrden || !formData.pesoBruto}
                className="bg-indigo-600 hover:bg-indigo-700 gap-2"
              >
                <PackageCheck className="h-4 w-4" />
                {isLoading ? 'Cerrando...' : 'Finalizar y Codificar Lote'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
