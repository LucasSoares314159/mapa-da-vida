'use server'

import { createServerSupabaseClient } from '@/lib/supabase-server'
import { DURACOES } from '@/types'
import type { MomentoVida, EstacaoMomento, DuracaoMomento } from '@/types'

// Calcula a data de revisão a partir de hoje + a duração escolhida.
// Retorna no formato YYYY-MM-DD (coluna date do Postgres).
function calcularDataRevisao(duracao: DuracaoMomento): string {
  const meses = DURACOES[duracao].meses
  const d = new Date()
  d.setMonth(d.getMonth() + meses)
  return d.toISOString().slice(0, 10)
}

// Busca o momento de vida ativo do usuário (ou null se ainda não definiu).
export async function buscarMomentoAtivo(): Promise<MomentoVida | null> {
  const supabase = createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data } = await supabase
    .from('momentos_vida')
    .select('*')
    .eq('user_id', user.id)
    .eq('ativo', true)
    .maybeSingle()

  return (data as MomentoVida | null) ?? null
}

// Define um novo momento de vida. Desativa o anterior (que vira histórico)
// e insere o novo como ativo.
export async function definirMomento(input: {
  estacao: EstacaoMomento
  frase: string
  duracao: DuracaoMomento
}): Promise<{ error: string } | { redirectTo: string } | { data: MomentoVida }> {
  const supabase = createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { redirectTo: '/auth/login' }

  const frase = input.frase.trim()
  if (!frase) return { error: 'Escreva em uma frase qual é o seu momento.' }
  if (frase.length > 280) return { error: 'Tente resumir seu momento em uma frase mais curta.' }

  // Desativa o momento ativo anterior (vira histórico)
  const { error: erroDesativar } = await supabase
    .from('momentos_vida')
    .update({ ativo: false })
    .eq('user_id', user.id)
    .eq('ativo', true)

  if (erroDesativar) return { error: 'Não foi possível salvar seu momento. Tente novamente.' }

  const { data, error } = await supabase
    .from('momentos_vida')
    .insert({
      user_id: user.id,
      estacao: input.estacao,
      frase,
      duracao: input.duracao,
      data_revisao: calcularDataRevisao(input.duracao),
      ativo: true,
    })
    .select()
    .single()

  if (error || !data) return { error: 'Não foi possível salvar seu momento. Tente novamente.' }

  return { data: data as MomentoVida }
}

// Busca o histórico de momentos anteriores (desativados), do mais recente ao mais antigo.
export async function buscarHistoricoMomentos(): Promise<MomentoVida[]> {
  const supabase = createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data } = await supabase
    .from('momentos_vida')
    .select('*')
    .eq('user_id', user.id)
    .eq('ativo', false)
    .order('criado_em', { ascending: false })

  return (data as MomentoVida[] | null) ?? []
}
