'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'
import { UserCog, Shield } from 'lucide-react'

// CU05: Asignar / Modificar Roles y Permisos
export default function RolesPage() {
  const [usuarios, setUsuarios] = useState([])
  const [roles, setRoles] = useState([])
  const [loading, setLoading] = useState(true)
  const [showDrawer, setShowDrawer] = useState(false)
  const [targetUser, setTargetUser] = useState(null)
  const [selectedRol, setSelectedRol] = useState('')
  const [saving, setSaving] = useState(false)
  const supabase = createClient()

  const fetchData = async () => {
    setLoading(true)
    // Cargar usuarios con su info de empleado y rol actual
    const { data: usrData } = await supabase
      .from('usuarios')
      .select(`
        id_usuario, email_corporativo, estado_acceso, id_rol,
        empleados ( nombre_completo, cargo, ci_documento, estado_activo ),
        roles ( id_rol, nombre_rol )
      `)
      .order('id_usuario')

    const { data: rolesData } = await supabase
      .from('roles')
      .select('*')
      .eq('estado_activo', true)
      .order('id_rol')

    if (usrData) setUsuarios(usrData)
    if (rolesData) setRoles(rolesData)
    setLoading(false)
  }

  useEffect(() => { fetchData() }, [])

  const openAsignar = (usr) => {
    setTargetUser(usr)
    setSelectedRol(usr.id_rol?.toString() || '')
    setShowDrawer(true)
  }

  const handleGuardarRol = async () => {
    if (!selectedRol || !targetUser) return
    setSaving(true)

    // Paso 4: UPDATE usuarios SET id_rol = X WHERE id_usuario = Y
    const { error } = await supabase
      .from('usuarios')
      .update({ id_rol: parseInt(selectedRol) })
      .eq('id_usuario', targetUser.id_usuario)

    if (error) {
      toast.error('Error al asignar rol', { description: error.message })
      setSaving(false)
      return
    }

    const rolName = roles.find(r => r.id_rol === parseInt(selectedRol))?.nombre_rol || 'Desconocido'
    toast.success('Rol actualizado', {
      description: `${targetUser.empleados?.nombre_completo} ahora es "${rolName}".`
    })
    setShowDrawer(false)
    fetchData()
    setSaving(false)
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Configuración de Accesos</h2>
          <p className="text-muted-foreground">Asigne roles y delimite las fronteras de poder de cada operador.</p>
        </div>
      </div>

      {/* Tabla de Roles disponibles */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {roles.map(r => (
          <Card key={r.id_rol} className="bg-zinc-900/50 border-border/50">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Shield className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="font-semibold text-white">{r.nombre_rol}</p>
                  <p className="text-xs text-muted-foreground">{r.descripcion || 'Sin descripción'}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* DataGrid principal: Usuarios con sus roles */}
      <Card className="bg-zinc-900 border-border/50">
        <CardHeader>
          <CardTitle>Personal y sus Perfiles de Autorización</CardTitle>
          <CardDescription>Haga clic en "Asignar Puesto" para modificar el rol de un operador.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border border-border/50">
            <Table>
              <TableHeader className="bg-zinc-950/50">
                <TableRow>
                  <TableHead className="w-[80px]">ID</TableHead>
                  <TableHead>CI</TableHead>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Email Corporativo</TableHead>
                  <TableHead>Rol Actual</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Acción</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow><TableCell colSpan={7} className="text-center py-4">Cargando...</TableCell></TableRow>
                ) : usuarios.length === 0 ? (
                  <TableRow><TableCell colSpan={7} className="text-center py-4">No hay usuarios.</TableCell></TableRow>
                ) : usuarios.map((usr) => (
                  <TableRow key={usr.id_usuario}>
                    <TableCell className="font-mono text-zinc-400">#{usr.id_usuario}</TableCell>
                    <TableCell className="font-medium">{usr.empleados?.ci_documento || '—'}</TableCell>
                    <TableCell className="font-semibold text-white">{usr.empleados?.nombre_completo || '—'}</TableCell>
                    <TableCell className="text-muted-foreground text-sm">{usr.email_corporativo}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-blue-400 border-blue-400/30 bg-blue-900/10">
                        {usr.roles?.nombre_rol || 'Sin rol'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {usr.estado_acceso
                        ? <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20">Activo</Badge>
                        : <Badge className="bg-red-500/10 text-red-500 border-red-500/20">Inactivo</Badge>
                      }
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openAsignar(usr)}
                        disabled={!usr.estado_acceso}
                        className="gap-1"
                      >
                        <UserCog className="w-3.5 h-3.5" />
                        Asignar Puesto
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* ========== DRAWER CU05: Configuración de Puesto Operativo ========== */}
      <Dialog open={showDrawer} onOpenChange={setShowDrawer}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Configuración de Puesto Operativo</DialogTitle>
            <DialogDescription>
              Operario: <strong>{targetUser?.empleados?.nombre_completo}</strong>
              <br />
              Rol actual: <strong>{targetUser?.roles?.nombre_rol || 'Ninguno'}</strong>
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="space-y-2">
              <p className="text-sm font-medium">Escoja el Departamento y Rango</p>
              <Select value={selectedRol} onValueChange={setSelectedRol}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccione un rol..." />
                </SelectTrigger>
                <SelectContent>
                  {roles.map(r => (
                    <SelectItem key={r.id_rol} value={r.id_rol.toString()}>
                      {r.nombre_rol} — {r.descripcion || 'Sin descripción'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setShowDrawer(false)} disabled={saving}>Cancelar</Button>
            <Button onClick={handleGuardarRol} className="bg-blue-600 hover:bg-blue-700" disabled={saving || !selectedRol}>
              {saving ? 'Guardando...' : 'Guardar Configuración'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
