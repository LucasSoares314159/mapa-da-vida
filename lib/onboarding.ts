import { PILARES } from '@/types'
import type { NomeArea, NomePilar, StatusArea } from '@/types'

// Lógica do Mapa da Vida conversacional: a sequência de passos, o progresso e a
// estimativa de tempo. Funções puras — os componentes só renderizam o resultado.

export const ORDEM_PILARES: NomePilar[] = ['corpo', 'mente', 'espirito']

/** Segundos por pergunta usados na estimativa exibida ao usuário. */
const SEGUNDOS_POR_PERGUNTA = 45

export type Passo =
  | { tipo: 'contexto' }
  | { tipo: 'perfil' }
  | { tipo: 'pergunta'; pilar: NomePilar; area: NomeArea; indicePergunta: number }
  | { tipo: 'enviando' }

export type RespostaArea = { status: StatusArea; observacao: string }
export type Respostas = Partial<Record<NomeArea, RespostaArea>>

/**
 * As 9 perguntas achatadas na ordem corpo → mente → espírito.
 * Derivadas de PILARES: a fonte de verdade das perguntas continua em types/index.ts.
 */
export const PERGUNTAS = ORDEM_PILARES.flatMap((pilar) =>
  PILARES[pilar].areas.map((area) => ({
    pilar,
    area,
    pergunta: PILARES[pilar].perguntas[area],
  }))
)

export const TOTAL_PERGUNTAS = PERGUNTAS.length

/**
 * Monta a sequência de telas. O passo de perfil só entra quando o usuário ainda
 * não informou nascimento/profissão — depois do primeiro acesso, nunca mais.
 */
export function montarPassos(opcoes: { pedirPerfil: boolean }): Passo[] {
  return [
    { tipo: 'contexto' as const },
    ...(opcoes.pedirPerfil ? [{ tipo: 'perfil' as const }] : []),
    ...PERGUNTAS.map((p, i) => ({
      tipo: 'pergunta' as const,
      pilar: p.pilar,
      area: p.area,
      indicePergunta: i,
    })),
    { tipo: 'enviando' as const },
  ]
}

/** Quantas perguntas já têm status e observação válida. */
export function contarRespondidas(respostas: Respostas, minObservacao: number): number {
  return PERGUNTAS.filter((p) => {
    const r = respostas[p.area]
    return !!r?.status && r.observacao.trim().length >= minObservacao
  }).length
}

/** Fração de 0 a 1 do fluxo de perguntas concluído. */
export function calcularProgresso(respondidas: number): number {
  return Math.min(1, respondidas / TOTAL_PERGUNTAS)
}

/**
 * Estimativa textual de quanto falta. Arredonda para cima e nunca mostra "0 min"
 * — é expectativa, não cronômetro: contagem regressiva ao vivo induziria resposta
 * rápida, o oposto da reflexão que o Mapa pede.
 */
export function estimarTempoRestante(respondidas: number): string {
  const restantes = Math.max(0, TOTAL_PERGUNTAS - respondidas)
  if (restantes === 0) return 'último passo'
  const minutos = Math.max(1, Math.ceil((restantes * SEGUNDOS_POR_PERGUNTA) / 60))
  return `~${minutos} min`
}

/** Tempo total anunciado na abertura, derivado da mesma constante. */
export const TEMPO_ESTIMADO_TOTAL = `${Math.ceil(
  (TOTAL_PERGUNTAS * SEGUNDOS_POR_PERGUNTA) / 60
)} minutos`

/**
 * Falas da abertura. Primeiro mapa explica por que o diagnóstico vem antes do
 * conteúdo; quem está refazendo já sabe e recebe a versão curta.
 */
export function falasContexto(ehPrimeiroMapa: boolean): string[] {
  if (!ehPrimeiroMapa) {
    return [
      'Bom te ver de volta.',
      `Vamos refazer seu Mapa da Vida: as mesmas 9 perguntas, respondidas pelo que é verdade hoje. Leva cerca de ${TEMPO_ESTIMADO_TOTAL}.`,
      'Comparar com o mapa anterior é o que mostra o que mudou de verdade.',
    ]
  }

  return [
    'Antes de qualquer aula, preciso de uma coisa sua.',
    'O Mapa da Vida é um diagnóstico de como está a sua vida hoje, em 9 áreas.',
    'Ele vem primeiro porque é o pilar de tudo o que você vai aplicar aqui: sem saber onde você está, o método não tem onde se apoiar.',
    `São 9 perguntas, uma por vez, em cerca de ${TEMPO_ESTIMADO_TOTAL}. Não existe resposta certa — só a verdadeira.`,
  ]
}

/** Fala de transição exibida antes do passo de perfil. */
export const FALAS_PERFIL = [
  'Primeiro, duas informações rápidas sobre você.',
  'Elas ficam salvas e eu não vou perguntar de novo.',
]
