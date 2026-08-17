import { notFound, redirect } from 'next/navigation'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { contarMembros } from '@/lib/membros'
import { AuthLayout } from '@/components/AuthLayout'
import { LiveAula } from '@/components/LiveAula'
import { getLive, LIVES } from '@/lib/lives'

export default async function LivePage({ params }: { params: { id: string } }) {
  const supabase = createServerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/auth/login')

  const [{ data: profile }, totalMembros] = await Promise.all([
    supabase.from('profiles').select('nome').eq('id', user.id).single(),
    contarMembros(),
  ])

  const nomeUsuario = profile?.nome ?? user.email ?? ''

  const live = getLive(params.id)
  if (!live) notFound()

  const index = LIVES.findIndex((l) => l.id === params.id)
  const anterior = LIVES[index - 1] ?? null
  const proximo = LIVES[index + 1] ?? null

  return (
    <AuthLayout titulo={live.titulo} nomeUsuario={nomeUsuario} totalMembros={totalMembros}>
      <LiveAula
        live={live}
        index={index + 1}
        total={LIVES.length}
        anteriorId={anterior?.id ?? null}
        proximoId={proximo?.id ?? null}
      />
    </AuthLayout>
  )
}
