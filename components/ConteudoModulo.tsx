'use client'

import { useState } from 'react'
import { Check } from 'lucide-react'
import type { Bloco } from '@/lib/conteudo-modulos'
import { renderizarTextoFormatado } from '@/lib/texto-formatado'

const CORES_DESTAQUE: Record<string, { bg: string; texto: string }> = {
  verde: { bg: '#E8F1EC', texto: '#1a2e29' },
  amarelo: { bg: '#FBF1DA', texto: '#1a2e29' },
  vermelho: { bg: '#F6E0E0', texto: '#1a2e29' },
  cinza: { bg: '#f0f7f5', texto: '#1a2e29' },
}

type Props = {
  blocos: Bloco[]
}

// Renderiza o conteúdo escrito de um módulo com a experiência de leitura de
// uma newsletter: coluna estreita, tipografia grande, espaçamento generoso —
// sem nada competindo com o texto.
export function ConteudoModulo({ blocos }: Props) {
  if (blocos.length === 0) return null

  return (
    <div className="mx-auto flex w-full max-w-[640px] flex-col gap-6">
      {blocos.map((bloco, i) => (
        <BlocoRenderizado key={i} bloco={bloco} />
      ))}
    </div>
  )
}

const REGEX_ITEM_LISTA = /^[-*]\s+/

/**
 * Texto de bloco quebrado em parágrafos (linha em branco) e bullet points
 * (linhas "- item"), sem precisar virar blocos separados. Usado no bloco de
 * Parágrafo e no Callout, com classes de tipografia diferentes para cada um.
 */
function TextoMultiParagrafo({
  texto,
  classeTexto,
  espacamento = 'gap-4',
}: {
  texto: string
  classeTexto: string
  espacamento?: string
}) {
  return (
    <div className={`flex flex-col ${espacamento}`}>
      {texto
        .split(/\n\s*\n/)
        .map((p) => p.trim())
        .filter(Boolean)
        .map((trecho, i) => (
          <TrechoDeParagrafo key={i} texto={trecho} classeTexto={classeTexto} />
        ))}
    </div>
  )
}

// Dentro de um trecho, linhas que começam com "- " ou "* " viram bullet
// points — assim uma lista curta no meio do texto não precisa virar um bloco
// à parte.
function TrechoDeParagrafo({ texto, classeTexto }: { texto: string; classeTexto: string }) {
  const linhas = texto.split('\n').map((l) => l.trim()).filter(Boolean)
  const ehLista = linhas.length > 0 && linhas.every((l) => REGEX_ITEM_LISTA.test(l))

  if (ehLista) {
    return (
      <ul className="flex flex-col gap-2 pl-5" style={{ listStyleType: 'disc' }}>
        {linhas.map((linha, i) => (
          <li key={i} className={classeTexto} style={{ color: '#1a2e29' }}>
            {renderizarTextoFormatado(linha.replace(REGEX_ITEM_LISTA, ''))}
          </li>
        ))}
      </ul>
    )
  }

  return (
    <p className={classeTexto} style={{ color: '#1a2e29' }}>
      {renderizarTextoFormatado(texto)}
    </p>
  )
}

// Estado só local (não persiste): o checklist da leitura é um apoio visual
// para a pessoa acompanhar a própria leitura, não substitui o botão "Marcar
// aula como concluída" — que é o progresso de verdade, salvo no banco.
function Checklist({ itens }: { itens: string[] }) {
  const [marcados, setMarcados] = useState<Set<number>>(new Set())

  function alternar(i: number) {
    setMarcados((atual) => {
      const novo = new Set(atual)
      if (novo.has(i)) novo.delete(i)
      else novo.add(i)
      return novo
    })
  }

  return (
    <ul className="flex flex-col gap-2.5">
      {itens.map((item, i) => {
        const marcado = marcados.has(i)
        return (
          <li key={i}>
            <button
              onClick={() => alternar(i)}
              className="flex w-full items-start gap-2.5 text-left"
            >
              <span
                className="mt-1 flex size-4 shrink-0 items-center justify-center rounded-[4px] transition-colors"
                style={
                  marcado
                    ? { backgroundColor: '#57AA8F', border: 'none' }
                    : { border: '1.5px solid #c8d8d2' }
                }
              >
                {marcado && <Check className="size-2.5 text-white" strokeWidth={3} />}
              </span>
              <span
                className="text-[16px] leading-[1.6]"
                style={{
                  color: marcado ? '#4a6b62' : '#1a2e29',
                  textDecoration: marcado ? 'line-through' : 'none',
                }}
              >
                {item}
              </span>
            </button>
          </li>
        )
      })}
    </ul>
  )
}

function BlocoRenderizado({ bloco }: { bloco: Bloco }) {
  switch (bloco.tipo) {
    case 'paragrafo':
      return (
        <TextoMultiParagrafo
          texto={bloco.texto}
          classeTexto="font-editorial text-[18px] leading-[1.7]"
        />
      )

    case 'titulo': {
      const Tag = bloco.nivel === 2 ? 'h2' : 'h3'
      return (
        <Tag
          className={
            bloco.nivel === 2
              ? 'font-heading text-2xl font-bold'
              : 'font-heading text-xl font-bold'
          }
          style={{ color: '#1a2e29' }}
        >
          {bloco.texto}
        </Tag>
      )
    }

    case 'lista':
      return (
        <ul className="flex flex-col gap-2 pl-5" style={{ listStyleType: 'disc' }}>
          {bloco.itens.map((item, i) => (
            <li key={i} className="font-editorial text-[18px] leading-[1.7]" style={{ color: '#1a2e29' }}>
              {renderizarTextoFormatado(item)}
            </li>
          ))}
        </ul>
      )

    case 'checklist':
      return <Checklist itens={bloco.itens} />

    case 'callout':
      return (
        <div
          className="flex items-start gap-3 rounded-xl px-5 py-4"
          style={{ backgroundColor: '#f0f7f5', border: '0.5px solid #c8d8d2' }}
        >
          <span className="text-lg leading-none">{bloco.icone}</span>
          <div className="flex-1">
            <TextoMultiParagrafo
              texto={bloco.texto}
              classeTexto="text-[16px] leading-[1.6]"
              espacamento="gap-2.5"
            />
          </div>
        </div>
      )

    case 'destaque': {
      const cores = CORES_DESTAQUE[bloco.cor] ?? CORES_DESTAQUE.cinza
      return (
        <p
          className="rounded-lg px-4 py-3 text-[17px] font-semibold leading-[1.6]"
          style={{ backgroundColor: cores.bg, color: cores.texto }}
        >
          {renderizarTextoFormatado(bloco.texto)}
        </p>
      )
    }

    case 'imagem':
      return (
        <figure className="flex flex-col gap-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={bloco.url} alt={bloco.legenda ?? ''} className="w-full rounded-xl" />
          {bloco.legenda && (
            <figcaption className="text-center text-sm italic" style={{ color: '#4a6b62' }}>
              {bloco.legenda}
            </figcaption>
          )}
        </figure>
      )

    case 'divisor':
      return <hr style={{ border: 'none', borderTop: '0.5px solid #c8d8d2' }} />

    case 'citacao':
      return (
        <blockquote
          className="flex flex-col gap-1 pl-4"
          style={{ borderLeft: '3px solid #c8d8d2' }}
        >
          <span className="text-[16px] italic leading-[1.6]" style={{ color: '#4a6b62' }}>
            {renderizarTextoFormatado(bloco.texto)}
          </span>
          {bloco.fonte && (
            <cite className="text-sm not-italic" style={{ color: '#4a6b62' }}>
              {bloco.fonte}
            </cite>
          )}
        </blockquote>
      )
  }
}
