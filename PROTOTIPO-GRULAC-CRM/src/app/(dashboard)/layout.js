import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Sidebar } from '@/components/sidebar'
import { Topbar } from '@/components/topbar'

export default async function DashboardLayout({ children }) {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()

  // Protect all dashboard routes — redirect to login if no session
  if (!session) {
    redirect('/login')
  }

  // GUARDIA MAESTRA (Anti-Bypass de Magic Links):
  // Si la sesión proviene de un enlace de recuperación o invitación, el usuario
  // no ha pasado por el Login oficial y no ha dejado rastro en la bitácora.
  // Lo encerramos en la pantalla de actualizar contraseña.
  const isRecoverySession = session.user?.amr?.some(auth => auth.method === 'recovery' || auth.method === 'invite')
  if (isRecoverySession) {
    redirect('/actualizar-contrasena')
  }

  // Get user profile from DB and VERIFY estado_acceso (CU01 E2 + CU04)
  const { data: userData } = await supabase
    .from('usuarios')
    .select(`
      id_usuario,
      email_corporativo,
      estado_acceso,
      empleados ( nombre_completo, cargo ),
      roles ( nombre_rol, permisos_json )
    `)
    .eq('auth_uid', session.user.id)
    .single()

  // If user was disabled by admin (CU04), force logout and redirect
  if (!userData || userData.estado_acceso === false) {
    // Can't call signOut from server component reliably, so redirect to login
    // The login page will handle the signOut when it detects estado_acceso=false
    redirect('/login')
  }

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
