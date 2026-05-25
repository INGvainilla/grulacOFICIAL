'use client'

import { useState, useEffect } from 'react'
import { obtenerOrdenesEnProceso } from '@/lib/controllers/CTR_Produccion'
import { registrarParametros } from '@/lib/controllers/CTR_Proceso'
import { toast } from 'sonner'
import { Activity, Thermometer, Droplets, Save, Clock, Scale } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

export default function ParametrosPage() {
  const [ordenes, setOrdenes] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    idOrden: '',
    temperatura: '',
    ph: '',
    brix: '',
    presion: '',
    etapa: 'General'
  })
  const [completitud, setCompletitud] = useState(null)
  const currentTime = new Date().toLocaleTimeString('es-BO')

  useEffect(() => {
    async function loadOrdenes() {
      const data = await obtenerOrdenesEnProceso()
      setOrdenes(data || [])
    }
    loadOrdenes()
  }, [])

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)

    const parametrosJSON = {
      temperatura: parseFloat(formData.temperatura) || null,
      ph: parseFloat(formData.ph) || null,
      brix: parseFloat(formData.brix) || null,
      presion: parseFloat(formData.presion) || null,
      etapa: formData.etapa
    }

    const res = await registrarParametros(formData.idOrden, parametrosJSON)

    setIsLoading(false)

    if (res.success) {
      toast.success(res.message)
      if (res.advertencias && res.advertencias.length > 0) {
        res.advertencias.forEach(adv => toast.warning(adv))
      }
      setCompletitud(res.completitud)
      setFormData(prev => ({ ...prev, temperatura: '', ph: '', brix: '', presion: '' }))
    } else {
      toast.error(res.error || 'Error al guardar parámetros')
    }
  }

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Registrar Parámetros Físicos</h2>
          <p className="text-muted-foreground">Guarda variables térmicas y bioquímicas de las órdenes en proceso.</p>
        </div>
      </div>

      <Card className="bg-zinc-900 border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-indigo-400" />
            Toma de Parámetros
          </CardTitle>
          <CardDescription>
            Documente los valores capturados por los sensores en la etapa actual.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="idOrden">Orden de Producción Activa</Label>
              <Select 
                value={formData.idOrden} 
                onValueChange={(val) => setFormData({ ...formData, idOrden: val })}
                required
              >
                <SelectTrigger id="idOrden">
                  <SelectValue placeholder="Seleccione una orden en proceso..." />
                </SelectTrigger>
                <SelectContent>
                  {ordenes.map(o => (
                    <SelectItem key={o.id_orden} value={o.id_orden.toString()}>
                      Orden #{o.id_orden} - {o.recetas_bom?.nombre_receta} ({o.litros_invertidos}L)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="etapa">Etapa del Proceso</Label>
                <Select 
                  value={formData.etapa} 
                  onValueChange={(val) => setFormData({ ...formData, etapa: val })}
                >
                  <SelectTrigger id="etapa">
                    <SelectValue placeholder="Etapa..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="General">General</SelectItem>
                    <SelectItem value="Pasteurizacion">Pasteurización</SelectItem>
                    <SelectItem value="Coagulacion">Coagulación</SelectItem>
                    <SelectItem value="Corte_Cuajada">Corte de Cuajada</SelectItem>
                    <SelectItem value="Prensado">Prensado</SelectItem>
                    <SelectItem value="Salado">Salado</SelectItem>
                    <SelectItem value="Maduracion">Maduración</SelectItem>
                    <SelectItem value="Hilado">Hilado (Mozzarella)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-1">
                  <Clock className="h-4 w-4 text-zinc-400" /> Hora de Registro
                </Label>
                <Input
                  type="text"
                  readOnly
                  value={currentTime}
                  className="bg-zinc-950/50 text-zinc-500 font-mono"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="temperatura" className="flex items-center gap-1">
                  <Thermometer className="h-4 w-4 text-orange-500" /> Temperatura (°C)
                </Label>
                <Input
                  type="number"
                  id="temperatura"
                  name="temperatura"
                  step="0.1"
                  value={formData.temperatura}
                  onChange={handleChange}
                  placeholder="Ej: 38.5"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="ph" className="flex items-center gap-1">
                  <Droplets className="h-4 w-4 text-blue-500" /> Potencial de Hidrógeno (pH)
                </Label>
                <Input
                  type="number"
                  id="ph"
                  name="ph"
                  step="0.01"
                  min="0"
                  max="14"
                  value={formData.ph}
                  onChange={handleChange}
                  placeholder="Ej: 6.60"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="brix" className="flex items-center gap-1">
                  <Scale className="h-4 w-4 text-amber-500" /> Grados Brix (°Bx)
                </Label>
                <Input
                  type="number"
                  id="brix"
                  name="brix"
                  step="0.1"
                  value={formData.brix}
                  onChange={handleChange}
                  placeholder="Ej: 12.0"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="presion" className="flex items-center gap-1">
                  <Activity className="h-4 w-4 text-purple-500" /> Presión (psi/bar)
                </Label>
                <Input
                  type="number"
                  id="presion"
                  name="presion"
                  step="0.1"
                  value={formData.presion}
                  onChange={handleChange}
                  placeholder="Ej: 1.5"
                />
              </div>
            </div>

            {completitud && (
              <div className="p-4 rounded-lg bg-zinc-950 border border-zinc-800">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-medium text-zinc-300">Completitud del Registro</h4>
                  <span className="text-sm font-bold text-indigo-400">{completitud.porcentaje}%</span>
                </div>
                <div className="w-full bg-zinc-800 rounded-full h-2">
                  <div
                    className="bg-indigo-600 h-2 rounded-full transition-all"
                    style={{ width: `${completitud.porcentaje}%` }}
                  />
                </div>
                <p className="mt-1 text-xs text-zinc-500">
                  {completitud.camposLlenos}/{completitud.totalCampos} campos completados • {completitud.registros} registro(s) guardados
                </p>
              </div>
            )}

            <div className="flex items-center justify-between pt-4 border-t border-border/50">
              <p className="text-xs text-zinc-500">
                *Los datos se anexarán a las observaciones cronológicamente.
              </p>
              <Button
                type="submit"
                disabled={isLoading || !formData.idOrden}
                className="bg-indigo-600 hover:bg-indigo-700 gap-2"
              >
                <Save className="h-4 w-4" />
                {isLoading ? 'Guardando...' : 'Guardar Parcial'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
