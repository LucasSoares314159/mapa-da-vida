export const dynamic = 'force-dynamic'

import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { contarMembros } from '@/lib/membros'
import { calcularDiagnostico } from '@/lib/analise'
import { calcularRotina, getZonaConfig } from '@/lib/rotina'
import { cn } from '@/lib/utils'
import { AuthLayout } from '@/components/AuthLayout'
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

  const [{ data: profile }, { data: mapaRaw }, totalMembros] = await Promise.all([
    supabase.from('profiles').select('nome').eq('id', user.id).single(),
    supabase
      .from('mapas')
      .select('*, areas(*)')
      .eq('id', id)
      .eq('user_id', user.id)
      .single(),
    contarMembros(),
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
    <AuthLayout titulo="Diagnóstico Completo" nomeUsuario={nomeUsuario} totalMembros={totalMembros}>
      <div className="mx-auto flex max-w-xl flex-col gap-4 px-6 py-8">
        {/* Botão Ver mapa */}
        <Link
          href={`/mapa/${id}`}
          className="flex w-fit items-center gap-1.5 text-sm font-medium text-mt-green-dark transition-colors hover:text-mt-green"
        >
          <ArrowLeft className="size-4" />
          Ver mapa
        </Link>

        {/* Análise Diagnóstica — padrão, projeção e escolha */}
        <div
          className="card-mt flex flex-col gap-5 p-card-lg"
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
            className="border-t-linha border-mt-border pt-5 font-editorial text-[17px] leading-relaxed text-mt-green-dark"
          >
            {diagnostico.escolha}
          </p>
        </div>

        {/* Áreas que pedem atenção — fundamento e evidência de cada uma */}
        {diagnostico.areasDestacadas.length > 0 && (
          <div className="flex flex-col gap-4">
            <h2 className="px-1 font-sans text-rotulo font-medium uppercase text-mt-apoio">
              O que o estudo mostra sobre essas áreas
            </h2>

            {diagnostico.areasDestacadas.map(({ nome, status, base }) => (
              <div
                key={nome}
                className="card-mt flex flex-col gap-3 p-card-lg"
              >
                <div className="flex items-center gap-2">
                  <span
                    className={cn(
                      'inline-block size-2 shrink-0 rounded-full',
                      status === 'vermelho' ? 'bg-mt-red' : 'bg-mt-yellow'
                    )}
                  />
                  <h3 className="font-heading text-titulo-card font-bold text-mt-green-dark">{nome}</h3>
                </div>

                <p className="text-[0.95rem] leading-relaxed text-mt-black">{base.fundamento}</p>

                <p className="rounded-elemento bg-mt-green-sup px-4 py-3.5 text-sm leading-relaxed text-mt-green-dark">
                  {base.destaque}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* Status Badges - Faróis */}
        <div className="card-mt flex items-center gap-2 p-card-lg">
          {(
            [
              { tipo: 'verde',    bg: 'rgba(87,170,143,0.15)', cor: '#57AA8F', count: totais.verde },
              { tipo: 'amarelo',  bg: 'rgba(212,168,67,0.15)', cor: '#D4A843', count: totais.amarelo },
              { tipo: 'vermelho', bg: 'rgba(192,80,80,0.15)',  cor: '#C05050', count: totais.vermelho },
            ] as const
          ).map(({ tipo, bg, cor, count }) => (
            <span
              key={tipo}
              className="flex items-center gap-[5px] rounded-full px-2.5 py-1 text-sm font-medium"
              style={{ backgroundColor: bg, color: cor }}
            >
              <span className="inline-block size-2 shrink-0 rounded-full" style={{ backgroundColor: cor }} />
              {count}
            </span>
          ))}
        </div>

        {/* Suas Observações */}
        {areasComObservacao.length > 0 && (
          <div className="card-mt flex flex-col gap-4 p-card-lg">
            <h2 className="font-sans text-rotulo font-medium uppercase text-mt-apoio">
              Suas observações
            </h2>
            <div className="flex flex-col gap-4">
              {areasComObservacao.map((area) => (
                <div key={area.id}>
                  <p className="mb-0.5 text-rotulo font-medium uppercase text-mt-apoio">
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
          <div className="flex flex-col gap-4 rounded-card bg-mt-green p-card-lg shadow-mt-2">
            {/* Eyebrow + Badge */}
            <div className="flex flex-col gap-2">
              <p className="text-rotulo font-medium uppercase text-white/75">
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
                <span className="font-heading text-[2.5rem] font-bold leading-none tracking-[-0.02em]" style={{ color: zonaConfig.percentualCardCor }}>
                  {rotina.percentual_livre}%
                </span>
                <span className="text-sm font-medium text-white/75">de tempo livre</span>
              </div>
              <p className="text-xs font-medium text-white/75">
                ≈ {horasLivresSemana} horas por semana
              </p>
            </div>

            {/* Mensagem da zona */}
            <p className="font-editorial text-[15px] leading-relaxed text-white/90">
              {zonaConfig.cardDescricao}
            </p>

            {/* Link */}
            <Link
              href={`/rotina?mapaId=${id}`}
              className="flex w-fit items-center gap-1 text-xs text-white/75 transition-colors hover:text-white"
            >
              <ArrowRight className="size-3" />
              Editar rotina
            </Link>
          </div>
        )}

        {/* NPS Feedback */}
        <FeedbackTally />
      </div>
    </AuthLayout>
  )
}
