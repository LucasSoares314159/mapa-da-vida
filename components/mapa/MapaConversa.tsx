'use client'

import { useCallback, useEffect, useMemo, useRef, useState, useTransition } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { ArrowLeft, ArrowRight, Loader2 } from 'lucide-react'
import { criarMapa, type AreaInput } from '@/app/actions/mapa'
import { salvarPerfilOnboarding } from '@/app/actions/perfil'
import { MIN_OBSERVACAO } from '@/lib/validations'
import {
  FALAS_PERFIL,
  ORDEM_PILARES,
  PERGUNTAS,
  contarRespondidas,
  falasContexto,
  montarPassos,
  type Respostas,
} from '@/lib/onboarding'
import { PILARES } from '@/types'
import type { NomeArea, StatusArea } from '@/types'
import { BolhaGuia } from './BolhaGuia'
import { PassoPergunta } from './PassoPergunta'
import { PassoPerfil, type PerfilRascunho } from './PassoPerfil'
import { ProgressoConversa } from './ProgressoConversa'

type Props = {
  ehPrimeiroMapa: boolean
  pedirPerfil: boolean
}

const CHAVE_RASCUNHO = 'mapa-conversa-rascunho'
const VERSAO_RASCUNHO = 1

type Rascunho = {
  versao: number
  indice: number
  respostas: Respostas
}

const PERFIL_VAZIO: PerfilRascunho = {
  data_nascimento: '',
  profissao: '',
  profissao_outro: '',
}

export function MapaConversa({ ehPrimeiroMapa, pedirPerfil }: Props) {
  const passos = useMemo(() => montarPassos({ pedirPerfil }), [pedirPerfil])

  const [indice, setIndice] = useState(0)
  const [respostas, setRespostas] = useState<Respostas>({})
  const [perfil, setPerfil] = useState<PerfilRascunho>(PERFIL_VAZIO)
  const [falasVisiveis, setFalasVisiveis] = useState(1)
  const [erro, setErro] = useState<string | null>(null)
  const [rascunhoOferecido, setRascunhoOferecido] = useState<Rascunho | null>(null)
  const [isPending, startTransition] = useTransition()

  const headingRef = useRef<HTMLHeadingElement>(null)
  const passo = passos[indice]
  const respondidas = contarRespondidas(respostas, MIN_OBSERVACAO)

  // --- Rascunho: sobrevive a um refresh acidental, não a uma nova sessão ---
  // sessionStorage de propósito: um rascunho de semanas atrás reaparecendo ao
  // refazer o mapa faria a pessoa achar que já respondeu.
  useEffect(() => {
    try {
      const bruto = sessionStorage.getItem(CHAVE_RASCUNHO)
      if (!bruto) return
      const salvo = JSON.parse(bruto) as Rascunho
      if (salvo.versao !== VERSAO_RASCUNHO) {
        sessionStorage.removeItem(CHAVE_RASCUNHO)
        return
      }
      if (Object.keys(salvo.respostas ?? {}).length > 0) setRascunhoOferecido(salvo)
    } catch {
      // Navegação privada ou storage bloqueado: segue sem rascunho.
    }
  }, [])

  useEffect(() => {
    if (Object.keys(respostas).length === 0) return
    try {
      const dados: Rascunho = { versao: VERSAO_RASCUNHO, indice, respostas }
      sessionStorage.setItem(CHAVE_RASCUNHO, JSON.stringify(dados))
    } catch {
      // Sem storage, o fluxo continua — é só conveniência.
    }
  }, [indice, respostas])

  function limparRascunho() {
    try {
      sessionStorage.removeItem(CHAVE_RASCUNHO)
    } catch {
      /* nada a fazer */
    }
  }

  // --- Falas encadeadas e foco ao trocar de passo ---
  useEffect(() => {
    setFalasVisiveis(1)
    window.scrollTo({ top: 0, behavior: 'smooth' })
    // Foca o heading, e não a primeira opção: focar o botão faria o leitor de
    // tela anunciar a resposta antes da pergunta.
    headingRef.current?.focus()
  }, [indice])

  const falas = useMemo(() => {
    if (passo.tipo === 'contexto') return falasContexto(ehPrimeiroMapa)
    if (passo.tipo === 'perfil') return FALAS_PERFIL
    if (passo.tipo === 'pergunta') return [PILARES[passo.pilar].perguntas[passo.area]]
    return ['Montando seu mapa…']
  }, [passo, ehPrimeiroMapa])

  const todasFalasDitas = falasVisiveis >= falas.length
  const avancarFala = useCallback(() => setFalasVisiveis((n) => n + 1), [])

  // --- Validação do passo atual ---
  const perfilValido =
    !!perfil.data_nascimento &&
    !!perfil.profissao &&
    (perfil.profissao !== 'Outro' || perfil.profissao_outro.trim().length >= 2)

  const respostaAtual = passo.tipo === 'pergunta' ? respostas[passo.area] : undefined
  const perguntaValida =
    !!respostaAtual?.status && respostaAtual.observacao.trim().length >= MIN_OBSERVACAO

  const podeAvancar =
    passo.tipo === 'contexto'
      ? todasFalasDitas
      : passo.tipo === 'perfil'
      ? perfilValido
      : passo.tipo === 'pergunta'
      ? perguntaValida
      : false

  function setStatus(area: NomeArea, status: StatusArea) {
    setRespostas((prev) => ({
      ...prev,
      [area]: { status, observacao: prev[area]?.observacao ?? '' },
    }))
  }

  function setObservacao(area: NomeArea, observacao: string) {
    setRespostas((prev) => ({
      ...prev,
      [area]: { status: prev[area]?.status ?? 'verde', observacao },
    }))
  }

  function enviarMapa() {
    setErro(null)
    const areas: AreaInput[] = ORDEM_PILARES.flatMap((pilar) =>
      PILARES[pilar].areas.map((area) => ({
        area,
        pilar,
        status: respostas[area]!.status,
        observacao: respostas[area]!.observacao.trim(),
      }))
    )

    startTransition(async () => {
      const resultado = await criarMapa(areas)
      if (resultado?.error) {
        setErro(resultado.error)
        setIndice(passos.length - 2) // volta à última pergunta
      } else {
        limparRascunho()
      }
    })
  }

  async function avancar() {
    setErro(null)

    // O perfil é salvo ao sair da sua tela, não junto com o mapa: um abandono no
    // meio das 9 perguntas não deve perder o dado de mentoria.
    if (passo.tipo === 'perfil') {
      const resultado = await salvarPerfilOnboarding({
        data_nascimento: perfil.data_nascimento,
        profissao: perfil.profissao as string,
        profissao_outro: perfil.profissao_outro.trim() || undefined,
      })
      if ('error' in resultado) {
        setErro(resultado.error)
        return
      }
    }

    const proximo = indice + 1
    setIndice(proximo)
    if (passos[proximo]?.tipo === 'enviando') enviarMapa()
  }

  const ehUltimaPergunta = passo.tipo === 'pergunta' && passo.indicePergunta === PERGUNTAS.length - 1

  return (
    <main
      className="flex min-h-screen flex-col px-6 py-8"
      style={{ backgroundColor: '#2A3F45' }}
      onKeyDown={(e) => {
        if (e.key === 'Enter' && (e.metaKey || e.ctrlKey) && podeAvancar) avancar()
      }}
    >
      <div className="mx-auto flex w-full max-w-lg flex-1 flex-col">
        {/* Progresso — sempre visível */}
        <div className="mb-10">
          <ProgressoConversa
            respondidas={respondidas}
            perguntaAtual={passo.tipo === 'pergunta' ? passo.indicePergunta + 1 : undefined}
          />
        </div>

        {/* Retomar rascunho */}
        {rascunhoOferecido && (
          <div
            className="mb-8 rounded-xl p-5"
            style={{ border: '0.5px solid #3d5a62', backgroundColor: 'rgba(255,255,255,0.03)' }}
          >
            <p className="mb-4 text-sm" style={{ color: '#EDF2EF' }}>
              Você já tinha começado este mapa. Quer continuar de onde parou?
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => {
                  setRespostas(rascunhoOferecido.respostas)
                  setIndice(rascunhoOferecido.indice)
                  setRascunhoOferecido(null)
                }}
                className="text-sm font-medium"
                style={{
                  backgroundColor: '#57AA8F',
                  color: '#fff',
                  borderRadius: 8,
                  padding: '8px 14px',
                }}
              >
                Continuar
              </button>
              <button
                type="button"
                onClick={() => {
                  limparRascunho()
                  setRascunhoOferecido(null)
                }}
                className="text-sm"
                style={{ color: '#a8c4bc' }}
              >
                Começar de novo
              </button>
            </div>
          </div>
        )}

        {/* Área da conversa */}
        <div className="flex-1">
          {passo.tipo === 'pergunta' && (
            <p
              className="mb-5 uppercase"
              style={{ color: '#57AA8F', fontSize: 11, fontWeight: 600, letterSpacing: '0.8px' }}
            >
              {PILARES[passo.pilar].label} · {passo.area}
            </p>
          )}

          {/* Heading alvo do foco ao trocar de passo */}
          <h1
            ref={headingRef}
            tabIndex={-1}
            className="sr-only"
            // O título visível é a própria fala do guia; este existe para
            // orientar leitor de tela e receber o foco sem roubar a leitura.
          >
            {passo.tipo === 'pergunta'
              ? `Pergunta ${passo.indicePergunta + 1} de ${PERGUNTAS.length}: ${passo.area}`
              : passo.tipo === 'perfil'
              ? 'Duas informações sobre você'
              : passo.tipo === 'contexto'
              ? 'Antes de começar'
              : 'Montando seu mapa'}
          </h1>

          {/* Falas encadeadas do guia */}
          <div className="flex flex-col gap-4">
            {falas.slice(0, falasVisiveis).map((fala, i) => (
              <BolhaGuia
                key={`${indice}-${i}`}
                texto={fala}
                destaque={passo.tipo === 'contexto' && i === falas.length - 1}
                onConcluir={i === falasVisiveis - 1 && !todasFalasDitas ? avancarFala : undefined}
              />
            ))}
          </div>

          {/* Conteúdo interativo do passo */}
          {passo.tipo === 'pergunta' && (
            <PassoPergunta
              area={passo.area}
              resposta={respostas[passo.area]}
              revelado={todasFalasDitas}
              onStatus={(s) => setStatus(passo.area, s)}
              onObservacao={(t) => setObservacao(passo.area, t)}
            />
          )}

          {passo.tipo === 'perfil' && (
            <PassoPerfil
              perfil={perfil}
              revelado={todasFalasDitas}
              erro={erro}
              onChange={setPerfil}
            />
          )}

          {passo.tipo === 'enviando' && (
            <div className="mt-10 flex flex-col items-center gap-3">
              <Loader2 className="size-6 animate-spin" style={{ color: '#57AA8F' }} />
              <p className="text-sm" style={{ color: '#a8c4bc' }}>
                Analisando suas 9 áreas…
              </p>
            </div>
          )}

          {erro && passo.tipo !== 'perfil' && (
            <p role="alert" className="mt-6 text-sm" style={{ color: '#E68A8A' }}>
              {erro}
            </p>
          )}
        </div>

        {/* Navegação */}
        {passo.tipo !== 'enviando' && (
          <div className="mt-10 flex items-center gap-4">
            {indice > 0 && (
              <button
                type="button"
                onClick={() => setIndice((i) => i - 1)}
                disabled={isPending}
                className="flex items-center gap-1.5 text-sm font-medium transition-opacity hover:opacity-80"
                style={{ color: '#a8c4bc' }}
              >
                <ArrowLeft className="size-4" />
                Voltar
              </button>
            )}

            <AnimatePresence>
              {podeAvancar && (
                <motion.button
                  type="button"
                  onClick={avancar}
                  disabled={isPending}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="ml-auto flex items-center justify-center gap-2 text-white transition-opacity hover:opacity-90 disabled:opacity-40"
                  style={{
                    backgroundColor: '#57AA8F',
                    borderRadius: 10,
                    padding: '14px 24px',
                    fontSize: 15,
                    fontWeight: 500,
                  }}
                >
                  {passo.tipo === 'contexto'
                    ? 'Começar'
                    : ehUltimaPergunta
                    ? 'Ver meu diagnóstico'
                    : 'Continuar'}
                  <ArrowRight className="size-4" />
                </motion.button>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>
    </main>
  )
}
