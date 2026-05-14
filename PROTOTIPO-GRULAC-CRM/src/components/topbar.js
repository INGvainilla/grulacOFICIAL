'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { LogOut, User, KeyRound, Bell, Menu } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { toast } from 'sonner'
import { SidebarContent } from './sidebar'

export function Topbar({ user }) {
  const router = useRouter()
  const supabase = createClient()
  const [showLogoutDialog, setShowLogoutDialog] = useState(false)
  const [loggingOut, setLoggingOut] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  // CU02: Cerrar Sesión — con Diálogo de Confirmación (Paso 3)
  const handleLogout = async () => {
    setLoggingOut(true)
    try {
      // Paso 5: Registrar LOGOUT en bitacora_auditoria
      if (user?.id_usuario) {
        await supabase.from('bitacora_auditoria').insert([{
          id_usuario: user.id_usuario,
          accion_sql: 'LOGOUT',
          tabla_afectada: 'usuarios',
          registro_id: user.id_usuario,
          new_data: { email: user.email_corporativo, accion: 'Cierre de sesión', timestamp: new Date().toISOString() }
        }])
      }

      // Paso 6: Destruir Token JWT / Paso 7: Redirigir a Login
      await supabase.auth.signOut()
      toast.success('Sesión finalizada de manera segura')
      router.refresh()
      router.push('/login')
    } catch (error) {
      toast.error('Error al cerrar sesión')
    } finally {
      setLoggingOut(false)
      setShowLogoutDialog(false)
    }
  }

  const name = user?.empleados?.nombre_completo || 'Operario'
  const cargo = user?.empleados?.cargo || 'Fábrica'
  const initials = name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()

  return (
    <>
      <header className="h-16 border-b border-border/50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 flex items-center justify-between px-4 md:px-6 sticky top-0 z-40">
        
        <div className="flex items-center md:hidden">
          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetTrigger render={<Button variant="ghost" size="icon" className="mr-2" />}>
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle mobile menu</span>
            </SheetTrigger>
            <SheetContent side="left" className="w-64 p-0 flex flex-col">
              <SidebarContent user={user} onItemClick={() => setIsMobileMenuOpen(false)} />
            </SheetContent>
          </Sheet>
        </div>
        
        {/* Espaciador central para alinear elementos a los extremos */}
        <div className="flex-1" />
        
        {/* Acciones Rápidas (Boundary): Menú de Usuario y Notificaciones */}
        <div className="flex items-center gap-4">
          
          <Button variant="ghost" size="icon" className="text-muted-foreground hidden sm:flex">
            <Bell className="h-5 w-5" />
          </Button>

          <div className="h-8 w-[1px] bg-border/50 hidden sm:block mx-2" />

          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center gap-3 outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-md hover:opacity-80 transition-opacity">
              <div className="flex-col items-end hidden sm:flex">
                <span className="text-sm font-semibold">{name}</span>
                <span className="text-xs text-muted-foreground">{cargo}</span>
              </div>
              <Avatar className="h-9 w-9 border border-border">
                <AvatarFallback className="bg-primary/20 text-primary">{initials}</AvatarFallback>
              </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <div className="px-2 py-1.5 text-xs text-muted-foreground uppercase font-semibold">Mi Cuenta</div>
              <DropdownMenuItem onClick={() => router.push('/perfil')} className="cursor-pointer">
                <User className="mr-2 h-4 w-4" />
                Perfil Técnico
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push('/perfil')} className="cursor-pointer">
                <KeyRound className="mr-2 h-4 w-4" />
                Cambiar Contraseña
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              {/* CU02 Paso 2: Clic en Cerrar Sesión abre diálogo */}
              <DropdownMenuItem 
                onClick={() => setShowLogoutDialog(true)} 
                className="text-destructive focus:text-destructive focus:bg-destructive/10 cursor-pointer"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Cerrar Sesión Segura
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

        </div>
      </header>

      {/* CU02 Paso 3: Diálogo de confirmación */}
      <Dialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg">¿Desea abandonar el área de trabajo?</DialogTitle>
            <DialogDescription>
              Su sesión será cerrada y cualquier progreso no guardado se perderá. 
              Se registrará la hora de salida en la bitácora de auditoría.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setShowLogoutDialog(false)} disabled={loggingOut}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleLogout} disabled={loggingOut}>
              {loggingOut ? 'Cerrando...' : 'Sí, salir'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
