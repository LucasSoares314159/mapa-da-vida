import { createClient } from '@supabase/supabase-js'

// Cliente com service role — bypassa RLS, nunca expor no client-side
export function createAdminSupabaseClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}
