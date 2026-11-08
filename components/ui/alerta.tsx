'use client'

import { AlertTriangle, Info, CheckCircle2, X, type LucideIcon } from 'lucide-react'

// Componente de mensagem de informação/alarme, padrão único do produto.
// Ícone em círculo à esquerda + título em negrito + texto de apoio.
// Inspirado em padrões de alerta modernos (ícone destacado, hierarquia de peso,
// fundo saturado o suficiente para ler como estado, cantos bem arredondados).

type VarianteAlerta = 'atencao' | 'info' | 'sucesso'

// Classes literais (não montadas) para o Tailwind encontrá-las no build.
const VARIANTES: Record<VarianteAlerta, {
  icone: LucideIcon
  caixa: string  // fundo e contorno do card
  icone_: string // círculo do ícone
  titulo: string
  fechar: string
}> = {
  atencao: {
    icone: AlertTriangle,
    caixa: 'bg-mt-red/[0.06] border-mt-red/25',
    icone_: 'bg-mt-red/[0.14] text-mt-red',
    titulo: 'text-mt-red',
    fechar: 'text-mt-red hover:bg-mt-red/[0.14]',
  },
  info: {
    icone: Info,
    caixa: 'bg-mt-yellow/[0.08] border-mt-yellow/30',
    icone_: 'bg-mt-yellow/[0.18] text-[#8a6620]',
    titulo: 'text-[#8a6620]',
    fechar: 'text-[#8a6620] hover:bg-mt-yellow/[0.18]',
  },
  sucesso: {
    icone: CheckCircle2,
    caixa: 'bg-mt-green-sup border-mt-green/30',
    icone_: 'bg-mt-green/[0.16] text-[#2f7a60]',
    titulo: 'text-[#2f7a60]',
    fechar: 'text-[#2f7a60] hover:bg-mt-green/[0.16]',
  },
}

type Props = {
  variante: VarianteAlerta
  titulo: string
  children: React.ReactNode
  /** Ícone customizado (sobrescreve o padrão da variante) */
  icone?: LucideIcon
  /** Se fornecido, exibe um botão de fechar que dispara este callback */
  onFechar?: () => void
}

// Card do sistema (rounded-card, hairline), tingido pela variante. O amarelo e o
// verde do texto são versões escurecidas dos tokens: mt-yellow e mt-green como
// texto reprovam no AA sobre fundo claro.
export function Alerta({ variante, titulo, children, icone, onFechar }: Props) {
  const v = VARIANTES[variante]
  const Icone = icone ?? v.icone

  return (
    <div className={`flex items-start gap-3 rounded-card border-linha px-[18px] py-4 ${v.caixa}`}>
      <span className={`mt-px flex size-[34px] shrink-0 items-center justify-center rounded-full ${v.icone_}`}>
        <Icone size={17} strokeWidth={2.2} />
      </span>

      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className={`text-[15px] font-semibold leading-snug ${v.titulo}`}>{titulo}</span>
        <span className="text-sm leading-relaxed text-mt-apoio">{children}</span>
      </div>

      {onFechar && (
        <button
          onClick={onFechar}
          aria-label="Fechar aviso"
          className={`-mr-1 mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full opacity-[0.65] transition-[opacity,background-color] hover:opacity-100 focus-visible:opacity-100 ${v.fechar}`}
        >
          <X size={15} strokeWidth={2.4} />
        </button>
      )}
    </div>
  )
}
