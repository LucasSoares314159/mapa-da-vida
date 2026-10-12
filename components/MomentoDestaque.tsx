'use client'

import Link from 'next/link'
import { Compass, ArrowRight } from 'lucide-react'
import { diasAtePartirDeHoje } from '@/lib/prazo'
import { ESTACOES } from '@/types'
import type { MomentoVida } from '@/types'

// Faixa do Momento de Vida no topo da página de Objetivos.
//
// Antes era um "card elevado" de ~170px, com a frase em 18px — a maior tipografia
// da tela, acima do próprio texto dos objetivos. Isso invertia a hierarquia: a
// página é sobre objetivos, o momento é o contexto que os guia.
//
// Agora ocupa ~90px: mantém o fundo na cor da estação (a presença continua), mas
// perde o eyebrow, o rodapé de revisão e a sombra alta. A frase cai para 15px e
// trunca em 2 linhas. A revisão só aparece quando está vencida — é o único aviso
// que exige ação; "revisar em 48 dias" era ruído no topo de toda visita.
export function MomentoDestaque({ momento }: { momento: MomentoVida | null }) {
  // Estado vazio: convite para definir o momento
  if (!momento) {
    return (
      <Link
        href="/momento"
        className="group flex items-center gap-3 rounded-[14px] border border-dashed border-mt-border bg-white px-4 py-3.5 no-underline transition-colors hover:border-mt-green hover:bg-mt-off-white/40"
      >
        <span className="flex size-8 shrink-0 items-center justify-center rounded-[10px] bg-mt-off-white text-mt-green">
          <Compass size={16} />
        </span>
        <span className="flex min-w-0 flex-1 flex-col">
          <span className="text-[13px] font-semibold text-mt-black">
            Defina seu Momento de Vida
          </span>
          <span className="truncate font-editorial text-xs italic text-mt-muted">
            Sem saber qual fase você está vivendo, os objetivos perdem o rumo.
          </span>
        </span>
        <ArrowRight size={16} className="shrink-0 text-mt-muted transition-colors group-hover:text-mt-green" />
      </Link>
    )
  }

  const est = ESTACOES[momento.estacao]
  const vencido = diasAtePartirDeHoje(momento.data_revisao) < 0

  return (
    <Link
      href="/momento"
      className="group flex items-center gap-3 rounded-[14px] px-4 py-3 no-underline transition-shadow hover:shadow-[0_2px_8px_rgba(0,0,0,0.06)]"
      style={{
        background: `linear-gradient(135deg, ${est.cor}14 0%, ${est.cor}08 100%)`,
        border: `1px solid ${est.cor}40`,
        boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
      }}
    >
      {/* Ícone da estação */}
      <span
        aria-hidden
        className="flex size-8 shrink-0 items-center justify-center rounded-[10px] text-base"
        style={{ background: est.cor }}
      >
        {est.emoji}
      </span>

      <span className="flex min-w-0 flex-1 flex-col gap-0.5">
        {/* Estação + aviso de revisão vencida (só quando vencida) */}
        <span className="flex items-center gap-1.5 text-[11px] font-semibold">
          <span style={{ color: est.cor }}>Momento: {est.label}</span>
          {vencido && (
            <>
              <span aria-hidden className="text-mt-muted opacity-50">·</span>
              <span className="text-mt-red">passou da hora de revisar</span>
            </>
          )}
        </span>

        {/* Frase — presente, mas não mais a maior tipografia da tela */}
        <span
          className="font-editorial text-[15px] leading-snug text-mt-black"
          style={{
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {momento.frase}
        </span>
      </span>

      <ArrowRight
        size={16}
        className="shrink-0 transition-transform group-hover:translate-x-0.5"
        style={{ color: est.cor }}
      />
    </Link>
  )
}
