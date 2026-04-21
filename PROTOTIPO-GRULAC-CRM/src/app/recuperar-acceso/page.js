'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { Mail, ArrowLeft } from 'lucide-react'

// CU32: Recuperar Contraseña Olvidada — Paso 1: Solicitar enlace
export default function RecuperarAccesoPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const supabase = createClient()

  const handleSendReset = async (e) => {
    e.preventDefault()
    if (!email.trim()) {
      toast.error('Debe ingresar su email corporativo')
      return
    }

    setLoading(true)

    // E1/E2: Por seguridad NO revelamos si el email existe o no
    // Supabase resetPasswordForEmail envía el email solo si existe
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/actualizar-contrasena`,
    })

    if (error) {
      // Aún así mostramos mensaje genérico (E1)
      console.error('Reset error:', error)
    }

    // Paso 7: Siempre mostrar el mismo mensaje genérico
    setSent(true)
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex w-full bg-background relative overflow-hidden">
      {/* Background */}
      <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] bg-primary/20 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute -bottom-[20%] -right-[10%] w-[50%] h-[50%] bg-blue-600/10 blur-[120px] rounded-full pointer-events-none" />

      {/* Pane Izquierdo */}
      <div className="hidden lg:flex flex-1 relative bg-zinc-900 border-r border-border/50 items-center justify-center">
        <div className="absolute inset-0 opacity-20 bg-[url('https://images.unsplash.com/photo-1628186105847-f378d380e557?q=80&w=2072&auto=format&fit=crop')] bg-cover bg-center mix-blend-luminosity grayscale" />
        <div className="relative z-10 text-center space-y-6 max-w-lg p-8">
          <div className="w-24 h-24 bg-primary/20 backdrop-blur-md rounded-2xl mx-auto flex items-center justify-center border border-primary/30 shadow-2xl">
            <span className="text-3xl font-black tracking-tighter text-primary-foreground">GL</span>
          </div>
          <h1 className="text-5xl font-bold tracking-tight text-white drop-shadow-lg">GRULAC S.R.L.</h1>
          <p className="text-xl text-zinc-400 font-medium">Sistema Integrado ERP & Trazabilidad SENASAG</p>
        </div>
      </div>

      {/* Pane Derecho */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 sm:p-12 z-10">
        <div className="w-full max-w-[420px] space-y-8">

          <Card className="border-border/40 bg-card/60 backdrop-blur-2xl shadow-2xl overflow-hidden rounded-2xl">
            <div className="h-1 w-full bg-gradient-to-r from-blue-600 to-primary" />
            <CardHeader className="space-y-3 pb-4 pt-8">
              <CardTitle className="text-2xl font-bold tracking-tight text-center">Recuperar Acceso</CardTitle>
              <CardDescription className="text-center text-zinc-400">
                {sent 
                  ? 'Hemos enviado un enlace de recuperación a su correo corporativo. El enlace expira en 5 minutos.'
                  : 'Ingrese su email corporativo y le enviaremos un enlace seguro.'
                }
              </CardDescription>
            </CardHeader>
            <CardContent>
              {sent ? (
                <div className="space-y-4">
                  <div className="text-center py-6">
                    <Mail className="w-16 h-16 mx-auto text-blue-400 mb-4" />
                    <p className="text-sm text-zinc-400">
                      Revise su bandeja de entrada. Si no recibe el correo en 5 minutos, verifique la carpeta de spam.
                    </p>
                  </div>
                  <Link href="/login">
                    <Button variant="outline" className="w-full gap-2">
                      <ArrowLeft className="w-4 h-4" />
                      Volver al Inicio de Sesión
                    </Button>
                  </Link>
                </div>
              ) : (
                <form onSubmit={handleSendReset} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Email Corporativo</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
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
                  <Button type="submit" className="w-full h-12 text-base font-medium" disabled={loading}>
                    {loading ? 'Enviando...' : 'Enviar Enlace de Recuperación'}
                  </Button>
                </form>
              )}

              {!sent && (
                <div className="mt-4 text-center">
                  <Link href="/login" className="text-sm text-zinc-500 hover:text-zinc-300 inline-flex items-center gap-1.5">
                    <ArrowLeft className="w-3.5 h-3.5" />
                    Volver al Inicio de Sesión
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
