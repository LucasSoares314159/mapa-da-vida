type Etapa = { rotulo: string; detalhe: string; valor: number; pct: number }

/**
 * Funil de ativação em linhas compactas.
 *
 * Cada etapa é um artefato real no banco, e o funil é cumulativo — só conta quem
 * cumpriu as anteriores. A barra usa o total da primeira etapa como referência,
 * então o estreitamento é visível de relance.
 */
export function Funil({ etapas }: { etapas: Etapa[] }) {
  return (
    <div className="overflow-hidden rounded-lg border border-mt-border bg-mt-surface">
      {etapas.map((e, i) => {
        const anterior = i > 0 ? etapas[i - 1].valor : null
        const queda =
          anterior && anterior > 0
            ? Math.round(((anterior - e.valor) / anterior) * 100)
            : 0

        return (
          <div
            key={e.rotulo}
            className="flex items-center gap-3 border-b border-mt-border px-4 py-2.5 last:border-0"
          >
            {/* Rótulo */}
            <div className="w-44 shrink-0">
              <p className="truncate text-sm font-medium" style={{ color: '#1a2e29' }}>
                {e.rotulo}
              </p>
              <p className="truncate text-[11px] text-mt-muted">{e.detalhe}</p>
            </div>

            {/* Barra */}
            <div className="h-2 flex-1 overflow-hidden rounded-full bg-mt-off-white">
              <div
                className="h-full rounded-full transition-all"
                style={{ width: `${e.pct}%`, backgroundColor: '#57AA8F' }}
              />
            </div>

            {/* Números */}
            <div className="flex w-24 shrink-0 items-baseline justify-end gap-1.5">
              <span className="text-sm font-semibold tabular-nums" style={{ color: '#1a2e29' }}>
                {e.valor}
              </span>
              <span className="text-[11px] tabular-nums text-mt-muted">{e.pct}%</span>
            </div>

            {/* Queda em relação à etapa anterior */}
            <div className="w-14 shrink-0 text-right">
              {queda > 0 && (
                <span
                  className="text-[11px] tabular-nums"
                  style={{ color: queda >= 40 ? '#C05050' : '#6f8f87' }}
                >
                  −{queda}%
                </span>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
