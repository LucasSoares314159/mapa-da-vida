import Link from 'next/link'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export default function VerificarEmailPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 px-4">
      <Card className="w-full max-w-sm text-center">
        <CardHeader>
          <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-2xl">
            ✉️
          </div>
          <CardTitle>Verifique seu email</CardTitle>
          <CardDescription>
            Enviamos um link de confirmação para o seu endereço de email. Clique nele para ativar sua conta.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Não recebeu o email? Verifique a pasta de spam ou tente se cadastrar novamente.
          </p>
        </CardContent>
        <CardFooter className="justify-center">
          <Button variant="outline" asChild>
            <Link href="/auth/login">Voltar para o login</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
