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
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 px-4">
      <Card className="w-full max-w-sm">
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
                <p className="text-xs text-destructive">{state.errors.email[0]}</p>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="senha">Senha</Label>
                <Link
                  href="/auth/esqueci-senha"
                  className="text-xs text-muted-foreground underline underline-offset-4 hover:text-foreground"
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
                <p className="text-xs text-destructive">{state.errors.senha[0]}</p>
              )}
            </div>
          </CardContent>

          <CardFooter className="flex flex-col gap-3">
            <SubmitButton className="w-full" pendingLabel="Entrando…">Entrar</SubmitButton>
            <p className="text-sm text-muted-foreground text-center">
              Não tem uma conta?{' '}
              <Link href="/auth/cadastro" className="text-foreground underline underline-offset-4 hover:text-primary">
                Cadastre-se
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
