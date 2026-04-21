'use client'

import { useState, useEffect, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { KeyRound, Check, X, Eye, EyeOff } from 'lucide-react'

// CU31: Cambiar Contraseña Propia
export default function PerfilPage() {
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [showCurrent, setShowCurrent] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [userEmail, setUserEmail] = useState('')
  const supabase = createClient()

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) setUserEmail(user.email)
    }
    getUser()
  }, [])

  // Validación de política de seguridad (CU31 Paso 6)
  const policies = useMemo(() => ({
    minLength: newPassword.length >= 8,
    hasUpper: /[A-Z]/.test(newPassword),
    hasLower: /[a-z]/.test(newPassword),
    hasNumber: /[0-9]/.test(newPassword),
  }), [newPassword])

  const allPoliciesMet = policies.minLength && policies.hasUpper && policies.hasLower && policies.hasNumber

  const handleChangePassword = async () => {
    // E1: Verificar contraseña actual
    if (!currentPassword) {
      toast.error('Debe ingresar su contraseña actual')
      return
    }

    // E2: Verificar política de seguridad
    if (!allPoliciesMet) {
      toast.error('La nueva contraseña no cumple los requisitos de seguridad')
      return
    }

    // E3: Verificar que coincidan
    if (newPassword !== confirmPassword) {
      toast.error('Las contraseñas no coinciden')
      return
    }

    // E4: Verificar que no sea igual a la actual
    if (newPassword === currentPassword) {
      toast.error('La nueva contraseña no puede ser igual a la anterior')
      return
    }

    setLoading(true)

    // Paso 5: Verificar contraseña actual haciendo re-auth
    const { error: authError } = await supabase.auth.signInWithPassword({
      email: userEmail,
      password: currentPassword,
    })

    if (authError) {
      toast.error('Su contraseña actual es incorrecta')
      setLoading(false)
      return
    }

    // Paso 7: Actualizar contraseña via Supabase Auth
    const { error: updateError } = await supabase.auth.updateUser({
      password: newPassword,
    })

    if (updateError) {
      toast.error('Error al actualizar contraseña', { description: updateError.message })
      setLoading(false)
      return
    }

    // Paso 8: Registrar en bitácora (el trigger cubre UPDATE en usuarios,
    // pero registramos explícitamente la acción CAMBIO_PASSWORD)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        // ACTUALIZACIÓN ACADÉMICA: Sincronizar hash en tabla pública
        await supabase.rpc('update_password_hash_direct', { p_user_id: user.id, p_raw_password: newPassword })

        const { data: userData } = await supabase
          .from('usuarios')
          .select('id_usuario')
          .eq('auth_uid', user.id)
          .single()

        if (userData) {
          await supabase.from('bitacora_auditoria').insert([{
            id_usuario: userData.id_usuario,
            accion_sql: 'CAMBIO_PASSWORD',
            tabla_afectada: 'usuarios',
            new_data: { email: userEmail, timestamp: new Date().toISOString() }
          }])
        }
      }
    } catch (_) { /* silencioso */ }

    // Paso 9: Toast de éxito
    toast.success('Su contraseña ha sido actualizada correctamente')
    setCurrentPassword('')
    setNewPassword('')
    setConfirmPassword('')
    setLoading(false)
  }

  const PolicyItem = ({ met, label }) => (
    <div className={`flex items-center gap-2 text-xs transition-colors ${met ? 'text-emerald-400' : 'text-zinc-500'}`}>
      {met ? <Check className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />}
      {label}
    </div>
  )

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Mi Perfil</h2>
        <p className="text-muted-foreground">Gestione su seguridad personal.</p>
      </div>

      <Card className="bg-zinc-900 border-border/50">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <KeyRound className="w-6 h-6 text-primary" />
            </div>
            <div>
              <CardTitle>Actualizar Contraseña</CardTitle>
              <CardDescription>{userEmail}</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-5">
          {/* Campo: Contraseña Actual */}
          <div className="space-y-2">
            <Label>Contraseña Actual</Label>
            <div className="relative">
              <Input
                type={showCurrent ? 'text' : 'password'}
                placeholder="••••••••"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="pr-10 font-mono"
              />
              <button
                type="button"
                onClick={() => setShowCurrent(!showCurrent)}
                className="absolute right-3 top-2.5 text-zinc-500 hover:text-zinc-300"
              >
                {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Campo: Nueva Contraseña */}
          <div className="space-y-2">
            <Label>Nueva Contraseña</Label>
            <div className="relative">
              <Input
                type={showNew ? 'text' : 'password'}
                placeholder="••••••••"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="pr-10 font-mono"
              />
              <button
                type="button"
                onClick={() => setShowNew(!showNew)}
                className="absolute right-3 top-2.5 text-zinc-500 hover:text-zinc-300"
              >
                {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {/* Checklist visual de requisitos (CU31 spec) */}
            {newPassword && (
              <div className="grid grid-cols-2 gap-1 pt-1">
                <PolicyItem met={policies.minLength} label="Mínimo 8 caracteres" />
                <PolicyItem met={policies.hasUpper} label="Una mayúscula" />
                <PolicyItem met={policies.hasLower} label="Una minúscula" />
                <PolicyItem met={policies.hasNumber} label="Un número" />
              </div>
            )}
          </div>

          {/* Campo: Confirmar Nueva Contraseña */}
          <div className="space-y-2">
            <Label>Confirmar Nueva Contraseña</Label>
            <Input
              type="password"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className={`font-mono ${confirmPassword && confirmPassword !== newPassword ? 'border-red-500' : ''}`}
            />
            {confirmPassword && confirmPassword !== newPassword && (
              <p className="text-xs text-red-500">Las contraseñas no coinciden</p>
            )}
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              variant="outline"
              onClick={() => { setCurrentPassword(''); setNewPassword(''); setConfirmPassword('') }}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleChangePassword}
              className="bg-blue-600 hover:bg-blue-700"
              disabled={loading || !allPoliciesMet || newPassword !== confirmPassword || !currentPassword}
            >
              {loading ? 'Guardando...' : 'Guardar Contraseña'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
