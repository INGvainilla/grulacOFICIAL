/**
 * Punto de entrada principal (Root Entry Point) para la aplicación web.
 * Arquitectura PUDS: Frontera (Boundary) Inicial del Usuario.
 * Este componente evalúa la sesión del usuario para redirigirlo al Módulo de Inicio
 * o al Módulo de Seguridad y Acceso (Login) si no cuenta con autenticación activa.
 */
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export default async function Home() {
  // 1. Instanciamos el cliente de Supabase desde el entorno del Servidor
  const supabase = await createClient()
  
  // 2. Verificamos el estado actual de la sesión del usuario
  const { data: { session } } = await supabase.auth.getSession()

  // 3. Control de flujo de acceso
  if (session) {
    // Si existe una sesión activa, el actor ingresa al panel principal
    redirect('/inicio')
  } else {
    // Si no hay sesión, se fuerza la redirección al flujo de inicio de sesión
    redirect('/login')
  }
}
