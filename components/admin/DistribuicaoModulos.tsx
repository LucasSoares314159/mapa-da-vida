type Item = { rotulo: string; valor: number }

/** Onde cada aluno está agora — quantos pararam em cada módulo. */
export function DistribuicaoModulos({ itens }: { itens: Item[] }) {
  const maior = Math.max(...itens.map((i) => i.valor), 1)

  return (
    <div className="flex flex-col gap-2 rounded-lg border border-mt-border bg-mt-surface p-5">
      {itens.map((i) => (
        <div key={i.rotulo} className="flex items-center gap-3">
          <span className="w-40 shrink-0 truncate text-xs text-mt-muted">{i.rotulo}</span>
          <div className="h-5 flex-1 overflow-hidden rounded bg-mt-off-white">
            <div
              className="h-full rounded transition-all"
              style={{
                width: `${(i.valor / maior) * 100}%`,
                backgroundColor: i.rotulo === 'Não começou' ? '#D4A843' : '#57AA8F',
              }}
            />
          </div>
          <span className="w-6 shrink-0 text-right text-xs font-semibold tabular-nums" style={{ color: '#1a2e29' }}>
            {i.valor}
          </span>
        </div>
      ))}
    </div>
  )
}
