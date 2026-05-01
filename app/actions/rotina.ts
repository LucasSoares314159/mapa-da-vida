'use server'

import { createServerSupabaseClient } from '@/lib/supabase-server'
import type { InputRotina } from '@/lib/rotina'

export async function salvarRotina(
  input: InputRotina,
  mapaId?: string
): Promise<{ error: string } | { redirectTo: string } | { success: true }> {
  const supabase = createServerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { redirectTo: '/auth/login' }

  const consumidaSemana = (input.horasSono + input.horasTrabalho + input.horasBasicas) / 24
  const consumidaFDS = (input.horasSono + input.horasBasicas) / 24
  const mediaConsumida =
    (consumidaSemana * input.diasTrabalho + consumidaFDS * (7 - input.diasTrabalho)) / 7
  const percentualLivre = Math.round((1 - mediaConsumida) * 100)

  const { error } = await supabase.from('rotinas').upsert(
    {
      user_id: user.id,
      horas_sono: input.horasSono,
      horas_trabalho: input.horasTrabalho,
      horas_basicas: input.horasBasicas,
      dias_trabalho: input.diasTrabalho,
      percentual_livre: percentualLivre,
      mapa_id: mapaId || null,
      atualizado_em: new Date().toISOString(),
    },
    { onConflict: 'user_id' }
  )

  if (error) {
    return { error: 'Não foi possível salvar sua rotina. Tente novamente.' }
  }

  if (mapaId) {
    return { redirectTo: `/diagnostico/${mapaId}` }
  }

  return { success: true }
}

export async function vincularRotina(
  mapaId: string
): Promise<{ error: string } | { success: true }> {
  const supabase = createServerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Você precisa estar autenticado.' }
  }

  const { error } = await supabase
    .from('rotinas')
    .update({ mapa_id: mapaId, atualizado_em: new Date().toISOString() })
    .eq('user_id', user.id)

  if (error) {
    return { error: 'Não foi possível vincular a rotina ao mapa. Tente novamente.' }
  }

  return { success: true }
}
