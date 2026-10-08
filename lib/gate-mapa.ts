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

/**
 * Data a partir da qual o gate passa a valer, por `profiles.criado_em`.
 *
 * O gate nasceu junto com o Mapa conversacional, quando 7 dos 16 alunos pagantes
 * ainda não tinham mapa algum — dois deles da Turma 1, de junho e julho. Aplicar
 * a regra a todos trancaria quem já pagou fora da plataforma até responder 9
 * perguntas com observação obrigatória, para corrigir uma ausência que o produto
 * nunca tinha exigido deles. Quem entra a partir daqui conhece o Mapa como porta
 * de entrada; quem já estava dentro continua sendo convidado, não barrado.
 *
 * Mudar esta data reabre ou fecha o gate retroativamente — é o único botão.
 */
export const GATE_VALE_DESDE = new Date('2026-10-08T00:00:00Z')

/**
 * O gate vale para esta conta?
 *
 * Em dúvida responde `false`: sem data legível, deixar navegar é melhor que
 * trancar um cliente por um dado que não deu para ler.
 */
export function gateValeParaConta(criadoEm: string | null | undefined): boolean {
  if (!criadoEm) return false
  const criado = new Date(criadoEm)
  if (Number.isNaN(criado.getTime())) return false
  return criado >= GATE_VALE_DESDE
}
