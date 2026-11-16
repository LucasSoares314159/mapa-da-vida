import { redirect } from 'next/navigation'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { contarMembros } from '@/lib/membros'
import {
  calendario30Dias,
  constancia,
  constanciaUltimos7Dias,
  diaDeHoje,
  diaEmBrasilia,
  inicioDaSemana,
  melhorSequencia,
  placarDoHabito,
  somarDias,
  SEMANAS_CONSTANCIA,
} from '@/lib/habitos'
import { AuthLayout } from '@/components/AuthLayout'
import { ProgressoHabitos, type HabitoNoProgresso } from '@/components/habitos/ProgressoHabitos'
import { statusDoUltimoMapa } from '../ultimo-mapa'
import { PILARES, type Habito, type RegistroHabito } from '@/types'

export const dynamic = 'force-dynamic'

const formatoDesde = new Intl.DateTimeFormat('pt-BR', { day: 'numeric', month: 'long', timeZone: 'UTC' })

function pilarDaArea(area: Habito['area']): string {
  return Object.values(PILARES).find((p) => p.areas.includes(area))?.label ?? ''
}

export default async function ProgressoHabitosPage() {
  const supabase = createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const hoje = diaDeHoje()
  const desdeRecorte = somarDias(inicioDaSemana(hoje), -7 * SEMANAS_CONSTANCIA * 2)

  const [{ data: profile }, { data: habitosRaw }, { data: registrosRaw }, { data: registrosTodosRaw }, { count: repeticoes }, statusPorArea, totalMembros] =
    await Promise.all([
      supabase.from('profiles').select('nome').eq('id', user.id).single(),
      // Arquivados também: o histórico deles segue contando na constância e no calendário.
      supabase
        .from('habitos')
        .select('*')
        .eq('user_id', user.id)
        .order('ordem', { ascending: true, nullsFirst: false })
        .order('criado_em', { ascending: true }),
      supabase.from('habito_registros').select('*').eq('user_id', user.id).gte('dia', desdeRecorte),
      // Todos os registros para calcular a melhor sequência histórica.
      supabase.from('habito_registros').select('habito_id, dia, status').eq('user_id', user.id).eq('status', 'feito'),
      // Repetições são desde sempre, fora do recorte de 8 semanas: o número só cresce.
      supabase
        .from('habito_registros')
        .select('habito_id', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('status', 'feito'),
      statusDoUltimoMapa(supabase, user.id),
      contarMembros(),
    ])

  const todos = (habitosRaw ?? []) as Habito[]
  const registros = (registrosRaw ?? []) as RegistroHabito[]
  const registrosTodos = (registrosTodosRaw ?? []) as RegistroHabito[]
  const primeiro = todos.reduce<string | null>((min, h) => (min === null || h.criado_em < min ? h.criado_em : min), null)
  const cal30 = calendario30Dias(todos, registros, hoje)
  const totalDiasCompletos = cal30.filter((d) => d.completo).length

  const ativos = todos.filter((h) => !h.arquivado_em)

  const habitos: HabitoNoProgresso[] = ativos
    .map((h) => ({
      id: h.id,
      nome: h.nome,
      icone: h.icone,
      areaLabel: `${pilarDaArea(h.area)} · ${h.area}`,
      status: statusPorArea[h.area],
      placar: placarDoHabito(h, registros, hoje),
      criado_em: h.criado_em,
      arquivado_em: h.arquivado_em ?? null,
    }))

  const feitosSet = registros
    .filter((r) => r.status === 'feito')
    .map((r) => `${r.habito_id}|${r.dia}`)

  const feitosSetObj = new Set(feitosSet)
  // Hábitos feitos hoje
  const feitosHoje = ativos.filter((h) => feitosSetObj.has(`${h.id}|${hoje}`)).length
  // Checks este mês (1º dia do mês até hoje)
  const inicioMes = `${hoje.slice(0, 7)}-01`
  const checksEsteMes = registros.filter(
    (r) => r.status === 'feito' && r.dia >= inicioMes && r.dia <= hoje
  ).length

  return (
    <AuthLayout titulo="Meus Hábitos" nomeUsuario={profile?.nome ?? user.email ?? ''} totalMembros={totalMembros}>
      <ProgressoHabitos
        repeticoes={repeticoes ?? 0}
        desde={primeiro ? formatoDesde.format(new Date(`${diaEmBrasilia(primeiro)}T12:00:00Z`)) : null}
        constancia={constancia(todos, registros, hoje)}
        constancia7Dias={constanciaUltimos7Dias(todos, registros, hoje)}
        calendario={cal30}
        diasCompletos={totalDiasCompletos}
        melhorSequencia={melhorSequencia(todos, registrosTodos, hoje)}
        habitos={habitos}
        feitosSet={feitosSet}
        hoje={hoje}
        totalHabitos={ativos.length}
        feitosHoje={feitosHoje}
        checksEsteMes={checksEsteMes}
      />
    </AuthLayout>
  )
}
