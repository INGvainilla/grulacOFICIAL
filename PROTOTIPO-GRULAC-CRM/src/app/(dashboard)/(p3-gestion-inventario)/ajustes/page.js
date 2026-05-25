'use client'

import { useState, useEffect } from 'react'
import { registrarAjuste, obtenerItemsCatalogo } from '@/lib/controllers/CTR_Inventario'
import { toast } from 'sonner'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { ArrowRightLeft } from 'lucide-react'

export default function AjustesPage() {
  const [items, setItems] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    idItem: '',
    tipoAjuste: 'IN',
    cantidad: '',
    motivo: '',
    observacion: ''
  })

  useEffect(() => {
    async function loadItems() {
      const data = await obtenerItemsCatalogo()
      setItems(data)
    }
    loadItems()
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)

    const res = await registrarAjuste(
      formData.idItem,
      formData.tipoAjuste,
      formData.cantidad,
      formData.motivo,
      formData.observacion
    )

    setIsLoading(false)

    if (res.success) {
      toast.success(res.message)
      setFormData({ ...formData, cantidad: '', motivo: '', observacion: '' })
      const data = await obtenerItemsCatalogo()
      setItems(data)
    } else {
      toast.error(res.error || 'Error al registrar el ajuste')
    }
  }

  const selectedItem = items.find(i => i.id_item === parseInt(formData.idItem))

  return (
    <div className="space-y-6 animate-fade-in max-w-3xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Ajustes de Inventario</h2>
          <p className="text-muted-foreground">Registra mermas o ajustes manuales al Kardex.</p>
        </div>
      </div>

      <Card className="bg-zinc-900 border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ArrowRightLeft className="h-5 w-5 text-indigo-400" />
            Nuevo Ajuste
          </CardTitle>
          <CardDescription>
            Complete los datos para generar un movimiento de entrada o salida manual.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="idItem">Ítem del Catálogo</Label>
              <Select 
                value={formData.idItem} 
                onValueChange={(val) => setFormData({ ...formData, idItem: val })}
                required
              >
                <SelectTrigger id="idItem">
                  <SelectValue placeholder="Seleccione un ítem..." />
                </SelectTrigger>
                <SelectContent>
                  {items.map(item => (
                    <SelectItem key={item.id_item} value={item.id_item.toString()}>
                      {item.nombre_producto} (Stock: {item.stock_actual} {item.unidad_medida})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="tipoAjuste">Tipo de Ajuste</Label>
                <Select 
                  value={formData.tipoAjuste} 
                  onValueChange={(val) => setFormData({ ...formData, tipoAjuste: val })}
                >
                  <SelectTrigger id="tipoAjuste">
                    <SelectValue placeholder="Tipo..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="IN">Ingreso (Positivo)</SelectItem>
                    <SelectItem value="OUT">Egreso (Merma)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="cantidad">Cantidad ({selectedItem ? selectedItem.unidad_medida : 'uds'})</Label>
                <Input
                  type="number"
                  id="cantidad"
                  step="0.01"
                  min="0.01"
                  required
                  value={formData.cantidad}
                  onChange={(e) => setFormData({ ...formData, cantidad: e.target.value })}
                  placeholder="0.00"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="motivo">Motivo / Justificación</Label>
              <Input
                type="text"
                id="motivo"
                required
                value={formData.motivo}
                onChange={(e) => setFormData({ ...formData, motivo: e.target.value })}
                placeholder="Ej: Merma técnica en almacén, Descuadre..."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="observacion">Observación Técnica Adicional</Label>
              <Textarea
                id="observacion"
                rows={3}
                value={formData.observacion}
                onChange={(e) => setFormData({ ...formData, observacion: e.target.value })}
                placeholder="Escribe observaciones adicionales para respaldar este ajuste..."
                className="resize-none"
              />
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-border/50">
              <Button type="button" variant="outline" onClick={() => setFormData({ ...formData, cantidad: '', motivo: '', observacion: '' })}>
                Limpiar
              </Button>
              <Button type="submit" disabled={isLoading} className="bg-indigo-600 hover:bg-indigo-700">
                {isLoading ? 'Registrando...' : 'Confirmar Ajuste'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
