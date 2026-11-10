'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useFormStatus } from 'react-dom'
import { Clock, Compass, LogOut, Plus, Users, Volume2, VolumeX } from 'lucide-react'
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog'
import { logout } from '@/app/actions/auth'
import { gravarSomLigado, lerSomLigado } from '@/hooks/useCelebracao'
import { cn } from '@/lib/utils'

// Menu "Mais" do celular, aberto pelo ≡ e pelo avatar do Header. Guarda o que não coube
// nas 5 abas do menu inferior: Momento de Vida, Rotina, novo mapa, som e sair.
// No computador tudo isso já está na Sidebar, e o avatar não abre nada.

type Props = {
  aberto: boolean
  onFechar: () => void
  nomeUsuario: string
  totalMembros?: number | null
}

function BotaoSair() {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      disabled={pending}
      className="flex min-h-12 w-full items-center gap-3 rounded-elemento px-3 text-base text-mt-apoio transition-colors hover:bg-mt-off-white disabled:opacity-60"
    >
      <LogOut className="size-5 shrink-0" aria-hidden />
      {pending ? 'Saindo…' : 'Sair'}
    </button>
  )
}

const ITEM =
  'flex min-h-12 w-full items-center gap-3 rounded-elemento px-3 text-base font-medium text-mt-green-dark transition-colors hover:bg-mt-green-sup focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-mt-green-dark'

export function MenuConta({ aberto, onFechar, nomeUsuario, totalMembros }: Props) {
  const [som, setSom] = useState(true)

  useEffect(() => {
    if (aberto) setSom(lerSomLigado())
  }, [aberto])

  function alternarSom() {
    const novo = !som
    setSom(novo)
    gravarSomLigado(novo)
  }

  return (
    <Dialog open={aberto} onOpenChange={(v) => !v && onFechar()}>
      {/* No celular vira folha presa ao rodapé; o Dialog padrão é centralizado. */}
      <DialogContent className="bottom-0 top-auto w-full max-w-none translate-y-0 rounded-b-none pb-[env(safe-area-inset-bottom)] data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom sm:bottom-auto sm:top-1/2 sm:w-[calc(100%-2.5rem)] sm:max-w-[420px] sm:-translate-y-1/2 sm:rounded-painel">
        <div className="flex flex-col gap-1 p-card">
          <DialogTitle className="mb-1 pr-10 text-subtitulo text-mt-green-dark">
            Olá, <span className="normal-case">{nomeUsuario.split(' ')[0]}</span>
          </DialogTitle>
          <DialogDescription className="sr-only">Mais opções da plataforma</DialogDescription>

          <Link href="/momento" onClick={onFechar} className={ITEM}>
            <Compass className="size-5 shrink-0" aria-hidden />
            Momento de Vida
          </Link>
          <Link href="/rotina" onClick={onFechar} className={ITEM}>
            <Clock className="size-5 shrink-0" aria-hidden />
            Minha Rotina
          </Link>
          <Link href="/mapa/preparacao" onClick={onFechar} className={ITEM}>
            <Plus className="size-5 shrink-0" aria-hidden />
            Novo mapa
          </Link>

          <button
            type="button"
            role="switch"
            aria-checked={som}
            onClick={alternarSom}
            className={cn(ITEM, 'justify-between')}
          >
            <span className="flex items-center gap-3">
              {som ? <Volume2 className="size-5 shrink-0" aria-hidden /> : <VolumeX className="size-5 shrink-0" aria-hidden />}
              Som ao marcar hábitos
            </span>
            <span
              aria-hidden
              className={cn(
                'relative h-6 w-10 shrink-0 rounded-full transition-colors',
                som ? 'bg-mt-green' : 'bg-mt-border'
              )}
            >
              <span
                className={cn(
                  'absolute left-0 top-0.5 size-5 rounded-full bg-white shadow-mt-1 transition-transform',
                  som ? 'translate-x-[18px]' : 'translate-x-0.5'
                )}
              />
            </span>
          </button>

          <div className="my-2 border-t-linha border-mt-border" />

          {typeof totalMembros === 'number' && (
            <div className="flex items-center gap-3 px-3 py-2 text-sm text-mt-apoio">
              <Users className="size-4 shrink-0" aria-hidden />
              {totalMembros.toLocaleString('pt-BR')} {totalMembros === 1 ? 'membro' : 'membros'}
            </div>
          )}
          <form action={logout}>
            <BotaoSair />
          </form>
        </div>
      </DialogContent>
    </Dialog>
  )
}
