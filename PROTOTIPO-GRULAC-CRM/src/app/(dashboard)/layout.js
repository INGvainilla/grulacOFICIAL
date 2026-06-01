import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Sidebar } from '@/components/sidebar'
import { Topbar } from '@/components/topbar'

export default async function DashboardLayout({ children }) {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()

  // Módulo de Seguridad PUDS: Protección de Rutas
  // Verificamos si existe una sesión; si no, el actor es redirigido a la frontera de autenticación
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

  // Consulta a Base de Datos (Entity Layer): Obtención del perfil de usuario y 
  // VERIFICACIÓN DEL ESTADO DE ACCESO (Flujo Alterno E2 del Caso de Uso 01 y CU04).
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

  // Validación de Regla de Negocio: Si el administrador inhabilitó al usuario (CU04),
  // se deniega el acceso y se redirige a la página de inicio de sesión.
  // La página de login se encargará de purgar la sesión al detectar estado_acceso=false.
  if (!userData || userData.estado_acceso === false) {
    redirect('/login')
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <div className="print:hidden">
        <Sidebar user={userData} />
      </div>
      <div className="flex-1 flex flex-col min-w-0">
        <div className="print:hidden">
          <Topbar user={userData} />
        </div>
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 print:p-0">
          {children}
        </main>
      </div>
    </div>
  )
}
