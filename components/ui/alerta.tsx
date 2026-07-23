'use client'

import { AlertTriangle, Info, CheckCircle2, X, type LucideIcon } from 'lucide-react'

// Componente de mensagem de informação/alarme, padrão único do produto.
// Ícone em círculo à esquerda + título em negrito + texto de apoio.
// Inspirado em padrões de alerta modernos (ícone destacado, hierarquia de peso,
// fundo saturado o suficiente para ler como estado, cantos bem arredondados).

type VarianteAlerta = 'atencao' | 'info' | 'sucesso'

const VARIANTES: Record<VarianteAlerta, {
  icone: LucideIcon
  cor: string        // cor principal (ícone, título)
  fundo: string      // fundo do card
  fundoIcone: string // fundo do círculo do ícone
  borda: string
}> = {
  atencao: {
    icone: AlertTriangle,
    cor: '#C05050',
    fundo: 'rgba(192, 80, 80, 0.06)',
    fundoIcone: 'rgba(192, 80, 80, 0.14)',
    borda: 'rgba(192, 80, 80, 0.25)',
  },
  info: {
    icone: Info,
    cor: '#b88a30',
    fundo: 'rgba(212, 168, 67, 0.08)',
    fundoIcone: 'rgba(212, 168, 67, 0.18)',
    borda: 'rgba(212, 168, 67, 0.30)',
  },
  sucesso: {
    icone: CheckCircle2,
    cor: '#3d8f72',
    fundo: 'rgba(87, 170, 143, 0.08)',
    fundoIcone: 'rgba(87, 170, 143, 0.16)',
    borda: 'rgba(87, 170, 143, 0.28)',
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

export function Alerta({ variante, titulo, children, icone, onFechar }: Props) {
  const v = VARIANTES[variante]
  const Icone = icone ?? v.icone

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: '13px',
        background: v.fundo,
        border: `1px solid ${v.borda}`,
        borderRadius: '14px',
        padding: '16px 18px',
      }}
    >
      {/* Ícone em círculo */}
      <span
        style={{
          flexShrink: 0,
          width: '34px',
          height: '34px',
          borderRadius: '50%',
          background: v.fundoIcone,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: v.cor,
          marginTop: '1px',
        }}
      >
        <Icone size={17} strokeWidth={2.2} />
      </span>

      {/* Título + texto de apoio */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', flex: 1, minWidth: 0 }}>
        <span style={{ fontSize: '14px', fontWeight: 600, color: v.cor, lineHeight: 1.35 }}>
          {titulo}
        </span>
        <span style={{ fontSize: '13.5px', color: '#4a5f59', lineHeight: 1.6 }}>
          {children}
        </span>
      </div>

      {/* Botão de fechar */}
      {onFechar && (
        <button
          onClick={onFechar}
          aria-label="Fechar aviso"
          style={{
            flexShrink: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '26px',
            height: '26px',
            marginTop: '2px',
            marginRight: '-4px',
            borderRadius: '8px',
            background: 'transparent',
            color: v.cor,
            cursor: 'pointer',
            opacity: 0.65,
            transition: 'opacity 0.15s, background 0.15s',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.background = v.fundoIcone }}
          onMouseLeave={(e) => { e.currentTarget.style.opacity = '0.65'; e.currentTarget.style.background = 'transparent' }}
        >
          <X size={15} strokeWidth={2.4} />
        </button>
      )}
    </div>
  )
}
