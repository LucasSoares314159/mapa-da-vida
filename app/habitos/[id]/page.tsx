import { notFound, redirect } from 'next/navigation'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { contarMembros } from '@/lib/membros'
import { AuthLayout } from '@/components/AuthLayout'
import { FormularioHabito } from '@/components/habitos/FormularioHabito'
import { statusDoUltimoMapa } from '../ultimo-mapa'
import type { Habito } from '@/types'

export const dynamic = 'force-dynamic'

export default async function EditarHabitoPage({ params }: { params: { id: string } }) {
  const supabase = createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const [{ data: profile }, { data: habitoRaw }, statusPorArea, totalMembros] = await Promise.all([
    supabase.from('profiles').select('nome').eq('id', user.id).single(),
    supabase
      .from('habitos')
      .select('*')
      .eq('id', params.id)
      .eq('user_id', user.id)
      .is('arquivado_em', null)
      .maybeSingle(),
    statusDoUltimoMapa(supabase, user.id),
    contarMembros(),
  ])

  // Arquivado também é 404: não há o que editar num hábito fora da grade.
  if (!habitoRaw) notFound()
  const habito = habitoRaw as Habito

  return (
    <AuthLayout titulo="Meus Hábitos" nomeUsuario={profile?.nome ?? user.email ?? ''} totalMembros={totalMembros}>
      <FormularioHabito
        statusPorArea={statusPorArea}
        habito={{
          id: habito.id,
          nome: habito.nome,
          icone: habito.icone,
          area: habito.area,
          meta_semanal: habito.meta_semanal,
          ancora: habito.ancora ?? null,
        }}
      />
    </AuthLayout>
  )
}
