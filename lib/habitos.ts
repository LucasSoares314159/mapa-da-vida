// Regras do Monitor de Hábitos. Funções puras: recebem hábitos, registros e o
// dia de hoje, e devolvem o que as telas mostram. Nada aqui toca o banco.
//
// Dias são strings 'YYYY-MM-DD' no fuso de Brasília. A aritmética de datas roda
// em UTC sobre essas strings, para não depender do fuso do servidor.

import type { Habito, RegistroHabito } from '@/types'

export const FUSO_HABITOS = 'America/Sao_Paulo'

// Teto de hábitos ativos. Cinco cabem numa tela de celular sem rolar e mantêm
// a ideia de "poucos hábitos" sem precisar de sermão.
export const LIMITE_HABITOS_ATIVOS = 5

// Semanas completas que entram na constância e no placar por hábito.
export const SEMANAS_CONSTANCIA = 4

// Semanas do calendário da tela de progresso, contando a atual.
export const SEMANAS_CALENDARIO = 5

const formatoDia = new Intl.DateTimeFormat('en-CA', {
  timeZone: FUSO_HABITOS,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
})

/** Dia, no fuso de Brasília, de um instante. */
export function diaEmBrasilia(instante: Date | string): string {
  return formatoDia.format(typeof instante === 'string' ? new Date(instante) : instante)
}

/** Hoje no fuso de Brasília. Marcar às 22h não pode cair no dia seguinte (UTC). */
export function diaDeHoje(agora: Date = new Date()): string {
  return diaEmBrasilia(agora)
}

function paraData(dia: string): Date {
  return new Date(`${dia}T00:00:00Z`)
}

export function somarDias(dia: string, n: number): string {
  const d = paraData(dia)
  d.setUTCDate(d.getUTCDate() + n)
  return d.toISOString().slice(0, 10)
}

/** 0 = segunda … 6 = domingo. */
export function diaDaSemana(dia: string): number {
  return (paraData(dia).getUTCDay() + 6) % 7
}

/** Segunda-feira da semana do dia. */
export function inicioDaSemana(dia: string): string {
  return somarDias(dia, -diaDaSemana(dia))
}

export function podeCriarHabito(ativos: number): boolean {
  return ativos < LIMITE_HABITOS_ATIVOS
}

function diaDeCriacao(h: Habito): string {
  return diaEmBrasilia(h.criado_em)
}

function diaDeArquivo(h: Habito): string | null {
  return h.arquivado_em ? diaEmBrasilia(h.arquivado_em) : null
}

/** O hábito já existia (e ainda não estava arquivado) naquele dia? */
export function existiaNoDia(h: Habito, dia: string): boolean {
  if (dia < diaDeCriacao(h)) return false
  const arquivo = diaDeArquivo(h)
  return arquivo === null || dia < arquivo
}

// Índice "habito_id|dia" dos registros feitos. Só 'feito' conta para tudo que
// as telas mostram: 'pulado' ainda não tem tela.
function indiceFeitos(registros: RegistroHabito[]): Set<string> {
  const s = new Set<string>()
  for (const r of registros) if (r.status === 'feito') s.add(`${r.habito_id}|${r.dia}`)
  return s
}

function feitosEntre(habitoId: string, inicio: string, fim: string, feitos: Set<string>): number {
  let n = 0
  for (let d = inicio; d <= fim; d = somarDias(d, 1)) if (feitos.has(`${habitoId}|${d}`)) n++
  return n
}

export type ProgressoSemanal = {
  feitos: number
  meta: number
  /** A meta da semana já foi alcançada. */
  cumprida: boolean
  /** Feito hoje. */
  feitoHoje: boolean
}

/** Situação do hábito na semana corrente (segunda até hoje). */
export function progressoSemanal(h: Habito, registros: RegistroHabito[], hoje: string): ProgressoSemanal {
  const feitos = indiceFeitos(registros)
  const n = feitosEntre(h.id, inicioDaSemana(hoje), hoje, feitos)
  return {
    feitos: n,
    meta: h.meta_semanal,
    cumprida: n >= h.meta_semanal,
    feitoHoje: feitos.has(`${h.id}|${hoje}`),
  }
}

export type Placar = { cumpridas: number; possiveis: number }

// Soma, sobre as semanas completas do intervalo, de min(feitos, meta) e de meta.
// Só entram semanas que começam depois da criação do hábito (inclusive) e
// terminam antes de ele ser arquivado: um hábito novo não derruba a média, e
// fazer além da meta numa semana não compensa a semana fraca seguinte.
function placarNoIntervalo(
  h: Habito,
  feitos: Set<string>,
  hoje: string,
  semanasAtras: number,
  quantas: number
): Placar {
  const segundaAtual = inicioDaSemana(hoje)
  const criacao = diaDeCriacao(h)
  const arquivo = diaDeArquivo(h)
  let cumpridas = 0
  let possiveis = 0
  for (let k = semanasAtras + 1; k <= semanasAtras + quantas; k++) {
    const inicio = somarDias(segundaAtual, -7 * k)
    const fim = somarDias(inicio, 6)
    if (inicio < criacao) continue
    if (arquivo !== null && arquivo <= fim) continue
    cumpridas += Math.min(feitosEntre(h.id, inicio, fim, feitos), h.meta_semanal)
    possiveis += h.meta_semanal
  }
  return { cumpridas, possiveis }
}

/** Placar do hábito nas últimas 4 semanas completas. possiveis = 0: começou agora. */
export function placarDoHabito(h: Habito, registros: RegistroHabito[], hoje: string): Placar {
  return placarNoIntervalo(h, indiceFeitos(registros), hoje, 0, SEMANAS_CONSTANCIA)
}

export type Constancia = {
  /** Percentual inteiro, ou null quando ainda não há semana completa. */
  atual: number | null
  /** Mesmo cálculo nas 4 semanas anteriores. */
  anterior: number | null
  /** Diferença em pontos percentuais, ou null sem as duas pontas. */
  variacao: number | null
}

function percentual(p: Placar): number | null {
  return p.possiveis > 0 ? Math.round((100 * p.cumpridas) / p.possiveis) : null
}

function somarPlacares(ps: Placar[]): Placar {
  return ps.reduce((a, p) => ({ cumpridas: a.cumpridas + p.cumpridas, possiveis: a.possiveis + p.possiveis }), {
    cumpridas: 0,
    possiveis: 0,
  })
}

/**
 * Constância geral: todas as metas cumpridas sobre todas as possíveis, nas 4
 * semanas completas antes da atual. A semana corrente fica de fora porque está
 * pela metade: contá-la faria a constância cair toda segunda-feira.
 */
export function constancia(habitos: Habito[], registros: RegistroHabito[], hoje: string): Constancia {
  const feitos = indiceFeitos(registros)
  const atual = percentual(
    somarPlacares(habitos.map((h) => placarNoIntervalo(h, feitos, hoje, 0, SEMANAS_CONSTANCIA)))
  )
  const anterior = percentual(
    somarPlacares(habitos.map((h) => placarNoIntervalo(h, feitos, hoje, SEMANAS_CONSTANCIA, SEMANAS_CONSTANCIA)))
  )
  return { atual, anterior, variacao: atual !== null && anterior !== null ? atual - anterior : null }
}

/** Total de vezes que a pessoa cumpriu um hábito, desde sempre. Só cresce. */
export function repeticoesTotais(registros: RegistroHabito[]): number {
  return registros.filter((r) => r.status === 'feito').length
}

export type DiaCalendario = {
  dia: string
  futuro: boolean
  hoje: boolean
  feitos: number
  /** Hábitos que existiam naquele dia. */
  existentes: number
  /** 0 a 3, para a intensidade da cor. */
  nivel: 0 | 1 | 2 | 3
  /** Todos os hábitos existentes no dia foram feitos. */
  completo: boolean
}

/**
 * Calendário das últimas semanas (segunda a domingo), terminando na atual.
 * Cada dia conta só os hábitos que existiam nele: criar um hábito hoje não
 * apaga os dias completos do passado.
 */
export function calendario(
  habitos: Habito[],
  registros: RegistroHabito[],
  hoje: string,
  semanas: number = SEMANAS_CALENDARIO
): DiaCalendario[][] {
  const feitos = indiceFeitos(registros)
  const segundaAtual = inicioDaSemana(hoje)
  const out: DiaCalendario[][] = []
  for (let k = semanas - 1; k >= 0; k--) {
    const inicio = somarDias(segundaAtual, -7 * k)
    const linha: DiaCalendario[] = []
    for (let i = 0; i < 7; i++) {
      const dia = somarDias(inicio, i)
      const futuro = dia > hoje
      const ativos = habitos.filter((h) => existiaNoDia(h, dia))
      const n = futuro ? 0 : ativos.filter((h) => feitos.has(`${h.id}|${dia}`)).length
      const existentes = ativos.length
      const nivel = (existentes ? Math.round((3 * n) / existentes) : 0) as DiaCalendario['nivel']
      linha.push({
        dia,
        futuro,
        hoje: dia === hoje,
        feitos: n,
        existentes,
        nivel,
        completo: !futuro && existentes > 0 && n === existentes,
      })
    }
    out.push(linha)
  }
  return out
}

export function diasCompletos(cal: DiaCalendario[][]): number {
  return cal.reduce((total, semana) => total + semana.filter((d) => d.completo).length, 0)
}
