/**
 * Gate do primeiro Mapa da Vida.
 *
 * O Mapa é o diagnóstico que sustenta todo o método, então nada na plataforma
 * abre antes do primeiro. O middleware precisa saber se o usuário já fez o seu —
 * e consultar o banco em toda navegação de todo mundo sairia caro.
 *
 * Daí o cookie: ele é apenas **cache** da resposta "esse usuário já tem mapa".
 * Nunca é autoridade. Quem o forjar apenas evita um redirect de navegação; não
 * ganha mapa, diagnóstico nem dado algum, porque cada página continua lendo do
 * banco com RLS. É por isso que ele pode ser um cookie simples.
 */
export const COOKIE_MAPA_OK = 'mapa_ok'

/** Rotas que o gate nunca redireciona, para o fluxo não travar a si mesmo. */
export function isentoDoGate(pathname: string): boolean {
  return (
    // O próprio fluxo do Mapa: redirecionar aqui seria um laço infinito.
    pathname.startsWith('/mapa') ||
    pathname.startsWith('/auth') ||
    pathname.startsWith('/api') ||
    // Back office: quem dá suporte precisa entrar sem fazer o próprio
    // diagnóstico. A rota já é protegida por ADMIN_EMAILS.
    pathname.startsWith('/admin')
  )
}

export function opcoesCookieMapaOk() {
  return {
    httpOnly: true,
    sameSite: 'lax' as const,
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 24 * 365, // 1 ano
  }
}
