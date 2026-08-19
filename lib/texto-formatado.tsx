import type { ReactNode } from 'react'

// Marcação inline tipo Markdown, usada dentro do texto de qualquer bloco:
// **negrito**, _itálico_, __sublinhado__, [texto](url). Interpretada só na
// leitura — o editor mostra os símbolos como texto puro, de propósito (ver
// components/admin/TextareaComFormatacao.tsx).
const REGEX_FORMATACAO = /(\*\*.+?\*\*|__.+?__|_.+?_|\[.+?\]\(.+?\))/g
const REGEX_LINK = /^\[(.+)\]\((.+)\)$/

export function renderizarTextoFormatado(texto: string): ReactNode[] {
  return texto.split(REGEX_FORMATACAO).map((trecho, i) => {
    if (trecho.startsWith('**') && trecho.endsWith('**')) {
      return <strong key={i}>{trecho.slice(2, -2)}</strong>
    }
    if (trecho.startsWith('__') && trecho.endsWith('__')) {
      return <u key={i}>{trecho.slice(2, -2)}</u>
    }
    if (trecho.startsWith('_') && trecho.endsWith('_')) {
      return <em key={i}>{trecho.slice(1, -1)}</em>
    }
    const link = trecho.match(REGEX_LINK)
    if (link) {
      return (
        <a
          key={i}
          href={link[2]}
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: '#57AA8F', textDecoration: 'underline' }}
        >
          {link[1]}
        </a>
      )
    }
    return trecho
  })
}
