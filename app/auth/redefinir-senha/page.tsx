'use client'

import { useFormState } from 'react-dom'
import { redefinirSenha } from '@/app/actions/auth'
import { SubmitButton } from '@/components/ui/submit-button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'

export default function RedefinirSenhaPage() {
  const [state, action] = useFormState(redefinirSenha, undefined)

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 px-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Redefinir senha</CardTitle>
          <CardDescription>Escolha uma nova senha para sua conta.</CardDescription>
        </CardHeader>

        <form action={action}>
          <CardContent className="flex flex-col gap-4">
            {state?.message && (
              <Alert variant="destructive">
                <AlertDescription>{state.message}</AlertDescription>
              </Alert>
            )}
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="senha">Nova senha</Label>
              <Input id="senha" name="senha" type="password" placeholder="••••••••" autoComplete="new-password" required />
              {state?.errors?.senha && <p className="text-xs text-destructive">{state.errors.senha[0]}</p>}
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="confirmarSenha">Confirmar nova senha</Label>
              <Input id="confirmarSenha" name="confirmarSenha" type="password" placeholder="••••••••" autoComplete="new-password" required />
              {state?.errors?.confirmarSenha && <p className="text-xs text-destructive">{state.errors.confirmarSenha[0]}</p>}
            </div>
          </CardContent>

          <CardFooter>
            <SubmitButton className="w-full" pendingLabel="Salvando…">Salvar nova senha</SubmitButton>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
