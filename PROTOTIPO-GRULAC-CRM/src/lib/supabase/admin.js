import { createClient } from '@supabase/supabase-js'

// This creates a Supabase client with the SERVICE_ROLE_KEY to bypass RLS and perform admin actions
// It should ONLY be used in server-side code (Server Actions, Route Handlers, etc.)
export const createAdminClient = () => {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  )
}
