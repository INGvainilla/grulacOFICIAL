'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { Settings, Edit } from 'lucide-react'

// CU05: Asignar / Modificar Roles
export default function RolesPage() {
  const [roles, setRoles] = useState([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const fetchRoles = async () => {
      const { data, error } = await supabase.from('roles').select('*').order('id_rol')
      if (error) toast.error('Error al cargar roles')
      else setRoles(data)
      setLoading(false)
    }
    fetchRoles()
  }, [])

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Perfiles de Autorización</h2>
          <p className="text-muted-foreground">Configuración de niveles de acceso y módulos permitidos.</p>
        </div>
      </div>

      <Card className="bg-zinc-900 border-border/50">
        <CardHeader>
          <CardTitle>Roles del Sistema</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border border-border/50">
            <Table>
              <TableHeader className="bg-zinc-950/50">
                <TableRow>
                  <TableHead className="w-[80px]">ID</TableHead>
                  <TableHead>Nombre del Rol</TableHead>
                  <TableHead>Descripción Técnica</TableHead>
                  <TableHead>Módulos (JSON)</TableHead>
                  <TableHead className="text-right">Acción</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow><TableCell colSpan={5} className="text-center py-4">Cargando...</TableCell></TableRow>
                ) : roles.map((rol) => (
                  <TableRow key={rol.id_rol}>
                    <TableCell className="font-mono text-zinc-400">#{rol.id_rol}</TableCell>
                    <TableCell className="font-semibold text-white">{rol.nombre_rol}</TableCell>
                    <TableCell className="text-muted-foreground">{rol.descripcion || '-'}</TableCell>
                    <TableCell className="font-mono text-xs">{JSON.stringify(rol.permisos_json)}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" onClick={() => toast('Abrir modal de edición')}>
                        <Settings className="w-4 h-4" />
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
