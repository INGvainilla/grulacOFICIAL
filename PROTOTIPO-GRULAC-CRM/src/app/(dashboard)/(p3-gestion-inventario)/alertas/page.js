'use client'

import { useState, useEffect } from 'react'
import { configurarAlerta, obtenerItemsCatalogo } from '@/lib/controllers/CTR_Inventario'
import { toast } from 'sonner'
import { Bell, AlertTriangle, CheckCircle, Package } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'

export default function AlertasPage() {
  const [items, setItems] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadItems()
  }, [])

  async function loadItems() {
    setIsLoading(true)
    const data = await obtenerItemsCatalogo()
    setItems(data || [])
    setIsLoading(false)
  }

  const handleUpdateUmbral = async (idItem, nuevoUmbral) => {
    const umbralNum = parseFloat(nuevoUmbral)
    if (isNaN(umbralNum) || umbralNum < 0) {
      toast.error('El umbral debe ser un número positivo')
      return
    }

    const res = await configurarAlerta(idItem, umbralNum)
    if (res.success) {
      toast.success(res.message)
      setItems(prevItems => prevItems.map(item => {
        if (item.id_item === idItem) {
          return { ...item, stock_minimo: umbralNum, estado_alerta: res.estado }
        }
        return item
      }))
    } else {
      toast.error(res.error || 'Error al configurar la alerta')
    }
  }

  const getStatusBadge = (stockActual, stockMinimo) => {
    if (stockActual <= 0) {
      return (
        <Badge variant="destructive" className="bg-red-500/10 text-red-500 hover:bg-red-500/20 border-red-500/20 gap-1">
          <AlertTriangle className="h-3 w-3" />
          Agotado
        </Badge>
      )
    }
    if (stockActual <= stockMinimo) {
      return (
        <Badge variant="outline" className="bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20 border-yellow-500/20 gap-1">
          <Bell className="h-3 w-3" />
          Stock Bajo
        </Badge>
      )
    }
    return (
      <Badge variant="outline" className="bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 border-emerald-500/20 gap-1">
        <CheckCircle className="h-3 w-3" />
        Suficiente
      </Badge>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Configuración de Alertas</h2>
          <p className="text-muted-foreground">Gestiona los umbrales de stock mínimo para generar alertas automáticas en el inventario.</p>
        </div>
        <Button onClick={loadItems} className="bg-indigo-600 hover:bg-indigo-700">
          Actualizar Datos
        </Button>
      </div>

      <Card className="bg-zinc-900 border-border/50">
        <CardHeader>
          <CardTitle>Inventario Actual</CardTitle>
          <CardDescription>Visualiza y ajusta las políticas de reorden de la materia prima e insumos.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border border-border/50 overflow-hidden">
            <Table>
              <TableHeader className="bg-zinc-950/50">
                <TableRow>
                  <TableHead className="w-[300px]">Ítem / Producto</TableHead>
                  <TableHead>Estado Actual</TableHead>
                  <TableHead>Stock Mínimo (Umbral)</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">Cargando inventario...</TableCell>
                  </TableRow>
                ) : items.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">No hay ítems en el catálogo.</TableCell>
                  </TableRow>
                ) : items.map((item) => (
                  <ItemRow 
                    key={item.id_item} 
                    item={item} 
                    onUpdateUmbral={handleUpdateUmbral} 
                    getStatusBadge={getStatusBadge}
                  />
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function ItemRow({ item, onUpdateUmbral, getStatusBadge }) {
  const [umbralValue, setUmbralValue] = useState(item.stock_minimo || 0)
  const [isEditing, setIsEditing] = useState(false)

  const handleSave = () => {
    onUpdateUmbral(item.id_item, umbralValue)
    setIsEditing(false)
  }

  return (
    <TableRow>
      <TableCell>
        <div className="flex items-center">
          <div className="h-10 w-10 flex-shrink-0 flex items-center justify-center rounded-lg bg-zinc-800 border border-zinc-700">
            <Package className="h-5 w-5 text-zinc-400" />
          </div>
          <div className="ml-4">
            <div className="font-semibold text-white">{item.nombre_producto}</div>
            <div className="text-zinc-500 text-xs">{item.tipo_item} • {item.stock_actual} {item.unidad_medida} en stock</div>
          </div>
        </div>
      </TableCell>
      <TableCell>
        {getStatusBadge(item.stock_actual, item.stock_minimo)}
      </TableCell>
      <TableCell className="font-mono text-zinc-300">
        {isEditing ? (
          <div className="flex items-center gap-2">
            <Input
              type="number"
              step="0.01"
              min="0"
              value={umbralValue}
              onChange={(e) => setUmbralValue(e.target.value)}
              className="w-24 h-8 text-sm"
            />
            <span className="text-xs text-zinc-500">{item.unidad_medida}</span>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            {item.stock_minimo} <span className="text-xs text-zinc-500">{item.unidad_medida}</span>
          </div>
        )}
      </TableCell>
      <TableCell className="text-right">
        {isEditing ? (
          <div className="flex items-center justify-end gap-2">
            <Button size="sm" variant="ghost" onClick={() => { setIsEditing(false); setUmbralValue(item.stock_minimo || 0); }}>
              Cancelar
            </Button>
            <Button size="sm" onClick={handleSave} className="bg-indigo-600 hover:bg-indigo-700">
              Guardar
            </Button>
          </div>
        ) : (
          <Button size="sm" variant="ghost" className="text-indigo-400 hover:text-indigo-300 hover:bg-indigo-950/50" onClick={() => setIsEditing(true)}>
            Editar
          </Button>
        )}
      </TableCell>
    </TableRow>
  )
}
