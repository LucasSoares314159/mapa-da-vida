import { createServerSupabaseClient } from '@/lib/supabase-server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/objetivos'

  if (code) {
    const supabase = createServerSupabaseClient()
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      if (next === '/objetivos' && data.user) {
        const { count } = await supabase
          .from('mapas')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', data.user.id)
        return NextResponse.redirect(`${origin}${count && count > 0 ? '/objetivos' : '/content'}`)
      }
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  return NextResponse.redirect(`${origin}/auth/login?error=auth`)
}
