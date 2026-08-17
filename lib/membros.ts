import { createAdminSupabaseClient } from './supabase-admin'

/**
 * Total de pessoas cadastradas.
 *
 * Usa o cliente admin porque o RLS de `profiles` restringe a leitura ao próprio
 * usuário — com o cliente comum a contagem sairia sempre 1. Só roda no servidor:
 * a service role key nunca é exposta ao browser.
 */
export async function contarMembros(): Promise<number | null> {
  try {
    const supabase = createAdminSupabaseClient()
    const { count, error } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })

    if (error) {
      console.error('[membros] erro ao contar perfis:', error)
      return null
    }

    return count ?? null
  } catch (erro) {
    // Sem a service role key configurada o contador some, mas o app segue.
    console.error('[membros] falha ao criar cliente admin:', erro)
    return null
  }
}
