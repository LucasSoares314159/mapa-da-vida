'use client'

import { useFormState } from 'react-dom'
import Link from 'next/link'
import { cadastro } from '@/app/actions/auth'
import { SubmitButton } from '@/components/ui/submit-button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'

export default function CadastroPage() {
  const [state, action] = useFormState(cadastro, undefined)

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 px-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Criar conta</CardTitle>
          <CardDescription>Comece a mapear sua vida</CardDescription>
        </CardHeader>

        <form action={action}>
          <CardContent className="flex flex-col gap-4">
            {state?.message && (
              <Alert variant="destructive">
                <AlertDescription>{state.message}</AlertDescription>
              </Alert>
            )}

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="nome">Nome</Label>
              <Input id="nome" name="nome" type="text" placeholder="Seu nome" autoComplete="name" required />
              {state?.errors?.nome && <p className="text-xs text-destructive">{state.errors.nome[0]}</p>}
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" placeholder="seu@email.com" autoComplete="email" required />
              {state?.errors?.email && <p className="text-xs text-destructive">{state.errors.email[0]}</p>}
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="senha">Senha</Label>
              <Input id="senha" name="senha" type="password" placeholder="••••••••" autoComplete="new-password" required />
              {state?.errors?.senha && <p className="text-xs text-destructive">{state.errors.senha[0]}</p>}
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="confirmarSenha">Confirmar senha</Label>
              <Input id="confirmarSenha" name="confirmarSenha" type="password" placeholder="••••••••" autoComplete="new-password" required />
              {state?.errors?.confirmarSenha && <p className="text-xs text-destructive">{state.errors.confirmarSenha[0]}</p>}
            </div>
          </CardContent>

          <CardFooter className="flex flex-col gap-3">
            <SubmitButton className="w-full" pendingLabel="Criando conta…">Criar conta</SubmitButton>
            <p className="text-sm text-muted-foreground text-center">
              Já tem uma conta?{' '}
              <Link href="/auth/login" className="text-foreground underline underline-offset-4 hover:text-primary">
                Entrar
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
