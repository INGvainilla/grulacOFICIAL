'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { History, ArrowDownToLine, ArrowUpToLine } from 'lucide-react'

// CU09: Consultar Kardex Dinámico (Historial)
export default function KardexPage() {
  const [movimientos, setMovimientos] = useState([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const fetchMovimientos = async () => {
      // Hacer un select incluyendo los datos del ítem del catálogo y usuario (si las relaciones existen)
      const { data, error } = await supabase
        .from('movimientos_kardex')
        .select(`
          *,
          catalogo_items (nombre_producto, codigo_sku),
          usuarios (email_corporativo)
        `)
        .order('fecha_hora', { ascending: false })

      if (error) {
        toast.error('Error al cargar movimientos de Kárdex', { description: error.message })
      } else {
        setMovimientos(data)
      }
      setLoading(false)
    }
    fetchMovimientos()
  }, [])

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Kárdex Dinámico</h2>
          <p className="text-muted-foreground">Historial inmutable de Entradas, Salidas y Ajustes volumétricos.</p>
        </div>
      </div>

      <Card className="bg-zinc-900 border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="w-5 h-5 text-zinc-400" />
            Libro de Operaciones Diarias
          </CardTitle>
          <CardDescription>Módulo de sólo lectura. Modificaciones se hacen vía ajustes operativos.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border border-border/50">
            <Table>
              <TableHeader className="bg-zinc-950/50">
                <TableRow>
                  <TableHead>Fecha Operación</TableHead>
                  <TableHead>Ítem / SKU afectado</TableHead>
                  <TableHead>Flujo (IN / OUT)</TableHead>
                  <TableHead className="text-right">Volumen (Kg/Lt)</TableHead>
                  <TableHead>Concepto Auditado</TableHead>
                  <TableHead>Responsable</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow><TableCell colSpan={6} className="text-center py-4">Interrogando BD Central...</TableCell></TableRow>
                ) : movimientos.length === 0 ? (
                  <TableRow><TableCell colSpan={6} className="text-center py-4">El Kárdex está aséptico (Cero movimientos).</TableCell></TableRow>
                ) : movimientos.map((mov) => (
                  <TableRow key={mov.id_movimiento}>
                    <TableCell className="font-mono text-xs text-zinc-400">
                      {new Date(mov.fecha_hora).toLocaleString('es-BO')}
                    </TableCell>
                    <TableCell className="font-semibold">
                      {mov.catalogo_items ? mov.catalogo_items.nombre_producto : `Ítem #${mov.id_item}`}
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
                      {mov.tipo_operacion === 'OUT' ? '-' : '+'}{mov.cantidad_kilos}
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm max-w-[200px] truncate" title={mov.concepto_operacion}>
                      {mov.concepto_operacion}
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
