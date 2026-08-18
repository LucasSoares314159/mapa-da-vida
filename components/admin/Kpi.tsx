type Props = {
  rotulo: string
  valor: string | number
  sublabel?: string
  tom?: 'neutro' | 'alerta' | 'critico'
}

/** Número grande de destaque no topo do back office. */
export function Kpi({ rotulo, valor, sublabel, tom = 'neutro' }: Props) {
  const cor =
    tom === 'critico' ? '#C05050' : tom === 'alerta' ? '#D4A843' : '#1a2e29'

  return (
    <div className="flex flex-col gap-1 rounded-lg border border-mt-border bg-mt-surface p-5">
      <span className="text-xs font-medium uppercase tracking-wider text-mt-muted">
        {rotulo}
      </span>
      <span className="font-heading text-3xl font-bold tabular-nums" style={{ color: cor }}>
        {valor}
      </span>
      {sublabel && <span className="text-xs text-mt-muted">{sublabel}</span>}
    </div>
  )
}
