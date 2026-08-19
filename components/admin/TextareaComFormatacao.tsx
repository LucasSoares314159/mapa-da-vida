'use client'

import { useEffect, useRef, useState } from 'react'
import { Bold, Italic, Underline, List, Link } from 'lucide-react'

const FORMATOS = [
  { marcador: '**', label: 'Negrito', Icone: Bold },
  { marcador: '_', label: 'Itálico', Icone: Italic },
  { marcador: '__', label: 'Sublinhado', Icone: Underline },
]

type Selecao = { inicio: number; fim: number; x: number; y: number }

type Props = {
  value: string
  onChange: (texto: string) => void
  placeholder?: string
  rows?: number
  className?: string
  style?: React.CSSProperties
  /**
   * Botões extra (ex: virar Título, Callout…), renderizados depois do
   * separador. Recebe o trecho selecionado e uma função para removê-lo do
   * texto (usada quando o trecho "sai" do textarea e vira outra coisa).
   */
  acoesExtra?: (trechoSelecionado: string, removerSelecao: () => void) => React.ReactNode
}

// Textarea com barra flutuante de formatação: selecionar um trecho oferece
// negrito, itálico e sublinhado (marcadores tipo Markdown), aplicados no
// próprio texto sem precisar sair do campo.
export function TextareaComFormatacao({
  value,
  onChange,
  placeholder,
  rows = 4,
  className,
  style,
  acoesExtra,
}: Props) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const barraRef = useRef<HTMLDivElement>(null)
  const [selecao, setSelecao] = useState<Selecao | null>(null)

  useEffect(() => {
    function aoClicarFora(e: MouseEvent) {
      const alvo = e.target as Node
      if (textareaRef.current?.contains(alvo)) return
      if (barraRef.current?.contains(alvo)) return
      setSelecao(null)
    }

    document.addEventListener('mousedown', aoClicarFora)
    return () => document.removeEventListener('mousedown', aoClicarFora)
  }, [])

  function detectarSelecao() {
    const el = textareaRef.current
    if (!el) return

    const inicio = el.selectionStart
    const fim = el.selectionEnd
    if (fim <= inicio) {
      setSelecao(null)
      return
    }

    const rect = el.getBoundingClientRect()
    setSelecao({ inicio, fim, x: rect.left + 12, y: Math.max(rect.top - 44, 8) })
  }

  function aoSoltarMouse() {
    requestAnimationFrame(detectarSelecao)
  }

  function aplicarFormato(marcador: string) {
    if (!selecao) return
    const trecho = value.slice(selecao.inicio, selecao.fim)
    const novoTexto =
      value.slice(0, selecao.inicio) + marcador + trecho + marcador + value.slice(selecao.fim)
    onChange(novoTexto)

    const novoInicio = selecao.inicio + marcador.length
    const novoFim = novoInicio + trecho.length
    reposicionarSelecao(novoInicio, novoFim)
  }

  // Cada linha selecionada vira um bullet point ("- linha"), sem precisar
  // virar um bloco de lista à parte.
  function aplicarLista() {
    if (!selecao) return
    const trecho = value.slice(selecao.inicio, selecao.fim)
    const comMarcadores = trecho
      .split('\n')
      .map((linha) => (linha.trim() ? `- ${linha}` : linha))
      .join('\n')
    const novoTexto =
      value.slice(0, selecao.inicio) + comMarcadores + value.slice(selecao.fim)
    onChange(novoTexto)
    reposicionarSelecao(selecao.inicio, selecao.inicio + comMarcadores.length)
  }

  // Pede a URL e envolve a seleção em [texto](url) — sintaxe Markdown padrão,
  // interpretada na leitura por lib/texto-formatado.tsx.
  function aplicarLink() {
    if (!selecao) return
    const url = window.prompt('Endereço do link:', 'https://')
    if (!url) return

    const trecho = value.slice(selecao.inicio, selecao.fim)
    const marcado = `[${trecho}](${url})`
    const novoTexto = value.slice(0, selecao.inicio) + marcado + value.slice(selecao.fim)
    onChange(novoTexto)
    reposicionarSelecao(selecao.inicio, selecao.inicio + marcado.length)
  }

  function reposicionarSelecao(inicio: number, fim: number) {
    setSelecao((s) => (s ? { ...s, inicio, fim } : s))
    requestAnimationFrame(() => {
      const el = textareaRef.current
      if (!el) return
      el.focus()
      el.setSelectionRange(inicio, fim)
    })
  }

  return (
    <div className="relative w-full">
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onSelect={detectarSelecao}
        onMouseUp={aoSoltarMouse}
        onKeyUp={aoSoltarMouse}
        placeholder={placeholder}
        rows={rows}
        className={className}
        style={style}
      />

      {selecao && (
        <div
          ref={barraRef}
          className="fixed z-50 flex items-center gap-1 rounded-lg p-1 shadow-lg"
          style={{ left: selecao.x, top: selecao.y, backgroundColor: '#1a2e29' }}
          onMouseDown={(e) => e.preventDefault()}
        >
          {FORMATOS.map(({ marcador, label, Icone }) => (
            <button
              key={label}
              onClick={() => aplicarFormato(marcador)}
              className="flex size-8 items-center justify-center rounded-md text-white transition-opacity hover:opacity-70"
              title={label}
              aria-label={label}
            >
              <Icone className="size-3.5" />
            </button>
          ))}
          <button
            onClick={aplicarLista}
            className="flex size-8 items-center justify-center rounded-md text-white transition-opacity hover:opacity-70"
            title="Lista"
            aria-label="Lista"
          >
            <List className="size-3.5" />
          </button>
          <button
            onClick={aplicarLink}
            className="flex size-8 items-center justify-center rounded-md text-white transition-opacity hover:opacity-70"
            title="Link"
            aria-label="Link"
          >
            <Link className="size-3.5" />
          </button>

          {acoesExtra && (
            <>
              <div className="mx-1 h-5 w-px" style={{ backgroundColor: 'rgba(255,255,255,0.2)' }} />
              {acoesExtra(value.slice(selecao.inicio, selecao.fim), () => {
                onChange(value.slice(0, selecao.inicio) + value.slice(selecao.fim))
                setSelecao(null)
              })}
            </>
          )}
        </div>
      )}
    </div>
  )
}
