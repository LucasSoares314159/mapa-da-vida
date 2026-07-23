'use client'

import Link from 'next/link'
import { Compass, ArrowRight, Clock } from 'lucide-react'
import { ESTACOES, DURACOES } from '@/types'
import type { MomentoVida } from '@/types'

// Dias até a data de revisão (calendário). Negativo = vencido.
function diasAteRevisao(dataRevisao: string): number {
  const msPorDia = 1000 * 60 * 60 * 24
  const hoje = new Date()
  const alvo = new Date(dataRevisao + 'T00:00:00')
  const hojeUTC = Date.UTC(hoje.getFullYear(), hoje.getMonth(), hoje.getDate())
  const alvoUTC = Date.UTC(alvo.getFullYear(), alvo.getMonth(), alvo.getDate())
  return Math.round((alvoUTC - hojeUTC) / msPorDia)
}

// Card de destaque do Momento de Vida, no topo da página de Objetivos.
// Desenhado como "card claro elevado": maior, com fundo na cor da estação,
// sombra e respiro — para reinar visualmente acima dos cards brancos de objetivo,
// comunicando que é o princípio que guia todo o resto.
export function MomentoDestaque({ momento }: { momento: MomentoVida | null }) {
  // Estado vazio: convite para definir o momento
  if (!momento) {
    return (
      <Link
        href="/momento"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          background: '#fff',
          borderRadius: '18px',
          border: '1.5px dashed #c8d8d2',
          padding: '22px 24px',
          textDecoration: 'none',
          transition: 'border-color 0.15s, background 0.15s',
        }}
        className="group hover:border-mt-green hover:bg-mt-off-white/40"
      >
        <span
          style={{
            flexShrink: 0,
            width: '46px',
            height: '46px',
            borderRadius: '13px',
            background: '#EDF2EF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#57AA8F',
          }}
        >
          <Compass size={22} />
        </span>
        <span style={{ display: 'flex', flexDirection: 'column', gap: '3px', flex: 1 }}>
          <span style={{ fontSize: '15px', fontWeight: 600, color: '#0C0F0F' }}>
            Defina seu Momento de Vida
          </span>
          <span
            style={{
              fontFamily: "'Lora', serif",
              fontStyle: 'italic',
              fontSize: '14px',
              color: '#6f8f87',
              lineHeight: 1.5,
            }}
          >
            Sem saber qual fase você está vivendo, os objetivos perdem o rumo.
          </span>
        </span>
        <ArrowRight size={18} className="shrink-0 text-mt-muted transition-colors group-hover:text-mt-green" />
      </Link>
    )
  }

  // Estado preenchido: card elevado na cor da estação
  const est = ESTACOES[momento.estacao]
  const dias = diasAteRevisao(momento.data_revisao)
  const vencido = dias < 0
  const revisaoLabel = vencido
    ? 'passou da hora de revisar'
    : dias === 0
      ? 'revisar hoje'
      : dias === 1
        ? 'revisar amanhã'
        : `revisar em ${dias} dias`

  return (
    <Link
      href="/momento"
      style={{
        display: 'block',
        // Fundo suave na cor da estação (gradiente sutil dá o "peso" de destaque)
        background: `linear-gradient(135deg, ${est.cor}14 0%, ${est.cor}08 100%)`,
        borderRadius: '18px',
        border: `1px solid ${est.cor}40`,
        padding: '22px 24px',
        textDecoration: 'none',
        boxShadow: `0 4px 20px ${est.cor}1f`,
        transition: 'box-shadow 0.2s, transform 0.2s',
      }}
      className="group hover:-translate-y-0.5"
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
        {/* Ícone da estação */}
        <span
          style={{
            flexShrink: 0,
            width: '46px',
            height: '46px',
            borderRadius: '13px',
            background: est.cor,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '22px',
            boxShadow: `0 2px 8px ${est.cor}55`,
          }}
        >
          {est.emoji}
        </span>

        <div style={{ flex: 1, minWidth: 0 }}>
          {/* Eyebrow */}
          <span
            style={{
              fontSize: '11px',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              color: est.cor,
            }}
          >
            Seu momento de vida · {est.label}
          </span>

          {/* Frase — grande, em Lora, é a estrela do card */}
          <p
            style={{
              fontFamily: "'Lora', serif",
              fontSize: '18px',
              color: '#0C0F0F',
              lineHeight: 1.5,
              margin: '6px 0 0',
            }}
          >
            {momento.frase}
          </p>
        </div>

        <ArrowRight
          size={18}
          className="shrink-0 text-mt-muted transition-transform group-hover:translate-x-0.5"
          style={{ marginTop: '4px', color: est.cor }}
        />
      </div>

      {/* Rodapé: fase + revisão */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          marginTop: '16px',
          paddingTop: '14px',
          borderTop: `1px solid ${est.cor}26`,
          fontSize: '12px',
          color: vencido ? '#C05050' : '#6f8f87',
          fontWeight: 500,
        }}
      >
        <Clock size={13} />
        <span>Fase de {DURACOES[momento.duracao].label}</span>
        <span style={{ opacity: 0.5 }}>·</span>
        <span style={{ fontWeight: vencido ? 600 : 500 }}>{revisaoLabel}</span>
      </div>
    </Link>
  )
}
