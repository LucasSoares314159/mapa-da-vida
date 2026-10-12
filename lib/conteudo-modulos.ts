import { createAdminSupabaseClient } from './supabase-admin'

// Blocos do conteúdo escrito de um módulo. Cobre o que existia no material
// migrado do Notion: parágrafo, título, listas, checklist, callout, trecho em
// destaque, imagem, divisor e citação com fonte — mais o embed de quadro
// interativo (Excalidraw), que o material do Notion não tinha.
export type Bloco =
  | { tipo: 'paragrafo'; texto: string }
  | { tipo: 'titulo'; nivel: 2 | 3; texto: string }
  | { tipo: 'lista'; itens: string[] }
  | { tipo: 'checklist'; itens: string[] }
  | { tipo: 'callout'; icone: string; texto: string }
  | { tipo: 'destaque'; cor: 'verde' | 'amarelo' | 'vermelho' | 'cinza'; texto: string }
  | { tipo: 'imagem'; url: string; legenda?: string }
  | { tipo: 'divisor' }
  | { tipo: 'citacao'; texto: string; fonte?: string }
  | { tipo: 'embed'; url: string; altura?: number; legenda?: string }

/**
 * Domínios aceitos no bloco de embed. O bloco monta um iframe, então uma URL
 * arbitrária seria execução de terceiro dentro da aula: a allowlist é o que
 * mantém o editor do admin incapaz de injetar origem desconhecida, mesmo por
 * engano ao colar. Para liberar outro serviço, adicione o host aqui.
 */
export const HOSTS_EMBED = ['link.excalidraw.com', 'excalidraw.com'] as const

export const ALTURA_EMBED_PADRAO = 480

/** URL https de host da allowlist. Devolve null (não lança) para o editor exibir erro. */
export function normalizarUrlEmbed(url: string): string | null {
  let parsed: URL
  try {
    parsed = new URL(url.trim())
  } catch {
    return null
  }

  if (parsed.protocol !== 'https:') return null
  if (!HOSTS_EMBED.includes(parsed.hostname as (typeof HOSTS_EMBED)[number])) return null

  return parsed.toString()
}

export function blocoVazio(tipo: Bloco['tipo']): Bloco {
  return blocoComTexto(tipo, '')
}

/** Cria um bloco do tipo dado já preenchido com o texto informado (ex: uma seleção). */
export function blocoComTexto(tipo: Bloco['tipo'], texto: string): Bloco {
  switch (tipo) {
    case 'paragrafo':
      return { tipo, texto }
    case 'titulo':
      return { tipo, nivel: 2, texto }
    case 'lista':
      return { tipo, itens: itensDe(texto) }
    case 'checklist':
      return { tipo, itens: itensDe(texto) }
    case 'callout':
      return { tipo, icone: '💡', texto }
    case 'destaque':
      return { tipo, cor: 'verde', texto }
    case 'imagem':
      return { tipo, url: '', legenda: texto }
    case 'divisor':
      return { tipo }
    case 'citacao':
      return { tipo, texto, fonte: '' }
    case 'embed':
      return { tipo, url: '', altura: ALTURA_EMBED_PADRAO, legenda: texto }
  }
}

/** Cada linha não vazia vira um item — útil ao transformar uma seleção em lista. */
function itensDe(texto: string): string[] {
  const itens = texto.split('\n').map((l) => l.trim()).filter(Boolean)
  return itens.length > 0 ? itens : ['']
}

/**
 * O texto restante do rascunho vira UM único bloco de parágrafo, preservando
 * as quebras de linha internas — a leitura trata cada linha em branco como um
 * parágrafo visual, mas o editor não fragmenta em dezenas de blocos.
 */
export function paragrafosDe(texto: string): Bloco[] {
  const limpo = texto.trim()
  return limpo ? [{ tipo: 'paragrafo', texto: limpo }] : []
}

export async function getConteudoModulo(moduloId: string): Promise<Bloco[]> {
  const sb = createAdminSupabaseClient()
  const { data } = await sb
    .from('modulos_conteudo')
    .select('blocos')
    .eq('modulo_id', moduloId)
    .single()

  return (data?.blocos as Bloco[] | undefined) ?? []
}

export async function salvarConteudoModulo(moduloId: string, blocos: Bloco[]): Promise<void> {
  const sb = createAdminSupabaseClient()
  const { error } = await sb
    .from('modulos_conteudo')
    .upsert(
      { modulo_id: moduloId, blocos, atualizado_em: new Date().toISOString() },
      { onConflict: 'modulo_id' }
    )

  if (error) throw error
}
