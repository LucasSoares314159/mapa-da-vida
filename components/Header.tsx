'use client'

import Link from 'next/link'
import { Mail, Menu, MessageCircle, Youtube } from 'lucide-react'

type Props = {
  titulo: string
  nomeUsuario: string
  onMenuClick?: () => void
}

export function Header({ titulo, nomeUsuario, onMenuClick }: Props) {
  const inicial = nomeUsuario.trim().charAt(0).toUpperCase()

  return (
    <header
      className="flex h-14 shrink-0 items-center justify-between border-b-linha border-mt-border bg-white px-5"
    >
      <div className="flex items-center gap-3">
        {/* Botão hamburguer — visível apenas em mobile */}
        {onMenuClick && (
          <button
            onClick={onMenuClick}
            className="flex size-11 items-center justify-center rounded-full text-mt-green-dark transition-colors hover:bg-mt-off-white lg:hidden"
            aria-label="Abrir menu"
          >
            <Menu className="size-5" />
          </button>
        )}
        <h1 className="font-heading text-[17px] font-medium text-mt-green-dark">{titulo}</h1>
      </div>

      <div className="flex items-center gap-2">
        {/* Ordem crescente de destaque, da esquerda para a direita: o grupo é
            a ação de comunidade (entra uma vez e fica), então vem sólido e por
            último, encostado no avatar. Canal e newsletter são visita
            recorrente e dividem o mesmo peso de contorno. Em telas estreitas
            sobram só os ícones, para não disputar espaço com o título. */}
        <Link
          href="https://www.youtube.com/@mindtrail_co"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex min-h-8 items-center gap-1.5 rounded-full border border-mt-border px-2.5 py-1.5 text-xs font-medium text-mt-apoio transition-colors hover:border-[#FF0000] hover:text-[#FF0000] sm:px-3"
          aria-label="Abrir o canal no YouTube"
        >
          <Youtube className="size-3.5 shrink-0" />
          <span className="hidden sm:inline">YouTube</span>
        </Link>

        <Link
          href="https://themindtrail.substack.com/subscribe?utm_source=mapa-da-vida&utm_medium=header&utm_campaign=header-fixo"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex min-h-8 items-center gap-1.5 rounded-full border border-mt-border px-2.5 py-1.5 text-xs font-medium text-mt-apoio transition-colors hover:border-mt-green hover:text-mt-green-dark sm:px-3"
          aria-label="Assinar a newsletter"
        >
          <Mail className="size-3.5 shrink-0" />
          <span className="hidden sm:inline">Newsletter</span>
        </Link>

        <Link
          href="https://chat.whatsapp.com/BmXD97eGDEYEgRMXI0fN7R"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex min-h-8 items-center gap-1.5 rounded-full bg-[#25D366] px-2.5 py-1.5 text-xs font-medium text-white transition-opacity hover:opacity-90 sm:px-3"
          aria-label="Entrar no grupo do WhatsApp"
        >
          <MessageCircle className="size-3.5 shrink-0" />
          <span className="hidden sm:inline">Grupo do WhatsApp</span>
        </Link>

        <div
          className="flex size-8 items-center justify-center rounded-full bg-mt-green-sup font-heading text-sm font-bold text-mt-green-dark"
        >
          {inicial}
        </div>
      </div>
    </header>
  )
}
