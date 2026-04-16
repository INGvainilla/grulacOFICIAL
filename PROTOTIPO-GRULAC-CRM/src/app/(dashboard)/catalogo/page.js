'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { PackagePlus, PackageSearch } from 'lucide-react'

// CU08: Registrar Nuevo Producto/Insumo en Catálogo
export default function CatalogoPage() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const fetchItems = async () => {
      const { data, error } = await supabase.from('catalogo_items').select('*').order('codigo_sku')
      if (error) toast.error('Error al cargar catálogo')
      else setItems(data)
      setLoading(false)
    }
    fetchItems()
  }, [])

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Catálogo Maestro (WMS)</h2>
          <p className="text-muted-foreground">Listado general de insumos, materia prima y productos lácteos terminados.</p>
        </div>
        <Button className="gap-2 bg-emerald-600 hover:bg-emerald-700">
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
                  <TableHead>SKU Corporal</TableHead>
                  <TableHead>Nombre del Ítem</TableHead>
                  <TableHead>Naturaleza (Tipo)</TableHead>
                  <TableHead>Unidad Base</TableHead>
                  <TableHead className="text-right">Stock Mínimo Alerta</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow><TableCell colSpan={5} className="text-center py-4">Sincronizando de Supabase...</TableCell></TableRow>
                ) : items.length === 0 ? (
                  <TableRow><TableCell colSpan={5} className="text-center py-4">No hay ítems registrados.</TableCell></TableRow>
                ) : items.map((item) => (
                  <TableRow key={item.id_item}>
                    <TableCell className="font-mono text-zinc-400 font-semibold">{item.codigo_sku}</TableCell>
                    <TableCell className="font-semibold text-white">{item.nombre_producto}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="bg-blue-900/20 text-blue-400 border-blue-900/50">
                        {item.tipo_item}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{item.unidad_medida}</TableCell>
                    <TableCell className="text-right font-mono text-red-400">
                      {item.stock_minimo} {item.unidad_medida === 'Litros'? 'Lt' : 'Kg'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
