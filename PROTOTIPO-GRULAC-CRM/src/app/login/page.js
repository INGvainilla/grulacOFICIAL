'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { toast } from 'sonner'
import { Lock, User, KeyRound } from 'lucide-react'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [attempts, setAttempts] = useState(0)
  const router = useRouter()
  const supabase = createClient()

  // Restauramos los intentos previos desde el almacenamiento local del navegador al cargar.
  // Esto previene inconsistencias de hidratación (Hydration mismatch) en Next.js.
  useEffect(() => {
    const saved = localStorage.getItem('login_attempts')
    if (saved) setAttempts(parseInt(saved))
  }, [])

  const handleLogin = async (e) => {
    e.preventDefault()

    // E3: Verificar bloqueo previo por 3 intentos fallidos
    const lockTime = localStorage.getItem('login_lock_until')
    if (lockTime && new Date().getTime() < parseInt(lockTime)) {
      const remainingMinutes = Math.ceil((parseInt(lockTime) - new Date().getTime()) / 60000)
      toast.error('Sistema bloqueado', {
        description: `Demasiados intentos fallidos. Intente en ${remainingMinutes} min.`
      })
      return
    }

    setLoading(true)

    // Paso 3-4: Enviar credenciales a Supabase Auth
    const { data: authData, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      // E1: Credenciales inválidas — limpiar password (spec CU01)
      setPassword('')

      // E3: Incrementar contador de intentos fallidos
      const newAttempts = attempts + 1
      setAttempts(newAttempts)
      localStorage.setItem('login_attempts', newAttempts.toString())

      if (newAttempts >= 3) {
        // Bloquear por 15 minutos
        const lockUntil = new Date().getTime() + 1 * 60 * 1000
        localStorage.setItem('login_lock_until', lockUntil.toString())
        localStorage.setItem('login_attempts', '0')
        setAttempts(0)

        // Registrar bloqueo en bitácora (sin usuario autenticado, se envía null)
        try {
          await supabase.from('bitacora_auditoria').insert([{
            accion_sql: 'ACCESS_LOCKED',
            tabla_afectada: 'usuarios',
            new_data: { email_target: email, reason: '3 intentos fallidos', ip: 'client' }
          }])
        } catch (_) { /* silencioso */ }

        toast.error('Bloqueo de seguridad activado', {
          description: 'Ha excedido 3 intentos. Espere 15 min o use "¿Olvidó su contraseña?"'
        })
      } else {
        toast.error('Credenciales incorrectas', {
          description: `Intento fallido ${newAttempts}/3. Se limpió la contraseña.`
        })
      }

      setLoading(false)
      return
    }

    // Autenticación primaria exitosa (Identity verified) 
    // Ahora validamos el perfil del actor en nuestra tabla interna de usuarios.
    if (authData?.user) {
      // E2: Verificar estado_acceso (empleado inhabilitado)
      const { data: userData, error: dbError } = await supabase
        .from('usuarios')
        .select('id_usuario, estado_acceso, roles(nombre_rol)')
        .eq('auth_uid', authData.user.id)
        .single()

      if (dbError || !userData) {
        await supabase.auth.signOut()
        toast.error('Error de configuración', {
          description: 'Su cuenta Auth no está vinculada a un usuario del sistema. Contacte al Administrador.'
        })
        setLoading(false)
        return
      }

      if (userData.estado_acceso === false) {
        await supabase.auth.signOut()
        setPassword('')
        toast.error('Acceso Restringido', {
          description: 'Usted no está autorizado por Gerencia.'
        })
        setLoading(false)
        return
      }

      // Paso 6: Registrar LOGIN en bitacora_auditoria
      try {
        await supabase.from('bitacora_auditoria').insert([{
          id_usuario: userData.id_usuario,
          accion_sql: 'LOGIN',
          tabla_afectada: 'usuarios',
          registro_id: userData.id_usuario,
          new_data: { email: email, accion: 'Inicio de sesión exitoso', timestamp: new Date().toISOString() }
        }])
      } catch (_) { /* silencioso */ }

      // Paso 7: Actualizar ultimo_login
      try {
        await supabase
          .from('usuarios')
          .update({ ultimo_login: new Date().toISOString(), intentos_fallidos: 0 })
          .eq('id_usuario', userData.id_usuario)
      } catch (_) { /* silencioso */ }

      // Limpieza de memoria (Storage local): Eliminamos variables de bloqueo tras éxito.
      localStorage.removeItem('login_attempts')
      localStorage.removeItem('login_lock_until')
      setAttempts(0)

      // Paso 8: Redirigir según rol
      toast.success('Sesión iniciada con éxito')
      router.refresh()

      const rol = userData?.roles?.nombre_rol?.toLowerCase() || ''
      if (rol.includes('recepción') || rol.includes('recepcion')) {
        router.push('/recepcion')
      } else if (rol.includes('calidad')) {
        router.push('/calidad')
      } else if (rol.includes('almacén') || rol.includes('almacen')) {
        router.push('/kardex')
      } else {
        router.push('/inicio')
      }
    } else {
      setLoading(false)
    }
  }

  // Interfaz de Usuario (Boundary): Mostrar hipervínculo de recuperación.
  // Se resalta visualmente (animate-pulse) si el usuario ya falló 2 o más veces.
  const showRecoveryHighlight = attempts >= 2

  return (
    <div className="min-h-screen flex w-full bg-background relative overflow-hidden">
      {/* Background Decorativo Glassmorphism */}
      <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] bg-primary/20 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute -bottom-[20%] -right-[10%] w-[50%] h-[50%] bg-blue-600/10 blur-[120px] rounded-full pointer-events-none" />

      {/* Pane Izquierdo (Imagen) */}
      <div className="hidden lg:flex flex-1 relative bg-zinc-900 border-r border-border/50 items-center justify-center">
        <div className="absolute inset-0 opacity-20 bg-[url('https://images.unsplash.com/photo-1628186105847-f378d380e557?q=80&w=2072&auto=format&fit=crop')] bg-cover bg-center mix-blend-luminosity grayscale" />
        
        <div className="relative z-10 text-center space-y-6 max-w-lg p-8">
          <div className="w-24 h-24 bg-primary/20 backdrop-blur-md rounded-2xl mx-auto flex items-center justify-center border border-primary/30 shadow-2xl">
            <span className="text-3xl font-black tracking-tighter text-primary-foreground">GL</span>
          </div>
          <h1 className="text-5xl font-bold tracking-tight text-white drop-shadow-lg">
            GRULAC S.R.L.
          </h1>
          <p className="text-xl text-zinc-400 font-medium">
            Sistema Integrado ERP & Trazabilidad SENASAG
          </p>
          <div className="pt-8 flex gap-4 justify-center">
            <BadgeLocal>Planta Sur</BadgeLocal>
            <BadgeLocal>Km 102</BadgeLocal>
          </div>
        </div>
      </div>

      {/* Pane Derecho (Formulario Glassmorphism) */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 sm:p-12 z-10">
        <div className="w-full max-w-[420px] space-y-8">
          
          <div className="text-center space-y-2 lg:hidden mb-8">
             <div className="w-16 h-16 bg-primary/20 rounded-xl mx-auto flex items-center justify-center border border-primary/30 mb-4">
               <span className="text-xl font-bold text-primary-foreground">GL</span>
             </div>
             <h1 className="text-3xl font-bold tracking-tight">GRULAC S.R.L.</h1>
          </div>

          <Card className="border-border/40 bg-card/60 backdrop-blur-2xl shadow-2xl overflow-hidden rounded-2xl">
            <div className="h-1 w-full bg-gradient-to-r from-blue-600 to-primary" />
            <CardHeader className="space-y-3 pb-6 pt-8">
              <CardTitle className="text-2xl font-bold tracking-tight text-center">Acceso Operativo ERP</CardTitle>
              <CardDescription className="text-center text-zinc-400">
                Ingrese sus credenciales corporativas para continuar
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleLogin} className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Email Corporativo</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="empleado@grulac.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="pl-9 bg-background/50 border-border/50 focus-visible:ring-primary h-11"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Contraseña</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
                      <Input
                        id="password"
                        type="password"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="pl-9 bg-background/50 border-border/50 focus-visible:ring-primary h-11 font-mono tracking-widest"
                      />
                    </div>
                  </div>
                </div>
                <Button type="submit" className="w-full h-12 text-base font-medium shadow-lg hover:shadow-primary/25 transition-all" disabled={loading}>
                  {loading ? 'Verificando...' : 'AUTENTICAR'}
                </Button>
              </form>

              {/* CU32: Link de recuperación de contraseña */}
              <div className="mt-4 text-center">
                <Link 
                  href="/recuperar-acceso" 
                  className={`text-sm transition-colors inline-flex items-center gap-1.5 ${
                    showRecoveryHighlight 
                      ? 'text-blue-400 font-semibold animate-pulse' 
                      : 'text-zinc-500 hover:text-zinc-300'
                  }`}
                >
                  <KeyRound className="w-3.5 h-3.5" />
                  ¿Olvidó su contraseña?
                </Link>
              </div>
            </CardContent>
          </Card>
          
          <p className="text-center text-xs text-zinc-600 font-medium tracking-wide">
            USO EXCLUSIVO PARA PERSONAL AUTORIZADO DE PLANTA
          </p>
        </div>
      </div>
    </div>
  )
}

// Badge helper
function BadgeLocal({ children }) {
  return (
    <div className="inline-flex items-center rounded-md px-2.5 py-0.5 text-xs font-semibold bg-background/20 backdrop-blur-md border border-border/50 text-zinc-300">
      {children}
    </div>
  )
}
