import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Eye, FileText } from 'lucide-react'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { logout } from '@/app/actions/auth'
import { Button } from '@/components/ui/button'
import type { Mapa } from '@/types'

export default async function DashboardPage() {
  const supabase = createServerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/auth/login')

  const [{ data: profile }, { data: mapasRaw }] = await Promise.all([
    supabase.from('profiles').select('nome').eq('id', user.id).single(),
    supabase
      .from('mapas')
      .select('*, areas(*)')
      .eq('user_id', user.id)
      .order('criado_em', { ascending: false }),
  ])

  const mapas = (mapasRaw ?? []) as Mapa[]

  return (
    <div className="flex min-h-screen flex-col bg-zinc-50">
      <header className="flex items-center justify-between border-b bg-white px-6 py-4">
        <h1 className="text-lg font-semibold">Mapa da Vida</h1>
        <div className="flex items-center gap-4">
          <span className="text-sm text-muted-foreground">{profile?.nome ?? user.email}</span>
          <form action={logout}>
            <Button variant="outline" size="sm" type="submit">
              Sair
            </Button>
          </form>
        </div>
      </header>

      <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-8">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-lg font-medium">Seus mapas</h2>
          <Button asChild>
            <Link href="/mapa/preparacao">+ Novo mapa</Link>
          </Button>
        </div>

        {mapas.length === 0 ? (
          <div className="flex flex-col items-center gap-4 rounded-xl border border-dashed bg-white py-16 text-center">
            <p className="text-muted-foreground">Você ainda não tem nenhum mapa.</p>
            <Button asChild>
              <Link href="/mapa/preparacao">Criar meu primeiro mapa</Link>
            </Button>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {mapas.map((mapa) => {
              const totais = { verde: 0, amarelo: 0, vermelho: 0 }
              for (const area of mapa.areas ?? []) totais[area.status]++
              const data = new Date(mapa.criado_em).toLocaleDateString('pt-BR')

              return (
                <div key={mapa.id} className="rounded-xl border bg-white px-5 py-4 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{mapa.titulo || 'Mapa da Vida'}</p>
                      <p className="text-xs text-muted-foreground">{data}</p>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <span title="Bem">🟢 {totais.verde}</span>
                      <span title="Atenção">🟡 {totais.amarelo}</span>
                      <span title="Urgente">🔴 {totais.vermelho}</span>
                    </div>
                  </div>
                  <div className="mt-3 flex gap-4 border-t pt-3">
                    <Link
                      href={`/mapa/${mapa.id}`}
                      className="flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      <Eye className="size-4" />
                      Ver Mapa
                    </Link>
                    <Link
                      href={`/diagnostico/${mapa.id}`}
                      className="flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      <FileText className="size-4" />
                      Ver Diagnóstico Completo
                    </Link>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}
