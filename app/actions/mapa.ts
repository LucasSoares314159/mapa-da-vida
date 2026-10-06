'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { COOKIE_MAPA_OK, opcoesCookieMapaOk } from '@/lib/gate-mapa'
import { mapaConversaSchema } from '@/lib/validations'
import type { NomeArea, NomePilar, StatusArea } from '@/types'

export type AreaInput = {
  area: NomeArea
  pilar: NomePilar
  status: StatusArea
  observacao?: string
}

export async function criarMapa(
  areas: AreaInput[],
  titulo?: string
): Promise<{ error: string } | never> {
  const supabase = createServerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/auth/login')

  // A observação é obrigatória nas 9 áreas desde o fluxo conversacional. A
  // validação vive aqui também porque o cliente pode ser contornado; a coluna
  // no banco segue nullable para não invalidar os mapas criados antes disso.
  const validado = mapaConversaSchema.safeParse({ titulo, areas })
  if (!validado.success) {
    return {
      error:
        'Revise as respostas: cada uma das 9 áreas precisa de um status e de uma frase sobre o motivo.',
    }
  }

  const { data: mapa, error: mapaError } = await supabase
    .from('mapas')
    .insert({ user_id: user.id, titulo: titulo || null })
    .select('id')
    .single()

  if (mapaError || !mapa) {
    return { error: 'Não foi possível criar o mapa. Tente novamente.' }
  }

  const { error: areasError } = await supabase.from('areas').insert(
    areas.map((a) => ({
      mapa_id: mapa.id,
      pilar: a.pilar,
      area: a.area,
      status: a.status,
      observacao: a.observacao?.trim() || null,
    }))
  )

  if (areasError) {
    await supabase.from('mapas').delete().eq('id', mapa.id)
    return { error: 'Não foi possível salvar as áreas. Tente novamente.' }
  }

  // Libera o gate sem custar outra consulta na navegação seguinte.
  cookies().set(COOKIE_MAPA_OK, '1', opcoesCookieMapaOk())

  redirect(`/mapa/${mapa.id}`)
}
