'use client'

import { useState, useEffect, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'
import { History, ArrowDownToLine, ArrowUpToLine, Search, Printer, FilterX } from 'lucide-react'

// CU09: Consultar Kardex Dinámico (Historial)
export default function KardexPage() {
  const [movimientos, setMovimientos] = useState([])
  const [loading, setLoading] = useState(true)
  const [filterItem, setFilterItem] = useState('')
  const [filterDesde, setFilterDesde] = useState('')
  const [filterHasta, setFilterHasta] = useState('')
  const [filterTipo, setFilterTipo] = useState('ALL')
  const [filterUsuario, setFilterUsuario] = useState('ALL')
  const [filterConcepto, setFilterConcepto] = useState('')
  const [filterMinVol, setFilterMinVol] = useState('')
  const [filterMaxVol, setFilterMaxVol] = useState('')
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

  // Obtener lista de responsables únicos de forma dinámica
  const responsables = useMemo(() => {
    const list = []
    const seen = new Set()
    movimientos.forEach(m => {
      const email = m.usuarios?.email_corporativo
      if (email && !seen.has(email)) {
        seen.add(email)
        list.push(email)
      }
    })
    return list.sort()
  }, [movimientos])

  // Filtrar movimientos por todos los criterios avanzados de forma reactiva
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

    if (filterTipo && filterTipo !== 'ALL') {
      result = result.filter(m => m.tipo_operacion === filterTipo)
    }

    if (filterUsuario && filterUsuario !== 'ALL') {
      result = result.filter(m => m.usuarios?.email_corporativo === filterUsuario)
    }

    if (filterConcepto.trim()) {
      const q = filterConcepto.toLowerCase()
      result = result.filter(m => m.concepto_operacion?.toLowerCase().includes(q))
    }

    if (filterMinVol.trim()) {
      const min = parseFloat(filterMinVol)
      if (!isNaN(min)) {
        result = result.filter(m => parseFloat(m.cantidad_kilos) >= min)
      }
    }

    if (filterMaxVol.trim()) {
      const max = parseFloat(filterMaxVol)
      if (!isNaN(max)) {
        result = result.filter(m => parseFloat(m.cantidad_kilos) <= max)
      }
    }

    return result
  }, [movimientos, filterItem, filterDesde, filterHasta, filterTipo, filterUsuario, filterConcepto, filterMinVol, filterMaxVol])

  const handleClearFilters = () => {
    setFilterItem('')
    setFilterDesde('')
    setFilterHasta('')
    setFilterTipo('ALL')
    setFilterUsuario('ALL')
    setFilterConcepto('')
    setFilterMinVol('')
    setFilterMaxVol('')
    toast.success('Filtros restablecidos')
  }

  const handleDownloadHTML = () => {
    const htmlContent = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Reporte de Kardex - GRULAC S.R.L.</title>
  <style>
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      margin: 40px;
      color: #1f2937;
      background: #ffffff;
      line-height: 1.5;
    }
    .header {
      text-align: center;
      border-bottom: 2px solid #111827;
      padding-bottom: 15px;
      margin-bottom: 25px;
    }
    .header h1 {
      font-family: Georgia, serif;
      margin: 0;
      font-size: 26px;
      color: #111827;
    }
    .header p {
      margin: 5px 0 0 0;
      font-size: 13px;
      color: #4b5563;
    }
    .doc-title-container {
      margin-top: 15px;
      display: inline-block;
      padding: 6px 20px;
      border: 2px solid #111827;
      font-family: 'Courier New', monospace;
      font-weight: bold;
      font-size: 17px;
      color: #1e3a8a;
      letter-spacing: 1px;
    }
    .grid-meta {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
      border: 1px solid #e5e7eb;
      border-radius: 6px;
      padding: 15px;
      font-size: 12px;
      margin-bottom: 25px;
      background-color: #f9fafb;
    }
    .grid-meta span {
      font-weight: bold;
      color: #374151;
    }
    .summary-cards {
      display: grid;
      grid-template-columns: 1fr 1fr 1fr;
      gap: 15px;
      margin-bottom: 25px;
    }
    .card {
      border: 1px solid #e5e7eb;
      border-radius: 6px;
      padding: 12px;
      text-align: center;
      background-color: #ffffff;
    }
    .card span.title {
      font-size: 10px;
      color: #6b7280;
      text-transform: uppercase;
      display: block;
      margin-bottom: 4px;
      letter-spacing: 0.5px;
    }
    .card span.value {
      font-size: 16px;
      font-weight: bold;
      font-family: monospace;
    }
    .text-green { color: #16a34a; }
    .text-red { color: #dc2626; }
    table {
      width: 100%;
      border-collapse: collapse;
      font-size: 12px;
      margin-bottom: 30px;
    }
    th, td {
      border: 1px solid #d1d5db;
      padding: 8px 12px;
      text-align: left;
    }
    th {
      background-color: #f3f4f6;
      color: #374151;
      font-weight: bold;
    }
    .text-right { text-align: right; }
    .text-center { text-align: center; }
    .font-mono { font-family: monospace; font-weight: bold; }
    .signatures {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 50px;
      margin-top: 50px;
      padding-top: 20px;
    }
    .signature-block {
      text-align: center;
    }
    .signature-line {
      border-top: 1px solid #111827;
      margin: 0 40px;
      padding-top: 8px;
    }
    .footer-note {
      margin-top: 40px;
      border-top: 1px solid #e5e7eb;
      padding-top: 15px;
      text-align: center;
      font-size: 11px;
      color: #9ca3af;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>GRULAC S.R.L.</h1>
    <p>Departamento de Control de Inventarios e Insumos</p>
    <p>Historial de Existencias y Libro Diario de Operaciones de Kárdex</p>
    <div class="doc-title-container">
      REPORTE DE MOVIMIENTOS DE KÁRDEX
    </div>
  </div>

  <div class="grid-meta">
    <div><span>Filtro de Ítem:</span> ${filterItem || 'Todos los ítems'}</div>
    <div><span>Fecha de Emisión:</span> ${new Date().toLocaleString('es-BO')}</div>
    <div><span>Rango de Fechas:</span> ${filterDesde ? `Desde ` + new Date(filterDesde).toLocaleDateString('es-BO') : 'Inicio'} — ${filterHasta ? `Hasta ` + new Date(filterHasta).toLocaleDateString('es-BO') : 'Fin'}</div>
    <div><span>Operaciones Emitidas:</span> ${displayMovimientos.length}</div>
    <div><span>Tipo de Operación / Flujo:</span> ${filterTipo === 'ALL' ? 'Todos' : filterTipo === 'IN' ? 'Ingreso (IN)' : filterTipo === 'OUT' ? 'Egreso (OUT)' : 'Ajuste (AJUSTE)'}</div>
    <div><span>Responsable:</span> ${filterUsuario === 'ALL' ? 'Todos' : filterUsuario}</div>
    <div><span>Filtro de Concepto:</span> ${filterConcepto || 'Todos'}</div>
    <div><span>Rango de Volumen (Kg):</span> ${filterMinVol || 'Min'} Kg — ${filterMaxVol || 'Max'} Kg</div>
  </div>

  <div class="summary-cards">
    <div class="card">
      <span class="title">Total Ingresos (IN)</span>
      <span class="value text-green">+${totalEntradas.toFixed(2)} Units/Kgs</span>
    </div>
    <div class="card">
      <span class="title">Total Egresos (OUT)</span>
      <span class="value text-red">-${totalSalidas.toFixed(2)} Units/Kgs</span>
    </div>
    <div class="card" style="background-color: #f9fafb;">
      <span class="title">Balance Neto Filtro</span>
      <span class="value ${(totalEntradas - totalSalidas + totalAjustes) >= 0 ? 'text-green' : 'text-red'}">
        ${(totalEntradas - totalSalidas + totalAjustes).toFixed(2)} Units/Kgs
      </span>
    </div>
  </div>

  <table>
    <thead>
      <tr>
        <th>Fecha/Hora</th>
        <th>Ítem / SKU</th>
        <th class="text-center">Operación</th>
        <th class="text-right">Volumen</th>
        <th class="text-right">Balance</th>
        <th>Concepto</th>
      </tr>
    </thead>
    <tbody>
      ${displayMovimientos.length === 0 ? `
        <tr>
          <td colspan="6" class="text-center" style="color: #6b7280; padding: 20px;">
            No hay transacciones registradas para este filtro.
          </td>
        </tr>
      ` : displayMovimientos.map(mov => `
        <tr>
          <td style="font-family: monospace; font-size: 11px; color: #4b5563;">
            ${new Date(mov.fecha_hora).toLocaleString('es-BO')}
          </td>
          <td>
            <strong>${mov.catalogo_items ? mov.catalogo_items.nombre_producto : 'Ítem #' + mov.id_item}</strong><br/>
            <span style="font-size: 10px; color: #6b7280; font-family: monospace;">${mov.catalogo_items?.codigo_sku || ''}</span>
          </td>
          <td class="text-center font-mono">
            ${mov.tipo_operacion}
          </td>
          <td class="text-right font-mono ${mov.tipo_operacion === 'OUT' ? 'text-red' : 'text-green'}">
            ${mov.tipo_operacion === 'OUT' ? '-' : '+'}${mov.cantidad_kilos}
          </td>
          <td class="text-right font-mono" style="color: #111827;">
            ${mov.balance_acumulado.toFixed(2)}
          </td>
          <td style="font-size: 11px; color: #4b5563;">
            ${mov.concepto_operacion || '—'}
          </td>
        </tr>
      `).join('')}
    </tbody>
  </table>

  <div class="signatures">
    <div class="signature-block">
      <div class="signature-line">
        <strong>Jefe de Almacén e Inventarios</strong>
        <p style="margin: 3px 0 0 0; font-size: 11px; color: #6b7280;">Firma Autorizada</p>
      </div>
    </div>
    <div class="signature-block">
      <div class="signature-line">
        <strong>Director General / Operaciones</strong>
        <p style="margin: 3px 0 0 0; font-size: 11px; color: #6b7280;">Visto Bueno</p>
      </div>
    </div>
  </div>

  <div class="footer-note">
    <p>Reporte oficial de auditoría de existencias - Generado digitalmente por el ERP de GRULAC S.R.L.</p>
  </div>
</body>
</html>`;

    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `reporte_kardex_${new Date().toISOString().slice(0,10)}.html`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Reporte HTML descargado con éxito');
  };

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

      {/* Filtros (CU09 spec: filtrar por lotes/fechas y filtros avanzados) */}
      <Card className="bg-zinc-900/50 border-border/50 print:hidden">
        <CardContent className="py-4 space-y-4">
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

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-2 border-t border-border/20">
            <div className="space-y-1">
              <Label className="text-xs text-zinc-400">Tipo de Flujo</Label>
              <Select value={filterTipo} onValueChange={setFilterTipo}>
                <SelectTrigger className="bg-background/50">
                  <SelectValue placeholder="Seleccione flujo..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">Todos los flujos</SelectItem>
                  <SelectItem value="IN">Ingreso (IN)</SelectItem>
                  <SelectItem value="OUT">Egreso (OUT)</SelectItem>
                  <SelectItem value="AJUSTE">Ajuste (AJUSTE)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <Label className="text-xs text-zinc-400">Responsable</Label>
              <Select value={filterUsuario} onValueChange={setFilterUsuario}>
                <SelectTrigger className="bg-background/50">
                  <SelectValue placeholder="Seleccione usuario..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">Todos los responsables</SelectItem>
                  {responsables.map(resp => (
                    <SelectItem key={resp} value={resp}>{resp}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <Label className="text-xs text-zinc-400">Buscar Concepto</Label>
              <Input
                placeholder="Ej: Merma, compra..."
                value={filterConcepto}
                onChange={(e) => setFilterConcepto(e.target.value)}
                className="bg-background/50"
              />
            </div>

            <div className="space-y-1">
              <Label className="text-xs text-zinc-400">Rango de Volumen (Kg)</Label>
              <div className="flex gap-2">
                <Input
                  type="number"
                  placeholder="Min"
                  value={filterMinVol}
                  onChange={(e) => setFilterMinVol(e.target.value)}
                  className="bg-background/50 w-full"
                />
                <Input
                  type="number"
                  placeholder="Max"
                  value={filterMaxVol}
                  onChange={(e) => setFilterMaxVol(e.target.value)}
                  className="bg-background/50 w-full"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleClearFilters}
              className="text-zinc-400 border-border hover:bg-zinc-800 hover:text-white flex items-center gap-1.5"
            >
              <FilterX className="h-3.5 w-3.5" />
              Limpiar Filtros
            </Button>
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
            <Button onClick={handleDownloadHTML} className="bg-emerald-600 hover:bg-emerald-700 gap-2 text-white">
              <ArrowDownToLine className="w-4 h-4" /> Descargar HTML
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
            <div className="grid grid-cols-2 gap-4 border border-gray-200 rounded p-4 text-xs mb-6 text-black">
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
              <div>
                <span className="font-bold">Tipo de Operación / Flujo:</span>{' '}
                {filterTipo === 'ALL' ? 'Todos' : filterTipo === 'IN' ? 'Ingreso (IN)' : filterTipo === 'OUT' ? 'Egreso (OUT)' : 'Ajuste (AJUSTE)'}
              </div>
              <div>
                <span className="font-bold">Responsable:</span>{' '}
                {filterUsuario === 'ALL' ? 'Todos' : filterUsuario}
              </div>
              <div>
                <span className="font-bold">Filtro de Concepto:</span>{' '}
                {filterConcepto || 'Todos'}
              </div>
              <div>
                <span className="font-bold">Rango de Volumen (Kg):</span>{' '}
                {filterMinVol || 'Min'} Kg — {filterMaxVol || 'Max'} Kg
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
