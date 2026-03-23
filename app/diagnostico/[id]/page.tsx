import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { calcularAnalise } from '@/lib/analise'
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

  const { data: mapaRaw } = await supabase
    .from('mapas')
    .select('*, areas(*)')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (!mapaRaw) notFound()

  const mapa = mapaRaw as Mapa
  const areas = mapa.areas ?? []
  const analise = calcularAnalise(areas)

  const totais = { verde: 0, amarelo: 0, vermelho: 0 }
  for (const area of areas) totais[area.status]++

  const areasComObservacao = areas.filter((a) => a.observacao?.trim())

  return (
    <div className="min-h-screen bg-zinc-50">
      <header className="sticky top-0 z-10 border-b bg-white px-6 py-4">
        <div className="mx-auto flex max-w-xl items-center gap-3">
          <Link
            href="/dashboard"
            className="flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="size-4" />
            Dashboard
          </Link>
          <h1 className="text-base font-semibold">Diagnóstico Completo</h1>
        </div>
      </header>

      <main className="mx-auto flex max-w-xl flex-col gap-4 px-4 py-8">
        <div className="rounded-xl border bg-white px-6 py-6 shadow-sm">
          <p className="text-[1.05rem] font-medium leading-relaxed text-zinc-900">{analise}</p>
        </div>

        <div className="flex justify-around rounded-xl border bg-white px-6 py-5 shadow-sm">
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
          <div className="flex flex-col gap-4 rounded-xl border bg-white px-6 py-5 shadow-sm">
            <h2 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Suas observações
            </h2>
            <div className="flex flex-col gap-4">
              {areasComObservacao.map((area) => (
                <div key={area.id}>
                  <p className="mb-0.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    {area.area}
                  </p>
                  <p className="text-sm leading-relaxed text-zinc-700">{area.observacao}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
