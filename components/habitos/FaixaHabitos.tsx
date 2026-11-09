'use client'

import Link from 'next/link'
import { ChevronRight, Plus } from 'lucide-react'
import { useMarcarHabitos, type HabitoDoDia } from '@/hooks/useMarcarHabitos'
import { CirculoHabito } from './CirculoHabito'

// Faixa de hábitos no topo da Trilha (/content). É onde a pessoa já passa todo
// dia: marcar dali, com o mesmo gesto e a mesma celebração da tela Hoje, evita
// depender de lembrete para o hábito ser lembrado. A tela cheia de "dia
// completo" fica só em /habitos; aqui o fechamento do dia vira um aviso.

export function FaixaHabitos({ habitos }: { habitos: HabitoDoDia[] }) {
  const { feitos, celebrando, aviso, avisar, alternar } = useMarcarHabitos(habitos)

  if (habitos.length === 0) {
    return (
      <Link
        href="/habitos/novo"
        className="card-mt flex items-center gap-4 p-card transition-shadow hover:shadow-mt-2 focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-[3px] focus-visible:outline-mt-green-dark"
      >
        <span className="flex size-12 shrink-0 items-center justify-center rounded-full border-2 border-dashed border-mt-apoio text-mt-green-dark">
          <Plus className="size-5" aria-hidden />
        </span>
        <span className="flex flex-1 flex-col gap-0.5">
          <span className="text-base font-semibold text-mt-green-dark">Crie seu primeiro hábito</span>
          <span className="text-sm text-mt-apoio">Um pequeno, ligado à área que mais pede atenção no seu Mapa.</span>
        </span>
        <ChevronRight className="size-5 shrink-0 text-mt-green-dark" aria-hidden />
      </Link>
    )
  }

  const feitosHoje = habitos.filter((h) => feitos[h.id]).length

  return (
    <section className="card-mt flex flex-col gap-4 p-card" aria-labelledby="faixa-habitos-titulo">
      <div className="flex items-baseline justify-between gap-3">
        <h2 id="faixa-habitos-titulo" className="font-heading text-titulo-card font-bold text-mt-green-dark">
          Hábitos de hoje
        </h2>
        <span className="text-sm text-mt-apoio">
          {feitosHoje} de {habitos.length}
        </span>
      </div>

      <ul className="flex flex-wrap justify-around gap-x-2 gap-y-4 sm:justify-start sm:gap-x-6">
        {habitos.map((h) => (
          <li key={h.id} className="w-[88px]">
            <CirculoHabito
              tamanho="compacto"
              nome={h.nome}
              icone={h.icone}
              meta={h.meta}
              feitosSemana={h.feitosAntesDeHoje + (feitos[h.id] ? 1 : 0)}
              feito={!!feitos[h.id]}
              celebrando={celebrando?.id === h.id ? celebrando.tipo : null}
              onAlternar={() => alternar(h)}
              onToqueCurto={() => avisar('Segure o círculo para marcar.')}
            />
          </li>
        ))}
      </ul>

      <Link
        href="/habitos"
        className="inline-flex min-h-11 items-center gap-1 self-start rounded-sm text-sm font-semibold text-mt-green-dark underline decoration-mt-green underline-offset-4 focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-mt-green-dark"
      >
        Ver hábitos e progresso
        <ChevronRight className="size-4" aria-hidden />
      </Link>

      <div role="status" aria-live="polite" className="pointer-events-none fixed inset-x-4 bottom-24 z-40 flex justify-center lg:bottom-6">
        {aviso && (
          <span className="animate-habito-entrar rounded-elemento bg-mt-green-dark px-4 py-3 text-sm text-mt-off-white shadow-mt-2 motion-reduce:animate-none">
            {aviso}
          </span>
        )}
      </div>
    </section>
  )
}
