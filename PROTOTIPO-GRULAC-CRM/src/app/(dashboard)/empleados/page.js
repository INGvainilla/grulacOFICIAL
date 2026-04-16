'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { UserPlus, UserMinus, ShieldAlert } from 'lucide-react'

// Basic implementations for CU03 and CU04
export default function EmpleadosPage() {
  const [empleados, setEmpleados] = useState([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  const fetchEmpleados = async () => {
    setLoading(true)
    // Left join using Supabase related tables if configured, or just employees table.
    // Given the prototype, we just query 'empleados' and its active status.
    const { data, error } = await supabase
      .from('empleados')
      .select('*')
      .order('id_empleado', { ascending: true })

    if (error) {
      toast.error('Error al cargar empleados', { description: error.message })
    } else {
      setEmpleados(data)
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchEmpleados()
  }, [])

  const handleAltaEmpleado = () => {
    // CU03: Aquí iría la lógica del Modal para el INSERT
    toast.info('Construcción de Modal de Alta (CU03)', {
      description: 'El formulario inyecta DNI, Nombre y llama al Edge Function de Supabase para crear Auth.'
    })
  }

  const handleBajaLogica = async (id_empleado, nombre_completo) => {
    // CU04: Baja lógica del empleado
    if(!confirm(`⚠️ PELIGRO:\n\n¿Estás seguro de inhabilitar operativamente a ${nombre_completo}?\nEsto revocará su acceso al ERP irrevocablemente.`)) return;

    // Actualiza la tabla empleados
    const { error } = await supabase
      .from('empleados')
      .update({ estado_activo: false })
      .eq('id_empleado', id_empleado)

    if (error) {
      toast.error('Error al inhabilitar empleado')
      return
    }

    toast.success(`Operador ${nombre_completo} inhabilitado`, {
      description: 'Sus tokens han sido revocados de sesión activa.'
    })
    fetchEmpleados()
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Gestión Operativa (RRHH)</h2>
          <p className="text-muted-foreground">Altas, bajas lógicas y configuraciones paramétricas de personal.</p>
        </div>
        <Button onClick={handleAltaEmpleado} className="gap-2 bg-blue-600 hover:bg-blue-700">
          <UserPlus className="h-4 w-4" />
          Añadir Trabajador
        </Button>
      </div>

      <Card className="bg-zinc-900 border-border/50">
        <CardHeader>
          <CardTitle>Nómina de Planta</CardTitle>
          <CardDescription>Directorio oficial de personal con acceso al sistema ERP.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border border-border/50 overflow-hidden">
            <Table>
              <TableHeader className="bg-zinc-950/50">
                <TableRow>
                  <TableHead className="w-[100px]">ID / PIN</TableHead>
                  <TableHead>Documento (CI)</TableHead>
                  <TableHead>Nombre del Colaborador</TableHead>
                  <TableHead>Cargo Industrial</TableHead>
                  <TableHead>Estado Lógico</TableHead>
                  <TableHead className="text-right">Acciones Peligrosas</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">Sincronizando con Base de Datos...</TableCell>
                  </TableRow>
                ) : empleados.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">No hay trabajadores en planilla.</TableCell>
                  </TableRow>
                ) : (
                  empleados.map((emp) => (
                    <TableRow key={emp.id_empleado}>
                      <TableCell className="font-mono text-zinc-400">#{emp.id_empleado}</TableCell>
                      <TableCell className="font-medium">{emp.ci_documento}</TableCell>
                      <TableCell className="font-semibold text-white">{emp.nombre_completo}</TableCell>
                      <TableCell>{emp.cargo || 'Sin Especificar'}</TableCell>
                      <TableCell>
                        {emp.estado_activo 
                          ? <Badge className="bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 border-emerald-500/20">Operativo</Badge>
                          : <Badge variant="destructive" className="bg-red-500/10 text-red-500 hover:bg-red-500/20 border-red-500/20">Inactivo</Badge>
                        }
                      </TableCell>
                      <TableCell className="text-right">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-red-400 hover:text-red-300 hover:bg-red-950/50"
                          disabled={!emp.estado_activo}
                          onClick={() => handleBajaLogica(emp.id_empleado, emp.nombre_completo)}
                        >
                          {emp.estado_activo ? <UserMinus className="h-4 w-4 mr-2" /> : <ShieldAlert className="h-4 w-4 mr-2" />}
                          {emp.estado_activo ? 'Revocar Acceso' : 'Bloqueado'}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
