'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function Home() {
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      router.replace(session ? '/inicio' : '/login')
    }).catch(() => {
      router.replace('/login')
    })
  }, [])

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4">
        <div className="w-8 h-8 rounded-lg bg-primary/20 border border-primary/30 flex items-center justify-center font-bold text-primary-foreground text-sm animate-pulse">
          GL
        </div>
        <p className="text-sm text-muted-foreground">Redirigiendo...</p>
      </div>
    </div>
  )
}
