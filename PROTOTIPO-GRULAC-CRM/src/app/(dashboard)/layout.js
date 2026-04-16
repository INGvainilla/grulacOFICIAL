import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Sidebar } from '@/components/sidebar'
import { Topbar } from '@/components/topbar'

export default async function DashboardLayout({ children }) {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()

  // Protect all dashboard routes
  if (!session) {
    redirect('/login')
  }

  // Get user profile from DB to pass to UI
  const { data: userData } = await supabase
    .from('usuarios')
    .select(`
      id_usuario,
      email_corporativo,
      empleados ( nombre_completo, cargo ),
      roles ( nombre_rol, permisos_json )
    `)
    .eq('auth_uid', session.user.id)
    .single()

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar user={userData} />
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar user={userData} />
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  )
}
