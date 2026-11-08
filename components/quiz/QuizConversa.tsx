'use client'

import { useCallback, useEffect, useMemo, useReducer, useRef } from 'react'
import { ArrowLeft } from 'lucide-react'
import { montarPassos, progressoDoPasso, rotuloEtapa } from '@/lib/quiz/passos'
import { avaliar } from '@/lib/quiz/motor'
import { gravarRascunho, lerRascunho, limparRascunho } from '@/lib/quiz/sessao'
import { capturarAtribuicao } from '@/lib/tracking/atribuicao'
import { track } from '@/lib/tracking/eventos'
import type { ConfigQuiz, Respostas } from '@/lib/quiz/tipos'
import { ProgressoQuiz } from './ProgressoQuiz'
import { TelaPergunta } from './TelaPergunta'
import { TelaProcessando } from './TelaProcessando'
import { TelaResultado } from './TelaResultado'
import { TelaTexto } from './TelaTexto'
import type { TemaQuiz } from './TextoQuiz'

// Orquestrador do quiz: um unico componente renderiza qualquer config.
//
// Estado em useReducer porque indice e respostas mudam juntos — avancar grava a
// resposta e move o indice, e com dois useState a gravacao do rascunho poderia
// rodar entre as duas atualizacoes e persistir um par inconsistente.

type Estado = {
  indice: number
  respostas: Respostas
  /** Evita disparar quiz_start mais de uma vez. */
  comecou: boolean
}

type Acao =
  | { tipo: 'restaurar'; indice: number; respostas: Respostas }
  | { tipo: 'responder'; idPergunta: string; idOpcao: string }
  | { tipo: 'avancar' }
  | { tipo: 'voltar' }
  | { tipo: 'comecou' }

function reducer(estado: Estado, acao: Acao): Estado {
  switch (acao.tipo) {
    case 'restaurar':
      return { ...estado, indice: acao.indice, respostas: acao.respostas }

    case 'responder':
      return {
        ...estado,
        respostas: { ...estado.respostas, [acao.idPergunta]: acao.idOpcao },
      }

    case 'avancar':
      return { ...estado, indice: estado.indice + 1 }

    case 'voltar':
      return { ...estado, indice: Math.max(0, estado.indice - 1) }

    case 'comecou':
      return { ...estado, comecou: true }
  }
}

export function QuizConversa({ config }: { config: ConfigQuiz }) {
  const passos = useMemo(() => montarPassos(config), [config])
  const [estado, dispatch] = useReducer(reducer, {
    indice: 0,
    respostas: {},
    comecou: false,
  })

  const passo = passos[estado.indice]
  const topo = useRef<HTMLDivElement>(null)

  // Entrada: captura a origem do trafego antes de qualquer evento, para que o
  // quiz_view ja saia com UTM.
  //
  // A trava de execucao unica nao e so pelo StrictMode do dev: o efeito
  // re-rodaria tambem se config trocasse de referencia, e um quiz_view a mais
  // por pessoa inflaria o topo do funil, fazendo toda a conversao parecer
  // metade do que e.
  const jaEntrou = useRef(false)
  useEffect(() => {
    if (jaEntrou.current) return
    jaEntrou.current = true

    capturarAtribuicao()
    track('quiz_view', { quiz_slug: config.slug })

    const rascunho = lerRascunho(config)
    if (rascunho && rascunho.indice > 0) {
      dispatch({ tipo: 'restaurar', indice: rascunho.indice, respostas: rascunho.respostas })
    }
  }, [config])

  // Persiste a cada mudanca. Nada disso sai do navegador.
  useEffect(() => {
    gravarRascunho(config, estado.indice, estado.respostas)
  }, [config, estado.indice, estado.respostas])

  // Troca de tela volta ao topo: as telas tem alturas muito diferentes, e sem
  // isso a pergunta seguinte abriria no meio.
  useEffect(() => {
    topo.current?.scrollIntoView({ block: 'start', behavior: 'auto' })
  }, [estado.indice])

  const resultado = useMemo(
    () => avaliar(estado.respostas, config),
    [estado.respostas, config]
  )

  // O resultado e calculado uma vez, ao chegar na tela — nao a cada render.
  const jaRegistrouConclusao = useRef(false)
  useEffect(() => {
    if (passo?.tipo !== 'resultado' || jaRegistrouConclusao.current) return

    jaRegistrouConclusao.current = true
    track('quiz_complete', {
      quiz_slug: config.slug,
      result_profile: resultado.perfil,
      regra: resultado.regra,
      pontos_a: resultado.pontos.A,
      pontos_b: resultado.pontos.B,
      pontos_c: resultado.pontos.C,
    })

    // Chegou ao fim: o rascunho so serviria para reabrir um resultado antigo
    // quando a pessoa voltasse pelo anuncio.
    limparRascunho(config)
  }, [passo?.tipo, config, resultado])

  // Perguntas cujo quiz_answer ja foi disparado. Sem isso, voltar e re-responder
  // (trivial agora com auto-advance) emitia um quiz_answer repetido para a mesma
  // etapa, inflando a contagem de respostas por etapa no GA4 e no Pixel. Cada
  // etapa conta uma vez — a primeira resposta dada a ela.
  const perguntasRegistradas = useRef<Set<string>>(new Set())

  // `opcaoEscolhida` chega das telas de pergunta (auto-advance): o id escolhido
  // vem explicito porque o estado do React ainda nao refletiu a escolha no mesmo
  // gesto — sem ele o quiz_answer sairia com a opcao anterior. As telas de copy
  // chamam sem argumento.
  const avancar = useCallback(
    (opcaoEscolhida?: string) => {
      if (!estado.comecou) {
        dispatch({ tipo: 'comecou' })
        track('quiz_start', { quiz_slug: config.slug })
      }

      if (passo?.tipo === 'pergunta' && !perguntasRegistradas.current.has(passo.pergunta.id)) {
        perguntasRegistradas.current.add(passo.pergunta.id)
        track('quiz_answer', {
          quiz_slug: config.slug,
          etapa: passo.indice + 1,
          pergunta: passo.pergunta.id,
          opcao: opcaoEscolhida ?? estado.respostas[passo.pergunta.id],
        })
      }

      dispatch({ tipo: 'avancar' })
    },
    [estado.comecou, estado.respostas, passo, config.slug]
  )

  if (!passo) return null

  const totalPerguntas = config.perguntas.length
  const mostrarProgresso = passo.tipo !== 'abertura' && passo.tipo !== 'resultado'
  const podeVoltar = estado.indice > 0 && passo.tipo !== 'processando' && passo.tipo !== 'resultado'

  // Abertura e ponte vivem no verde escuro, como o hero e a virada da LP
  // /trilha; perguntas, processando e resultado no off-white, onde as opcoes
  // sao cards brancos. A troca de fundo marca a troca de "voz" — a mesma
  // alternancia de secoes escuras e claras da LP. A VSL tem o proprio fundo
  // (fixed) em TelaResultado.
  const tema: TemaQuiz =
    passo.tipo === 'abertura' || passo.tipo === 'interstituicao' ? 'escuro' : 'claro'
  const escuro = tema === 'escuro'

  return (
    <div
      className={`flex min-h-screen flex-col transition-colors duration-300 motion-reduce:transition-none ${
        escuro ? 'bg-mt-green-dark' : 'bg-mt-off-white'
      }`}
    >
      <div ref={topo} />

      {mostrarProgresso && (
        <header
          className={`sticky top-0 z-10 border-b-[0.5px] px-5 py-4 backdrop-blur sm:px-8 ${
            escuro
              ? 'border-white/10 bg-mt-green-dark/95'
              : 'border-mt-border bg-mt-off-white/95'
          }`}
        >
          <div className="mx-auto flex max-w-2xl items-center gap-4">
            {podeVoltar ? (
              <button
                type="button"
                onClick={() => dispatch({ tipo: 'voltar' })}
                aria-label="Voltar para a pergunta anterior"
                className={`-ml-1 shrink-0 rounded-full p-2 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-mt-green ${
                  escuro
                    ? 'text-mt-off-white/70 hover:bg-white/10 hover:text-mt-off-white'
                    : 'text-mt-apoio hover:bg-mt-green-sup hover:text-mt-green-dark'
                }`}
              >
                <ArrowLeft className="h-5 w-5" aria-hidden="true" />
              </button>
            ) : (
              <span className="w-9 shrink-0" aria-hidden="true" />
            )}

            <ProgressoQuiz
              fracao={progressoDoPasso(passos, estado.indice, totalPerguntas)}
              rotulo={rotuloEtapa(passo, totalPerguntas)}
              tema={tema}
            />
          </div>
        </header>
      )}

      <main className="flex flex-1 flex-col px-5 py-8 sm:px-8 sm:py-12">
        <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col">
          {passo.tipo === 'abertura' && (
            <TelaTexto tela={passo.tela} onAvancar={avancar} variante="abertura" />
          )}

          {passo.tipo === 'interstituicao' && (
            <TelaTexto tela={passo.tela} onAvancar={avancar} variante="ponte" />
          )}

          {passo.tipo === 'pergunta' && (
            <TelaPergunta
              key={passo.pergunta.id}
              pergunta={passo.pergunta}
              selecionada={estado.respostas[passo.pergunta.id]}
              onSelecionar={(idOpcao) =>
                dispatch({ tipo: 'responder', idPergunta: passo.pergunta.id, idOpcao })
              }
              onAvancar={avancar}
              // A última pergunta avança para o processando: transição de peso,
              // por botão, não por toque na opção.
              confirmaComBotao={passo.indice === totalPerguntas - 1}
            />
          )}

          {passo.tipo === 'processando' && (
            <TelaProcessando config={config} onConcluir={avancar} />
          )}

          {passo.tipo === 'resultado' && (
            <TelaResultado config={config} resultado={resultado} />
          )}
        </div>
      </main>
    </div>
  )
}
