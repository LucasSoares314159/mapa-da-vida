import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { COOKIE_MAPA_OK, isentoDoGate, opcoesCookieMapaOk } from '@/lib/gate-mapa'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Refresh da sessão — não remova esta chamada
  const { data: { user } } = await supabase.auth.getUser()

  const isAuthRoute = request.nextUrl.pathname.startsWith('/auth')

  if (!user && !isAuthRoute) {
    const url = request.nextUrl.clone()
    url.pathname = '/auth/login'
    return NextResponse.redirect(url)
  }

  // Back office: só os emails listados em ADMIN_EMAILS entram.
  if (request.nextUrl.pathname.startsWith('/admin')) {
    const admins = (process.env.ADMIN_EMAILS ?? '')
      .split(',')
      .map((e) => e.trim().toLowerCase())
      .filter(Boolean)

    if (!user?.email || !admins.includes(user.email.toLowerCase())) {
      const url = request.nextUrl.clone()
      url.pathname = '/content'
      return NextResponse.redirect(url)
    }
  }

  // Gate do primeiro Mapa da Vida: o diagnóstico sustenta todo o método, então
  // nada abre antes dele. O cookie é só cache da resposta — ver lib/gate-mapa.ts.
  if (user && !isentoDoGate(request.nextUrl.pathname)) {
    if (!request.cookies.get(COOKIE_MAPA_OK)) {
      const { count } = await supabase
        .from('mapas')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', user.id)

      if (!count) {
        const url = request.nextUrl.clone()
        url.pathname = '/mapa/novo'
        return NextResponse.redirect(url)
      }

      // Já tem mapa: guarda a resposta para não consultar de novo a cada página.
      supabaseResponse.cookies.set(COOKIE_MAPA_OK, '1', opcoesCookieMapaOk())
    }
  }

  const isRedefinirSenha = request.nextUrl.pathname === '/auth/redefinir-senha'
  const isVerificarEmail = request.nextUrl.pathname === '/auth/verificar-email'

  if (user && isAuthRoute && !isRedefinirSenha && !isVerificarEmail) {
    const url = request.nextUrl.clone()
    url.pathname = '/content'
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}

export const config = {
  matcher: ['/admin', '/admin/:path*', '/dashboard/:path*', '/mapa/:path*', '/auth/:path*', '/rotina/:path*', '/rotina', '/diagnostico/:path*', '/objetivos', '/objetivos/:path*', '/momento', '/momento/:path*', '/content', '/content/:path*'],
}
