type Item = { rotulo: string; valor: number }

/**
 * Onde cada aluno parou.
 *
 * Módulos sem ninguém ficam de fora: uma lista de barras zeradas ocupa espaço
 * sem dizer nada. O rodapé informa quantos foram omitidos.
 */
export function DistribuicaoModulos({ itens }: { itens: Item[] }) {
  const comGente = itens.filter((i) => i.valor > 0)
  const vazios = itens.length - comGente.length
  const maior = Math.max(...comGente.map((i) => i.valor), 1)

  if (comGente.length === 0) {
    return (
      <p className="rounded-lg border border-mt-border bg-mt-surface px-4 py-3 text-sm text-mt-muted">
        Ninguém concluiu módulos ainda.
      </p>
    )
  }

  return (
    <div className="flex flex-col gap-1.5 rounded-lg border border-mt-border bg-mt-surface p-4">
      {comGente.map((i) => (
        <div key={i.rotulo} className="flex items-center gap-3">
          <span className="w-32 shrink-0 truncate text-xs text-mt-muted">{i.rotulo}</span>
          <div className="h-4 flex-1 overflow-hidden rounded bg-mt-off-white">
            <div
              className="h-full rounded transition-all"
              style={{
                width: `${(i.valor / maior) * 100}%`,
                backgroundColor: i.rotulo === 'Não começou' ? '#D4A843' : '#57AA8F',
              }}
            />
          </div>
          <span
            className="w-5 shrink-0 text-right text-xs font-semibold tabular-nums"
            style={{ color: '#1a2e29' }}
          >
            {i.valor}
          </span>
        </div>
      ))}
      {vazios > 0 && (
        <p className="mt-1 text-[11px] text-mt-muted">
          {vazios} {vazios === 1 ? 'módulo sem ninguém' : 'módulos sem ninguém'}.
        </p>
      )}
    </div>
  )
}
