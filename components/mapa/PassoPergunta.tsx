'use client'

import { useEffect, useRef } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { Check } from 'lucide-react'
import { MIN_OBSERVACAO } from '@/lib/validations'
import type { RespostaArea } from '@/lib/onboarding'
import type { NomeArea, StatusArea } from '@/types'

/** Configuração visual das 3 opções. O rótulo textual sempre acompanha a cor. */
export const STATUS_OPTIONS: {
  value: StatusArea
  titulo: string
  sublabel: string
  ponto: string
  bgSelecionado: string
  bordaSelecionada: string
}[] = [
  {
    value: 'verde',
    titulo: 'Está bem',
    sublabel: 'Me sinto bem nessa área hoje',
    ponto: '#57AA8F',
    bgSelecionado: '#E8F5F1',
    bordaSelecionada: '#57AA8F',
  },
  {
    value: 'amarelo',
    titulo: 'Precisa de atenção',
    sublabel: 'Não está mal, mas poderia ser melhor',
    ponto: '#D4A843',
    bgSelecionado: '#FBF5E6',
    bordaSelecionada: '#D4A843',
  },
  {
    value: 'vermelho',
    titulo: 'Precisa mudar',
    sublabel: 'Está impactando minha vida negativamente',
    ponto: '#C05050',
    bgSelecionado: '#FAECEC',
    bordaSelecionada: '#C05050',
  },
]

type Props = {
  area: NomeArea
  resposta?: RespostaArea
  /** Só revela as opções depois que a pergunta terminou de ser escrita. */
  revelado: boolean
  onStatus: (status: StatusArea) => void
  onObservacao: (texto: string) => void
}

export function PassoPergunta({ area, resposta, revelado, onStatus, onObservacao }: Props) {
  const status = resposta?.status
  const observacao = resposta?.observacao ?? ''
  const faltam = Math.max(0, MIN_OBSERVACAO - observacao.trim().length)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const refsOpcoes = useRef<(HTMLButtonElement | null)[]>([])

  // Foca a descrição quando a cor é escolhida — nunca antes, para não roubar o
  // foco do grupo de opções.
  useEffect(() => {
    if (status && !observacao) textareaRef.current?.focus()
    // Intencional: só reage à escolha do status, não a cada tecla digitada.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status])

  /** Setas navegam dentro do radiogroup, como manda o padrão ARIA. */
  function onKeyDownOpcao(e: React.KeyboardEvent, indice: number) {
    const teclas = ['ArrowDown', 'ArrowRight', 'ArrowUp', 'ArrowLeft']
    if (!teclas.includes(e.key)) return
    e.preventDefault()
    const avanca = e.key === 'ArrowDown' || e.key === 'ArrowRight'
    const proximo = (indice + (avanca ? 1 : -1) + STATUS_OPTIONS.length) % STATUS_OPTIONS.length
    refsOpcoes.current[proximo]?.focus()
    onStatus(STATUS_OPTIONS[proximo].value)
  }

  return (
    <AnimatePresence>
      {revelado && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="mt-8"
        >
          {/* Opções de status */}
          <div role="radiogroup" aria-label={`Como está ${area}`} className="flex flex-col gap-2">
            {STATUS_OPTIONS.map((opt, i) => {
              const selecionado = status === opt.value
              return (
                <motion.button
                  key={opt.value}
                  ref={(el) => {
                    refsOpcoes.current[i] = el
                  }}
                  type="button"
                  role="radio"
                  aria-checked={selecionado}
                  tabIndex={selecionado || (!status && i === 0) ? 0 : -1}
                  onClick={() => onStatus(opt.value)}
                  onKeyDown={(e) => onKeyDownOpcao(e, i)}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.06 * i }}
                  className={`flex w-full items-center gap-3 rounded-elemento px-4 py-3.5 text-left transition-colors duration-150 ${
                    selecionado ? 'border-[1.5px]' : 'border-linha border-mt-linha-escura bg-white/[0.03] hover:bg-white/[0.06]'
                  }`}
                  // Cor por status (verde/amarelo/vermelho): dado da opção.
                  style={
                    selecionado
                      ? { borderColor: opt.bordaSelecionada, backgroundColor: opt.bgSelecionado }
                      : undefined
                  }
                >
                  <span
                    className="inline-block size-[9px] shrink-0 rounded-full"
                    style={{ backgroundColor: opt.ponto }}
                  />
                  <span className="flex flex-1 flex-col gap-0.5">
                    <span
                      className={`text-[15px] font-medium ${selecionado ? 'text-mt-green-dark' : 'text-mt-off-white'}`}
                    >
                      {opt.titulo}
                    </span>
                    <span className={`text-xs ${selecionado ? 'text-mt-apoio' : 'text-mt-off-white/70'}`}>
                      {opt.sublabel}
                    </span>
                  </span>
                  {selecionado && (
                    <Check className="size-4 flex-shrink-0" style={{ color: opt.bordaSelecionada }} />
                  )}
                </motion.button>
              )
            })}
          </div>

          {/* Descrição obrigatória — só aparece depois da escolha, para uma
              decisão por vez. */}
          <AnimatePresence>
            {status && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                className="overflow-hidden"
              >
                <div className="pt-5">
                  <label
                    htmlFor={`obs-${area}`}
                    className="mb-2 block text-sm text-mt-off-white"
                  >
                    O que está por trás dessa escolha?
                  </label>
                  <textarea
                    id={`obs-${area}`}
                    ref={textareaRef}
                    value={observacao}
                    onChange={(e) => onObservacao(e.target.value)}
                    rows={3}
                    required
                    aria-describedby={`ajuda-${area}`}
                    placeholder="Ex: não treino há 3 meses, sempre falta tempo"
                    className="campo-escuro resize-none"
                  />
                  <p id={`ajuda-${area}`} className="mt-2 text-xs text-mt-off-white/70">
                    {faltam > 0
                      ? `Uma frase com o motivo — faltam ${faltam} caractere${faltam > 1 ? 's' : ''}.`
                      : 'Pronto. Uma frase honesta vale mais que um parágrafo.'}
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
