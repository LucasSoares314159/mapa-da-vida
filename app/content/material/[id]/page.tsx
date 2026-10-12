import { notFound, redirect } from 'next/navigation'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { contarMembros } from '@/lib/membros'
import { AuthLayout } from '@/components/AuthLayout'
import { MaterialApoioPagina } from '@/components/MaterialApoioPagina'
import { getMaterial, MATERIAIS } from '@/lib/materiais'

export default async function MaterialPage({ params }: { params: { id: string } }) {
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

  const material = getMaterial(params.id)
  if (!material) notFound()

  const index = MATERIAIS.findIndex((m) => m.id === params.id)
  const anterior = MATERIAIS[index - 1] ?? null
  const proximo = MATERIAIS[index + 1] ?? null

  return (
    <AuthLayout titulo={material.titulo} nomeUsuario={nomeUsuario} totalMembros={totalMembros}>
      <MaterialApoioPagina
        material={material}
        index={index + 1}
        total={MATERIAIS.length}
        anteriorId={anterior?.id ?? null}
        proximoId={proximo?.id ?? null}
      />
    </AuthLayout>
  )
}
