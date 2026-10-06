import { PILARES } from '@/types'
import type { NomeArea, NomePilar, StatusArea } from '@/types'

// Lógica do Mapa da Vida conversacional: a sequência de passos, o progresso e a
// estimativa de tempo. Funções puras — os componentes só renderizam o resultado.

export const ORDEM_PILARES: NomePilar[] = ['corpo', 'mente', 'espirito']

/**
 * Segundos por pergunta usados na estimativa exibida ao usuário.
 *
 * Calibrado para ler a pergunta, escolher e escrever uma frase de pelo menos
 * MIN_OBSERVACAO caracteres. Mantém o total anunciado em 7 minutos, o número
 * que a abertura promete — os dois saem daqui, então não podem divergir.
 */
const SEGUNDOS_POR_PERGUNTA = 45

/** Nível tipográfico de uma fala. Só muda tamanho e peso — a tela é um chat,
 *  não uma landing: nada de eyebrow, borda ou itálico editorial. */
export type NivelFala = 'titulo' | 'corpo'

export type Fala = {
  texto: string
  nivel?: NivelFala
  /** Negrito pontual, para a frase que pede foco. */
  forte?: boolean
}

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
 * Falas da abertura.
 *
 * Quatro beats, nesta ordem: o que é → em que se baseia → para que serve →
 * o que se espera de quem responde. A pessoa chega sem contexto nenhum, e sem
 * esses quatro ela responde 9 perguntas íntimas sem saber para quê.
 *
 * A Blue Zones entra como credibilidade da metodologia, nunca como promessa de
 * anos de vida: o Mapa é termômetro do impacto da Trilha, não um estudo de
 * longevidade pessoal.
 */
export function falasContexto(ehPrimeiroMapa: boolean): Fala[] {
  if (!ehPrimeiroMapa) {
    return [
      { texto: 'Bom te ver de volta.', nivel: 'titulo' },
      {
        texto: `Vamos medir de novo: as mesmas 9 perguntas, respondidas pelo que é verdade hoje. Cerca de ${TEMPO_ESTIMADO_TOTAL}.`,
      },
      { texto: 'Comparar com o seu mapa anterior é o que mostra o progresso de verdade.' },
    ]
  }

  return [
    {
      texto: 'O Mapa da Vida é um primeiro diagnóstico de como está a sua vida.',
      nivel: 'titulo',
    },
    { texto: 'Ele é baseado no maior estudo de longevidade do planeta: as Blue Zones.' },
    {
      texto:
        'O mapa vai ser um guia do impacto da Trilha na sua vida. Esse é o primeiro termômetro — você pode criar novos mapas com o tempo e acompanhar seu progresso.',
    },
    {
      texto: `O mapa dura em média ${TEMPO_ESTIMADO_TOTAL}. É fundamental que seja feito com foco.`,
      forte: true,
    },
  ]
}

/** Fala de transição exibida antes do passo de perfil. */
export const FALAS_PERFIL: Fala[] = [
  { texto: 'Primeiro, duas informações rápidas sobre você.', nivel: 'titulo' },
  { texto: 'Elas ficam salvas e eu não vou perguntar de novo.' },
]
