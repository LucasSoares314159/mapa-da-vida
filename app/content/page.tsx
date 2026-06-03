import { redirect } from 'next/navigation'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { AuthLayout } from '@/components/AuthLayout'
import { BookOpen, ExternalLink } from 'lucide-react'

export default async function ContentPage() {
  const supabase = createServerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/auth/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('nome')
    .eq('id', user.id)
    .single()

  const nomeUsuario = profile?.nome ?? user.email ?? ''

  return (
    <AuthLayout titulo="Conteúdo" nomeUsuario={nomeUsuario}>
      <div className="mx-auto w-full max-w-2xl px-6 py-8">
        <div
          className="flex flex-col gap-6 rounded-xl p-8"
          style={{ backgroundColor: '#ffffff', border: '0.5px solid #c8d8d2' }}
        >
          {/* Tag */}
          <div className="flex items-center gap-2">
            <BookOpen className="size-4" style={{ color: '#57AA8F' }} />
            <span
              className="text-xs font-semibold uppercase tracking-widest"
              style={{ color: '#57AA8F' }}
            >
              Turma Fundadores
            </span>
          </div>

          {/* Título e descrição */}
          <div className="flex flex-col gap-3">
            <h1 className="text-xl font-semibold leading-snug" style={{ color: '#1a2e29' }}>
              Conteúdo da Trilha da Produtividade
            </h1>
            <p className="text-sm leading-relaxed" style={{ color: '#4a6b62' }}>
              Aqui você encontra os módulos, materiais e recursos do programa. O conteúdo fica
              hospedado no Notion — clique no botão abaixo para acessar.
            </p>
          </div>

          {/* Instrução de acesso */}
          <div
            className="rounded-lg px-4 py-3 text-sm leading-relaxed"
            style={{ backgroundColor: '#f0f7f5', color: '#4a6b62' }}
          >
            <strong style={{ color: '#2A3F45' }}>Como acessar:</strong> abra o link abaixo e entre
            com o email que foi convidado para o workspace do Notion. Se ainda não tiver acesso,
            entre em contato com o suporte.
          </div>

          {/* Botão */}
          <a
            href="https://www.notion.so/Trilha-da-Produtividade-Turma-Fundadores-373553ba5fd78047a61be01c17458074"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 rounded-lg px-5 py-3 text-sm font-medium text-white transition-opacity hover:opacity-90"
            style={{ backgroundColor: '#57AA8F' }}
          >
            Acessar conteúdo
            <ExternalLink className="size-4" />
          </a>
        </div>
      </div>
    </AuthLayout>
  )
}
