import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { createAdminSupabaseClient } from '@/lib/supabase-admin'
import { contarMembros } from '@/lib/membros'
import { AuthLayout } from '@/components/AuthLayout'
import { MODULOS } from '@/lib/modulos'

export const dynamic = 'force-dynamic'

export default async function AdminModulosPage() {
  const supabase = createServerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/auth/login')

  const [{ data: profile }, totalMembros, { data: conteudos }] = await Promise.all([
    supabase.from('profiles').select('nome').eq('id', user.id).single(),
    contarMembros(),
    createAdminSupabaseClient().from('modulos_conteudo').select('modulo_id, blocos'),
  ])

  const nomeUsuario = profile?.nome ?? user.email ?? ''
  const temConteudo = new Set(
    (conteudos ?? [])
      .filter((c) => Array.isArray(c.blocos) && c.blocos.length > 0)
      .map((c) => c.modulo_id)
  )

  return (
    <AuthLayout titulo="Conteúdo dos módulos" nomeUsuario={nomeUsuario} totalMembros={totalMembros}>
      <div className="mx-auto flex w-full max-w-2xl flex-col gap-6 px-6 py-8">
        <div>
          <h1 className="font-heading text-2xl font-bold" style={{ color: '#1a2e29' }}>
            Conteúdo dos módulos
          </h1>
          <p className="text-sm" style={{ color: '#4a6b62' }}>
            Escolha um módulo para editar o texto que os alunos leem.
          </p>
        </div>

        <div
          className="w-full rounded-xl overflow-hidden"
          style={{ border: '0.5px solid #c8d8d2', backgroundColor: '#ffffff' }}
        >
          {MODULOS.map((modulo, index) => (
            <Link
              key={modulo.id}
              href={`/admin/modulos/${modulo.id}`}
              className="flex items-center justify-between px-5 py-3.5 transition-opacity hover:opacity-70"
              style={{
                borderBottom: index < MODULOS.length - 1 ? '0.5px solid #c8d8d2' : 'none',
              }}
            >
              <span className="text-sm font-medium" style={{ color: '#1a2e29' }}>
                {modulo.titulo}
              </span>
              <span
                className="text-xs"
                style={{ color: temConteudo.has(modulo.id) ? '#57AA8F' : '#D4A843' }}
              >
                {temConteudo.has(modulo.id) ? 'Com conteúdo' : 'Vazio'}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </AuthLayout>
  )
}
