'use client'

import { useFormState } from 'react-dom'
import Link from 'next/link'
import { esqueciSenha } from '@/app/actions/auth'
import { SubmitButton } from '@/components/ui/submit-button'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'

export default function EsqueciSenhaPage() {
  const [state, action] = useFormState(esqueciSenha, undefined)

  if (state?.message === 'ok') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 px-4">
        <Card className="w-full max-w-sm text-center">
          <CardHeader>
            <CardTitle>Email enviado</CardTitle>
            <CardDescription>
              Se esse email estiver cadastrado, você receberá um link para redefinir sua senha.
            </CardDescription>
          </CardHeader>
          <CardFooter className="justify-center">
            <Button variant="outline" asChild>
              <Link href="/auth/login">Voltar para o login</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 px-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Esqueci minha senha</CardTitle>
          <CardDescription>Informe seu email e enviaremos um link para redefinir sua senha.</CardDescription>
        </CardHeader>

        <form action={action}>
          <CardContent className="flex flex-col gap-4">
            {state?.message && state.message !== 'ok' && (
              <Alert variant="destructive">
                <AlertDescription>{state.message}</AlertDescription>
              </Alert>
            )}
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" placeholder="seu@email.com" autoComplete="email" required />
              {state?.errors?.email && <p className="text-xs text-destructive">{state.errors.email[0]}</p>}
            </div>
          </CardContent>

          <CardFooter className="flex flex-col gap-3">
            <SubmitButton className="w-full" pendingLabel="Enviando…">Enviar link</SubmitButton>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/auth/login">Voltar para o login</Link>
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
