import { redirect } from 'next/navigation'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { contarMembros } from '@/lib/membros'
import {
  diaDeHoje,
  habitosDoDia,
  inicioDaSemana,
  podeCriarHabito,
  somarDias,
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

  const [{ data: profile }, { data: habitosRaw }, { data: registrosRaw }, totalMembros] = await Promise.all([
    supabase.from('profiles').select('nome').eq('id', user.id).single(),
    supabase
      .from('habitos')
      .select('*')
      .eq('user_id', user.id)
      .order('ordem', { ascending: true, nullsFirst: false })
      .order('criado_em', { ascending: true }),
    // Desde o início da semana: cobre a semana corrente (progressoSemanal e diasFeitos).
    supabase.from('habito_registros').select('*').eq('user_id', user.id).gte('dia', inicioDaSemana(hoje)),
    contarMembros(),
  ])

  const todos = (habitosRaw ?? []) as Habito[]
  const registros = (registrosRaw ?? []) as RegistroHabito[]
  const ativos = todos.filter((h) => !h.arquivado_em)

  const habitos = habitosDoDia(todos, registros, hoje)

  // Dias desta semana (seg–hoje) em que pelo menos 1 hábito foi feito
  const seg = inicioDaSemana(hoje)
  const diasFeitos: string[] = []
  for (let d = seg; d <= hoje; d = somarDias(d, 1)) {
    if (registros.some((r) => r.dia === d && r.status === 'feito')) diasFeitos.push(d)
  }

  return (
    <AuthLayout titulo="Meus Hábitos" nomeUsuario={profile?.nome ?? user.email ?? ''} totalMembros={totalMembros}>
      <HabitosHoje
        dataLabel={formatoData.format(new Date(`${hoje}T12:00:00Z`))}
        habitos={habitos}
        podeCriar={podeCriarHabito(ativos.length)}
        diasFeitos={diasFeitos}
        hoje={hoje}
      />
    </AuthLayout>
  )
}
