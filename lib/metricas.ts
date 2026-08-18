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

/**
 * Fronteira entre as turmas. Quem se cadastrou a partir daqui é Turma 2 — a
 * primeira que nasceu já com `progresso_aulas`, e por isso a única com data real
 * de conclusão. A Turma 1 teve o progresso migrado do array antigo, sem data.
 */
export const INICIO_TURMA_2 = '2026-08-17'

export type Turma = 'turma1' | 'turma2'

export function turmaDe(criadoEm: string): Turma {
  return criadoEm >= INICIO_TURMA_2 ? 'turma2' : 'turma1'
}

export type LinhaAluno = {
  id: string
  nome: string
  email: string
  criadoEm: string
  coorte: string
  turma: Turma
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

export type Etapa = { rotulo: string; detalhe: string; valor: number; pct: number }

export type VisaoTurma = {
  nome: string
  descricao: string
  total: number
  funil: Etapa[]
  alcance: { rotulo: string; valor: number }[]
  porModulo: { id: string; titulo: string; chegaram: number; concluiram: number; dropoff: number }[]
  distribuicao: { rotulo: string; valor: number }[]
  emRisco: number
  ativos7d: number
  concluiramTrilha: number
  mediaModulos: number
  /** Métricas de tempo só valem onde há data real de conclusão. */
  temDataReal: boolean
}

export type Metricas = {
  totalAlunos: number
  todas: VisaoTurma
  turma1: VisaoTurma
  turma2: VisaoTurma
  funil: Etapa[]
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

/** Janela de análise. Sem `desde`, considera tudo. */
export type Periodo = { desde?: string; ate?: string }

export const PERIODOS = [
  { id: 'tudo', rotulo: 'Tudo' },
  { id: '7d', rotulo: '7 dias' },
  { id: '30d', rotulo: '30 dias' },
  { id: '90d', rotulo: '90 dias' },
] as const

export type IdPeriodo = (typeof PERIODOS)[number]['id']

export function periodoDe(id: IdPeriodo): Periodo {
  if (id === 'tudo') return {}
  const dias = id === '7d' ? 7 : id === '30d' ? 30 : 90
  return { desde: new Date(Date.now() - dias * 86_400_000).toISOString() }
}

export async function carregarMetricas(periodo: Periodo = {}): Promise<Metricas> {
  const sb = createAdminSupabaseClient()

  const [
    { data: perfis },
    { data: progresso },
    { data: mapas },
    { data: momentos },
    { data: objetivos },
    { data: rotinas },
  ] = await Promise.all([
    sb
      .from('profiles')
      .select('id, nome, criado_em, excluir_das_metricas')
      .order('criado_em'),
    sb.from('progresso_aulas').select('user_id, modulo_id, concluido_em, data_confiavel'),
    sb.from('mapas').select('user_id, criado_em'),
    sb.from('momentos_vida').select('user_id, criado_em'),
    sb.from('objetivos').select('user_id, criado_em'),
    sb.from('rotinas').select('user_id, atualizado_em'),
  ])

  // Contas internas (testes, equipe) ficam fora de todas as métricas — a
  // plataforma segue funcionando normalmente para elas.
  const alunosBrutos = (perfis ?? []).filter((p) => !p.excluir_das_metricas)
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

  /** Dentro da janela de análise? Sem janela, tudo entra. */
  const naJanela = (iso: string | null | undefined) => {
    if (!iso) return !periodo.desde
    if (periodo.desde && iso < periodo.desde) return false
    if (periodo.ate && iso > periodo.ate) return false
    return true
  }

  const setDe = (
    linhas: Record<string, string>[] | null,
    colunaData: string
  ) =>
    new Set(
      (linhas ?? []).filter((l) => naJanela(l[colunaData])).map((l) => l.user_id)
    )

  const comMapa = setDe(mapas as any, 'criado_em')
  const comMomento = setDe(momentos as any, 'criado_em')
  const comObjetivo = setDe(objetivos as any, 'criado_em')
  const comRotina = setDe(rotinas as any, 'atualizado_em')

  // Eventos de progresso agrupados por aluno.
  const porAluno = new Map<string, { indices: number[]; ultima: string | null }>()
  for (const e of eventos) {
    const idx = moduloIdParaIndice(e.modulo_id)
    if (idx < 0) continue
    // Datas estimadas não têm posição no tempo: só entram quando não há janela.
    if (periodo.desde && !(e.data_confiavel && naJanela(e.concluido_em))) continue
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
    const turma = turmaDe(p.criado_em ?? '')
    const dias = diasDesde(prog.ultima)
    // Quem nunca teve atividade datada conta como parado desde o cadastro.
    const diasParado = dias ?? diasDesde(p.criado_em)

    return {
      id: p.id,
      nome: p.nome ?? '—',
      email: emails.get(p.id) ?? '—',
      criadoEm: p.criado_em,
      coorte: (p.criado_em ?? '').slice(0, 7),
      turma,
      modulosConcluidos: prog.indices.length,
      ultimoModulo: prog.indices.length ? Math.max(...prog.indices) : null,
      ultimaAtividade: prog.ultima,
      diasParado,
      // Só a Turma 2 tem data real de conclusão; marcar a Turma 1 como "em
      // risco" seria medir a data da migração, não o comportamento dela.
      emRisco:
        turma === 'turma2' &&
        prog.indices.length < MODULOS.length &&
        (diasParado ?? 0) >= DIAS_RISCO,
      temMapa: comMapa.has(p.id),
      temMomento: comMomento.has(p.id),
      temObjetivo: comObjetivo.has(p.id),
      temRotina: comRotina.has(p.id),
    }
  })

  const pct = (n: number) => (total ? Math.round((n / total) * 100) : 0)

  // Etapas do funil, na ordem em que a trilha as propõe. Cada uma é um
  // artefato real no banco — não um checkbox.
  //
  // `desdeTurma2` marca features lançadas junto com a Turma 2: incluí-las no
  // funil da Turma 1 mediria a data de lançamento, não o engajamento.
  const etapas = [
    { rotulo: 'Cadastrou', detalhe: 'Entrou na turma', desdeTurma2: false, tem: (_: LinhaAluno) => true },
    { rotulo: 'Começou a trilha', detalhe: 'Concluiu ao menos um módulo', desdeTurma2: false, tem: (a: LinhaAluno) => a.modulosConcluidos > 0 },
    { rotulo: 'Fez o Mapa da Vida', detalhe: 'Módulo 3 · o AHA moment', desdeTurma2: false, tem: (a: LinhaAluno) => a.temMapa },
    { rotulo: 'Criou um Objetivo', detalhe: 'Módulo 5 · saiu do diagnóstico para a ação', desdeTurma2: false, tem: (a: LinhaAluno) => a.temObjetivo },
    { rotulo: 'Montou a Rotina', detalhe: 'Módulo 4 · calculou a própria semana', desdeTurma2: false, tem: (a: LinhaAluno) => a.temRotina },
    { rotulo: 'Definiu o Momento', detalhe: 'Módulo 2 · feature nova', desdeTurma2: true, tem: (a: LinhaAluno) => a.temMomento },
  ]

  /**
   * Funil cumulativo: uma etapa só conta quem cumpriu todas as anteriores. Sem
   * isso o gráfico "sobe" no meio e deixa de significar alguma coisa.
   */
  function funilDe(grupo: LinhaAluno[], incluirNovas: boolean) {
    const base = grupo.length
    const usadas = etapas.filter((e) => incluirNovas || !e.desdeTurma2)
    return usadas.map((e, i) => {
      const ate = usadas.slice(0, i + 1)
      const valor = grupo.filter((a) => ate.every((x) => x.tem(a))).length
      return {
        rotulo: e.rotulo,
        detalhe: e.detalhe,
        valor,
        pct: base ? Math.round((valor / base) * 100) : 0,
      }
    })
  }

  /** Uso de cada ferramenta em qualquer ordem — o funil sozinho engana. */
  function alcanceDe(grupo: LinhaAluno[]) {
    return [
      { rotulo: 'Assistiu ao menos um módulo', valor: grupo.filter((a) => a.modulosConcluidos > 0).length },
      { rotulo: 'Fez o Mapa da Vida', valor: grupo.filter((a) => a.temMapa).length },
      { rotulo: 'Criou um Objetivo', valor: grupo.filter((a) => a.temObjetivo).length },
      { rotulo: 'Montou a Rotina', valor: grupo.filter((a) => a.temRotina).length },
      { rotulo: 'Definiu o Momento', valor: grupo.filter((a) => a.temMomento).length },
    ]
  }

  const turma1 = alunos.filter((a) => a.turma === 'turma1')
  const turma2 = alunos.filter((a) => a.turma === 'turma2')

  const funil = funilDe(alunos, true)

  // Drop-off: de quem chegou a um módulo, quantos não passaram dele.
  function porModuloDe(grupo: LinhaAluno[]) {
    return MODULOS.map((m, i) => {
      const concluiram = grupo.filter((a) => porAluno.get(a.id)?.indices.includes(i)).length
      // "Chegaram" = concluíram este módulo ou algum posterior.
      const chegaram = grupo.filter((a) => (a.ultimoModulo ?? -1) >= i).length
      const dropoff = chegaram ? Math.round(((chegaram - concluiram) / chegaram) * 100) : 0
      return { id: m.id, titulo: m.titulo, chegaram, concluiram, dropoff }
    })
  }

  const porModulo = porModuloDe(alunos)

  // Onde cada aluno está agora.
  function distribuicaoDe(grupo: LinhaAluno[]) {
    return [
      { rotulo: 'Não começou', valor: grupo.filter((a) => a.modulosConcluidos === 0).length },
      ...MODULOS.map((m, i) => ({
        rotulo: m.titulo.replace(/ —.*/, ''),
        valor: grupo.filter((a) => a.ultimoModulo === i).length,
      })),
    ]
  }

  const distribuicaoAtual = distribuicaoDe(alunos)

  function visao(
    grupo: LinhaAluno[],
    nome: string,
    descricao: string,
    incluirNovas: boolean,
    temDataReal: boolean
  ): VisaoTurma {
    const somaModulos = grupo.reduce((s, a) => s + a.modulosConcluidos, 0)
    return {
      nome,
      descricao,
      total: grupo.length,
      funil: funilDe(grupo, incluirNovas),
      alcance: alcanceDe(grupo),
      porModulo: porModuloDe(grupo),
      distribuicao: distribuicaoDe(grupo),
      emRisco: grupo.filter((a) => a.emRisco).length,
      // Ativo = concluiu alguma aula nos últimos dias. Cadastro recente sem
      // nenhuma conclusão não é atividade.
      ativos7d: grupo.filter(
        (a) => a.ultimaAtividade !== null && (a.diasParado ?? 99) < DIAS_RISCO
      ).length,
      concluiramTrilha: grupo.filter((a) => a.modulosConcluidos === MODULOS.length).length,
      mediaModulos: grupo.length ? Math.round((somaModulos / grupo.length) * 10) / 10 : 0,
      temDataReal,
    }
  }

  return {
    totalAlunos: total,
    todas: visao(
      alunos,
      'Base completa',
      'Turma 1 e Turma 2 juntas.',
      true,
      false
    ),
    turma1: visao(
      turma1,
      'Turma 1',
      'Cadastros até julho. Progresso migrado, sem data real — serve para visão macro, não para ritmo.',
      false,
      false
    ),
    turma2: visao(
      turma2,
      'Turma 2',
      'Cadastros a partir de 17/08. Nasceram com registro de data — é aqui que o engajamento se mede.',
      true,
      true
    ),
    funil,
    porModulo,
    distribuicaoAtual,
    alunos,
    emRisco: alunos.filter((a) => a.emRisco).length,
    ativos7d: alunos.filter(
      (a) => a.ultimaAtividade !== null && (a.diasParado ?? 99) < DIAS_RISCO
    ).length,
    concluiramTrilha: alunos.filter((a) => a.modulosConcluidos === MODULOS.length).length,
    dadosDeTempoConfiaveis: eventos.some((e) => e.data_confiavel),
  }
}
