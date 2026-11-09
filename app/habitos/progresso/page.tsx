import { redirect } from 'next/navigation'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { contarMembros } from '@/lib/membros'
import {
  calendario,
  constancia,
  diaDeHoje,
  diaEmBrasilia,
  diasCompletos,
  inicioDaSemana,
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

  const [{ data: profile }, { data: habitosRaw }, { data: registrosRaw }, { count: repeticoes }, statusPorArea, totalMembros] =
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
  const primeiro = todos.reduce<string | null>((min, h) => (min === null || h.criado_em < min ? h.criado_em : min), null)
  const cal = calendario(todos, registros, hoje)

  const habitos: HabitoNoProgresso[] = todos
    .filter((h) => !h.arquivado_em)
    .map((h) => ({
      id: h.id,
      nome: h.nome,
      areaLabel: `${pilarDaArea(h.area)} · ${h.area}`,
      status: statusPorArea[h.area],
      placar: placarDoHabito(h, registros, hoje),
    }))

  return (
    <AuthLayout titulo="Meus Hábitos" nomeUsuario={profile?.nome ?? user.email ?? ''} totalMembros={totalMembros}>
      <ProgressoHabitos
        repeticoes={repeticoes ?? 0}
        desde={primeiro ? formatoDesde.format(new Date(`${diaEmBrasilia(primeiro)}T12:00:00Z`)) : null}
        constancia={constancia(todos, registros, hoje)}
        calendario={cal}
        diasCompletos={diasCompletos(cal)}
        habitos={habitos}
      />
    </AuthLayout>
  )
}
