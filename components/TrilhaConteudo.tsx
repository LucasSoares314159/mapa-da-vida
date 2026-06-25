'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ChevronUp, ChevronDown, Check } from 'lucide-react'
import { atualizarProgresso } from '@/app/actions/progresso'
import { LIVES } from '@/lib/lives'

type Modulo = {
  titulo: string
  duracao: string
  link?: string
}

const MODULOS: Modulo[] = [
  { titulo: 'Módulo 0 — Prefácio', duracao: '05:00', link: 'https://app.notion.com/p/MD0-Pref-cio-373553ba5fd780eba964de6f7d9755d4?source=copy_link' },
  { titulo: 'Módulo 1 — Mínima Organização Viável', duracao: '15:00', link: 'https://app.notion.com/p/MD1-M-nima-Organiza-o-Vi-vel-MOV-373553ba5fd780e78868e781497b31c2?source=copy_link' },
  { titulo: 'Módulo 2 — Definindo Seu Momento de Vida', duracao: '30:00', link: 'https://app.notion.com/p/MD2-Definindo-seu-Momento-de-Vida-373553ba5fd780f0aea8e7b7a77bb528?source=copy_link' },
  { titulo: 'Módulo 3 — Mapa da Vida', duracao: '30:00', link: 'https://app.notion.com/p/MD3-Mapa-da-Vida-373553ba5fd780e68ca6f49bfaecce6a?source=copy_link' },
  { titulo: 'Módulo 4 — Rotina vs Projetos', duracao: '20:00', link: 'https://app.notion.com/p/MD4-Rotina-vs-Projetos-373553ba5fd78042beb8cdc443accf47?source=copy_link' },
  { titulo: 'Módulo 5 — Definindo Objetivos Coerentes', duracao: '45:00', link: 'https://app.notion.com/p/MD4-Rotina-vs-Projetos-373553ba5fd78042beb8cdc443accf47?source=copy_link' },
  { titulo: 'Módulo 6 — Sistema de Objetivos', duracao: '30:00', link: 'https://app.notion.com/p/MD6-Sistema-de-Objetivos-38a553ba5fd7802c9e03e3cba9e19a35?source=copy_link' },
  { titulo: 'Módulo 7 — Sistema de Organização Pessoal', duracao: '1:30:00', link: 'https://app.notion.com/p/MD7-Sistema-de-Organiza-o-Pessoal-38a553ba5fd78098ae0bdb06cd007b07?source=copy_link' },
  { titulo: 'Módulo 8 — O Segredo da Consistência', duracao: '15:00' },
  { titulo: 'Módulo 9 (Extra) — Ciclo de Reforço (+) (-)', duracao: '25:00' },
]

const TOTAL_AULAS = MODULOS.length

// Soma total em minutos: 5+15+30+30+20+45+30+90+15+25 = 305 min = 5h05min
const DURACAO_TOTAL = '5 h 05 min'

type Props = {
  nomeUsuario: string
  aulasConcluidas: number[]
}

export function TrilhaConteudo({ nomeUsuario, aulasConcluidas }: Props) {
  const [aberto, setAberto] = useState(true)
  const [abertoLives, setAbertoLives] = useState(true)
  const [concluidas, setConcluidas] = useState<number[]>(aulasConcluidas)

  const primeiroNome = nomeUsuario.split(' ')[0]
  const qtdConcluidas = concluidas.length
  const porcentagem = Math.round((qtdConcluidas / TOTAL_AULAS) * 100)

  function toggleAula(index: number) {
    if (!MODULOS[index].link) return

    const novoArray = concluidas.includes(index)
      ? concluidas.filter((i) => i !== index)
      : [...concluidas, index]

    setConcluidas(novoArray)
    atualizarProgresso(novoArray)
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
              Aulas Trilha da Produtividade
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
              const disponivel = !!modulo.link

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
                      disabled={!disponivel}
                      className="shrink-0 size-4 rounded-full flex items-center justify-center transition-colors"
                      style={
                        concluida
                          ? { backgroundColor: '#57AA8F', border: 'none', cursor: 'pointer' }
                          : {
                              backgroundColor: 'transparent',
                              border: '1.5px solid #c8d8d2',
                              cursor: disponivel ? 'pointer' : 'default',
                            }
                      }
                      aria-label={concluida ? 'Marcar como não concluída' : 'Marcar como concluída'}
                    >
                      {concluida && <Check className="size-2.5 text-white" strokeWidth={3} />}
                    </button>

                    {/* Título */}
                    <div className="flex items-center gap-2 flex-wrap min-w-0">
                      {disponivel ? (
                        <a
                          href={modulo.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm font-medium transition-opacity hover:opacity-70"
                          style={{
                            color: '#57AA8F',
                            textDecoration: concluida ? 'line-through' : 'none',
                          }}
                        >
                          {modulo.titulo}
                        </a>
                      ) : (
                        <span
                          className="text-sm"
                          style={{
                            color: '#1a2e29',
                            textDecoration: concluida ? 'line-through' : 'none',
                          }}
                        >
                          {modulo.titulo}
                        </span>
                      )}

                      {!disponivel && (
                        <span
                          style={{
                            padding: '2px 8px',
                            borderRadius: '100px',
                            fontSize: '10px',
                            fontWeight: 500,
                            textTransform: 'uppercase',
                            letterSpacing: '0.04em',
                            background: 'rgba(212,168,67,0.12)',
                            color: '#D4A843',
                            border: '0.5px solid #D4A843',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          Indisponível
                        </span>
                      )}
                    </div>
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
      {/* Seção Lives & Materiais */}
      <div
        className="w-full rounded-xl overflow-hidden"
        style={{ border: '0.5px solid #c8d8d2', backgroundColor: '#ffffff' }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-5 py-4"
          style={{
            backgroundColor: '#f0f7f5',
            borderBottom: abertoLives ? '0.5px solid #c8d8d2' : 'none',
          }}
        >
          <div className="flex items-center gap-3">
            <button
              onClick={() => setAbertoLives((v) => !v)}
              className="flex items-center gap-1.5"
              aria-label={abertoLives ? 'Ocultar lives' : 'Mostrar lives'}
            >
              {abertoLives ? (
                <ChevronUp className="size-4" style={{ color: '#4a6b62' }} />
              ) : (
                <ChevronDown className="size-4" style={{ color: '#4a6b62' }} />
              )}
            </button>
            <span className="text-sm font-semibold" style={{ color: '#1a2e29' }}>
              Lives & Materiais
            </span>
            <span className="text-xs" style={{ color: '#4a6b62' }}>
              {LIVES.length} aulas
            </span>
          </div>

          <button
            onClick={() => setAbertoLives((v) => !v)}
            className="text-xs font-medium transition-opacity hover:opacity-70"
            style={{ color: '#57AA8F' }}
          >
            {abertoLives ? 'Ocultar todas as seções' : 'Mostrar todas as seções'}
          </button>
        </div>

        {/* Lista de lives */}
        {abertoLives && (
          <div>
            {LIVES.map((live, index) => (
              <div
                key={live.id}
                className="flex items-center justify-between px-5 py-3.5"
                style={{
                  borderBottom: index < LIVES.length - 1 ? '0.5px solid #c8d8d2' : 'none',
                }}
              >
                <Link
                  href={`/content/live/${live.id}`}
                  className="text-sm font-medium transition-opacity hover:opacity-70"
                  style={{ color: '#57AA8F' }}
                >
                  {live.titulo}
                </Link>
                <span className="text-xs shrink-0 ml-4" style={{ color: '#4a6b62' }}>
                  {live.duracao}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
