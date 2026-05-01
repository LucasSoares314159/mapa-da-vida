import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { calcularAnalise } from '@/lib/analise'
import { getZonaConfig } from '@/lib/rotina'
import { AuthLayout } from '@/components/AuthLayout'
import { NewsletterCTA } from '@/components/NewsletterCTA'
import { FeedbackTally } from '@/components/FeedbackTally'
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

  const [{ data: profile }, { data: mapaRaw }, { data: rotinaRaw }] = await Promise.all([
    supabase.from('profiles').select('nome').eq('id', user.id).single(),
    supabase
      .from('mapas')
      .select('*, areas(*)')
      .eq('id', id)
      .eq('user_id', user.id)
      .single(),
    supabase
      .from('rotinas')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle(),
  ])

  if (!mapaRaw) notFound()

  const mapa = mapaRaw as Mapa
  const areas = mapa.areas ?? []
  const analise = calcularAnalise(areas)
  const nomeUsuario = profile?.nome ?? user.email ?? ''

  const totais = { verde: 0, amarelo: 0, vermelho: 0 }
  for (const area of areas) totais[area.status]++

  const areasComObservacao = areas.filter((a) => a.observacao?.trim())

  const rotina = rotinaRaw as any

  const zonaConfig = rotina ? getZonaConfig(rotina.percentual_livre > 45 ? 'privilegio' : rotina.percentual_livre >= 35 ? 'base' : 'sacrificio') : null

  return (
    <AuthLayout titulo="Diagnóstico Completo" nomeUsuario={nomeUsuario}>
      <div className="mx-auto flex max-w-xl flex-col gap-4 px-6 py-8">
        {/* Botão Ver mapa */}
        <Link
          href={`/mapa/${id}`}
          className="flex items-center gap-1.5 text-sm font-medium transition-colors w-fit"
          style={{ color: '#57AA8F' }}
        >
          <ArrowLeft className="size-4" />
          Ver mapa
        </Link>

        {/* Resumo da Rotina */}
        {rotina && zonaConfig && (
          <div className={`rounded-card p-6 ${zonaConfig.cor}`} style={{ border: '0.5px solid #c8d8d2' }}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-mt-green-dark">Sua Rotina</h3>
              <span className="text-xs font-semibold uppercase tracking-[0.09em] text-mt-green-dark opacity-70">
                {rotina.percentual_livre}% livre
              </span>
            </div>
            <p className="text-sm leading-relaxed text-mt-muted mb-3">
              Você tem <span className="font-semibold text-mt-green-dark">{rotina.percentual_livre}%</span> de tempo livre por semana
              ({Math.round((1 - (rotina.horas_sono + rotina.horas_trabalho + rotina.horas_basicas) / 24) * 168)} horas).
            </p>
            <div className="text-xs text-mt-muted italic">
              {zonaConfig.descricao}
            </div>
          </div>
        )}

        <FeedbackTally />

        <div className="rounded-card bg-white px-9 py-8" style={{ border: '0.5px solid #c8d8d2' }}>
          <p className="text-[1.05rem] font-medium leading-relaxed text-mt-black">{analise}</p>
        </div>

        <div className="flex items-center gap-2 rounded-card bg-white px-9 py-6" style={{ border: '0.5px solid #c8d8d2' }}>
          {(
            [
              { tipo: 'verde',    bg: 'rgba(87,170,143,0.15)', cor: '#57AA8F', count: totais.verde },
              { tipo: 'amarelo',  bg: 'rgba(212,168,67,0.15)', cor: '#D4A843', count: totais.amarelo },
              { tipo: 'vermelho', bg: 'rgba(192,80,80,0.15)',  cor: '#C05050', count: totais.vermelho },
            ] as const
          ).map(({ tipo, bg, cor, count }) => (
            <span
              key={tipo}
              className="flex items-center text-sm font-medium"
              style={{ backgroundColor: bg, color: cor, borderRadius: 20, padding: '4px 10px', gap: 5 }}
            >
              <span
                style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: cor, flexShrink: 0, display: 'inline-block' }}
              />
              {count}
            </span>
          ))}
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

        <NewsletterCTA utm_campaign="pos-diagnostico" />
      </div>
    </AuthLayout>
  )
}
