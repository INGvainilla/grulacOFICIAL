import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/inicio'
  const type = searchParams.get('type')

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || new URL(request.url).origin

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error) {
      // Si el intercambio es exitoso, redirigimos a la ruta final
      const redirectUrl = new URL(next, baseUrl)
      if (type) {
        redirectUrl.searchParams.set('type', type)
      }
      return NextResponse.redirect(redirectUrl)
    }
  }

  // Si algo falla, redirigimos al login con error
  return NextResponse.redirect(new URL('/login?error=InvalidToken', baseUrl))
}
