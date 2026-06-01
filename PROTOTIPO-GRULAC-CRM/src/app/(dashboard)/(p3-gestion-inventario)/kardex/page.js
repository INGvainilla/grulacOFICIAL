'use client'

import { useState, useEffect, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { History, ArrowDownToLine, ArrowUpToLine, Search, Printer } from 'lucide-react'

// CU09: Consultar Kardex Dinámico (Historial)
export default function KardexPage() {
  const [movimientos, setMovimientos] = useState([])
  const [loading, setLoading] = useState(true)
  const [filterItem, setFilterItem] = useState('')
  const [filterDesde, setFilterDesde] = useState('')
  const [filterHasta, setFilterHasta] = useState('')
  const [showPrintKardex, setShowPrintKardex] = useState(false)
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

  const { totalEntradas, totalSalidas, totalAjustes } = useMemo(() => {
    let entradas = 0
    let salidas = 0
    let ajustes = 0
    displayMovimientos.forEach(m => {
      const cant = parseFloat(m.cantidad_kilos || 0)
      if (m.tipo_operacion === 'IN') entradas += cant
      else if (m.tipo_operacion === 'OUT') salidas += cant
      else if (m.tipo_operacion === 'AJUSTE')  ajustes += cant
    })
    return { totalEntradas: entradas, totalSalidas: salidas, totalAjustes: ajustes }
  }, [displayMovimientos])

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center print:hidden">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Kárdex Dinámico</h2>
          <p className="text-muted-foreground">Historial inmutable de Entradas, Salidas y Ajustes volumétricos.</p>
        </div>
        <Button onClick={() => setShowPrintKardex(true)} className="bg-blue-600 hover:bg-blue-700 gap-2">
          <Printer className="w-4 h-4" /> Generar Reporte Kárdex
        </Button>
      </div>

      {/* Filtros (CU09 spec: filtrar por lotes/fechas) */}
      <Card className="bg-zinc-900/50 border-border/50 print:hidden">
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

      <Card className="bg-zinc-900 border-border/50 print:hidden">
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

      {/* =====================================================
          MODAL DE IMPRESIÓN: REPORTE DE KÁRDEX DINÁMICO (CU09)
          ===================================================== */}
      {showPrintKardex && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center print:bg-white print:static print:z-auto">
          {/* Controles del modal — ocultos al imprimir */}
          <div className="absolute top-4 right-4 flex gap-2 print:hidden">
            <Button onClick={() => window.print()} className="bg-blue-600 hover:bg-blue-700 gap-2">
              <Printer className="w-4 h-4" /> Imprimir Reporte / PDF
            </Button>
            <Button variant="outline" onClick={() => setShowPrintKardex(false)}>
              Cerrar
            </Button>
          </div>

          {/* Documento Imprimible: Reporte de Kárdex */}
          <div className="bg-white text-black w-[800px] max-h-[90vh] overflow-y-auto p-8 rounded-lg shadow-2xl print:shadow-none print:w-full print:max-h-none print:rounded-none print:p-10">
            {/* Cabecera Oficial */}
            <div className="text-center border-b-2 border-black pb-4 mb-6">
              <h1 className="text-2xl font-bold tracking-wide" style={{ fontFamily: 'Georgia, serif' }}>
                GRULAC S.R.L.
              </h1>
              <p className="text-sm text-gray-600 mt-1">Departamento de Control de Inventarios e Insumos</p>
              <p className="text-xs text-gray-500">Historial de Existencias y Libro Diario de Operaciones de Kárdex</p>
              <div className="mt-3 inline-block px-4 py-1 border-2 border-black">
                <span className="text-lg font-bold tracking-widest text-blue-900" style={{ fontFamily: 'Courier New, monospace' }}>
                  REPORTE DE MOVIMIENTOS DE KÁRDEX
                </span>
              </div>
            </div>

            {/* Parámetros de Filtro del Reporte */}
            <div className="grid grid-cols-2 gap-4 border border-gray-200 rounded p-4 text-xs mb-6">
              <div>
                <span className="font-bold">Filtro de Ítem:</span>{' '}
                {filterItem || 'Todos los ítems'}
              </div>
              <div>
                <span className="font-bold">Fecha de Emisión:</span>{' '}
                {new Date().toLocaleString('es-BO')}
              </div>
              <div>
                <span className="font-bold">Rango de Fechas:</span>{' '}
                {filterDesde ? `Desde ${new Date(filterDesde).toLocaleDateString('es-BO')}` : 'Inicio'} — {filterHasta ? `Hasta ${new Date(filterHasta).toLocaleDateString('es-BO')}` : 'Fin'}
              </div>
              <div>
                <span className="font-bold">Operaciones Emitidas:</span>{' '}
                {displayMovimientos.length}
              </div>
            </div>

            {/* Resumen Numérico */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="p-3 border border-gray-300 rounded text-center">
                <span className="text-xs text-gray-500 block uppercase">Total Ingresos (IN)</span>
                <span className="text-md font-bold text-green-700 font-mono">+{totalEntradas.toFixed(2)} Units/Kgs</span>
              </div>
              <div className="p-3 border border-gray-300 rounded text-center">
                <span className="text-xs text-gray-500 block uppercase">Total Egresos (OUT)</span>
                <span className="text-md font-bold text-red-600 font-mono">-{totalSalidas.toFixed(2)} Units/Kgs</span>
              </div>
              <div className="p-3 border border-gray-300 rounded text-center bg-gray-50">
                <span className="text-xs text-gray-500 block uppercase">Balance Neto Filtro</span>
                <span className={`text-md font-bold font-mono ${(totalEntradas - totalSalidas) >= 0 ? 'text-green-700' : 'text-red-600'}`}>
                  {(totalEntradas - totalSalidas + totalAjustes).toFixed(2)} Units/Kgs
                </span>
              </div>
            </div>

            {/* Tabla de Movimientos */}
            <table className="w-full border-collapse border border-gray-400 text-xs mb-6">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-400 px-2 py-1.5 text-left">Fecha/Hora</th>
                  <th className="border border-gray-400 px-2 py-1.5 text-left">Ítem / SKU</th>
                  <th className="border border-gray-400 px-2 py-1.5 text-center">Operación</th>
                  <th className="border border-gray-400 px-2 py-1.5 text-right">Volumen</th>
                  <th className="border border-gray-400 px-2 py-1.5 text-right">Balance</th>
                  <th className="border border-gray-400 px-2 py-1.5 text-left">Concepto</th>
                </tr>
              </thead>
              <tbody>
                {displayMovimientos.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="border border-gray-400 px-2 py-4 text-center text-gray-500">
                      No hay transacciones registradas para este filtro.
                    </td>
                  </tr>
                ) : displayMovimientos.map((mov) => (
                  <tr key={mov.id_movimiento} className="hover:bg-gray-50 text-[11px]">
                    <td className="border border-gray-400 px-2 py-1 font-mono text-[10px]">
                      {new Date(mov.fecha_hora).toLocaleString('es-BO')}
                    </td>
                    <td className="border border-gray-400 px-2 py-1">
                      <div className="font-semibold">{mov.catalogo_items?.nombre_producto}</div>
                      <div className="text-[10px] text-gray-500 font-mono">{mov.catalogo_items?.codigo_sku}</div>
                    </td>
                    <td className="border border-gray-400 px-2 py-1 text-center font-bold">
                      {mov.tipo_operacion}
                    </td>
                    <td className="border border-gray-400 px-2 py-1 text-right font-mono font-bold">
                      <span className={mov.tipo_operacion === 'OUT' ? 'text-red-600' : 'text-green-700'}>
                        {mov.tipo_operacion === 'OUT' ? '-' : '+'}{mov.cantidad_kilos}
                      </span>
                    </td>
                    <td className="border border-gray-400 px-2 py-1 text-right font-mono">
                      {mov.balance_acumulado.toFixed(2)}
                    </td>
                    <td className="border border-gray-400 px-2 py-1 text-[10px] text-gray-600 max-w-[150px] truncate">
                      {mov.concepto_operacion || '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Firmas */}
            <div className="grid grid-cols-2 gap-8 mt-12 pt-4">
              <div className="text-center">
                <div className="border-t border-black pt-2 mx-6">
                  <p className="text-sm font-semibold">Jefe de Almacén e Inventarios</p>
                  <p className="text-xs text-gray-500">Firma Autorizada</p>
                </div>
              </div>
              <div className="text-center">
                <div className="border-t border-black pt-2 mx-6">
                  <p className="text-sm font-semibold">Director General / Operaciones</p>
                  <p className="text-xs text-gray-500">Visto Bueno</p>
                </div>
              </div>
            </div>

            {/* Pie de página */}
            <div className="mt-8 pt-3 border-t border-gray-300 text-center text-xs text-gray-400">
              <p>Reporte oficial de auditoría de existencias - Generado digitalmente por el ERP de GRULAC S.R.L.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
