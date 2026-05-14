'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { LayoutDashboard, Users, UserCog, Package, History, Truck, Building2, ShoppingCart, FlaskConical } from 'lucide-react'

export const PACKAGES = [
  {
    id: 'p1',
    name: 'General',
    items: [
      { module: 'inicio', title: 'Panel de Control', href: '/inicio', icon: LayoutDashboard }
    ]
  },
  {
    id: 'p2',
    name: 'Gestión de Usuario',
    items: [
      { module: 'empleados', title: 'Empleados (RRHH)', href: '/empleados', icon: Users },
      { module: 'roles', title: 'Roles y Permisos', href: '/roles', icon: UserCog },
    ]
  },
  {
    id: 'p3',
    name: 'Gestión de Inventario',
    items: [
      { module: 'catalogo', title: 'Catálogo Maestro', href: '/catalogo', icon: Package },
      { module: 'kardex', title: 'Kardex Dinámico', href: '/kardex', icon: History },
    ]
  },
  {
    id: 'p4',
    name: 'Gestión Comercial',
    items: [
      { module: 'clientes', title: 'Cartera de Clientes', href: '/clientes', icon: Building2 },
    ]
  },
  {
    id: 'p5',
    name: 'Proveedores y Compras',
    items: [
      { module: 'proveedores', title: 'Ganaderos / Proveedores', href: '/proveedores', icon: Truck },
      { module: 'compras', title: 'Compras e Insumos', href: '/compras', icon: ShoppingCart },
    ]
  },
  {
    id: 'p6',
    name: 'Acopio y Formulación',
    items: [
      { module: 'acopio', title: 'Acopio y Triage', href: '/acopio', icon: Truck },
      { module: 'recetas', title: 'Recetas BOM', href: '/recetas', icon: FlaskConical },
    ]
  }
]

export function SidebarContent({ user, onItemClick }) {
  const pathname = usePathname()
  
  // Módulo de Seguridad (Capa de Control PUDS): Filtro Básico RBAC
  // Se evalúan los privilegios de la sesión; si no existen, se asume un rol de demostración.
  const permissions = user?.roles?.permisos_json?.modulos || []
  
  const isAllowed = (item) => {
    if (permissions.includes('ALL')) return true
    
    // Mapeo de superpoderes según el SQL del usuario
    if (item.module === 'inicio') return true
    if (item.module === 'proveedores' && (permissions.includes('recepcion') || permissions.includes('calidad'))) return true
    if (item.module === 'catalogo' && permissions.includes('produccion')) return true
    if (item.module === 'kardex' && (permissions.includes('produccion') || permissions.includes('almacen'))) return true
    if (item.module === 'clientes' && permissions.includes('ventas')) return true
    if (['compras', 'acopio', 'recetas'].includes(item.module) && (permissions.includes('recepcion') || permissions.includes('produccion'))) return true

    return permissions.includes(item.module)
  }

  // Capa de Presentación (Boundary Layer): 
  // Filtrar los módulos y mostrar únicamente aquellos autorizados, omitiendo los vacíos.
  const filteredPackages = PACKAGES.map(pkg => ({
    ...pkg,
    items: pkg.items.filter(isAllowed)
  })).filter(pkg => pkg.items.length > 0)

  return (
    <>
      <div className="h-16 flex items-center px-6 border-b border-border/50 bg-background/50 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary/20 border border-primary/30 flex items-center justify-center font-bold text-primary-foreground text-sm">
            GL
          </div>
          <span className="font-semibold tracking-tight">GRULAC ERP</span>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto py-4">
        {filteredPackages.map((pkg) => (
          <div key={pkg.id} className="mb-6">
            <div className="px-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70 mb-2">
              {pkg.name}
            </div>
            <nav className="space-y-1 px-2">
              {pkg.items.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onItemClick}
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
        ))}
      </div>
      
      <div className="p-4 border-t border-border/50 bg-zinc-900/50 flex-shrink-0">
        <div className="text-xs text-zinc-500 font-mono">
          ID: {user?.id_usuario || 'MODO'}
          <br/>
          ROL: {user?.roles?.nombre_rol || 'LOCAL'}
        </div>
      </div>
    </>
  )
}

export function Sidebar({ user }) {
  return (
    <div className="w-64 border-r border-border/50 bg-card hidden md:flex flex-col">
      <SidebarContent user={user} />
    </div>
  )
}
