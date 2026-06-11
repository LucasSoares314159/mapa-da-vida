'use server'

import { createServerSupabaseClient } from '@/lib/supabase-server'

export async function atualizarProgresso(
  aulasConcluidas: number[]
): Promise<{ error: string } | { success: true }> {
  const supabase = createServerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { error: 'Você precisa estar autenticado.' }

  const { error } = await supabase
    .from('profiles')
    .update({ aulas_concluidas: aulasConcluidas })
    .eq('id', user.id)

  if (error) {
    return { error: 'Não foi possível salvar o progresso. Tente novamente.' }
  }

  return { success: true }
}
