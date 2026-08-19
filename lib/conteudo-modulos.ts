import { createAdminSupabaseClient } from './supabase-admin'

// Blocos do conteúdo escrito de um módulo. Cobre o que existia no material
// migrado do Notion: parágrafo, título, listas, checklist, callout, trecho em
// destaque, imagem, divisor e citação com fonte.
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
