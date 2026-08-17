import { redirect } from 'next/navigation'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { contarMembros } from '@/lib/membros'
import { AuthLayout } from '@/components/AuthLayout'
import { TrilhaConteudo } from '@/components/TrilhaConteudo'

export default async function ContentPage() {
  const supabase = createServerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/auth/login')

  const [{ data: profile }, totalMembros] = await Promise.all([
    supabase.from('profiles').select('nome, aulas_concluidas').eq('id', user.id).single(),
    contarMembros(),
  ])

  const nomeUsuario = profile?.nome ?? user.email ?? ''
  const aulasConcluidas: number[] = profile?.aulas_concluidas ?? []

  return (
    <AuthLayout titulo="Conteúdo" nomeUsuario={nomeUsuario} totalMembros={totalMembros}>
      <div className="mx-auto w-full max-w-2xl px-6 py-8">
        <TrilhaConteudo nomeUsuario={nomeUsuario} aulasConcluidas={aulasConcluidas} />
      </div>
    </AuthLayout>
  )
}
