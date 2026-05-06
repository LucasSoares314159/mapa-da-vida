import { notFound, redirect } from 'next/navigation'
import dynamic from 'next/dynamic'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { calcularAnalise } from '@/lib/analise'
import type { Mapa } from '@/types'

const RevelacaoMapa = dynamic(
  () => import('@/components/mapa/RevelacaoMapa').then((m) => m.RevelacaoMapa),
  {
    ssr: false,
    loading: () => (
      <div className="flex-1 flex items-center justify-center bg-mt-off-white min-h-screen">
        <div className="flex flex-col items-center gap-3">
          <div className="size-8 rounded-full border-2 border-mt-green border-t-transparent animate-spin" />
          <p className="text-sm text-mt-muted">Carregando mapa…</p>
        </div>
      </div>
    ),
  }
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
