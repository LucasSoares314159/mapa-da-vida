import { notFound, redirect } from 'next/navigation'
import dynamic from 'next/dynamic'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { calcularAnalise } from '@/lib/analise'
import type { Mapa } from '@/types'

const RevelacaoMapa = dynamic(
  () => import('@/components/mapa/RevelacaoMapa').then((m) => m.RevelacaoMapa),
  { ssr: false }
)

type Props = {
  params: { id: string }
}

export default async function MapaPage({ params }: Props) {
  const { id } = params
  const supabase = createServerSupabaseClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: mapaRaw } = await supabase
    .from('mapas')
    .select('*, areas(*)')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (!mapaRaw) notFound()

  const mapa = mapaRaw as Mapa
  const analise = calcularAnalise(mapa.areas ?? [])

  return <RevelacaoMapa mapa={mapa} analise={analise} />
}
