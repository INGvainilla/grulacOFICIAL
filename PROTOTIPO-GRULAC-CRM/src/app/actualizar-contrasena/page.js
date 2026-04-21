'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { Check, X, ShieldCheck } from 'lucide-react'

// CU32: Recuperar Contraseña Olvidada — Paso 2: Establecer nueva contraseña
export default function ActualizarContrasenaPage() {
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  // Supabase pasa el token via hash fragment
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event) => {
      if (event === 'PASSWORD_RECOVERY') {
        // Usuario llegó del link del email — autenticado temporalmente
      }
    })
    return () => subscription.unsubscribe()
  }, [])

  // Validación de política de seguridad (misma que CU31)
  const policies = useMemo(() => ({
    minLength: newPassword.length >= 8,
    hasUpper: /[A-Z]/.test(newPassword),
    hasLower: /[a-z]/.test(newPassword),
    hasNumber: /[0-9]/.test(newPassword),
  }), [newPassword])

  const allPoliciesMet = policies.minLength && policies.hasUpper && policies.hasLower && policies.hasNumber

  const handleUpdatePassword = async () => {
    if (!allPoliciesMet) {
      toast.error('La contraseña no cumple los requisitos de seguridad')
      return
    }
    if (newPassword !== confirmPassword) {
      toast.error('Las contraseñas no coinciden')
      return
    }

    setLoading(true)

    // Paso 11-12: Actualizar contraseña y resetear intentos_fallidos
    const { error } = await supabase.auth.updateUser({ password: newPassword })

    if (error) {
      if (error.message.includes('expired') || error.message.includes('invalid')) {
        // E3: Token expirado
        toast.error('El enlace ha expirado. Solicite uno nuevo.')
      } else {
        toast.error('Error al actualizar contraseña', { description: error.message })
      }
      setLoading(false)
      return
    }

    // Resetear intentos_fallidos del usuario
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data: userData } = await supabase
          .from('usuarios')
          .select('id_usuario')
          .eq('auth_uid', user.id)
          .single()

        if (userData) {
          await supabase
            .from('usuarios')
            .update({ intentos_fallidos: 0 })
            .eq('id_usuario', userData.id_usuario)

          // Paso 13: Registrar evento en bitácora
          await supabase.from('bitacora_auditoria').insert([{
            id_usuario: userData.id_usuario,
            accion_sql: 'RESET_PASSWORD',
            tabla_afectada: 'usuarios',
            new_data: { timestamp: new Date().toISOString() }
          }])
        }
      }
    } catch (_) { /* silencioso */ }

    setSuccess(true)
    setLoading(false)

    // Paso 14: Redirigir al login tras 3 segundos
    toast.success('Contraseña restablecida. Inicie sesión con su nueva clave.')
    setTimeout(() => router.push('/login'), 3000)
  }

  const PolicyItem = ({ met, label }) => (
    <div className={`flex items-center gap-2 text-xs transition-colors ${met ? 'text-emerald-400' : 'text-zinc-500'}`}>
      {met ? <Check className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />}
      {label}
    </div>
  )

  return (
    <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden p-6">
      <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] bg-primary/20 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute -bottom-[20%] -right-[10%] w-[50%] h-[50%] bg-blue-600/10 blur-[120px] rounded-full pointer-events-none" />

      <div className="w-full max-w-[420px] z-10">
        <Card className="border-border/40 bg-card/60 backdrop-blur-2xl shadow-2xl overflow-hidden rounded-2xl">
          <div className="h-1 w-full bg-gradient-to-r from-blue-600 to-primary" />
          <CardHeader className="space-y-3 pb-4 pt-8">
            <div className="w-16 h-16 bg-primary/20 rounded-2xl mx-auto flex items-center justify-center border border-primary/30 mb-2">
              <ShieldCheck className="w-8 h-8 text-primary" />
            </div>
            <CardTitle className="text-2xl font-bold tracking-tight text-center">
              {success ? 'Contraseña Restablecida' : 'Nueva Contraseña'}
            </CardTitle>
            <CardDescription className="text-center text-zinc-400">
              {success 
                ? 'Será redirigido al inicio de sesión en unos segundos...'
                : 'Establezca su nueva contraseña cumpliendo las políticas de seguridad.'
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!success && (
              <div className="space-y-5">
                <div className="space-y-2">
                  <Label>Nueva Contraseña</Label>
                  <Input
                    type="password"
                    placeholder="••••••••"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="font-mono"
                  />
                  {newPassword && (
                    <div className="grid grid-cols-2 gap-1 pt-1">
                      <PolicyItem met={policies.minLength} label="Mínimo 8 caracteres" />
                      <PolicyItem met={policies.hasUpper} label="Una mayúscula" />
                      <PolicyItem met={policies.hasLower} label="Una minúscula" />
                      <PolicyItem met={policies.hasNumber} label="Un número" />
                    </div>
                  )}
                </div>
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
                <Button
                  onClick={handleUpdatePassword}
                  className="w-full h-12 text-base font-medium"
                  disabled={loading || !allPoliciesMet || newPassword !== confirmPassword}
                >
                  {loading ? 'Actualizando...' : 'Restablecer Contraseña'}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
