'use server'

import { createServerSupabaseClient } from '@/lib/supabase-server'
import { validarPrazoComData } from '@/lib/prazo'
import { RITMOS } from '@/types'
import type { Objetivo, StatusObjetivo, PrazoObjetivo, NomePilar, FrequenciaLembrete, RitmoObjetivo } from '@/types'

const STATUS_VALIDOS: StatusObjetivo[] = ['ativo', 'pausado', 'concluido', 'arquivado']

type Resultado<T> = { error: string } | { redirectTo: string } | T

type DadosObjetivo = {
  texto: string
  pilar: NomePilar
  prazo: PrazoObjetivo
  data_alvo: string
  frequencia_lembrete: FrequenciaLembrete
  motivo?: string | null
  radar_faz_sentido: boolean | null
  radar_por_mim: boolean | null
}

// Validações compartilhadas por criar e editar. O cliente já valida tudo isso,
// mas uma action é um endpoint público: sem isso, uma chamada direta gravaria
// objetivo sem texto ou com data incoerente com o prazo.
function validarDados(input: DadosObjetivo): string | null {
  if (!input.texto?.trim()) return 'Descreva o objetivo com clareza.'
  if (!input.data_alvo) return 'Defina uma data alvo.'
  const erroPrazo = validarPrazoComData(input.prazo, input.data_alvo)
  if (erroPrazo) return erroPrazo
  if (!input.frequencia_lembrete) return 'Escolha a frequência de lembrete.'
  if (input.radar_faz_sentido === null || input.radar_por_mim === null) {
    return 'Responda o Radar de Coerência antes de salvar.'
  }
  return null
}

// Próxima posição livre no fim de uma aba de prazo. Usada quando o objetivo muda
// de prazo: herdar a posição da lista antiga o jogaria no meio da lista de destino.
async function proximaOrdem(
  supabase: ReturnType<typeof createServerSupabaseClient>,
  userId: string,
  prazo: PrazoObjetivo
): Promise<number> {
  const { data } = await supabase
    .from('objetivos')
    .select('ordem')
    .eq('user_id', userId)
    .eq('prazo', prazo)
    .neq('status', 'arquivado')
    .order('ordem', { ascending: false, nullsFirst: false })
    .limit(1)
    .maybeSingle()

  return typeof data?.ordem === 'number' ? data.ordem + 1 : 0
}

export async function criarObjetivo(
  input: DadosObjetivo
): Promise<Resultado<{ data: Objetivo }>> {
  const supabase = createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { redirectTo: '/auth/login' }

  const erro = validarDados(input)
  if (erro) return { error: erro }

  // Objetivo novo entra no topo da sua aba. Quem acabou de criar está começando,
  // então nasce como 'avancando' em vez de pedir mais um toque à pessoa.
  const { data: existentes } = await supabase
    .from('objetivos')
    .select('id, ordem')
    .eq('user_id', user.id)
    .eq('prazo', input.prazo)
    .neq('status', 'arquivado')

  const { data, error } = await supabase
    .from('objetivos')
    .insert({
      user_id: user.id,
      texto: input.texto.trim(),
      pilar: input.pilar,
      prazo: input.prazo,
      data_alvo: input.data_alvo,
      frequencia_lembrete: input.frequencia_lembrete,
      motivo: input.motivo?.trim() || null,
      status: 'ativo',
      radar_faz_sentido: input.radar_faz_sentido,
      radar_por_mim: input.radar_por_mim,
      ritmo: 'avancando',
      ordem: 0,
    })
    .select()
    .single()

  if (error || !data) return { error: 'Não foi possível criar o objetivo. Tente novamente.' }

  // Empurra os que já existiam uma posição para baixo. Em lote, não em loop.
  if (existentes && existentes.length > 0) {
    const deslocados = existentes.map((o, i) => ({
      id: o.id,
      ordem: typeof o.ordem === 'number' ? o.ordem + 1 : i + 1,
    }))
    await Promise.all(
      deslocados.map((d) =>
        supabase.from('objetivos').update({ ordem: d.ordem }).eq('id', d.id).eq('user_id', user.id)
      )
    )
  }

  return { data: data as Objetivo }
}

export async function atualizarStatusObjetivo(
  id: string,
  status: StatusObjetivo
): Promise<Resultado<{ data: Objetivo }>> {
  const supabase = createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { redirectTo: '/auth/login' }

  if (!STATUS_VALIDOS.includes(status)) return { error: 'Status inválido.' }

  const extra = status === 'concluido'
    ? { concluido_em: new Date().toISOString() }
    : status === 'ativo'
      ? { concluido_em: null }
      : {}

  const { data, error } = await supabase
    .from('objetivos')
    .update({ status, ...extra })
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error || !data) return { error: 'Não foi possível atualizar o objetivo. Tente novamente.' }

  return { data: data as Objetivo }
}

// Semáforo do card. Update de uma coluna só — é a ação mais frequente da tela,
// não faz sentido passar pelo fluxo de edição inteiro para mudar uma bolinha.
export async function definirRitmoObjetivo(
  id: string,
  ritmo: RitmoObjetivo
): Promise<Resultado<{ data: Objetivo }>> {
  const supabase = createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { redirectTo: '/auth/login' }

  if (!Object.keys(RITMOS).includes(ritmo)) return { error: 'Ritmo inválido.' }

  const { data, error } = await supabase
    .from('objetivos')
    .update({ ritmo })
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error || !data) return { error: 'Não foi possível atualizar o ritmo. Tente novamente.' }

  return { data: data as Objetivo }
}

// Recebe os ids de uma aba já na ordem final e grava a posição de cada um.
// Confere a propriedade de TODOS os ids antes de escrever: um id de outra conta
// no meio da lista falharia silenciosamente no RLS e deixaria a ordem pela metade.
export async function reordenarObjetivos(
  prazo: PrazoObjetivo,
  idsNaOrdem: string[]
): Promise<Resultado<{ success: true }>> {
  const supabase = createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { redirectTo: '/auth/login' }

  if (idsNaOrdem.length === 0) return { success: true }

  const { data: proprios, error: erroConsulta } = await supabase
    .from('objetivos')
    .select('id')
    .eq('user_id', user.id)
    .eq('prazo', prazo)
    .in('id', idsNaOrdem)

  if (erroConsulta) return { error: 'Não foi possível salvar a ordem. Tente novamente.' }
  if ((proprios?.length ?? 0) !== idsNaOrdem.length) {
    return { error: 'Não foi possível salvar a ordem. Recarregue a página.' }
  }

  const resultados = await Promise.all(
    idsNaOrdem.map((id, indice) =>
      supabase
        .from('objetivos')
        .update({ ordem: indice })
        .eq('id', id)
        .eq('user_id', user.id)
    )
  )

  if (resultados.some((r) => r.error)) {
    return { error: 'Não foi possível salvar a ordem. Tente novamente.' }
  }

  return { success: true }
}

export async function arquivarObjetivo(
  id: string
): Promise<Resultado<{ success: true }>> {
  const supabase = createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { redirectTo: '/auth/login' }

  const { error } = await supabase
    .from('objetivos')
    .update({ status: 'arquivado' })
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) return { error: 'Não foi possível arquivar o objetivo. Tente novamente.' }

  return { success: true }
}

export async function editarObjetivo(
  id: string,
  input: DadosObjetivo
): Promise<Resultado<{ data: Objetivo }>> {
  const supabase = createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { redirectTo: '/auth/login' }

  const erro = validarDados(input)
  if (erro) return { error: erro }

  // Se o prazo mudou, o objetivo troca de aba: recalcula a posição para o fim da
  // lista de destino em vez de herdar a posição que tinha na aba de origem.
  const { data: atual } = await supabase
    .from('objetivos')
    .select('prazo')
    .eq('id', id)
    .eq('user_id', user.id)
    .maybeSingle()

  const mudouDePrazo = !!atual && atual.prazo !== input.prazo
  const ordemNova = mudouDePrazo ? await proximaOrdem(supabase, user.id, input.prazo) : null

  const { data, error } = await supabase
    .from('objetivos')
    .update({
      texto: input.texto.trim(),
      pilar: input.pilar,
      prazo: input.prazo,
      data_alvo: input.data_alvo,
      frequencia_lembrete: input.frequencia_lembrete,
      motivo: input.motivo?.trim() || null,
      radar_faz_sentido: input.radar_faz_sentido,
      radar_por_mim: input.radar_por_mim,
      ...(ordemNova !== null ? { ordem: ordemNova } : {}),
    })
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error || !data) return { error: 'Não foi possível editar o objetivo. Tente novamente.' }

  return { data: data as Objetivo }
}
