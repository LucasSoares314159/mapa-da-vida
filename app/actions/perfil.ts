'use server'

import { redirect } from 'next/navigation'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { createAdminSupabaseClient } from '@/lib/supabase-admin'
import { perfilOnboardingSchema } from '@/lib/validations'

export type PerfilInput = {
  data_nascimento: string
  profissao: string
  profissao_outro?: string
}

/**
 * Grava nascimento e profissão coletados no primeiro acesso.
 *
 * Usa o cliente admin porque todo write em `profiles` já passa por ele
 * (ver cadastroPorConvite) — as policies de RLS da tabela cobrem leitura, e um
 * UPDATE sem policy correspondente retornaria sucesso com zero linhas, falhando
 * em silêncio. Por isso o `.select()` abaixo: confirma que a linha foi tocada.
 */
export async function salvarPerfilOnboarding(
  input: PerfilInput
): Promise<{ error: string } | { ok: true }> {
  const supabase = createServerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/auth/login')

  const result = perfilOnboardingSchema.safeParse(input)
  if (!result.success) {
    const primeiro = result.error.issues[0]?.message
    return { error: primeiro ?? 'Confira os dados informados.' }
  }

  const { data_nascimento, profissao, profissao_outro } = result.data

  const admin = createAdminSupabaseClient()
  const { data, error } = await admin
    .from('profiles')
    .update({
      data_nascimento,
      profissao,
      // Só faz sentido com 'Outro'; nos demais casos limpa para não deixar
      // resíduo de uma escolha anterior.
      profissao_outro: profissao === 'Outro' ? profissao_outro ?? null : null,
    })
    .eq('id', user.id)
    .select('id')
    .maybeSingle()

  if (error) {
    console.error('[perfil-onboarding] Falha ao gravar perfil:', error)
    return { error: 'Não foi possível salvar. Tente novamente.' }
  }

  if (!data) {
    // Conta autenticada sem linha em `profiles` (cadastro que falhou no meio ou
    // perfil removido). Travar aqui trancaria a pessoa fora do primeiro mapa,
    // que é obrigatório — então o perfil é criado agora, a partir da própria
    // conta logada. Nunca é reconciliação em massa: só quem está de fato
    // preenchendo o onboarding.
    console.error('[perfil-onboarding] Perfil ausente; criando para', user.id)
    const meta = (user.user_metadata ?? {}) as { nome?: unknown }
    const nome =
      (typeof meta.nome === 'string' && meta.nome.trim()) ||
      user.email?.split('@')[0] ||
      'Aluno'

    const { error: insertError } = await admin.from('profiles').upsert(
      {
        id: user.id,
        nome,
        data_nascimento,
        profissao,
        profissao_outro: profissao === 'Outro' ? profissao_outro ?? null : null,
      },
      { onConflict: 'id' }
    )

    if (insertError) {
      console.error('[perfil-onboarding] Falha ao criar perfil ausente:', insertError)
      return { error: 'Não foi possível salvar. Tente novamente.' }
    }
  }

  return { ok: true }
}
