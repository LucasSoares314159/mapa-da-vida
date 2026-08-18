type Etapa = { rotulo: string; detalhe: string; valor: number; pct: number }

/**
 * Funil de ativação. Cada etapa é um artefato real no banco — não um checkbox —
 * então a queda entre dois passos mostra onde as pessoas realmente param.
 */
export function Funil({ etapas }: { etapas: Etapa[] }) {
  return (
    <div className="flex flex-col gap-2">
      {etapas.map((e, i) => {
        const anterior = i > 0 ? etapas[i - 1].valor : null
        const queda =
          anterior && anterior > 0
            ? Math.round(((anterior - e.valor) / anterior) * 100)
            : 0

        return (
          <div key={e.rotulo} className="rounded-lg border border-mt-border bg-mt-surface p-4">
            <div className="flex items-baseline justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold" style={{ color: '#1a2e29' }}>
                  {e.rotulo}
                </p>
                <p className="truncate text-xs text-mt-muted">{e.detalhe}</p>
              </div>
              <div className="flex shrink-0 items-baseline gap-2">
                <span className="font-heading text-xl font-bold tabular-nums" style={{ color: '#1a2e29' }}>
                  {e.valor}
                </span>
                <span className="text-xs tabular-nums text-mt-muted">{e.pct}%</span>
              </div>
            </div>

            <div className="mt-3 h-2 overflow-hidden rounded-full bg-mt-off-white">
              <div
                className="h-full rounded-full transition-all"
                style={{ width: `${e.pct}%`, backgroundColor: '#57AA8F' }}
              />
            </div>

            {queda > 0 && (
              <p className="mt-2 text-xs" style={{ color: queda >= 40 ? '#C05050' : '#6f8f87' }}>
                −{queda}% em relação à etapa anterior
              </p>
            )}
          </div>
        )
      })}
    </div>
  )
}
