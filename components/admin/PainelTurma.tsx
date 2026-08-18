import type { VisaoTurma } from '@/lib/metricas'
import { MODULOS } from '@/lib/modulos'
import { Funil } from './Funil'
import { DistribuicaoModulos } from './DistribuicaoModulos'

/** Bloco completo de uma turma: números, funil, alcance e distribuição. */
export function PainelTurma({ turma, destaque }: { turma: VisaoTurma; destaque?: boolean }) {
  const { total } = turma

  return (
    <section
      className="flex flex-col gap-4 rounded-lg border p-5"
      style={{
        borderColor: destaque ? '#57AA8F' : '#c8d8d2',
        backgroundColor: destaque ? '#F5FAF7' : 'transparent',
      }}
    >
      <div>
        <div className="flex items-baseline gap-2">
          <h2 className="font-heading text-lg font-bold" style={{ color: '#1a2e29' }}>
            {turma.nome}
          </h2>
          <span className="text-sm tabular-nums text-mt-muted">
            {total} {total === 1 ? 'aluno' : 'alunos'}
          </span>
        </div>
        <p className="mt-1 text-sm text-mt-muted">{turma.descricao}</p>
      </div>

      {total === 0 ? (
        <p className="text-sm text-mt-muted">Nenhum aluno nesta turma ainda.</p>
      ) : (
        <>
          {/* Números */}
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <Mini rotulo="Média de módulos" valor={`${turma.mediaModulos}/${MODULOS.length}`} />
            <Mini rotulo="Concluíram tudo" valor={turma.concluiramTrilha} />
            {turma.temDataReal ? (
              <>
                <Mini rotulo="Ativos (7d)" valor={turma.ativos7d} sublabel="concluíram alguma aula" />
                <Mini
                  rotulo="Em risco"
                  valor={turma.emRisco}
                  tom={turma.emRisco > total * 0.45 ? 'critico' : 'alerta'}
                />
              </>
            ) : (
              <div className="col-span-2 flex items-center rounded-lg border border-mt-border bg-mt-surface px-4 py-3">
                <span className="text-xs text-mt-muted">
                  Sem data real de conclusão — métricas de ritmo e risco não se aplicam.
                </span>
              </div>
            )}
          </div>

          {/* Funil */}
          <div className="flex flex-col gap-2">
            <h3 className="text-xs font-medium uppercase tracking-wider text-mt-muted">
              Funil de ativação
            </h3>
            <Funil etapas={turma.funil} />
          </div>

          {/* Alcance */}
          <div className="rounded-lg border border-mt-border bg-mt-surface p-4">
            <h3 className="mb-3 text-xs font-medium uppercase tracking-wider text-mt-muted">
              Alcance de cada ferramenta · em qualquer ordem
            </h3>
            <div className="flex flex-col gap-2">
              {turma.alcance.map((a) => (
                <div key={a.rotulo} className="flex items-baseline justify-between gap-3">
                  <span className="text-sm text-mt-muted">{a.rotulo}</span>
                  <span className="text-sm font-semibold tabular-nums" style={{ color: '#1a2e29' }}>
                    {a.valor}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Distribuição */}
          <div className="flex flex-col gap-2">
            <h3 className="text-xs font-medium uppercase tracking-wider text-mt-muted">
              Onde pararam
            </h3>
            <DistribuicaoModulos itens={turma.distribuicao} />
          </div>
        </>
      )}
    </section>
  )
}

function Mini({
  rotulo,
  valor,
  sublabel,
  tom = 'neutro',
}: {
  rotulo: string
  valor: string | number
  sublabel?: string
  tom?: 'neutro' | 'alerta' | 'critico'
}) {
  const cor = tom === 'critico' ? '#C05050' : tom === 'alerta' ? '#D4A843' : '#1a2e29'
  return (
    <div className="flex flex-col gap-0.5 rounded-lg border border-mt-border bg-mt-surface px-4 py-3">
      <span className="text-[11px] font-medium uppercase tracking-wider text-mt-muted">
        {rotulo}
      </span>
      <span className="font-heading text-xl font-bold tabular-nums" style={{ color: cor }}>
        {valor}
      </span>
      {sublabel && <span className="text-[11px] text-mt-muted">{sublabel}</span>}
    </div>
  )
}
