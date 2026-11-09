import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { contarMembros } from '@/lib/membros'
import { LIMITE_HABITOS_ATIVOS, podeCriarHabito } from '@/lib/habitos'
import { AuthLayout } from '@/components/AuthLayout'
import { Button } from '@/components/ui/button'
import { FormularioHabito } from '@/components/habitos/FormularioHabito'
import { statusDoUltimoMapa } from '../ultimo-mapa'

export const dynamic = 'force-dynamic'

export default async function NovoHabitoPage() {
  const supabase = createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const [{ data: profile }, { count }, statusPorArea, totalMembros] = await Promise.all([
    supabase.from('profiles').select('nome').eq('id', user.id).single(),
    supabase
      .from('habitos')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .is('arquivado_em', null),
    statusDoUltimoMapa(supabase, user.id),
    contarMembros(),
  ])

  return (
    <AuthLayout titulo="Meus Hábitos" nomeUsuario={profile?.nome ?? user.email ?? ''} totalMembros={totalMembros}>
      {podeCriarHabito(count ?? 0) ? (
        <FormularioHabito statusPorArea={statusPorArea} />
      ) : (
        <div className="mx-auto flex w-full max-w-xl flex-col items-start gap-4 px-5 pt-8 sm:px-8">
          <h1 className="font-heading text-titulo font-medium text-mt-green-dark">Você já tem {LIMITE_HABITOS_ATIVOS} hábitos</h1>
          <p className="apoio">poucos hábitos cumpridos valem mais que muitos evitados. arquive um para começar outro.</p>
          <Button asChild>
            <Link href="/habitos">Voltar aos hábitos</Link>
          </Button>
        </div>
      )}
    </AuthLayout>
  )
}
