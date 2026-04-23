'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { LayoutDashboard, Users, UserCog, Package, History, Truck, Building2, ShoppingCart } from 'lucide-react'

const MENU_ITEMS = [
  { module: 'inicio', title: 'Panel de Control', href: '/inicio', icon: LayoutDashboard },
  { module: 'empleados', title: 'Empleados (RRHH)', href: '/empleados', icon: Users },
  { module: 'roles', title: 'Roles y Permisos', href: '/roles', icon: UserCog },
  { module: 'catalogo', title: 'Catálogo Maestro', href: '/catalogo', icon: Package },
  { module: 'kardex', title: 'Kardex Dinámico', href: '/kardex', icon: History },
  { module: 'proveedores', title: 'Ganaderos / Proveedores', href: '/proveedores', icon: Truck },
  { module: 'clientes', title: 'Cartera de Clientes', href: '/clientes', icon: Building2 },
]

export function Sidebar({ user }) {
  const pathname = usePathname()
  
  // Basic RBAC filtering for the prototype based on user's role JSON
  // If no user context or permissions are provided, default to full access for demo.
  const permissions = user?.roles?.permisos_json?.modulos || []
  
  const filteredItems = MENU_ITEMS.filter(item => {
    if (permissions.includes('ALL')) return true
    
    // Mapeo de superpoderes según el SQL del usuario
    if (item.module === 'inicio') return true
    if (item.module === 'proveedores' && (permissions.includes('recepcion') || permissions.includes('calidad'))) return true
    if (item.module === 'catalogo' && permissions.includes('produccion')) return true
    if (item.module === 'kardex' && (permissions.includes('produccion') || permissions.includes('almacen'))) return true
    if (item.module === 'clientes' && permissions.includes('ventas')) return true

    return permissions.includes(item.module)
  })

  return (
    <div className="w-64 border-r border-border/50 bg-card hidden md:flex flex-col">
      <div className="h-16 flex items-center px-6 border-b border-border/50 bg-background/50">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary/20 border border-primary/30 flex items-center justify-center font-bold text-primary-foreground text-sm">
            GL
          </div>
          <span className="font-semibold tracking-tight">GRULAC ERP</span>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto py-4">
        <div className="px-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-4">
          Módulos Principales
        </div>
        <nav className="space-y-1 px-2">
          {filteredItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                pathname === item.href 
                  ? "bg-primary text-primary-foreground" 
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.title}
            </Link>
          ))}
        </nav>
      </div>
      
      <div className="p-4 border-t border-border/50 bg-zinc-900/50">
        <div className="text-xs text-zinc-500 font-mono">
          ID: {user?.id_usuario || 'MODO'}
          <br/>
          ROL: {user?.roles?.nombre_rol || 'LOCAL'}
        </div>
      </div>
    </div>
  )
}
