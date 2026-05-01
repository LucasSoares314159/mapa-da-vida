import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, ArrowRight } from 'lucide-react'
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

  let rotinaRaw = null
  const { data: rotinaData, error: rotinaError } = await supabase
    .from('rotinas')
    .select('*')
    .eq('user_id', user.id)
    .maybeSingle()
  if (rotinaError) console.error('[diagnostico] erro ao buscar rotina:', rotinaError)
  rotinaRaw = rotinaData

  const mapa = mapaRaw as Mapa
  const areas = mapa.areas ?? []
  const analise = calcularAnalise(areas)
  const nomeUsuario = profile?.nome ?? user.email ?? ''

  const totais = { verde: 0, amarelo: 0, vermelho: 0 }
  for (const area of areas) totais[area.status]++

  const areasComObservacao = areas.filter((a) => a.observacao?.trim())

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const rotina = rotinaRaw as any
  const percentualLivre = typeof rotina?.percentual_livre === 'number' ? rotina.percentual_livre : 0

  const zonaConfig = rotina ? getZonaConfig(percentualLivre >= 40 ? 'privilegio' : 'sacrificio') : null

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

        {/* Análise Diagnóstica */}
        <div className="rounded-card bg-white px-9 py-8" style={{ border: '0.5px solid #c8d8d2' }}>
          <p className="text-[1.05rem] font-medium leading-relaxed text-mt-black">{analise}</p>
        </div>

        {/* Status Badges - Faróis */}
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

        {/* Suas Observações */}
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

        {/* Sua Rotina */}
        {rotina && zonaConfig && (
          <div className="rounded-card px-7 py-6 flex flex-col gap-4" style={{ backgroundColor: '#57AA8F', border: '0.5px solid #57AA8F' }}>
            {/* Eyebrow + Badge */}
            <div className="flex flex-col gap-2">
              <p className="text-[10px] font-semibold uppercase tracking-[1.5px]" style={{ color: 'rgba(255,255,255,0.6)' }}>
                Sua Rotina
              </p>
              <span
                className="text-[11px] font-bold uppercase tracking-[1px] border rounded-badge px-3 py-1 w-fit"
                style={{ borderColor: zonaConfig.badgeCardBorder, backgroundColor: zonaConfig.badgeCardBg, color: zonaConfig.badgeCardText }}
              >
                {zonaConfig.badgeLabel}
              </span>
            </div>

            {/* Percentual em destaque */}
            <div className="flex flex-col gap-0.5">
              <div className="flex items-baseline gap-2">
                <span className="text-[2.5rem] font-bold leading-none tracking-tight" style={{ color: zonaConfig.percentualCardCor }}>
                  {rotina.percentual_livre}%
                </span>
                <span className="text-sm font-medium" style={{ color: 'rgba(255,255,255,0.75)' }}>de tempo livre</span>
              </div>
              <p className="text-xs font-medium" style={{ color: 'rgba(255,255,255,0.7)' }}>
                ≈ {Math.round((1 - ((rotina.horas_sono ?? 0) + (rotina.horas_trabalho ?? 0) + (rotina.horas_basicas ?? 0)) / 24) * 168)} horas por semana
              </p>
            </div>

            {/* Mensagem da zona */}
            <p className="text-sm leading-relaxed font-editorial italic" style={{ color: 'rgba(255,255,255,0.85)' }}>
              {zonaConfig.cardDescricao}
            </p>

            {/* Link */}
            <Link
              href={`/rotina?mapaId=${id}`}
              className="flex items-center gap-1 text-xs w-fit transition-colors"
              style={{ color: 'rgba(255,255,255,0.55)' }}
            >
              <ArrowRight className="size-3" />
              Editar rotina
            </Link>
          </div>
        )}

        {/* NPS Feedback */}
        <FeedbackTally />

        {/* Newsletter CTA */}
        <NewsletterCTA utm_campaign="pos-diagnostico" />
      </div>
    </AuthLayout>
  )
}
