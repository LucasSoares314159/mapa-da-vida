'use client'

import { useFormState } from 'react-dom'
import Link from 'next/link'
import { cadastroPorConvite } from '@/app/actions/auth'
import { SubmitButton } from '@/components/ui/submit-button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'

type Props = {
  token: string
  email: string
}
export function CadastroConviteForm({ token, email }: Props) {
  const [state, action] = useFormState(cadastroPorConvite, undefined)

  return (
    <main className="flex min-h-screen items-center justify-center bg-zinc-50 px-4 py-10">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Criar conta</CardTitle>
          <CardDescription>Complete seu cadastro para acessar a Trilha</CardDescription>
        </CardHeader>

        <form action={action}>
          <input type="hidden" name="token" value={token} />
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
              <Label htmlFor="email">E-mail da compra</Label>
              <Input id="email" type="email" value={email} readOnly aria-readonly="true" />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="telefone">Telefone</Label>
              <Input id="telefone" name="telefone" type="tel" placeholder="(00) 00000-0000" autoComplete="tel" required />
              {state?.errors?.telefone && <p className="text-xs text-destructive">{state.errors.telefone[0]}</p>}
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
            <p className="text-center text-sm text-muted-foreground">
              Já tem uma conta?{' '}
              <Link href="/auth/login" className="text-foreground underline underline-offset-4 hover:text-primary">
                Entrar
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </main>
  )
}
