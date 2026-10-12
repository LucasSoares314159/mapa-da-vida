import { cn } from '@/lib/utils'

// Bolinha + label do semáforo do produto, padrão único.
//
// O projeto reimplementou esse mesmo verde/amarelo/vermelho em seis lugares, com
// hex divergentes. Aqui as cores saem dos tokens mt-* do tailwind.config.
//
// O label textual é obrigatório de propósito: status nunca é comunicado só por
// cor (mesma regra da acessibilidade do Mapa).

type TomStatus = 'verde' | 'amarelo' | 'vermelho' | 'neutro'

const TONS: Record<TomStatus, { ponto: string; texto: string; fundo: string; borda: string }> = {
  verde:    { ponto: '#57AA8F', texto: '#3d8f72', fundo: 'rgba(87,170,143,0.12)',  borda: 'rgba(87,170,143,0.28)' },
  amarelo:  { ponto: '#D4A843', texto: '#b88a30', fundo: 'rgba(212,168,67,0.14)',  borda: 'rgba(212,168,67,0.32)' },
  vermelho: { ponto: '#C05050', texto: '#C05050', fundo: 'rgba(192,80,80,0.10)',   borda: 'rgba(192,80,80,0.28)' },
  neutro:   { ponto: '#c8d8d2', texto: '#6f8f87', fundo: 'transparent',            borda: '#c8d8d2' },
}

type Props = {
  tom: TomStatus
  label: string
  /** sm: 11px, para linha de chips · md: 12px, para uso isolado */
  tamanho?: 'sm' | 'md'
  className?: string
}

export function IndicadorStatus({ tom, label, tamanho = 'sm', className }: Props) {
  const t = TONS[tom]
  const sm = tamanho === 'sm'

  return (
    <span
      className={cn('inline-flex items-center gap-1.5 rounded-badge font-medium', className)}
      style={{
        background: t.fundo,
        border: `1px solid ${t.borda}`,
        color: t.texto,
        fontSize: sm ? '11px' : '12px',
        padding: sm ? '3px 10px' : '4px 11px',
      }}
    >
      <PontoStatus tom={tom} />
      {label}
    </span>
  )
}

/** Só a bolinha, para quando o label já está ao lado no layout. */
export function PontoStatus({ tom }: { tom: TomStatus }) {
  return (
    <span
      aria-hidden
      className="inline-block shrink-0 rounded-full"
      style={{ width: 7, height: 7, background: TONS[tom].ponto }}
    />
  )
}
