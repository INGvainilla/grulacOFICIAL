'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'
import { UserPlus, UserMinus, ShieldAlert } from 'lucide-react'

import { inviteEmpleadoAction } from './actions'

export default function EmpleadosPage() {
  const [empleados, setEmpleados] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAltaModal, setShowAltaModal] = useState(false)
  const [showStatusModal, setShowStatusModal] = useState(false)
  const [targetEmpleado, setTargetEmpleado] = useState(null)
  const [adminPin, setAdminPin] = useState('')
  const [roles, setRoles] = useState([])
  const [saving, setSaving] = useState(false)
  const [currentAuthId, setCurrentAuthId] = useState(null)
  const supabase = createClient()

  // Form state for CU03
  const [form, setForm] = useState({
    ci_documento: '',
    nombre_completo: '',
    cargo: '',
    telefono: '',
    email_corporativo: '',
    id_rol: '',
  })
  const [formErrors, setFormErrors] = useState({})

  const fetchEmpleados = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('empleados')
      .select(`
        *,
        usuarios ( id_usuario, auth_uid, email_corporativo, estado_acceso, id_rol, roles ( nombre_rol ) )
      `)
      .order('id_empleado', { ascending: true })

    if (error) {
      toast.error('Error al cargar empleados', { description: error.message })
    } else {
      setEmpleados(data)
    }
    setLoading(false)
  }

  const fetchRoles = async () => {
    const { data } = await supabase.from('roles').select('*').eq('estado_activo', true).order('id_rol')
    if (data) setRoles(data)
  }

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setCurrentAuthId(data?.user?.id))
    fetchEmpleados()
    fetchRoles()
  }, [])

  // ========== CU03: Registrar Nuevo Empleado ==========
  const validateForm = () => {
    const errors = {}
    if (!form.ci_documento.trim()) errors.ci_documento = 'Este campo es obligatorio'
    if (!form.nombre_completo.trim()) errors.nombre_completo = 'Este campo es obligatorio'
    if (!form.email_corporativo.trim()) errors.email_corporativo = 'Este campo es obligatorio'
    if (!form.id_rol) errors.id_rol = 'Debe asignar un rol'
    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleAltaEmpleado = async () => {
    if (!validateForm()) return
    setSaving(true)

    // Paso 1 a 5: Invocar Server Action para Atomicidad + Auth Invite
    const result = await inviteEmpleadoAction(form)

    if (result.error) {
      if (result.error.includes('CI/DNI')) {
        setFormErrors({ ci_documento: result.error })
      } else if (result.error.includes('correo')) {
        setFormErrors({ email_corporativo: result.error })
      } else {
        toast.error('Error en el Alta', { description: result.error })
      }
      setSaving(false)
      return
    }

    // Paso 6: Éxito
    toast.success('Invitación enviada con éxito', {
      description: `Se ha enviado un correo a ${form.email_corporativo} para configurar la contraseña.`
    })
    setShowAltaModal(false)
    fetchEmpleados()
    setSaving(false)
  }



  // ========== CU04: Gestionar Estado Operativo (Alta/Baja Lógica) ==========
  const openStatusModal = (emp) => {
    setTargetEmpleado(emp)
    setAdminPin('')
    setShowStatusModal(true)
  }

  const handleToggleStatus = async () => {
    if (!adminPin.trim()) {
      toast.error('Debe ingresar su contraseña de Administrador')
      return
    }

    setSaving(true)
    const isCurrentlyActive = targetEmpleado.estado_activo

    // E1: Verificar que no es el único admin SOLO si estamos inhabilitando
    if (isCurrentlyActive && targetEmpleado.usuarios?.[0]?.id_rol === 1) {
      const { count } = await supabase
        .from('usuarios')
        .select('id_usuario', { count: 'exact', head: true })
        .eq('id_rol', 1)
        .eq('estado_acceso', true)

      if (count <= 1) {
        toast.error('Autodestrucción Bloqueada', {
          description: 'No puede inhabilitar al único Administrador del sistema.'
        })
        setSaving(false)
        return
      }
    }

    // Paso 3: Verificar contraseña del admin (via Supabase Auth)
    const { data: { user: currentUser } } = await supabase.auth.getUser()
    if (!currentUser) {
      toast.error('Sesión expirada')
      setSaving(false)
      return
    }

    // Validate admin password by attempting re-auth
    const { error: authError } = await supabase.auth.signInWithPassword({
      email: currentUser.email,
      password: adminPin,
    })

    if (authError) {
      toast.error('Contraseña de Administrador incorrecta')
      setSaving(false)
      return
    }

    const newState = !isCurrentlyActive

    // Paso 4: Actualizar en empleados
    const { error: empErr } = await supabase
      .from('empleados')
      .update({ estado_activo: newState })
      .eq('id_empleado', targetEmpleado.id_empleado)

    if (empErr) {
      toast.error(`Error al ${newState ? 'habilitar' : 'inhabilitar'} empleado`)
      setSaving(false)
      return
    }

    // UPDATE usuarios.estado_acceso = newState (bloquea o habilita login)
    if (targetEmpleado.usuarios?.[0]?.id_usuario) {
      await supabase
        .from('usuarios')
        .update({ estado_acceso: newState })
        .eq('id_usuario', targetEmpleado.usuarios[0].id_usuario)
    }

    let idUsuario = 1
    if (currentUser?.id) {
      const { data: userData } = await supabase.from('usuarios').select('id_usuario').eq('auth_uid', currentUser.id).single()
      if (userData?.id_usuario) idUsuario = userData.id_usuario
    }

    await supabase.from('bitacora_auditoria').insert([{
      id_usuario: idUsuario,
      accion_sql: 'UPDATE',
      tabla_afectada: 'empleados',
      registro_id: targetEmpleado.id_empleado,
      new_data: { estado_activo: newState }
    }])

    toast.success(`Operador ${targetEmpleado.nombre_completo} ${newState ? 'rehabilitado' : 'inhabilitado'}`, {
      description: newState ? 'Su acceso al ERP ha sido restaurado exitosamente.' : 'Su acceso al ERP ha sido revocado.'
    })
    setShowStatusModal(false)
    setTargetEmpleado(null)
    fetchEmpleados()
    setSaving(false)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Gestión Operativa (RRHH)</h2>
          <p className="text-muted-foreground">Altas, bajas lógicas y configuraciones de personal.</p>
        </div>
        <Button onClick={() => setShowAltaModal(true)} className="gap-2 bg-blue-600 hover:bg-blue-700">
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
                  <TableHead className="w-[80px]">ID</TableHead>
                  <TableHead>CI</TableHead>
                  <TableHead>Nombre del Colaborador</TableHead>
                  <TableHead>Cargo</TableHead>
                  <TableHead>Rol Sistémico</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">Sincronizando con Base de Datos...</TableCell>
                  </TableRow>
                ) : empleados.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">No hay trabajadores en planilla.</TableCell>
                  </TableRow>
                ) : (
                  empleados.map((emp) => (
                    <TableRow key={emp.id_empleado}>
                      <TableCell className="font-mono text-zinc-400">#{emp.id_empleado}</TableCell>
                      <TableCell className="font-medium">{emp.ci_documento}</TableCell>
                      <TableCell className="font-semibold text-white">{emp.nombre_completo}</TableCell>
                      <TableCell>{emp.cargo || 'Sin especificar'}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-blue-400 border-blue-400/30 bg-blue-900/10">
                          {emp.usuarios?.[0]?.roles?.nombre_rol || 'Sin rol'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {emp.estado_activo
                          ? <Badge className="bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 border-emerald-500/20">Operativo</Badge>
                          : <Badge variant="destructive" className="bg-red-500/10 text-red-500 hover:bg-red-500/20 border-red-500/20">Inactivo</Badge>
                        }
                      </TableCell>
                      <TableCell className="text-right whitespace-nowrap">
                        {(() => {
                          const isSelf = emp.usuarios?.[0]?.auth_uid === currentAuthId
                          return (
                            <Button
                              variant="ghost"
                              size="sm"
                              className={`${emp.estado_activo
                                  ? 'text-red-400 hover:text-red-300 hover:bg-red-950/50'
                                  : 'text-emerald-400 hover:text-emerald-300 hover:bg-emerald-950/50'
                                } disabled:opacity-50`}
                              disabled={isSelf}
                              onClick={() => openStatusModal(emp)}
                            >
                              {isSelf ? (
                                <><ShieldAlert className="h-4 w-4 mr-2" /> Eres Tú</>
                              ) : emp.estado_activo ? (
                                <><UserMinus className="h-4 w-4 mr-2" /> Dar de Baja</>
                              ) : (
                                <><UserPlus className="h-4 w-4 mr-2" /> Rehabilitar</>
                              )}
                            </Button>
                          )
                        })()}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* ========== MODAL CU03: Alta de Identidad Corporativa ========== */}
      <Dialog open={showAltaModal} onOpenChange={setShowAltaModal}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-xl">Alta de Identidad Corporativa</DialogTitle>
            <DialogDescription>Registre los datos del nuevo colaborador. Se le asignará una contraseña genérica inicial.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="ci">Documento Nacional (CI/DNI) *</Label>
              <Input
                id="ci"
                placeholder="Ej: 12345678"
                value={form.ci_documento}
                onChange={(e) => { setForm({ ...form, ci_documento: e.target.value }); setFormErrors({ ...formErrors, ci_documento: '' }) }}
                className={formErrors.ci_documento ? 'border-red-500' : ''}
              />
              {formErrors.ci_documento && <p className="text-xs text-red-500">{formErrors.ci_documento}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="nombre">Nombre Completo del Colaborador *</Label>
              <Input
                id="nombre"
                placeholder="Ej: Juan Pérez Mamani"
                value={form.nombre_completo}
                onChange={(e) => { setForm({ ...form, nombre_completo: e.target.value }); setFormErrors({ ...formErrors, nombre_completo: '' }) }}
                className={formErrors.nombre_completo ? 'border-red-500' : ''}
              />
              {formErrors.nombre_completo && <p className="text-xs text-red-500">{formErrors.nombre_completo}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="cargo">Cargo Industrial</Label>
              <Input
                id="cargo"
                placeholder="Ej: Operario de Tina"
                value={form.cargo}
                onChange={(e) => setForm({ ...form, cargo: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="telefono">Teléfono</Label>
              <Input
                id="telefono"
                placeholder="Ej: 76543210"
                value={form.telefono}
                onChange={(e) => setForm({ ...form, telefono: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email_corp">Correo Corporativo *</Label>
              <Input
                id="email_corp"
                type="email"
                placeholder="Ej: juan.perez@grulac.com"
                value={form.email_corporativo}
                onChange={(e) => { setForm({ ...form, email_corporativo: e.target.value }); setFormErrors({ ...formErrors, email_corporativo: '' }) }}
                className={formErrors.email_corporativo ? 'border-red-500' : ''}
              />
              {formErrors.email_corporativo && <p className="text-xs text-red-500">{formErrors.email_corporativo}</p>}
            </div>
            <div className="space-y-2">
              <Label>Rol del Sistema *</Label>
              <Select value={form.id_rol} onValueChange={(val) => { setForm({ ...form, id_rol: val }); setFormErrors({ ...formErrors, id_rol: '' }) }}>
                <SelectTrigger className={formErrors.id_rol ? 'border-red-500' : ''}>
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
              {formErrors.id_rol && <p className="text-xs text-red-500">{formErrors.id_rol}</p>}
            </div>

          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setShowAltaModal(false)} disabled={saving}>Cancelar</Button>
            <Button onClick={handleAltaEmpleado} className="bg-blue-600 hover:bg-blue-700" disabled={saving}>
              {saving ? 'Guardando...' : 'Guardar Empleado'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ========== MODAL CU04: Confirmación Crítica — Gestionar Estado ========== */}
      <Dialog open={showStatusModal} onOpenChange={setShowStatusModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className={`w-12 h-12 rounded-full ${targetEmpleado?.estado_activo ? 'bg-red-500/10' : 'bg-emerald-500/10'} flex items-center justify-center`}>
                {targetEmpleado?.estado_activo ? <ShieldAlert className="w-6 h-6 text-red-500" /> : <UserPlus className="w-6 h-6 text-emerald-500" />}
              </div>
              <div>
                <DialogTitle className="text-lg">
                  Confirmación Crítica: {targetEmpleado?.estado_activo ? 'Baja' : 'Rehabilitación'} de Personal
                </DialogTitle>
              </div>
            </div>
            <DialogDescription>
              Está a punto de {targetEmpleado?.estado_activo ? 'revocar' : 'restaurar'} todos los privilegios de <strong>{targetEmpleado?.nombre_completo}</strong>.
              Escriba su contraseña maestra de Administrador para confirmar.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-3">
            <Label htmlFor="adminPin">Contraseña de Administrador</Label>
            <Input
              id="adminPin"
              type="password"
              placeholder="••••••••"
              value={adminPin}
              onChange={(e) => setAdminPin(e.target.value)}
              className="font-mono"
            />
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setShowStatusModal(false)} disabled={saving}>Cancelar</Button>
            <Button
              variant={targetEmpleado?.estado_activo ? "destructive" : "default"}
              className={!targetEmpleado?.estado_activo ? "bg-emerald-600 hover:bg-emerald-700 text-white" : ""}
              onClick={handleToggleStatus}
              disabled={saving || !adminPin.trim()}
            >
              {saving ? 'Procesando...' : (targetEmpleado?.estado_activo ? 'Revocar Acceso' : 'Restaurar Acceso')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>


    </div>
  )
}
