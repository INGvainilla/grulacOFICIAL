'use client'

import { useState, useEffect, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { History, ArrowDownToLine, ArrowUpToLine, Search } from 'lucide-react'

// CU09: Consultar Kardex Dinámico (Historial)
export default function KardexPage() {
  const [movimientos, setMovimientos] = useState([])
  const [loading, setLoading] = useState(true)
  const [filterItem, setFilterItem] = useState('')
  const [filterDesde, setFilterDesde] = useState('')
  const [filterHasta, setFilterHasta] = useState('')
  const supabase = createClient()

  useEffect(() => {
    const fetchMovimientos = async () => {
      const { data, error } = await supabase
        .from('movimientos_kardex')
        .select(`
          *,
          catalogo_items (nombre_producto, codigo_sku),
          usuarios (email_corporativo)
        `)
        .order('fecha_hora', { ascending: true })

      if (error) {
        toast.error('Error al cargar movimientos de Kárdex', { description: error.message })
      } else {
        setMovimientos(data)
      }
      setLoading(false)
    }
    fetchMovimientos()
  }, [])

  // Filtrar movimientos por ítem y rango de fechas
  const filteredMovimientos = useMemo(() => {
    let result = movimientos

    if (filterItem.trim()) {
      const q = filterItem.toLowerCase()
      result = result.filter(m =>
        m.catalogo_items?.nombre_producto?.toLowerCase().includes(q) ||
        m.catalogo_items?.codigo_sku?.toLowerCase().includes(q)
      )
    }

    if (filterDesde) {
      const desde = new Date(filterDesde)
      result = result.filter(m => new Date(m.fecha_hora) >= desde)
    }

    if (filterHasta) {
      const hasta = new Date(filterHasta + 'T23:59:59')
      result = result.filter(m => new Date(m.fecha_hora) <= hasta)
    }

    return result
  }, [movimientos, filterItem, filterDesde, filterHasta])

  // Calcular balance acumulado dinámico (suma corrida)
  const movimientosConBalance = useMemo(() => {
    const balancePorItem = {}
    return filteredMovimientos.map(m => {
      const key = m.id_item
      if (!balancePorItem[key]) balancePorItem[key] = 0

      if (m.tipo_operacion === 'IN') balancePorItem[key] += parseFloat(m.cantidad_kilos)
      else if (m.tipo_operacion === 'OUT') balancePorItem[key] -= parseFloat(m.cantidad_kilos)
      // AJUSTE can be positive or negative, treat as +
      else balancePorItem[key] += parseFloat(m.cantidad_kilos)

      return { ...m, balance_acumulado: balancePorItem[key] }
    })
  }, [filteredMovimientos])

  // Mostrar la tabla en orden descendente para la UI (más reciente arriba)
  const displayMovimientos = [...movimientosConBalance].reverse()

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Kárdex Dinámico</h2>
          <p className="text-muted-foreground">Historial inmutable de Entradas, Salidas y Ajustes volumétricos.</p>
        </div>
      </div>

      {/* Filtros (CU09 spec: filtrar por lotes/fechas) */}
      <Card className="bg-zinc-900/50 border-border/50">
        <CardContent className="py-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1">
              <Label className="text-xs text-zinc-400">Buscar Ítem / SKU</Label>
              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
                <Input
                  placeholder="Ej: Cheddar, INS-CUAJO..."
                  value={filterItem}
                  onChange={(e) => setFilterItem(e.target.value)}
                  className="pl-9 bg-background/50"
                />
              </div>
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-zinc-400">Desde</Label>
              <Input type="date" value={filterDesde} onChange={(e) => setFilterDesde(e.target.value)} className="bg-background/50" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-zinc-400">Hasta</Label>
              <Input type="date" value={filterHasta} onChange={(e) => setFilterHasta(e.target.value)} className="bg-background/50" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-zinc-900 border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="w-5 h-5 text-zinc-400" />
            Libro de Operaciones Diarias
          </CardTitle>
          <CardDescription>Módulo de sólo lectura. El balance se calcula dinámicamente por ítem.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border border-border/50">
            <Table>
              <TableHeader className="bg-zinc-950/50">
                <TableRow>
                  <TableHead>Fecha Operación</TableHead>
                  <TableHead>Ítem / SKU</TableHead>
                  <TableHead>Flujo</TableHead>
                  <TableHead className="text-right">Volumen</TableHead>
                  <TableHead className="text-right">Balance Acumulado</TableHead>
                  <TableHead>Concepto</TableHead>
                  <TableHead>Responsable</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow><TableCell colSpan={7} className="text-center py-4">Interrogando BD Central...</TableCell></TableRow>
                ) : displayMovimientos.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      {movimientos.length === 0
                        ? 'No existen transacciones trazables en la fábrica.'
                        : 'No se encontraron movimientos con los filtros aplicados.'
                      }
                    </TableCell>
                  </TableRow>
                ) : displayMovimientos.map((mov) => (
                  <TableRow key={mov.id_movimiento}>
                    <TableCell className="font-mono text-xs text-zinc-400">
                      {new Date(mov.fecha_hora).toLocaleString('es-BO')}
                    </TableCell>
                    <TableCell className="font-semibold">
                      <div>{mov.catalogo_items ? mov.catalogo_items.nombre_producto : `Ítem #${mov.id_item}`}</div>
                      <div className="text-xs text-zinc-500">{mov.catalogo_items?.codigo_sku}</div>
                    </TableCell>
                    <TableCell>
                      {mov.tipo_operacion === 'IN' && (
                        <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/50">
                          <ArrowDownToLine className="w-3 h-3 mr-1"/> INGRESO
                        </Badge>
                      )}
                      {mov.tipo_operacion === 'OUT' && (
                        <Badge variant="destructive" className="bg-red-500/20 text-red-500 border-red-500/50">
                          <ArrowUpToLine className="w-3 h-3 mr-1"/> EGRESO
                        </Badge>
                      )}
                      {mov.tipo_operacion === 'AJUSTE' && (
                        <Badge variant="outline" className="text-yellow-500 border-yellow-500/50">AJUSTE</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right font-mono font-bold">
                      <span className={mov.tipo_operacion === 'OUT' ? 'text-red-400' : 'text-emerald-400'}>
                        {mov.tipo_operacion === 'OUT' ? '-' : '+'}{mov.cantidad_kilos}
                      </span>
                    </TableCell>
                    <TableCell className="text-right font-mono font-bold text-white">
                      {mov.balance_acumulado.toFixed(2)}
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm max-w-[180px] truncate" title={mov.concepto_operacion}>
                      {mov.concepto_operacion || '—'}
                    </TableCell>
                    <TableCell className="text-xs text-zinc-500">
                      {mov.usuarios ? mov.usuarios.email_corporativo : `U#${mov.id_usuario}`}
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
