'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { Building2 } from 'lucide-react'

// CU26: Registrar Cliente (CRM)
export default function ClientesPage() {
  const [clientes, setClientes] = useState([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const fetchClientes = async () => {
      const { data, error } = await supabase.from('clientes').select('*').order('razon_social')
      if (error) toast.error('Error al cargar clientes CRM', { description: error.message })
      else setClientes(data)
      setLoading(false)
    }
    fetchClientes()
  }, [])

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Cartera de Clientes Comerciales</h2>
          <p className="text-muted-foreground">Listado de Supermercados (B2B) y Distribuidores (B2C).</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Building2 className="w-4 h-4 mr-2" />
          Aperturar Cuenta Cliente
        </Button>
      </div>

      <Card className="bg-zinc-900 border-border/50">
        <CardHeader>
          <CardTitle>Destinos de Despacho (SIN Facturación)</CardTitle>
          <CardDescription>Para que el chofer pueda llevar producto, el receptor debe estar oficializado.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border border-border/50">
            <Table>
              <TableHeader className="bg-zinc-950/50">
                <TableRow>
                  <TableHead>NIT Obligatorio</TableHead>
                  <TableHead>Razón Social (A facturar)</TableHead>
                  <TableHead>Categoria Comercial</TableHead>
                  <TableHead>Canal</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow><TableCell colSpan={4} className="text-center py-4">Buscando carteras activas...</TableCell></TableRow>
                ) : clientes.length === 0 ? (
                  <TableRow><TableCell colSpan={4} className="text-center py-4">Aún no hay clientes.</TableCell></TableRow>
                ) : clientes.map((cli) => (
                  <TableRow key={cli.id_cliente}>
                    <TableCell className="font-mono text-zinc-300">{cli.nit_facturacion}</TableCell>
                    <TableCell className="font-semibold text-white">{cli.razon_social}</TableCell>
                    <TableCell>
                      {cli.tipo_cliente === 'B2B' ? (
                        <Badge variant="outline" className="text-blue-400 border-blue-400/50 bg-blue-900/10">Retail / Mayorista</Badge>
                      ) : (
                        <Badge variant="outline" className="text-purple-400 border-purple-400/50 bg-purple-900/10">Detallista</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-muted-foreground">{cli.ciudad || 'No especificada'}</TableCell>
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
