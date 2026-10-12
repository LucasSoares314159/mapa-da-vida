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
}

export function TrilhaConteudo({ nomeUsuario, aulasConcluidas }: Props) {
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
    <div className="flex flex-col gap-6">
      {/* Boas-vindas */}
      <div>
        <h1 className="font-heading text-2xl font-bold" style={{ color: '#1a2e29' }}>
          Boas-vindas, {primeiroNome}.
        </h1>
      </div>

      {/* Card de progresso */}
      <div className="flex flex-col gap-2">
        <span className="text-sm font-semibold" style={{ color: '#1a2e29' }}>
          Progresso do curso
        </span>
        <div
          className="rounded-xl px-5 py-4"
          style={{ border: '0.5px solid #c8d8d2', backgroundColor: '#ffffff' }}
        >
          <div className="flex items-center justify-between">
            <span className="text-sm" style={{ color: '#4a6b62' }}>
              {qtdConcluidas} de {TOTAL_AULAS} aulas concluídas
            </span>
            <span className="text-sm font-semibold" style={{ color: '#1a2e29' }}>
              {porcentagem}%
            </span>
          </div>
          <div
            className="mt-3 w-full overflow-hidden"
            style={{ backgroundColor: '#f0f7f5', borderRadius: '100px', height: '6px' }}
          >
            <div
              className="h-full transition-all duration-300"
              style={{
                width: `${porcentagem}%`,
                backgroundColor: '#57AA8F',
                borderRadius: '100px',
              }}
            />
          </div>
        </div>
      </div>

      {/* Lista de módulos */}
      <div
        className="w-full rounded-xl overflow-hidden"
        style={{ border: '0.5px solid #c8d8d2', backgroundColor: '#ffffff' }}
      >
        {/* Header da seção */}
        <div
          className="flex items-center justify-between px-5 py-4"
          style={{
            backgroundColor: '#f0f7f5',
            borderBottom: aberto ? '0.5px solid #c8d8d2' : 'none',
          }}
        >
          <div className="flex items-center gap-3">
            <button
              onClick={() => setAberto((v) => !v)}
              className="flex items-center gap-1.5"
              aria-label={aberto ? 'Ocultar seção' : 'Mostrar seção'}
            >
              {aberto ? (
                <ChevronUp className="size-4" style={{ color: '#4a6b62' }} />
              ) : (
                <ChevronDown className="size-4" style={{ color: '#4a6b62' }} />
              )}
            </button>
            <span className="text-sm font-semibold" style={{ color: '#1a2e29' }}>
              Aulas da TRILHA
            </span>
            <span className="text-xs" style={{ color: '#4a6b62' }}>
              {TOTAL_AULAS} aulas • {DURACAO_TOTAL}
            </span>
          </div>

          <button
            onClick={() => setAberto((v) => !v)}
            className="text-xs font-medium transition-opacity hover:opacity-70"
            style={{ color: '#57AA8F' }}
          >
            {aberto ? 'Ocultar todas as seções' : 'Mostrar todas as seções'}
          </button>
        </div>

        {/* Módulos */}
        {aberto && (
          <div>
            {MODULOS.map((modulo, index) => {
              const concluida = concluidas.includes(index)

              return (
                <div
                  key={index}
                  className="flex items-center justify-between px-5 py-3.5"
                  style={{
                    borderBottom: index < MODULOS.length - 1 ? '0.5px solid #c8d8d2' : 'none',
                    opacity: concluida ? 0.6 : 1,
                  }}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {/* Checkbox / bolinha */}
                    <button
                      onClick={() => toggleAula(index)}
                      className="shrink-0 size-4 rounded-full flex items-center justify-center transition-colors"
                      style={
                        concluida
                          ? { backgroundColor: '#57AA8F', border: 'none', cursor: 'pointer' }
                          : { backgroundColor: 'transparent', border: '1.5px solid #c8d8d2', cursor: 'pointer' }
                      }
                      aria-label={concluida ? 'Marcar como não concluída' : 'Marcar como concluída'}
                    >
                      {concluida && <Check className="size-2.5 text-white" strokeWidth={3} />}
                    </button>

                    {/* Título */}
                    <Link
                      href={`/content/modulo/${modulo.id}`}
                      className="text-sm font-medium transition-opacity hover:opacity-70"
                      style={{
                        color: '#57AA8F',
                        textDecoration: concluida ? 'line-through' : 'none',
                      }}
                    >
                      {modulo.titulo}
                    </Link>
                  </div>

                  {/* Duração */}
                  <span className="text-xs shrink-0 ml-4" style={{ color: '#4a6b62' }}>
                    {modulo.duracao}
                  </span>
                </div>
              )
            })}
          </div>
        )}
      </div>
      {/* Seção Materiais & Frameworks */}
      <div
        className="w-full rounded-xl overflow-hidden"
        style={{ border: '0.5px solid #c8d8d2', backgroundColor: '#ffffff' }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-5 py-4"
          style={{
            backgroundColor: '#f0f7f5',
            borderBottom: abertoMateriais ? '0.5px solid #c8d8d2' : 'none',
          }}
        >
          <div className="flex items-center gap-3">
            <button
              onClick={() => setAbertoMateriais((v) => !v)}
              className="flex items-center gap-1.5"
              aria-label={abertoMateriais ? 'Ocultar materiais' : 'Mostrar materiais'}
            >
              {abertoMateriais ? (
                <ChevronUp className="size-4" style={{ color: '#4a6b62' }} />
              ) : (
                <ChevronDown className="size-4" style={{ color: '#4a6b62' }} />
              )}
            </button>
            <span className="text-sm font-semibold" style={{ color: '#1a2e29' }}>
              Materiais &amp; Frameworks
            </span>
          </div>

          <button
            onClick={() => setAbertoMateriais((v) => !v)}
            className="text-xs font-medium transition-opacity hover:opacity-70"
            style={{ color: '#57AA8F' }}
          >
            {abertoMateriais ? 'Ocultar todas as seções' : 'Mostrar todas as seções'}
          </button>
        </div>

        {/* Lista de materiais */}
        {abertoMateriais && (
          <div>
            {MATERIAIS.map((material, index) => (
              <div
                key={material.id}
                className="px-5 py-3.5"
                style={{
                  borderBottom: index < MATERIAIS.length - 1 ? '0.5px solid #c8d8d2' : 'none',
                }}
              >
                <Link
                  href={`/content/material/${material.id}`}
                  className="block text-sm font-medium transition-opacity hover:opacity-70"
                  style={{ color: '#57AA8F' }}
                >
                  {material.titulo}
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
