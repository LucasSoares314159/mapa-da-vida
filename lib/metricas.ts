import { createAdminSupabaseClient } from './supabase-admin'
import { MODULOS } from './modulos'
import { moduloIdParaIndice } from './progresso'

/**
 * Agregações do back office.
 *
 * Tudo aqui usa o cliente admin porque o RLS restringe cada tabela ao próprio
 * usuário — com o cliente comum os números sairiam sempre referentes a uma
 * pessoa só. Roda exclusivamente em Server Components: a service role key nunca
 * chega ao browser.
 */

/** Dias sem concluir nenhuma aula a partir dos quais o aluno entra em risco. */
export const DIAS_RISCO = 7

export type LinhaAluno = {
  id: string
  nome: string
  email: string
  criadoEm: string
  coorte: string
  modulosConcluidos: number
  ultimoModulo: number | null
  ultimaAtividade: string | null
  diasParado: number | null
  emRisco: boolean
  temMapa: boolean
  temMomento: boolean
  temObjetivo: boolean
  temRotina: boolean
}

export type Metricas = {
  totalAlunos: number
  funil: { rotulo: string; detalhe: string; valor: number; pct: number }[]
  alcance: { rotulo: string; valor: number }[]
  porModulo: { id: string; titulo: string; chegaram: number; concluiram: number; dropoff: number }[]
  distribuicaoAtual: { rotulo: string; valor: number }[]
  alunos: LinhaAluno[]
  emRisco: number
  ativos7d: number
  concluiramTrilha: number
  dadosDeTempoConfiaveis: boolean
}

function diasDesde(iso: string | null): number | null {
  if (!iso) return null
  const ms = Date.now() - new Date(iso).getTime()
  return Math.floor(ms / 86_400_000)
}

export async function carregarMetricas(): Promise<Metricas> {
  const sb = createAdminSupabaseClient()

  const [
    { data: perfis },
    { data: progresso },
    { data: mapas },
    { data: momentos },
    { data: objetivos },
    { data: rotinas },
  ] = await Promise.all([
    sb.from('profiles').select('id, nome, criado_em').order('criado_em'),
    sb.from('progresso_aulas').select('user_id, modulo_id, concluido_em, data_confiavel'),
    sb.from('mapas').select('user_id'),
    sb.from('momentos_vida').select('user_id'),
    sb.from('objetivos').select('user_id'),
    sb.from('rotinas').select('user_id'),
  ])

  const alunosBrutos = perfis ?? []
  const eventos = progresso ?? []
  const total = alunosBrutos.length

  // auth.users guarda o email; profiles não tem essa coluna.
  const emails = new Map<string, string>()
  try {
    const { data: authUsers } = await sb.auth.admin.listUsers({ page: 1, perPage: 1000 })
    for (const u of authUsers?.users ?? []) {
      if (u.email) emails.set(u.id, u.email)
    }
  } catch {
    // Sem email a tela ainda funciona — só perde o contato direto.
  }

  const setDe = (linhas: { user_id: string }[] | null) =>
    new Set((linhas ?? []).map((l) => l.user_id))

  const comMapa = setDe(mapas)
  const comMomento = setDe(momentos)
  const comObjetivo = setDe(objetivos)
  const comRotina = setDe(rotinas)

  // Eventos de progresso agrupados por aluno.
  const porAluno = new Map<string, { indices: number[]; ultima: string | null }>()
  for (const e of eventos) {
    const idx = moduloIdParaIndice(e.modulo_id)
    if (idx < 0) continue
    const atual = porAluno.get(e.user_id) ?? { indices: [], ultima: null }
    atual.indices.push(idx)
    // Datas estimadas na migração não valem como "atividade recente".
    if (e.data_confiavel && (!atual.ultima || e.concluido_em > atual.ultima)) {
      atual.ultima = e.concluido_em
    }
    porAluno.set(e.user_id, atual)
  }

  const alunos: LinhaAluno[] = alunosBrutos.map((p) => {
    const prog = porAluno.get(p.id) ?? { indices: [], ultima: null }
    const dias = diasDesde(prog.ultima)
    // Quem nunca teve atividade datada conta como parado desde o cadastro.
    const diasParado = dias ?? diasDesde(p.criado_em)

    return {
      id: p.id,
      nome: p.nome ?? '—',
      email: emails.get(p.id) ?? '—',
      criadoEm: p.criado_em,
      coorte: (p.criado_em ?? '').slice(0, 7),
      modulosConcluidos: prog.indices.length,
      ultimoModulo: prog.indices.length ? Math.max(...prog.indices) : null,
      ultimaAtividade: prog.ultima,
      diasParado,
      emRisco: prog.indices.length < MODULOS.length && (diasParado ?? 0) >= DIAS_RISCO,
      temMapa: comMapa.has(p.id),
      temMomento: comMomento.has(p.id),
      temObjetivo: comObjetivo.has(p.id),
      temRotina: comRotina.has(p.id),
    }
  })

  const pct = (n: number) => (total ? Math.round((n / total) * 100) : 0)

  // Etapas do funil, na ordem em que a trilha as propõe. Cada uma é um
  // artefato real no banco — não um checkbox.
  const etapas = [
    { rotulo: 'Cadastrou', detalhe: 'Criou conta na plataforma', tem: (_: LinhaAluno) => true },
    { rotulo: 'Fez o Mapa da Vida', detalhe: 'Módulo 3 · o AHA moment', tem: (a: LinhaAluno) => a.temMapa },
    { rotulo: 'Definiu o Momento', detalhe: 'Módulo 2 · declarou a fase de vida', tem: (a: LinhaAluno) => a.temMomento },
    { rotulo: 'Criou um Objetivo', detalhe: 'Módulo 5 · saiu do diagnóstico para a ação', tem: (a: LinhaAluno) => a.temObjetivo },
    { rotulo: 'Montou a Rotina', detalhe: 'Módulo 4 · calculou a própria semana', tem: (a: LinhaAluno) => a.temRotina },
  ]

  // Cumulativo: uma etapa só conta quem cumpriu todas as anteriores. Sem isso o
  // funil "sobe" no meio e deixa de significar alguma coisa.
  const funil = etapas.map((e, i) => {
    const ate = etapas.slice(0, i + 1)
    const valor = alunos.filter((a) => ate.every((x) => x.tem(a))).length
    return { rotulo: e.rotulo, detalhe: e.detalhe, valor, pct: pct(valor) }
  })

  // Fora do funil: quantos usaram cada ferramenta, em qualquer ordem.
  const alcance = [
    { rotulo: 'Assistiu ao menos um módulo', valor: alunos.filter((a) => a.modulosConcluidos > 0).length },
    { rotulo: 'Fez o Mapa da Vida', valor: comMapa.size },
    { rotulo: 'Definiu o Momento', valor: comMomento.size },
    { rotulo: 'Criou um Objetivo', valor: comObjetivo.size },
    { rotulo: 'Montou a Rotina', valor: comRotina.size },
  ]

  // Drop-off: de quem chegou a um módulo, quantos não passaram dele.
  const porModulo = MODULOS.map((m, i) => {
    const concluiram = alunos.filter((a) => porAluno.get(a.id)?.indices.includes(i)).length
    // "Chegaram" = concluíram este módulo ou algum posterior.
    const chegaram = alunos.filter((a) => (a.ultimoModulo ?? -1) >= i).length
    const dropoff = chegaram ? Math.round(((chegaram - concluiram) / chegaram) * 100) : 0
    return { id: m.id, titulo: m.titulo, chegaram, concluiram, dropoff }
  })

  // Onde cada aluno está agora.
  const distribuicaoAtual = [
    { rotulo: 'Não começou', valor: alunos.filter((a) => a.modulosConcluidos === 0).length },
    ...MODULOS.map((m, i) => ({
      rotulo: m.titulo.replace(/ —.*/, ''),
      valor: alunos.filter((a) => a.ultimoModulo === i).length,
    })),
  ]

  return {
    totalAlunos: total,
    funil,
    alcance,
    porModulo,
    distribuicaoAtual,
    alunos,
    emRisco: alunos.filter((a) => a.emRisco).length,
    ativos7d: alunos.filter((a) => a.diasParado !== null && a.diasParado < DIAS_RISCO).length,
    concluiramTrilha: alunos.filter((a) => a.modulosConcluidos === MODULOS.length).length,
    dadosDeTempoConfiaveis: eventos.some((e) => e.data_confiavel),
  }
}
