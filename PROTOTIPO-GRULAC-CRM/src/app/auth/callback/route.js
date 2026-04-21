import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/inicio'

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error) {
      // Si el intercambio es exitoso, redirigimos a la ruta final
      return NextResponse.redirect(new URL(next, request.url))
    }
  }

  // Si algo falla, redirigimos al login con error
  return NextResponse.redirect(new URL('/login?error=InvalidToken', request.url))
}
