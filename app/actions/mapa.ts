'use server'

import { redirect } from 'next/navigation'
import { createServerSupabaseClient } from '@/lib/supabase-server'
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
      observacao: a.observacao || null,
    }))
  )

  if (areasError) {
    await supabase.from('mapas').delete().eq('id', mapa.id)
    return { error: 'Não foi possível salvar as áreas. Tente novamente.' }
  }

  redirect(`/mapa/${mapa.id}`)
}
