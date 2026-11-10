'use server'

import { revalidatePath } from 'next/cache'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { diaDeHoje, podeCriarHabito, LIMITE_HABITOS_ATIVOS } from '@/lib/habitos'
import { habitoSchema, type HabitoData, type HabitoInput } from '@/lib/validations'
import type { Habito } from '@/types'

type Resultado<T> = { error: string } | { redirectTo: string } | T

// Toda escrita de hábito invalida as telas que mostram hábitos. Sem isso o Router
// Cache do Next 14 reaproveita, por ~30s, a tela baixada antes da marcação: a
// pessoa marca, vai para a Trilha, volta para Hábitos e vê o hábito desmarcado,
// embora o banco já tenha o registro. 'layout' cobre /habitos, /habitos/progresso
// e /habitos/[id]; /content tem a faixa "Hábitos de hoje".
function revalidarTelasDeHabitos() {
  revalidatePath('/habitos', 'layout')
  revalidatePath('/content')
}

function validar(input: HabitoInput): { ok: true; data: HabitoData } | { ok: false; error: string } {
  const r = habitoSchema.safeParse(input)
  if (!r.success) return { ok: false, error: r.error.issues[0]?.message ?? 'Confira os dados do hábito.' }
  return { ok: true, data: r.data }
}

export async function criarHabito(input: HabitoInput): Promise<Resultado<{ data: Habito }>> {
  const supabase = createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { redirectTo: '/auth/login' }

  const v = validar(input)
  if (!v.ok) return { error: v.error }

  const { count } = await supabase
    .from('habitos')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .is('arquivado_em', null)

  const ativos = count ?? 0
  if (!podeCriarHabito(ativos)) {
    return { error: `Você já tem ${LIMITE_HABITOS_ATIVOS} hábitos ativos. Arquive um antes de começar outro.` }
  }

  // Hábito novo entra no fim da grade: os que a pessoa já marca não mudam de lugar.
  const { data, error } = await supabase
    .from('habitos')
    .insert({ user_id: user.id, ...v.data, ordem: ativos })
    .select()
    .single()

  if (error || !data) return { error: 'Não foi possível criar o hábito. Tente novamente.' }
  revalidarTelasDeHabitos()
  return { data: data as Habito }
}

export async function editarHabito(id: string, input: HabitoInput): Promise<Resultado<{ data: Habito }>> {
  const supabase = createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { redirectTo: '/auth/login' }

  const v = validar(input)
  if (!v.ok) return { error: v.error }

  // Mudar a meta não reescreve o passado: as semanas já fechadas passam a ser
  // lidas com a meta nova. Aceito para o MVP; guardar o histórico de metas
  // seria uma tabela a mais para um caso raro.
  const { data, error } = await supabase
    .from('habitos')
    .update(v.data)
    .eq('id', id)
    .eq('user_id', user.id)
    .is('arquivado_em', null)
    .select()
    .single()

  if (error || !data) return { error: 'Não foi possível salvar o hábito. Tente novamente.' }
  revalidarTelasDeHabitos()
  return { data: data as Habito }
}

export async function arquivarHabito(id: string): Promise<Resultado<{ data: Habito }>> {
  const supabase = createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { redirectTo: '/auth/login' }

  // Arquivar, nunca apagar: o histórico segue contando nas repetições e no
  // calendário até o dia do arquivamento.
  const { data, error } = await supabase
    .from('habitos')
    .update({ arquivado_em: new Date().toISOString() })
    .eq('id', id)
    .eq('user_id', user.id)
    .is('arquivado_em', null)
    .select()
    .single()

  if (error || !data) return { error: 'Não foi possível arquivar o hábito. Tente novamente.' }
  revalidarTelasDeHabitos()
  return { data: data as Habito }
}

/**
 * Marca ou desmarca o hábito HOJE (dia de Brasília, calculado aqui no servidor).
 * Recebe o estado desejado, não um "alternar": a tela marca de forma otimista, e
 * dois toques rápidos com "alternar" poderiam chegar fora de ordem e inverter o
 * resultado. Com o estado explícito, repetir a chamada não muda nada.
 */
export async function definirHabitoHoje(
  habitoId: string,
  feito: boolean
): Promise<Resultado<{ data: { dia: string; feito: boolean } }>> {
  const supabase = createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { redirectTo: '/auth/login' }

  const dia = diaDeHoje()

  if (!feito) {
    const { error } = await supabase
      .from('habito_registros')
      .delete()
      .eq('habito_id', habitoId)
      .eq('user_id', user.id)
      .eq('dia', dia)
    if (error) return { error: 'Não foi possível desmarcar. Tente novamente.' }
    revalidarTelasDeHabitos()
    return { data: { dia, feito: false } }
  }

  // Hábito arquivado não recebe marcação nova. A policy de INSERT já garante que
  // o hábito é da pessoa; esta checagem cobre o arquivamento.
  const { data: habito } = await supabase
    .from('habitos')
    .select('id')
    .eq('id', habitoId)
    .eq('user_id', user.id)
    .is('arquivado_em', null)
    .maybeSingle()
  if (!habito) return { error: 'Hábito não encontrado.' }

  const { error } = await supabase
    .from('habito_registros')
    .upsert(
      { habito_id: habitoId, user_id: user.id, dia, status: 'feito' },
      { onConflict: 'habito_id,dia', ignoreDuplicates: true }
    )
  if (error) return { error: 'Não foi possível marcar. Tente novamente.' }
  revalidarTelasDeHabitos()
  return { data: { dia, feito: true } }
}
