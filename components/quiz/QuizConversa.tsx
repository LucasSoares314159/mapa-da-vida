'use client'

import { useCallback, useEffect, useMemo, useReducer, useRef } from 'react'
import { ArrowLeft } from 'lucide-react'
import { montarPassos, progressoDoPasso, rotuloEtapa } from '@/lib/quiz/passos'
import { avaliar } from '@/lib/quiz/motor'
import { gravarRascunho, lerRascunho, limparRascunho } from '@/lib/quiz/sessao'
import { capturarAtribuicao } from '@/lib/tracking/atribuicao'
import { track } from '@/lib/tracking/eventos'
import { carregarGa } from '@/lib/tracking/ga'
import { aoFicarVisivel } from '@/lib/tracking/visibilidade'
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
    // Rascunho com indice > 0 so existe se a pessoa ja respondeu algo nesta
    // aba — e o quiz_start dela ja saiu. Sem marcar `comecou`, um F5 no meio
    // do quiz disparava um segundo quiz_start na resposta seguinte.
    case 'restaurar':
      return { ...estado, indice: acao.indice, respostas: acao.respostas, comecou: true }

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
  // quiz_view ja saia com UTM — por isso este efeito vem antes do do quiz_view.
  //
  // A trava de execucao unica nao e so pelo StrictMode do dev: o efeito
  // re-rodaria tambem se config trocasse de referencia.
  const jaEntrou = useRef(false)
  useEffect(() => {
    if (jaEntrou.current) return
    jaEntrou.current = true

    capturarAtribuicao()

    const rascunho = lerRascunho(config)
    if (rascunho && rascunho.indice > 0) {
      dispatch({ tipo: 'restaurar', indice: rascunho.indice, respostas: rascunho.respostas })
      // Ja tinha comecado: o GA4 e liberado na primeira resposta, e ela ja houve.
      carregarGa()
    }
  }, [config])

  // quiz_view so com a pagina visivel (ver lib/tracking/visibilidade.ts): uma
  // carga em segundo plano nao e uma pessoa olhando para a pergunta.
  //
  // Uma vez por carga: um quiz_view a mais por pessoa inflaria o topo do funil,
  // fazendo toda a conversao parecer metade do que e.
  const viewRegistrada = useRef(false)
  useEffect(
    () =>
      aoFicarVisivel(() => {
        if (viewRegistrada.current) return
        viewRegistrada.current = true
        track('quiz_view', { quiz_slug: config.slug })
      }),
    [config.slug]
  )

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
  //
  // O quiz_start sai na PRIMEIRA RESPOSTA (passo de pergunta), imediatamente
  // antes do quiz_answer da etapa 1 — nao no toque do COMECAR da abertura.
  // "comecar o quiz" e responder, nao abrir a landing: a condicao por tipo
  // garante que avancar a abertura nao conte como inicio nem baixe o gtag.js.
  const avancar = useCallback(
    (opcaoEscolhida?: string) => {
      if (!estado.comecou && passo?.tipo === 'pergunta') {
        dispatch({ tipo: 'comecou' })
        track('quiz_start', { quiz_slug: config.slug })
        // A entrada ja cumpriu seu papel: agora o gtag.js pode baixar, e
        // esvazia a fila com quiz_view e quiz_start (ver lib/tracking/ga.ts).
        carregarGa()
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
  // A seta nao leva de volta a abertura: a primeira pergunta nao tem "voltar"
  // (quem chega do anuncio cai nela). Sem a seta, o cabecalho da pergunta 1
  // alinha com o conteudo, sem espaco reservado. Da pergunta 2 em diante, sim.
  const passoAnterior = passos[estado.indice - 1]
  const podeVoltar =
    estado.indice > 0 &&
    passo.tipo !== 'processando' &&
    passo.tipo !== 'resultado' &&
    passoAnterior?.tipo !== 'abertura'

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
      // min-h-dvh, nao min-h-screen: o 100vh do navegador do Instagram e do
      // Facebook conta a tela inteira e ignora as barras do app, e o layout
      // acharia que tem mais altura do que tem.
      className={`flex min-h-dvh flex-col transition-colors duration-300 motion-reduce:transition-none ${
        escuro ? 'bg-mt-green-dark' : 'bg-mt-off-white'
      }`}
    >
      <div ref={topo} />

      {mostrarProgresso && (
        <header
          className={`sticky top-0 z-10 border-b-[0.5px] px-5 py-3 backdrop-blur celular-baixo:py-2 sm:px-8 sm:py-4 ${
            escuro
              ? 'border-white/10 bg-mt-green-dark/95'
              : 'border-mt-border bg-mt-off-white/95'
          }`}
        >
          {/* Sem seta de voltar (pergunta 1), a barra e o rotulo comecam
              alinhados com o conteudo: nada de espaco reservado para um botao
              que nao existe. Com a seta, o gap volta e a barra retoma a posicao
              de antes. */}
          <div className={`mx-auto flex max-w-2xl items-center ${podeVoltar ? 'gap-4' : ''}`}>
            {podeVoltar && (
              <button
                type="button"
                onClick={() => dispatch({ tipo: 'voltar' })}
                aria-label="Voltar para a pergunta anterior"
                // Area de toque de 44x44 (before) sobre o botao de 36px, sem
                // aumentar o icone nem deslocar a barra: o pseudo cresce para
                // fora do fluxo (absolute), o botao mantem o -ml-1 p-2 de antes.
                className={`relative -ml-1 shrink-0 rounded-full p-2 transition-colors before:absolute before:left-1/2 before:top-1/2 before:h-11 before:w-11 before:-translate-x-1/2 before:-translate-y-1/2 before:content-[''] focus-visible:outline focus-visible:outline-2 focus-visible:outline-mt-green ${
                  escuro
                    ? 'text-mt-off-white/70 hover:bg-white/10 hover:text-mt-off-white'
                    : 'text-mt-apoio hover:bg-mt-green-sup hover:text-mt-green-dark'
                }`}
              >
                <ArrowLeft className="h-5 w-5" aria-hidden="true" />
              </button>
            )}

            <ProgressoQuiz
              fracao={progressoDoPasso(passos, estado.indice, totalPerguntas)}
              rotulo={rotuloEtapa(passo, totalPerguntas)}
              tema={tema}
            />
          </div>
        </header>
      )}

      {/* Topo curto no mobile: a pergunta mais longa (6, com contexto e botão)
          não cabia em ~630px visíveis, e cada pixel acima do enunciado empurra
          as opções para fora da tela. Em tela baixa (celular-baixo), mais
          curto ainda. */}
      <main className="flex flex-1 flex-col px-5 pb-8 pt-5 celular-baixo:pt-3 celular-minimo:pt-2 sm:px-8 sm:py-12">
        <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col">
          {passo.tipo === 'abertura' && (
            <TelaTexto tela={passo.tela} onAvancar={avancar} variante="abertura" />
          )}

          {passo.tipo === 'interstituicao' && (
            <TelaTexto tela={passo.tela} onAvancar={avancar} />
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
