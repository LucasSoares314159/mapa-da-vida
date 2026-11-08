'use client'

import { useFormState } from 'react-dom'
import Link from 'next/link'
import { login } from '@/app/actions/auth'
import { SubmitButton } from '@/components/ui/submit-button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'

export default function LoginPage() {
  const [state, action] = useFormState(login, undefined)

  return (
    <div className="flex min-h-screen items-center justify-center bg-mt-off-white px-4">
      <Card className="w-full max-w-[400px] rounded-painel shadow-mt-3">
        <CardHeader>
          <CardTitle>Entrar</CardTitle>
          <CardDescription>Acesse seu Mapa da Vida</CardDescription>
        </CardHeader>

        <form action={action}>
          <CardContent className="flex flex-col gap-4">
            {state?.message && (
              <Alert variant="destructive">
                <AlertDescription>{state.message}</AlertDescription>
              </Alert>
            )}

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="seu@email.com"
                autoComplete="email"
                required
              />
              {state?.errors?.email && (
                <p className="text-[13px] text-mt-red">{state.errors.email[0]}</p>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="senha">Senha</Label>
                <Link
                  href="/auth/esqueci-senha"
                  className="text-[13px] text-mt-apoio underline decoration-mt-green underline-offset-4 hover:text-mt-green-dark"
                >
                  Esqueci minha senha
                </Link>
              </div>
              <Input
                id="senha"
                name="senha"
                type="password"
                placeholder="••••••••"
                autoComplete="current-password"
                required
              />
              {state?.errors?.senha && (
                <p className="text-[13px] text-mt-red">{state.errors.senha[0]}</p>
              )}
            </div>
          </CardContent>

          <CardFooter className="flex flex-col gap-3">
            <SubmitButton className="w-full" pendingLabel="Entrando…">Entrar</SubmitButton>
            <p className="text-sm text-muted-foreground text-center">
              Comprou a Trilha? Use o link de acesso enviado por e-mail.
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
