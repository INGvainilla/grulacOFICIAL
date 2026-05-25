'use client'

import { useState, useEffect } from 'react'
import { registrarFichaQA, obtenerLotesPendientes } from '@/lib/controllers/CTR_Calidad'
import { toast } from 'sonner'
import { Microscope, CheckCircle2, XCircle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'

export default function FichaCalidadPage() {
  const [lotes, setLotes] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    idLote: '',
    phFinal: '',
    salinidad: '',
    brix: '',
    humedad: '',
    temperaturaEvaluacion: '',
    textura: '',
    aspectoVisual: '',
    refContramuestra: '',
    observaciones: ''
  })
  const [dictamenPrevio, setDictamenPrevio] = useState(null)

  useEffect(() => {
    loadLotes()
  }, [])

  async function loadLotes() {
    const data = await obtenerLotesPendientes()
    setLotes(data || [])
  }

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  // Dictamen preliminar visual (semaforo)
  useEffect(() => {
    if (formData.phFinal) {
      const ph = parseFloat(formData.phFinal)
      if (ph >= 4.0 && ph <= 7.5) {
        setDictamenPrevio('Aprobado')
      } else {
        setDictamenPrevio('Rechazado')
      }
    } else {
      setDictamenPrevio(null)
    }
  }, [formData.phFinal])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)

    const res = await registrarFichaQA(formData.idLote, formData)

    setIsLoading(false)

    if (res.success) {
      toast.success(res.message)
      setFormData({ idLote: '', phFinal: '', salinidad: '', brix: '', humedad: '', temperaturaEvaluacion: '', textura: '', aspectoVisual: '', refContramuestra: '', observaciones: '' })
      loadLotes()
    } else {
      toast.error(res.error || 'Error al registrar la ficha')
    }
  }

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Registrar Ficha de Calidad</h2>
          <p className="text-muted-foreground">Analiza lotes terminados y emite dictamen de laboratorio (QA).</p>
        </div>
      </div>

      <Card className="bg-zinc-900 border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Microscope className="h-5 w-5 text-indigo-400" />
            Inspección de Laboratorio
          </CardTitle>
          <CardDescription>
            Tome la contramuestra del lote seleccionado y complete las variables biométricas.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="idLote">Seleccionar Lote Pendiente de QA</Label>
              <Select 
                value={formData.idLote} 
                onValueChange={(val) => setFormData({ ...formData, idLote: val })}
                required
              >
                <SelectTrigger id="idLote">
                  <SelectValue placeholder="Seleccione un lote..." />
                </SelectTrigger>
                <SelectContent>
                  {lotes.map(l => (
                    <SelectItem key={l.id_lote} value={l.id_lote.toString()}>
                      {l.codigo_lote} - {l.catalogo_items?.nombre_producto} ({l.cantidad_producida} {l.unidad_medida})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="phFinal">pH Final</Label>
                <Input
                  type="number"
                  id="phFinal"
                  name="phFinal"
                  step="0.01"
                  min="0"
                  max="14"
                  required
                  value={formData.phFinal}
                  onChange={handleChange}
                  placeholder="Ej: 5.2"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="brix">Grados Brix</Label>
                <Input
                  type="number"
                  id="brix"
                  name="brix"
                  step="0.1"
                  value={formData.brix}
                  onChange={handleChange}
                  placeholder="Ej: 15.0"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="humedad">Humedad %</Label>
                <Input
                  type="number"
                  id="humedad"
                  name="humedad"
                  step="0.1"
                  value={formData.humedad}
                  onChange={handleChange}
                  placeholder="Ej: 40.5"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="salinidad">Salinidad %</Label>
                <Input
                  type="number"
                  id="salinidad"
                  name="salinidad"
                  step="0.1"
                  value={formData.salinidad}
                  onChange={handleChange}
                  placeholder="Ej: 2.5"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="textura">Textura (Escala 1-10)</Label>
                <Input
                  type="number"
                  id="textura"
                  name="textura"
                  min="1"
                  max="10"
                  value={formData.textura}
                  onChange={handleChange}
                  placeholder="Ej: 7"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="aspectoVisual">Aspecto Visual</Label>
                <Select 
                  value={formData.aspectoVisual} 
                  onValueChange={(val) => setFormData({ ...formData, aspectoVisual: val })}
                >
                  <SelectTrigger id="aspectoVisual">
                    <SelectValue placeholder="Seleccione..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Uniforme">Uniforme</SelectItem>
                    <SelectItem value="Ojos regulares">Ojos regulares</SelectItem>
                    <SelectItem value="Grietas superficiales">Grietas superficiales</SelectItem>
                    <SelectItem value="Deformaciones">Deformaciones</SelectItem>
                    <SelectItem value="Manchas">Manchas / Mohos</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="refContramuestra">Ref. Contramuestra</Label>
              <Input
                type="text"
                id="refContramuestra"
                name="refContramuestra"
                value={formData.refContramuestra}
                onChange={handleChange}
                placeholder="Ej: CM-2026-001"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="observaciones">Observaciones Técnicas / Microbiológicas</Label>
              <Textarea
                id="observaciones"
                name="observaciones"
                rows={3}
                value={formData.observaciones}
                onChange={handleChange}
                className="resize-none"
              />
            </div>

            {/* Panel Semáforo de Dictamen */}
            <div className={`p-4 rounded-lg flex items-center justify-between border ${!dictamenPrevio ? 'bg-zinc-950/50 border-zinc-800' : dictamenPrevio === 'Aprobado' ? 'bg-emerald-950/30 border-emerald-900/50' : 'bg-red-950/30 border-red-900/50'}`}>
              <div>
                <h4 className="text-sm font-medium text-zinc-300">Dictamen Preliminar</h4>
                <p className="text-xs text-zinc-500">Calculado en base a los parámetros ingresados</p>
              </div>
              {dictamenPrevio === 'Aprobado' && (
                <div className="flex items-center gap-2 text-emerald-400 font-bold">
                  <CheckCircle2 className="h-6 w-6" /> APROBADO
                </div>
              )}
              {dictamenPrevio === 'Rechazado' && (
                <div className="flex items-center gap-2 text-red-400 font-bold">
                  <XCircle className="h-6 w-6" /> NO CONFORME
                </div>
              )}
              {!dictamenPrevio && (
                <div className="text-zinc-500 text-sm">Esperando datos...</div>
              )}
            </div>

            <div className="flex items-center justify-end pt-4 border-t border-border/50">
              <Button
                type="submit"
                disabled={isLoading || !formData.idLote || !formData.phFinal}
                className="bg-indigo-600 hover:bg-indigo-700 gap-2"
              >
                <Microscope className="h-4 w-4" />
                {isLoading ? 'Registrando...' : 'Sellar Ficha de Laboratorio'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
