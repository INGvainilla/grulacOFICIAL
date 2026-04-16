'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { PlusCircle } from 'lucide-react'

// CU12: Registrar Proveedor / Ganadero
export default function ProveedoresPage() {
  const [proveedores, setProveedores] = useState([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const fetchProv = async () => {
      const { data, error } = await supabase.from('proveedores').select('*').order('razon_social')
      if (error) toast.error('Error al cargar proveedores', { description: error.message })
      else setProveedores(data)
      setLoading(false)
    }
    fetchProv()
  }, [])

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Gestión de Orígenes (SCM)</h2>
          <p className="text-muted-foreground">Catálogo de Ranchos Lecheros y Proveedores Secundarios.</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <PlusCircle className="w-4 h-4 mr-2" />
          Registrar Empresa
        </Button>
      </div>

      <Card className="bg-zinc-900 border-border/50">
        <CardHeader>
          <CardTitle>Proveedores Registrados</CardTitle>
          <CardDescription>Cualquier inhabilitación bacteriológica bloquea acopios futuros de este NIT.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border border-border/50">
            <Table>
              <TableHeader className="bg-zinc-950/50">
                <TableRow>
                  <TableHead>NIT/CI Documento</TableHead>
                  <TableHead>Nombre Comercial</TableHead>
                  <TableHead>Tipo Suministro</TableHead>
                  <TableHead>Reputación Biosanitaria</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow><TableCell colSpan={4} className="text-center py-4">Validando red interbancaria...</TableCell></TableRow>
                ) : proveedores.length === 0 ? (
                  <TableRow><TableCell colSpan={4} className="text-center py-4">Directorio Vacío.</TableCell></TableRow>
                ) : proveedores.map((prov) => (
                  <TableRow key={prov.id_proveedor}>
                    <TableCell className="font-mono text-zinc-300">{prov.ci_nit}</TableCell>
                    <TableCell className="font-semibold">{prov.razon_social}</TableCell>
                    <TableCell className="text-muted-foreground">{prov.tipo_proveedor}</TableCell>
                    <TableCell>
                      {prov.estado_reputacion === 'Activo' ? (
                        <Badge className="bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20">Autorizado</Badge>
                      ) : (
                        <Badge variant="destructive">Bloqueado</Badge>
                      )}
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
