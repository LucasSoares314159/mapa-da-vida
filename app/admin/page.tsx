import { redirect } from 'next/navigation'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { contarMembros } from '@/lib/membros'
import { carregarMetricas, DIAS_RISCO } from '@/lib/metricas'
import { MODULOS } from '@/lib/modulos'
import { AuthLayout } from '@/components/AuthLayout'
import { Kpi } from '@/components/admin/Kpi'
import { Funil } from '@/components/admin/Funil'
import { DistribuicaoModulos } from '@/components/admin/DistribuicaoModulos'
import { TabelaAlunos } from '@/components/admin/TabelaAlunos'

// Métricas sempre frescas — sem cache entre visitas.
export const dynamic = 'force-dynamic'

export default async function AdminPage() {
  const supabase = createServerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/auth/login')

  const [{ data: profile }, totalMembros, m] = await Promise.all([
    supabase.from('profiles').select('nome').eq('id', user.id).single(),
    contarMembros(),
    carregarMetricas(),
  ])

  const nomeUsuario = profile?.nome ?? user.email ?? ''
  const piorModulo = [...m.porModulo]
    .filter((x) => x.chegaram > 0)
    .sort((a, b) => b.dropoff - a.dropoff)[0]

  return (
    <AuthLayout titulo="Back Office" nomeUsuario={nomeUsuario} totalMembros={totalMembros}>
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-6 py-8">

        {/* Números do topo */}
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <Kpi rotulo="Alunos" valor={m.totalAlunos} sublabel="cadastrados no total" />
          <Kpi
            rotulo="Ativos"
            valor={m.ativos7d}
            sublabel={`concluíram algo em ${DIAS_RISCO}d`}
          />
          <Kpi
            rotulo="Em risco"
            valor={m.emRisco}
            sublabel={`${DIAS_RISCO}+ dias sem avançar`}
            tom={m.emRisco > m.totalAlunos * 0.45 ? 'critico' : 'alerta'}
          />
          <Kpi
            rotulo="Concluíram"
            valor={m.concluiramTrilha}
            sublabel={`os ${MODULOS.length} módulos`}
          />
        </div>

        {!m.dadosDeTempoConfiaveis && (
          <div
            className="rounded-lg border p-4 text-sm"
            style={{ borderColor: '#D4A843', backgroundColor: '#FBF6E9', color: '#8a6d20' }}
          >
            <strong>As métricas de tempo ainda não têm base real.</strong> Todo o
            progresso registrado até agora veio da migração, com data estimada. Os
            números de &ldquo;parado há&rdquo; passam a valer conforme a turma nova avança.
          </div>
        )}

        {/* Funil */}
        <section className="flex flex-col gap-3">
          <div>
            <h2 className="font-heading text-lg font-bold" style={{ color: '#1a2e29' }}>
              Funil de ativação
            </h2>
            <p className="text-sm text-mt-muted">
              Cumulativo: cada etapa conta só quem cumpriu todas as anteriores.
              A maior queda é o gargalo do mês.
            </p>
          </div>
          <Funil etapas={m.funil} />

          <div className="rounded-lg border border-mt-border bg-mt-surface p-5">
            <p className="mb-3 text-xs font-medium uppercase tracking-wider text-mt-muted">
              Alcance de cada ferramenta · em qualquer ordem
            </p>
            <div className="flex flex-col gap-2">
              {m.alcance.map((a) => (
                <div key={a.rotulo} className="flex items-baseline justify-between gap-3">
                  <span className="text-sm text-mt-muted">{a.rotulo}</span>
                  <span className="text-sm font-semibold tabular-nums" style={{ color: '#1a2e29' }}>
                    {a.valor}
                  </span>
                </div>
              ))}
            </div>
            <p className="mt-3 text-xs text-mt-muted">
              Números maiores que os do funil significam que a pessoa usou a
              ferramenta sem marcar a aula correspondente.
            </p>
          </div>
        </section>

        {/* Distribuição */}
        <section className="flex flex-col gap-3">
          <div>
            <h2 className="font-heading text-lg font-bold" style={{ color: '#1a2e29' }}>
              Onde a turma está agora
            </h2>
            <p className="text-sm text-mt-muted">Último módulo concluído por aluno.</p>
          </div>
          <DistribuicaoModulos itens={m.distribuicaoAtual} />
        </section>

        {/* Conteúdo */}
        <section className="flex flex-col gap-3">
          <div>
            <h2 className="font-heading text-lg font-bold" style={{ color: '#1a2e29' }}>
              Drop-off por módulo
            </h2>
            <p className="text-sm text-mt-muted">
              De quem chegou ao módulo, quantos não o concluíram.
              {piorModulo && piorModulo.dropoff > 0 && (
                <> Maior queda: <strong>{piorModulo.titulo.replace(/ —.*/, '')}</strong>.</>
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
