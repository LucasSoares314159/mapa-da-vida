export const dynamic = 'force-dynamic'

import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { calcularDiagnostico } from '@/lib/analise'
import { calcularRotina, getZonaConfig } from '@/lib/rotina'
import { cn } from '@/lib/utils'
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
  console.log('[diagnostico] user_id:', user.id)
  console.log('[diagnostico] rotinaData:', rotinaData)
  console.log('[diagnostico] rotinaError:', rotinaError)
  if (rotinaError) console.error('[diagnostico] erro ao buscar rotina:', rotinaError)
  rotinaRaw = rotinaData

  const mapa = mapaRaw as Mapa
  const areas = mapa.areas ?? []
  const diagnostico = calcularDiagnostico(areas)
  const nomeUsuario = profile?.nome ?? user.email ?? ''

  const totais = diagnostico.totais

  const areasComObservacao = areas.filter((a) => a.observacao?.trim())

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const rotina = rotinaRaw as any
  const zona = (rotina?.zona as 'privilegio' | 'sacrificio' | undefined) ?? 'privilegio'

  const zonaConfig = rotina ? getZonaConfig(zona) : null
  const horasLivresSemana = rotina
    ? calcularRotina({
        horasSono: rotina.horas_sono ?? 8,
        horasTrabalho: rotina.horas_trabalho ?? 8,
        horasBasicas: rotina.horas_basicas ?? 4,
        diasTrabalho: rotina.dias_trabalho ?? 5,
        horasTela: rotina.horas_tela ?? 0,
      }).horasLivresSemana
    : 0

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

        {/* Análise Diagnóstica — padrão, projeção e escolha */}
        <div
          className="flex flex-col gap-5 rounded-card bg-white px-9 py-8"
          style={{ border: '0.5px solid #c8d8d2' }}
        >
          <p className="text-[1.05rem] font-medium leading-relaxed text-mt-black">
            {diagnostico.padrao}
          </p>

          {diagnostico.projecao.map((paragrafo, i) => (
            <p key={i} className="text-[0.95rem] leading-relaxed text-mt-green-dark">
              {paragrafo}
            </p>
          ))}

          <p
            className="text-[1rem] leading-relaxed font-editorial italic"
            style={{ color: '#2A3F45', borderTop: '0.5px solid #c8d8d2', paddingTop: 20 }}
          >
            {diagnostico.escolha}
          </p>
        </div>

        {/* Áreas que pedem atenção — fundamento e evidência de cada uma */}
        {diagnostico.areasDestacadas.length > 0 && (
          <div className="flex flex-col gap-4">
            <h2 className="px-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              O que o estudo mostra sobre essas áreas
            </h2>

            {diagnostico.areasDestacadas.map(({ nome, status, base }) => (
              <div
                key={nome}
                className="flex flex-col gap-3 rounded-card bg-white px-9 py-7"
                style={{ border: '0.5px solid #c8d8d2' }}
              >
                <div className="flex items-center gap-2">
                  <span
                    className={cn(
                      'inline-block size-2 shrink-0 rounded-full',
                      status === 'vermelho' ? 'bg-mt-red' : 'bg-mt-yellow'
                    )}
                  />
                  <h3 className="text-sm font-semibold text-mt-black">{nome}</h3>
                </div>

                <p className="text-[0.95rem] leading-relaxed text-mt-black">{base.fundamento}</p>

                <p className="rounded-md border-l-2 border-mt-green bg-mt-green/10 px-4 py-3.5 text-sm leading-relaxed text-mt-green-dark">
                  {base.destaque}
                </p>
              </div>
            ))}
          </div>
        )}

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
                ≈ {horasLivresSemana} horas por semana
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
