'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { toast } from 'sonner'
import { Lock, User } from 'lucide-react'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleLogin = async (e) => {
    e.preventDefault()

    // Excepción E3: Verificar bloqueo previo
    const lockTime = localStorage.getItem('login_lock_until')
    if (lockTime && new Date().getTime() < parseInt(lockTime)) {
      const remainingMinutes = Math.ceil((parseInt(lockTime) - new Date().getTime()) / 60000)
      toast.error('Sistema bloqueado', {
        description: `Demasiados intentos fallidos. Intente nuevamente en ${remainingMinutes} minutos.`
      })
      return
    }

    setLoading(true)

    const { data: authData, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      // Excepción E3: Rastreo de intentos fallidos
      let attempts = parseInt(localStorage.getItem('login_attempts') || '0')
      attempts += 1
      
      if (attempts >= 3) {
        // Bloquear por 15 minutos (15 * 60 * 1000 ms)
        const lockUntil = new Date().getTime() + 15 * 60 * 1000
        localStorage.setItem('login_lock_until', lockUntil.toString())
        localStorage.setItem('login_attempts', '0')
        
        // Registrar en bitácora de auditoría
        try {
          await supabase.from('bitacora_auditoria').insert([{
            accion_sql: 'ACCESS_LOCKED',
            tabla_afectada: 'usuarios',
            new_data: { email_target: email, reason: '3 failed attempts' }
          }])
        } catch(err) {
          // Fallo silencioso si la bitácora falla
        }

        toast.error('Bloqueo de seguridad activado', {
          description: 'Ha excedido el número máximo de intentos. Comuníquese con Gerencia o espere 15 minutos.'
        })
      } else {
        localStorage.setItem('login_attempts', attempts.toString())
        toast.error('Credenciales incorrectas', {
          description: `Intento fallido ${attempts}/3. Reintente.`
        })
      }
      setLoading(false)
      return
    }

    // Excepción E2: Verificar si el empleado está inhabilitado por gerencia
    if (authData?.user) {
      const { data: userData } = await supabase
        .from('usuarios')
        .select(`estado_acceso, roles(nombre_rol)`)
        .eq('auth_uid', authData.user.id)
        .single()

      if (userData && userData.estado_acceso === false) {
        await supabase.auth.signOut()
        toast.error('Acceso Restringido', {
          description: 'Usted no está autorizado por Gerencia.'
        })
        setLoading(false)
        return
      }

      // Limpiar intentos si la autenticación es exitosa
      localStorage.removeItem('login_attempts')
      localStorage.removeItem('login_lock_until')

      toast.success('Sesión iniciada con éxito')
      router.refresh()

      // Redirección condicional (por rol)
      const rol = userData?.roles?.nombre_rol?.toLowerCase() || ''
      if (rol.includes('recepción') || rol.includes('recepcion')) {
        router.push('/recepcion')
      } else if (rol.includes('calidad')) {
        router.push('/calidad')
      } else if (rol.includes('almacén') || rol.includes('almacen')) {
        router.push('/kardex')
      } else {
        router.push('/inicio') // Default dashboard
      }
    } else {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex w-full bg-background relative overflow-hidden">
      {/* Background Decorativo Glassmorphism */}
      <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] bg-primary/20 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute -bottom-[20%] -right-[10%] w-[50%] h-[50%] bg-blue-600/10 blur-[120px] rounded-full pointer-events-none" />

      {/* Pane Izquierdo (Imagen Placeholder) */}
      <div className="hidden lg:flex flex-1 relative bg-zinc-900 border-r border-border/50 items-center justify-center">
        {/* Placeholder para la fotografía elegante de tambero/quesos */}
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
            <Badge variant="outline" className="bg-background/20 backdrop-blur-md border-border/50 text-zinc-300">Planta Sur</Badge>
            <Badge variant="outline" className="bg-background/20 backdrop-blur-md border-border/50 text-zinc-300">Km 102</Badge>
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
                    <Label htmlFor="email" className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">ID Corporativo</Label>
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
                    <Label htmlFor="password" className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Contraseña Segura</Label>
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
function Badge({ variant = "default", className, ...props }) {
  const base = "inline-flex items-center rounded-md px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
  const variants = {
    default: "bg-primary text-primary-foreground hover:bg-primary/80",
    outline: "text-foreground",
  }
  return <div className={`${base} ${variants[variant]} ${className}`} {...props} />
}
