'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ChevronUp, ChevronDown, Check } from 'lucide-react'
import { marcarAula } from '@/app/actions/progresso'
import { MATERIAIS } from '@/lib/materiais'
import { duracaoTotalTrilha, MODULOS } from '@/lib/modulos'

const TOTAL_AULAS = MODULOS.length
const DURACAO_TOTAL = duracaoTotalTrilha()

type Props = {
  nomeUsuario: string
  aulasConcluidas: number[]
  /** Logo abaixo das boas-vindas: a faixa de hábitos de hoje. */
  destaque?: React.ReactNode
}

export function TrilhaConteudo({ nomeUsuario, aulasConcluidas, destaque }: Props) {
  const [aberto, setAberto] = useState(true)
  const [abertoMateriais, setAbertoMateriais] = useState(true)
  const [concluidas, setConcluidas] = useState<number[]>(aulasConcluidas)

  const primeiroNome = nomeUsuario.split(' ')[0]
  const qtdConcluidas = concluidas.length
  const porcentagem = Math.round((qtdConcluidas / TOTAL_AULAS) * 100)

  function toggleAula(index: number) {
    const jaConcluida = concluidas.includes(index)

    setConcluidas(
      jaConcluida ? concluidas.filter((i) => i !== index) : [...concluidas, index]
    )
    marcarAula(index, !jaConcluida)
  }

  return (
    <div className="flex flex-col gap-grade">
      {/* Boas-vindas */}
      <h1 className="font-heading text-titulo font-medium text-mt-green-dark">
        Boas-vindas, {primeiroNome}.
      </h1>

      {destaque}

      {/* Card de progresso */}
      <section className="card-mt p-card">
        <div className="flex items-baseline justify-between gap-4">
          <h2 className="font-heading text-titulo-card font-bold text-mt-green-dark">
            Progresso da Trilha
          </h2>
          <span className="font-heading text-titulo-card font-bold text-mt-green-dark">
            {porcentagem}%
          </span>
        </div>
        <p className="mt-1 text-sm text-mt-apoio">
          {qtdConcluidas} de {TOTAL_AULAS} aulas concluídas
        </p>
        <div
          className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-mt-green-sup"
          role="progressbar"
          aria-valuenow={porcentagem}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Progresso da Trilha"
        >
          <div
            className="h-full rounded-full bg-mt-green transition-all duration-300"
            style={{ width: `${porcentagem}%` }}
          />
        </div>
      </section>

      {/* Lista de módulos */}
      <section className="card-mt w-full overflow-hidden">
        <CabecalhoSecao
          aberto={aberto}
          onAlternar={() => setAberto((v) => !v)}
          rotuloAria={aberto ? 'Ocultar seção' : 'Mostrar seção'}
          titulo={
            <>
              Aulas da <strong className="font-bold">Trilha</strong>
            </>
          }
          detalhe={`${TOTAL_AULAS} aulas • ${DURACAO_TOTAL}`}
        />

        {aberto && (
          <ul className="divide-y-linha divide-mt-border">
            {MODULOS.map((modulo, index) => {
              const concluida = concluidas.includes(index)

              return (
                <li
                  key={index}
                  className={`flex items-center justify-between px-card py-3.5 ${concluida ? 'opacity-60' : ''}`}
                >
                  <div className="flex min-w-0 items-center gap-3">
                    {/* Checkbox / bolinha */}
                    <button
                      onClick={() => toggleAula(index)}
                      className={`flex size-5 shrink-0 items-center justify-center rounded-full transition-colors ${
                        concluida ? 'bg-mt-green' : 'border-[1.5px] border-mt-border hover:border-mt-green'
                      }`}
                      aria-label={concluida ? 'Marcar como não concluída' : 'Marcar como concluída'}
                    >
                      {concluida && <Check className="size-3 text-white" strokeWidth={3} />}
                    </button>

                    {/* Título */}
                    <Link
                      href={`/content/modulo/${modulo.id}`}
                      className={`text-[15px] font-medium text-mt-green-dark transition-colors hover:text-mt-green ${
                        concluida ? 'line-through' : ''
                      }`}
                    >
                      {modulo.titulo}
                    </Link>
                  </div>

                  {/* Duração */}
                  <span className="ml-4 shrink-0 text-xs text-mt-apoio">{modulo.duracao}</span>
                </li>
              )
            })}
          </ul>
        )}
      </section>

      {/* Seção Materiais & Frameworks */}
      <section className="card-mt w-full overflow-hidden">
        <CabecalhoSecao
          aberto={abertoMateriais}
          onAlternar={() => setAbertoMateriais((v) => !v)}
          rotuloAria={abertoMateriais ? 'Ocultar materiais' : 'Mostrar materiais'}
          titulo={<>Materiais &amp; Frameworks</>}
        />

        {abertoMateriais && (
          <ul className="divide-y-linha divide-mt-border">
            {MATERIAIS.map((material) => (
              <li key={material.id} className="px-card py-3.5">
                <Link
                  href={`/content/material/${material.id}`}
                  className="block text-[15px] font-medium text-mt-green-dark transition-colors hover:text-mt-green"
                >
                  {material.titulo}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}

// Faixa de título das duas seções da Trilha. Fundo mt-green-sup, que é a
// variação de card do sistema; a hairline só aparece com a seção aberta.
function CabecalhoSecao({
  aberto,
  onAlternar,
  rotuloAria,
  titulo,
  detalhe,
}: {
  aberto: boolean
  onAlternar: () => void
  rotuloAria: string
  titulo: React.ReactNode
  detalhe?: string
}) {
  const Chevron = aberto ? ChevronUp : ChevronDown

  return (
    <div
      className={`flex items-center justify-between gap-4 bg-mt-green-sup px-card py-4 ${
        aberto ? 'border-b-linha border-mt-border' : ''
      }`}
    >
      <div className="flex min-w-0 flex-wrap items-center gap-x-3 gap-y-1">
        <button
          onClick={onAlternar}
          className="-m-1 flex items-center rounded-full p-1 text-mt-apoio hover:text-mt-green-dark"
          aria-label={rotuloAria}
        >
          <Chevron className="size-4" />
        </button>
        <h2 className="font-heading text-titulo-card font-medium text-mt-green-dark">{titulo}</h2>
        {detalhe && <span className="text-xs text-mt-apoio">{detalhe}</span>}
      </div>

      <button
        onClick={onAlternar}
        className="shrink-0 text-xs font-medium text-mt-green-dark underline decoration-mt-green underline-offset-4 hover:decoration-2"
      >
        {aberto ? 'Ocultar todas as seções' : 'Mostrar todas as seções'}
      </button>
    </div>
  )
}
