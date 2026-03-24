import { notFound, redirect } from 'next/navigation'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { calcularAnalise } from '@/lib/analise'
import { AuthLayout } from '@/components/AuthLayout'
import type { Mapa } from '@/types'

type Props = {
  params: { id: string }
}

export default async function DiagnosticoPage({ params }: Props) {
  const { id } = params
  const supabase = createServerSupabaseClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const [{ data: profile }, { data: mapaRaw }] = await Promise.all([
    supabase.from('profiles').select('nome').eq('id', user.id).single(),
    supabase
      .from('mapas')
      .select('*, areas(*)')
      .eq('id', id)
      .eq('user_id', user.id)
      .single(),
  ])

  if (!mapaRaw) notFound()

  const mapa = mapaRaw as Mapa
  const areas = mapa.areas ?? []
  const analise = calcularAnalise(areas)
  const nomeUsuario = profile?.nome ?? user.email ?? ''

  const totais = { verde: 0, amarelo: 0, vermelho: 0 }
  for (const area of areas) totais[area.status]++

  const areasComObservacao = areas.filter((a) => a.observacao?.trim())

  return (
    <AuthLayout titulo="Diagnóstico Completo" nomeUsuario={nomeUsuario}>
      <div className="mx-auto flex max-w-xl flex-col gap-4 px-6 py-8">
        <div className="rounded-card bg-white px-9 py-8" style={{ border: '0.5px solid #c8d8d2' }}>
          <p className="text-[1.05rem] font-medium leading-relaxed text-mt-black">{analise}</p>
        </div>

        <div className="flex justify-around rounded-card bg-white px-9 py-6" style={{ border: '0.5px solid #c8d8d2' }}>
          <div className="flex flex-col items-center gap-1">
            <span className="text-2xl">🟢</span>
            <span className="text-xl font-semibold">{totais.verde}</span>
            <span className="text-xs text-muted-foreground">Bem</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <span className="text-2xl">🟡</span>
            <span className="text-xl font-semibold">{totais.amarelo}</span>
            <span className="text-xs text-muted-foreground">Atenção</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <span className="text-2xl">🔴</span>
            <span className="text-xl font-semibold">{totais.vermelho}</span>
            <span className="text-xs text-muted-foreground">Urgente</span>
          </div>
        </div>

        {areasComObservacao.length > 0 && (
          <div className="flex flex-col gap-4 rounded-card bg-white px-9 py-6" style={{ border: '0.5px solid #c8d8d2' }}>
            <h2 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Suas observações
            </h2>
            <div className="flex flex-col gap-4">
              {areasComObservacao.map((area) => (
                <div key={area.id}>
                  <p className="mb-0.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    {area.area}
                  </p>
                  <p className="text-sm leading-relaxed text-mt-green-dark">{area.observacao}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </AuthLayout>
  )
}
