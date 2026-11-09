import { redirect } from 'next/navigation'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { contarMembros } from '@/lib/membros'
import {
  constancia,
  diaDeHoje,
  habitosDoDia,
  inicioDaSemana,
  podeCriarHabito,
  somarDias,
  SEMANAS_CONSTANCIA,
} from '@/lib/habitos'
import { AuthLayout } from '@/components/AuthLayout'
import { HabitosHoje } from '@/components/habitos/HabitosHoje'
import type { Habito, RegistroHabito } from '@/types'

export const dynamic = 'force-dynamic'

const formatoData = new Intl.DateTimeFormat('pt-BR', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
  timeZone: 'UTC',
})

export default async function HabitosPage() {
  const supabase = createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const hoje = diaDeHoje()
  // A constância compara as 4 semanas fechadas com as 4 anteriores: 8 semanas
  // inteiras mais a atual cobrem tudo o que a tela calcula.
  const desde = somarDias(inicioDaSemana(hoje), -7 * SEMANAS_CONSTANCIA * 2)

  const [{ data: profile }, { data: habitosRaw }, { data: registrosRaw }, totalMembros] = await Promise.all([
    supabase.from('profiles').select('nome').eq('id', user.id).single(),
    // Arquivados também: o histórico deles segue contando na constância.
    supabase
      .from('habitos')
      .select('*')
      .eq('user_id', user.id)
      .order('ordem', { ascending: true, nullsFirst: false })
      .order('criado_em', { ascending: true }),
    supabase.from('habito_registros').select('*').eq('user_id', user.id).gte('dia', desde),
    contarMembros(),
  ])

  const todos = (habitosRaw ?? []) as Habito[]
  const registros = (registrosRaw ?? []) as RegistroHabito[]
  const ativos = todos.filter((h) => !h.arquivado_em)

  const habitos = habitosDoDia(todos, registros, hoje)

  return (
    <AuthLayout titulo="Meus Hábitos" nomeUsuario={profile?.nome ?? user.email ?? ''} totalMembros={totalMembros}>
      <HabitosHoje
        dataLabel={formatoData.format(new Date(`${hoje}T12:00:00Z`))}
        habitos={habitos}
        constancia={constancia(todos, registros, hoje).atual}
        podeCriar={podeCriarHabito(ativos.length)}
      />
    </AuthLayout>
  )
}
