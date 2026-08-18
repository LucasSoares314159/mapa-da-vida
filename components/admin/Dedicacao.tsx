import type { VisaoTurma } from '@/lib/metricas'

/** Formata minutos como "1h 30min" ou "45min". */
function formatarMinutos(min: number): string {
  if (min < 60) return `${min}min`
  const h = Math.floor(min / 60)
  const m = min % 60
  return m ? `${h}h ${m}min` : `${h}h`
}

/**
 * Dedicação medida por retorno e consistência.
 *
 * Não usamos tempo de sessão de propósito: ele mede aba aberta, e o conteúdo
 * pesado da trilha vive no Notion e no YouTube — fora da plataforma. Voltar em
 * dias distintos e manter sequência diz mais sobre hábito do que qualquer
 * cronômetro.
 */
export function Dedicacao({ turma }: { turma: VisaoTurma }) {
  const r = turma.ritmo
  const comecaram = turma.total - turma.distribuicao[0].valor

  if (!turma.temDataReal) {
    return (
      <div className="rounded-lg border border-mt-border bg-mt-surface px-4 py-3">
        <p className="text-sm text-mt-muted">
          Esta turma teve o progresso migrado sem data real, então retorno e
          sequência não podem ser calculados. Só o conteúdo concluído:{' '}
          <strong style={{ color: '#1a2e29' }}>
            {formatarMinutos(r.minutosTotais)}
          </strong>{' '}
          no total.
        </p>
      </div>
    )
  }

  if (comecaram === 0) {
    return (
      <div className="rounded-lg border border-mt-border bg-mt-surface px-4 py-3">
        <p className="text-sm text-mt-muted">
          Ninguém concluiu aulas ainda — sem base para medir dedicação.
        </p>
      </div>
    )
  }

  const itens = [
    {
      rotulo: 'Voltaram',
      valor: `${r.voltaram}/${comecaram}`,
      nota: 'em mais de um dia',
      tom: r.voltaram === 0 ? 'alerta' : 'neutro',
    },
    {
      rotulo: 'Dias com atividade',
      valor: r.mediaDiasAtivos,
      nota: 'média de quem começou',
      tom: 'neutro',
    },
    {
      rotulo: 'Melhor sequência',
      valor: `${r.melhorSequencia}d`,
      nota: 'dias seguidos',
      tom: 'neutro',
    },
    {
      rotulo: 'Ritmo',
      valor: r.ritmoMediano === null ? '—' : `${r.ritmoMediano}d`,
      nota: r.ritmoMediano === null ? 'precisa de 2+ aulas' : 'entre uma aula e a seguinte',
      tom: r.ritmoMediano !== null && r.ritmoMediano > 14 ? 'alerta' : 'neutro',
    },
    {
      rotulo: 'Conteúdo',
      valor: formatarMinutos(r.minutosPorAluno),
      nota: 'por aluno que começou',
      tom: 'neutro',
    },
  ] as const

  return (
    <div className="grid grid-cols-2 gap-2 lg:grid-cols-5">
      {itens.map((i) => (
        <div
          key={i.rotulo}
          className="flex flex-col gap-0.5 rounded-lg border border-mt-border bg-mt-surface px-3 py-2.5"
        >
          <span className="text-[10px] font-medium uppercase tracking-wider text-mt-muted">
            {i.rotulo}
          </span>
          <span
            className="font-heading text-lg font-bold tabular-nums"
            style={{ color: i.tom === 'alerta' ? '#D4A843' : '#1a2e29' }}
          >
            {i.valor}
          </span>
          <span className="text-[10px] text-mt-muted">{i.nota}</span>
        </div>
      ))}
    </div>
  )
}
