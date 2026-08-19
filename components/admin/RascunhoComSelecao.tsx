'use client'

import { Heading, MessageSquareQuote, Quote, Highlighter, Pilcrow } from 'lucide-react'
import { blocoComTexto, type Bloco } from '@/lib/conteudo-modulos'
import { TextareaComFormatacao } from './TextareaComFormatacao'

// Sem "Lista" aqui: bullet points são marcação inline dentro do próprio
// parágrafo (botão de lista do TextareaComFormatacao), não um bloco à parte —
// evita criar uma seção nova só por causa de alguns itens no meio do texto.
const OPCOES: { tipo: Bloco['tipo']; label: string; Icone: typeof Heading }[] = [
  { tipo: 'paragrafo', label: 'Parágrafo', Icone: Pilcrow },
  { tipo: 'titulo', label: 'Título', Icone: Heading },
  { tipo: 'callout', label: 'Callout', Icone: MessageSquareQuote },
  { tipo: 'destaque', label: 'Destaque', Icone: Highlighter },
  { tipo: 'citacao', label: 'Citação', Icone: Quote },
]

type Props = {
  texto: string
  onChangeTexto: (texto: string) => void
  onExtrairBloco: (bloco: Bloco) => void
}

// Espaço único de rascunho: cola-se o texto corrido inteiro aqui, e cada
// trecho selecionado vira um bloco especial (ou ganha negrito/itálico/
// sublinhado) por meio da barra flutuante — sem sair do textarea para
// "adicionar bloco" do zero.
export function RascunhoComSelecao({ texto, onChangeTexto, onExtrairBloco }: Props) {
  return (
    <div className="flex flex-col gap-2">
      <p className="text-xs" style={{ color: '#4a6b62' }}>
        Cole o texto aqui. Selecione um trecho para aplicar negrito, itálico, sublinhado,
        bullet points, ou transformá-lo em título, callout, destaque ou citação — o resto
        vira parágrafo normal ao salvar.
      </p>

      <TextareaComFormatacao
        value={texto}
        onChange={onChangeTexto}
        placeholder="Cole aqui o texto completo da aula…"
        rows={16}
        className="w-full resize-y rounded-xl px-4 py-3 text-[15px] leading-[1.7] outline-none focus:ring-1"
        style={{ border: '1px solid #c8d8d2', color: '#1a2e29' }}
        acoesExtra={(trecho, removerSelecao) => (
          <>
            {OPCOES.map(({ tipo, label, Icone }) => (
              <button
                key={tipo}
                onClick={() => {
                  onExtrairBloco(blocoComTexto(tipo, trecho))
                  removerSelecao()
                }}
                className="flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium text-white transition-opacity hover:opacity-70"
                title={label}
              >
                <Icone className="size-3.5" />
                {label}
              </button>
            ))}
          </>
        )}
      />
    </div>
  )
}
