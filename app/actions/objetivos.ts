'use server'

import { createServerSupabaseClient } from '@/lib/supabase-server'
import type { Objetivo, StatusObjetivo, PrazoObjetivo, NomePilar } from '@/types'

export async function criarObjetivo(input: {
  texto: string
  pilar: NomePilar
  prazo: PrazoObjetivo
  data_alvo?: string | null
  motivo?: string | null
}): Promise<{ error: string } | { redirectTo: string } | { data: Objetivo }> {
  const supabase = createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { redirectTo: '/auth/login' }

  const { data, error } = await supabase
    .from('objetivos')
    .insert({
      user_id: user.id,
      texto: input.texto.trim(),
      pilar: input.pilar,
      prazo: input.prazo,
      data_alvo: input.data_alvo ?? null,
      motivo: input.motivo?.trim() || null,
      status: 'ativo',
    })
    .select()
    .single()

  if (error || !data) return { error: 'Não foi possível criar o objetivo. Tente novamente.' }

  return { data: data as Objetivo }
}

export async function atualizarStatusObjetivo(
  id: string,
  status: StatusObjetivo
): Promise<{ error: string } | { redirectTo: string } | { data: Objetivo }> {
  const supabase = createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { redirectTo: '/auth/login' }

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

export async function arquivarObjetivo(
  id: string
): Promise<{ error: string } | { redirectTo: string } | { success: true }> {
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
  input: {
    texto: string
    pilar: NomePilar
    prazo: PrazoObjetivo
    data_alvo?: string | null
    motivo?: string | null
  }
): Promise<{ error: string } | { redirectTo: string } | { data: Objetivo }> {
  const supabase = createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { redirectTo: '/auth/login' }

  const { data, error } = await supabase
    .from('objetivos')
    .update({
      texto: input.texto.trim(),
      pilar: input.pilar,
      prazo: input.prazo,
      data_alvo: input.data_alvo ?? null,
      motivo: input.motivo?.trim() || null,
    })
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error || !data) return { error: 'Não foi possível editar o objetivo. Tente novamente.' }

  return { data: data as Objetivo }
}
