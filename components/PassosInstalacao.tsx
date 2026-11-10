'use client'

import { EllipsisVertical, Share, SquarePlus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog'

// Passo a passo para instalar o app quando o navegador não oferece o próprio
// diálogo: sempre no Safari do iPhone, e no Chrome do Android quando ele ainda não
// disparou o pedido de instalação (não é garantido na primeira visita).

type Props = {
  aberto: boolean
  onFechar: () => void
  plataforma: 'ios' | 'android'
}

function Passo({ n, children }: { n: number; children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-3">
      <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-mt-green-sup text-sm font-bold text-mt-green-dark">
        {n}
      </span>
      <span>{children}</span>
    </li>
  )
}

export function PassosInstalacao({ aberto, onFechar, plataforma }: Props) {
  const ios = plataforma === 'ios'
  return (
    <Dialog open={aberto} onOpenChange={(v) => !v && onFechar()}>
      <DialogContent>
        <div className="flex flex-col gap-5 p-card-lg">
          <DialogTitle className="pr-8 text-subtitulo text-mt-green-dark">
            Instalar no <span className="normal-case">{ios ? 'iPhone' : 'Android'}</span>
          </DialogTitle>
          <DialogDescription className="sr-only">Passo a passo para adicionar a Trilha à tela de início</DialogDescription>
          <ol className="flex flex-col gap-4 text-base text-mt-black">
            {ios ? (
              <>
                <Passo n={1}>
                  No Safari, toque em <strong>Compartilhar</strong>{' '}
                  <Share className="inline size-4 align-text-bottom text-mt-green-dark" aria-hidden /> na barra de baixo.
                </Passo>
                <Passo n={2}>
                  Role e toque em <strong>Adicionar à Tela de Início</strong>{' '}
                  <SquarePlus className="inline size-4 align-text-bottom text-mt-green-dark" aria-hidden />.
                </Passo>
              </>
            ) : (
              <>
                <Passo n={1}>
                  No Chrome, toque no menu{' '}
                  <EllipsisVertical className="inline size-4 align-text-bottom text-mt-green-dark" aria-hidden /> no canto de
                  cima.
                </Passo>
                <Passo n={2}>
                  Toque em <strong>Instalar app</strong> (em alguns celulares, <strong>Adicionar à tela inicial</strong>).
                </Passo>
              </>
            )}
            <Passo n={3}>
              Confirme. A Trilha aparece com os seus apps e abre direto nos hábitos.
            </Passo>
          </ol>
          <Button onClick={onFechar}>Entendi</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
