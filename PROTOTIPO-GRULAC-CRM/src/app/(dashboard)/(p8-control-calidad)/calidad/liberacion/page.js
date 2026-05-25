'use client'

import { useState, useEffect } from 'react'
import { liberarLote, obtenerFichasConformesParaLiberacion } from '@/lib/controllers/CTR_Calidad'
import { toast } from 'sonner'
import { CheckSquare, PackagePlus } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

export default function LiberacionPage() {
  const [fichas, setFichas] = useState([])
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    loadFichas()
  }, [])

  async function loadFichas() {
    const data = await obtenerFichasConformesParaLiberacion()
    setFichas(data || [])
  }

  const handleLiberar = async (idLote) => {
    if (!window.confirm('¿Estás seguro de liberar este lote comercialmente?')) return
    
    setIsLoading(true)
    const res = await liberarLote(idLote)
    setIsLoading(false)

    if (res.success) {
      toast.success(res.message)
      loadFichas() // remove from list
    } else {
      toast.error(res.error || 'Error al liberar lote')
    }
  }

  return (
    <div className="space-y-6 animate-fade-in max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Liberar Lotes a Almacén</h2>
          <p className="text-muted-foreground">Revisa los lotes con dictamen conforme y libéralos al Kardex.</p>
        </div>
      </div>

      <Card className="bg-zinc-900 border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckSquare className="h-5 w-5 text-indigo-400" />
            Lotes Conformes
          </CardTitle>
          <CardDescription>Lotes que aprobaron QA y están listos para despacho comercial.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border border-border/50 overflow-hidden">
            <Table>
              <TableHeader className="bg-zinc-950/50">
                <TableRow>
                  <TableHead>Lote Físico</TableHead>
                  <TableHead>Producto Terminado</TableHead>
                  <TableHead>Cantidad</TableHead>
                  <TableHead>Dictamen QA</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {fichas.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="py-10 text-center text-zinc-500">
                      No hay lotes conformes pendientes de liberación.
                    </TableCell>
                  </TableRow>
                ) : fichas.map((ficha) => (
                  <TableRow key={ficha.id_ficha}>
                    <TableCell className="font-mono text-zinc-300">
                      {ficha.lote_produccion?.codigo_lote}
                    </TableCell>
                    <TableCell className="font-medium text-white">
                      {ficha.lote_produccion?.catalogo_items?.nombre_producto}
                    </TableCell>
                    <TableCell className="text-zinc-400">
                      {ficha.lote_produccion?.cantidad_producida} {ficha.lote_produccion?.catalogo_items?.unidad_medida}
                    </TableCell>
                    <TableCell>
                      <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 hover:bg-emerald-500/20">
                        {ficha.dictamen_qa}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        size="sm"
                        onClick={() => handleLiberar(ficha.id_lote)}
                        disabled={isLoading}
                        className="bg-indigo-600 hover:bg-indigo-700 gap-2"
                      >
                        <PackagePlus className="h-4 w-4" /> 
                        Liberar al Kardex
                      </Button>
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
