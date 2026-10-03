import Link from 'next/link'
import { buscarConviteCompra } from '@/lib/acesso-compra'
import { CadastroConviteForm } from '@/components/CadastroConviteForm'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'

type Props = {
  searchParams: { token?: string }
}
export default async function CadastroPage({ searchParams }: Props) {
  const token = searchParams.token ?? ''
  let convite = null

  try {
    convite = await buscarConviteCompra(token)
  } catch (error) {
    console.error('[cadastro] Falha ao consultar convite:', error)
  }

  if (!convite) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-zinc-50 px-4">
        <Card className="w-full max-w-sm">
          <CardHeader>
            <CardTitle>Link indisponível</CardTitle>
            <CardDescription>Este link é inválido, expirou ou já foi utilizado.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm leading-6 text-muted-foreground">
              Peça ao suporte o reenvio do acesso usando o mesmo e-mail informado na compra.
            </p>
          </CardContent>
          <CardFooter>
            <Button asChild variant="outline" className="w-full">
              <Link href="/auth/login">Ir para o login</Link>
            </Button>
          </CardFooter>
        </Card>
      </main>
    )
  }

  return <CadastroConviteForm token={token} email={convite.email} />
}
