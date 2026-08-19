import { notFound, redirect } from 'next/navigation'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { contarMembros } from '@/lib/membros'
import { getConteudoModulo } from '@/lib/conteudo-modulos'
import { AuthLayout } from '@/components/AuthLayout'
import { EditorConteudoModulo } from '@/components/admin/EditorConteudoModulo'
import { getModulo } from '@/lib/modulos'

export const dynamic = 'force-dynamic'

export default async function AdminModuloEditarPage({ params }: { params: { id: string } }) {
  const supabase = createServerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/auth/login')

  const modulo = getModulo(params.id)
  if (!modulo) notFound()

  const [{ data: profile }, totalMembros, blocos] = await Promise.all([
    supabase.from('profiles').select('nome').eq('id', user.id).single(),
    contarMembros(),
    getConteudoModulo(params.id),
  ])

  const nomeUsuario = profile?.nome ?? user.email ?? ''

  return (
    <AuthLayout titulo={modulo.titulo} nomeUsuario={nomeUsuario} totalMembros={totalMembros}>
      <EditorConteudoModulo moduloId={modulo.id} moduloTitulo={modulo.titulo} blocosIniciais={blocos} />
    </AuthLayout>
  )
}
