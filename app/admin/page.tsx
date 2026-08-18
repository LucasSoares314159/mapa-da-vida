import { Suspense } from 'react'
import { redirect } from 'next/navigation'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { contarMembros } from '@/lib/membros'
import { carregarMetricas, periodoDe, type IdPeriodo, PERIODOS, DIAS_RISCO } from '@/lib/metricas'
import { AuthLayout } from '@/components/AuthLayout'
import { Kpi } from '@/components/admin/Kpi'
import { PainelMetricas } from '@/components/admin/PainelMetricas'
import { TabelaAlunos } from '@/components/admin/TabelaAlunos'

// Métricas sempre frescas — sem cache entre visitas.
export const dynamic = 'force-dynamic'

export default async function AdminPage({
  searchParams,
}: {
  searchParams: { periodo?: string }
}) {
  const supabase = createServerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/auth/login')

  const periodoId = (PERIODOS.find((p) => p.id === searchParams.periodo)?.id ??
    'tudo') as IdPeriodo

  const [{ data: profile }, totalMembros, m] = await Promise.all([
    supabase.from('profiles').select('nome').eq('id', user.id).single(),
    contarMembros(),
    carregarMetricas(periodoDe(periodoId)),
  ])

  const nomeUsuario = profile?.nome ?? user.email ?? ''

  // Drop-off só é informativo onde há volume suficiente para significar algo.
  const piorModulo = [...m.porModulo]
    .filter((x) => x.chegaram >= 3)
    .sort((a, b) => b.dropoff - a.dropoff)[0]

  return (
    <AuthLayout titulo="Back Office" nomeUsuario={nomeUsuario} totalMembros={totalMembros}>
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-6 py-8">

        {/* Base */}
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <Kpi rotulo="Base paga" valor={m.totalAlunos} sublabel="Turma 1 + Turma 2" />
          <Kpi rotulo="Turma 1" valor={m.turma1.total} sublabel="até julho" />
          <Kpi rotulo="Turma 2" valor={m.turma2.total} sublabel="desde 17/08" />
          <Kpi
            rotulo="Em risco"
            valor={m.turma2.emRisco}
            sublabel={`Turma 2 · ${DIAS_RISCO}+ dias parada`}
            tom={m.turma2.emRisco > m.turma2.total * 0.45 ? 'critico' : 'alerta'}
          />
        </div>

        <Suspense fallback={<div className="h-64 rounded-lg border border-mt-border bg-mt-surface" />}>
          <PainelMetricas metricas={m} periodo={periodoId} />
        </Suspense>

        {/* Conteúdo, base inteira */}
        <section className="flex flex-col gap-3">
          <div>
            <h2 className="font-heading text-lg font-bold" style={{ color: '#1a2e29' }}>
              Drop-off por módulo
            </h2>
            <p className="text-sm text-mt-muted">
              Base inteira. De quem chegou ao módulo, quantos não o concluíram.
              {piorModulo && piorModulo.dropoff > 0 ? (
                <> Maior queda: <strong>{piorModulo.titulo.replace(/ —.*/, '')}</strong>.</>
              ) : (
                <> Ainda sem volume para apontar um gargalo.</>
              )}
            </p>
          </div>
          <div className="overflow-x-auto rounded-lg border border-mt-border bg-mt-surface">
            <table className="w-full min-w-[520px] text-sm">
              <thead>
                <tr className="border-b border-mt-border bg-mt-off-white">
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-mt-muted">Módulo</th>
                  <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-mt-muted">Chegaram</th>
                  <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-mt-muted">Concluíram</th>
                  <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-mt-muted">Drop-off</th>
                </tr>
              </thead>
              <tbody>
                {m.porModulo.map((mod) => (
                  <tr key={mod.id} className="border-b border-mt-border last:border-0">
                    <td className="px-4 py-3" style={{ color: '#1a2e29' }}>
                      {mod.titulo.replace(/ —/, ' ·')}
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums text-mt-muted">{mod.chegaram}</td>
                    <td className="px-4 py-3 text-right tabular-nums text-mt-muted">{mod.concluiram}</td>
                    <td className="px-4 py-3 text-right tabular-nums">
                      {mod.chegaram === 0 ? (
                        <span className="text-xs text-mt-muted">—</span>
                      ) : (
                        <span
                          className="rounded-full px-2 py-1 text-xs font-medium"
                          style={
                            mod.dropoff > 30
                              ? { backgroundColor: '#F6E0E0', color: '#C05050' }
                              : mod.dropoff > 15
                              ? { backgroundColor: '#FBF1DA', color: '#8a6d20' }
                              : { backgroundColor: '#E8F1EC', color: '#3F8C74' }
                          }
                        >
                          {mod.dropoff}%
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Alunos */}
        <section className="flex flex-col gap-3">
          <div>
            <h2 className="font-heading text-lg font-bold" style={{ color: '#1a2e29' }}>
              Alunos
            </h2>
            <p className="text-sm text-mt-muted">
              Quem puxar hoje. Sem observações do Mapa nem texto de objetivos.
            </p>
          </div>
          <TabelaAlunos alunos={m.alunos} />
        </section>

      </div>
    </AuthLayout>
  )
}
