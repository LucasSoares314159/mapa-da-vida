'use server'

import { createServerSupabaseClient } from '@/lib/supabase-server'
import { indiceParaModuloId } from '@/lib/progresso'

/**
 * Marca ou desmarca uma aula, gravando a data da conclusão.
 *
 * Recebe uma aula por vez (e não o array inteiro como antes) porque só assim dá
 * para registrar *quando* cada conclusão aconteceu. É esse timestamp que alimenta
 * as métricas de velocidade da trilha e de alunos travados.
 */
export async function marcarAula(
  indice: number,
  concluida: boolean
): Promise<{ error: string } | { success: true }> {
  const supabase = createServerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { error: 'Você precisa estar autenticado.' }

  const moduloId = indiceParaModuloId(indice)
  if (!moduloId) return { error: 'Módulo não encontrado.' }

  if (concluida) {
    // upsert para que remarcar uma aula já concluída não duplique nem
    // sobrescreva a data original da primeira conclusão.
    const { error } = await supabase
      .from('progresso_aulas')
      .upsert(
        { user_id: user.id, modulo_id: moduloId },
        { onConflict: 'user_id,modulo_id', ignoreDuplicates: true }
      )

    if (error) {
      return { error: 'Não foi possível salvar o progresso. Tente novamente.' }
    }
  } else {
    const { error } = await supabase
      .from('progresso_aulas')
      .delete()
      .eq('user_id', user.id)
      .eq('modulo_id', moduloId)

    if (error) {
      return { error: 'Não foi possível salvar o progresso. Tente novamente.' }
    }
  }

  return { success: true }
}
