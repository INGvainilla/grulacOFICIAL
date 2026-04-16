'use client'

import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { LogOut, User, Settings, Bell } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { toast } from 'sonner'

export function Topbar({ user }) {
  const router = useRouter()
  const supabase = createClient()

  const handleLogout = async () => {
    // Implementación CU02: Cerrar Sesión Activa
    try {
      await supabase.auth.signOut()
      toast.success('Sesión finalizada de manera segura')
      router.refresh()
      router.push('/login')
    } catch (error) {
      toast.error('Error al cerrar sesión')
    }
  }

  const name = user?.empleados?.nombre_completo || 'Operario'
  const cargo = user?.empleados?.cargo || 'Fábrica'
  const initials = name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()

  return (
    <header className="h-16 border-b border-border/50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 flex items-center justify-between px-4 md:px-6 sticky top-0 z-40">
      
      <div className="flex items-center md:hidden">
         {/* Mobile menu trigger would go here */}
      </div>
      
      {/* Spacer / Left side */}
      <div className="flex-1" />
      
      {/* Right Actions */}
      <div className="flex items-center gap-4">
        
        <Button variant="ghost" size="icon" className="text-muted-foreground hidden sm:flex">
          <Bell className="h-5 w-5" />
        </Button>

        <div className="h-8 w-[1px] bg-border/50 hidden sm:block mx-2" />

        <DropdownMenu>
          <DropdownMenuTrigger className="flex items-center gap-3 outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-md hover:opacity-80 transition-opacity">
            <div className="flex flex-col items-end hidden sm:flex">
              <span className="text-sm font-semibold">{name}</span>
              <span className="text-xs text-muted-foreground">{cargo}</span>
            </div>
            <Avatar className="h-9 w-9 border border-border">
              <AvatarFallback className="bg-primary/20 text-primary">{initials}</AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <div className="px-2 py-1.5 text-xs text-muted-foreground uppercase font-semibold">Mi Cuenta</div>
            <DropdownMenuItem>
              <User className="mr-2 h-4 w-4" />
              Perfil Técnico
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Settings className="mr-2 h-4 w-4" />
              Configuraciones
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive focus:bg-destructive/10 cursor-pointer">
              <LogOut className="mr-2 h-4 w-4" />
              Cerrar Sesión Segura
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

      </div>
    </header>
  )
}
