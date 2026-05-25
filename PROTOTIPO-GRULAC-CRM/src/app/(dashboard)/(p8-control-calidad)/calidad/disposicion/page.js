'use client'

import { useState, useEffect } from 'react'
import { enviarDisposicion, obtenerLotesNoConformes } from '@/lib/controllers/CTR_Calidad'
import { toast } from 'sonner'
import { ShieldAlert, AlertOctagon } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'

export default function DisposicionPage() {
  const [lotes, setLotes] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    idLote: '',
    tipoDisposicion: 'Cuarentena',
    justificacion: '',
    instruccionesReproceso: ''
  })

  useEffect(() => {
    loadLotes()
  }, [])

  async function loadLotes() {
    const data = await obtenerLotesNoConformes()
    setLotes(data || [])
  }

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)

    const res = await enviarDisposicion(formData.idLote, formData.tipoDisposicion, formData.justificacion, formData.instruccionesReproceso)

    setIsLoading(false)

    if (res.success) {
      toast.success(res.message)
      setFormData({ idLote: '', tipoDisposicion: 'Cuarentena', justificacion: '', instruccionesReproceso: '' })
      loadLotes() 
    } else {
      toast.error(res.error || 'Error al procesar disposición')
    }
  }

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Disposición de Lotes No Conformes</h2>
          <p className="text-muted-foreground">Envía a cuarentena, rechazo o reproceso aquellos lotes que fallaron en el control de calidad.</p>
        </div>
      </div>

      <Card className="bg-zinc-900 border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-400">
            <ShieldAlert className="h-5 w-5" />
            Acción Restrictiva
          </CardTitle>
          <CardDescription>
            Determine el flujo alterno para el lote observado según el protocolo de bioseguridad.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="idLote">Seleccionar Lote Observado</Label>
                <Select 
                  value={formData.idLote} 
                  onValueChange={(val) => setFormData({ ...formData, idLote: val })}
                  required
                >
                  <SelectTrigger id="idLote">
                    <SelectValue placeholder="Seleccione un lote no conforme..." />
                  </SelectTrigger>
                  <SelectContent>
                    {lotes.map(f => (
                      <SelectItem key={f.id_lote} value={f.id_lote.toString()}>
                        {f.lote_produccion?.codigo_lote} - Dictamen QA: {f.dictamen_qa}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="tipoDisposicion">Tipo de Disposición</Label>
                <Select 
                  value={formData.tipoDisposicion} 
                  onValueChange={(val) => setFormData({ ...formData, tipoDisposicion: val })}
                  required
                >
                  <SelectTrigger id="tipoDisposicion">
                    <SelectValue placeholder="Seleccione..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Cuarentena">Aislar en Cuarentena</SelectItem>
                    <SelectItem value="Reprocesar">Enviar a Reproceso</SelectItem>
                    <SelectItem value="Rechazado">Rechazo Total / Destrucción</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="justificacion">Justificación Técnica e Instrucciones</Label>
              <Textarea
                id="justificacion"
                name="justificacion"
                rows={4}
                required
                value={formData.justificacion}
                onChange={handleChange}
                placeholder="Justifique la decisión e indique las medidas correctivas si corresponde..."
                className="resize-none"
              />
            </div>

            {formData.tipoDisposicion === 'Reprocesar' && (
              <div className="space-y-2 p-4 border border-zinc-800 bg-zinc-950/50 rounded-lg">
                <Label htmlFor="instruccionesReproceso" className="text-zinc-300">
                  Instrucciones de Reproceso (para Jefe de Producción)
                </Label>
                <Textarea
                  id="instruccionesReproceso"
                  name="instruccionesReproceso"
                  rows={3}
                  value={formData.instruccionesReproceso}
                  onChange={handleChange}
                  placeholder="Instrucciones específicas para el reproceso del lote..."
                  className="mt-2 resize-none"
                />
                <p className="mt-2 text-xs text-zinc-500">*Se notificará automáticamente al Jefe de Producción.</p>
              </div>
            )}

            <div className="flex items-center justify-end pt-4 border-t border-border/50">
              <Button
                type="submit"
                disabled={isLoading || !formData.idLote || !formData.justificacion}
                variant="destructive"
                className="gap-2"
              >
                <AlertOctagon className="h-4 w-4" />
                {isLoading ? 'Procesando...' : 'Confirmar Disposición Restrictiva'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
