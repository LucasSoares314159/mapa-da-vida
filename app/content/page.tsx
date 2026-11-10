import { redirect } from 'next/navigation'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { contarMembros } from '@/lib/membros'
import { linhasParaIndices } from '@/lib/progresso'
import { diaDeHoje, habitosDoDia, inicioDaSemana } from '@/lib/habitos'
import { AuthLayout } from '@/components/AuthLayout'
import { TrilhaConteudo } from '@/components/TrilhaConteudo'
import { FaixaHabitos } from '@/components/habitos/FaixaHabitos'
import type { Habito, RegistroHabito } from '@/types'

export default async function ContentPage() {
  const supabase = createServerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/auth/login')

  const hoje = diaDeHoje()
  const [{ data: profile }, { data: progresso }, { data: habitosRaw }, { data: registrosRaw }, totalMembros] =
    await Promise.all([
      supabase.from('profiles').select('nome').eq('id', user.id).single(),
      supabase.from('progresso_aulas').select('modulo_id').eq('user_id', user.id),
      // Faixa de hábitos: só os ativos e só a semana corrente.
      supabase
        .from('habitos')
        .select('*')
        .eq('user_id', user.id)
        .is('arquivado_em', null)
        .order('ordem', { ascending: true, nullsFirst: false })
        .order('criado_em', { ascending: true }),
      supabase.from('habito_registros').select('*').eq('user_id', user.id).gte('dia', inicioDaSemana(hoje)),
      contarMembros(),
    ])

  const nomeUsuario = profile?.nome ?? user.email ?? ''
  const aulasConcluidas = linhasParaIndices(progresso ?? [])
  const habitos = habitosDoDia((habitosRaw ?? []) as Habito[], (registrosRaw ?? []) as RegistroHabito[], hoje)

  return (
    <AuthLayout titulo="Conteúdo" nomeUsuario={nomeUsuario} totalMembros={totalMembros}>
      <div className="mx-auto w-full max-w-2xl px-6 py-8">
        <TrilhaConteudo
          nomeUsuario={nomeUsuario}
          aulasConcluidas={aulasConcluidas}
          destaque={<FaixaHabitos habitos={habitos} />}
        />
      </div>
    </AuthLayout>
  )
}
