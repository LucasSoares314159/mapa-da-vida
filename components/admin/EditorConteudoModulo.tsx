'use client'

import { useRef, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import {
  Plus,
  Trash2,
  ChevronUp,
  ChevronDown,
  ImagePlus,
  Loader2,
  Check,
} from 'lucide-react'
import { salvarConteudo, uploadImagemModulo } from '@/app/actions/admin-conteudo'
import {
  ALTURA_EMBED_PADRAO,
  blocoVazio,
  HOSTS_EMBED,
  normalizarUrlEmbed,
  paragrafosDe,
  type Bloco,
} from '@/lib/conteudo-modulos'
import { ConteudoModulo } from '@/components/ConteudoModulo'
import { RascunhoComSelecao } from './RascunhoComSelecao'
import { TextareaComFormatacao } from './TextareaComFormatacao'

const TIPOS: { tipo: Bloco['tipo']; label: string }[] = [
  { tipo: 'paragrafo', label: 'Parágrafo' },
  { tipo: 'titulo', label: 'Título' },
  { tipo: 'lista', label: 'Lista' },
  { tipo: 'checklist', label: 'Checklist' },
  { tipo: 'callout', label: 'Callout' },
  { tipo: 'destaque', label: 'Destaque' },
  { tipo: 'imagem', label: 'Imagem' },
  { tipo: 'embed', label: 'Quadro (Excalidraw)' },
  { tipo: 'citacao', label: 'Citação' },
  { tipo: 'divisor', label: 'Divisor' },
]

type Props = {
  moduloId: string
  moduloTitulo: string
  blocosIniciais: Bloco[]
}

export function EditorConteudoModulo({ moduloId, moduloTitulo, blocosIniciais }: Props) {
  const router = useRouter()
  const [blocos, setBlocos] = useState<Bloco[]>(blocosIniciais)
  const [rascunho, setRascunho] = useState('')
  const [mostrarPreview, setMostrarPreview] = useState(false)
  const [salvando, startSalvar] = useTransition()
  const [salvo, setSalvo] = useState(false)
  const [erro, setErro] = useState<string | null>(null)

  function adicionar(tipo: Bloco['tipo']) {
    setBlocos((atual) => [...atual, blocoVazio(tipo)])
    setSalvo(false)
  }

  function extrairBlocoDoRascunho(bloco: Bloco) {
    setBlocos((atual) => [...atual, bloco])
    setSalvo(false)
  }

  function atualizar(index: number, bloco: Bloco) {
    setBlocos((atual) => atual.map((b, i) => (i === index ? bloco : b)))
    setSalvo(false)
  }

  function remover(index: number) {
    setBlocos((atual) => atual.filter((_, i) => i !== index))
    setSalvo(false)
  }

  function mover(index: number, direcao: -1 | 1) {
    setBlocos((atual) => {
      const novo = [...atual]
      const alvo = index + direcao
      if (alvo < 0 || alvo >= novo.length) return atual
      ;[novo[index], novo[alvo]] = [novo[alvo], novo[index]]
      return novo
    })
    setSalvo(false)
  }

  function salvar() {
    setErro(null)
    const blocosFinais = [...blocos, ...paragrafosDe(rascunho)]
    startSalvar(async () => {
      const resultado = await salvarConteudo(moduloId, blocosFinais)
      if ('error' in resultado) {
        setErro(resultado.error)
        return
      }
      setBlocos(blocosFinais)
      setRascunho('')
      setSalvo(true)
      router.refresh()
    })
  }

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-6 py-8">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-titulo font-medium text-mt-green-dark">
            {moduloTitulo}
          </h1>
          <p className="text-sm text-mt-apoio">
            Edite o conteúdo escrito que os alunos leem nesta aula.
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <button
            onClick={() => setMostrarPreview((v) => !v)}
            className="rounded-lg px-4 py-2 text-sm font-medium transition-opacity hover:opacity-80 border border-mt-border text-mt-green-dark"
          >
            {mostrarPreview ? 'Editar' : 'Pré-visualizar'}
          </button>
          <button
            onClick={salvar}
            disabled={salvando}
            className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-60 bg-mt-green"
          >
            {salvando ? (
              <Loader2 className="size-4 animate-spin" />
            ) : salvo ? (
              <Check className="size-4" strokeWidth={3} />
            ) : null}
            {salvando ? 'Salvando…' : salvo ? 'Salvo' : 'Salvar'}
          </button>
        </div>
      </div>

      {erro && (
        <p className="text-sm text-mt-red">
          {erro}
        </p>
      )}

      {mostrarPreview ? (
        <div
          className="card-mt px-8 py-10"
        >
          <ConteudoModulo blocos={blocos} />
          {blocos.length === 0 && (
            <p className="text-sm text-mt-apoio">
              Nenhum bloco ainda.
            </p>
          )}
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          <div
            className="card-mt p-4"
          >
            <RascunhoComSelecao
              texto={rascunho}
              onChangeTexto={setRascunho}
              onExtrairBloco={extrairBlocoDoRascunho}
            />
          </div>

          {blocos.length > 0 && (
            <div className="flex flex-col gap-4">
              <span className="text-xs font-semibold uppercase tracking-wide text-mt-apoio">
                Blocos já formatados
              </span>
              {blocos.map((bloco, index) => (
                <BlocoEditor
                  key={index}
                  bloco={bloco}
                  onChange={(b) => atualizar(index, b)}
                  onRemover={() => remover(index)}
                  onMoverCima={() => mover(index, -1)}
                  onMoverBaixo={() => mover(index, 1)}
                  podeSubir={index > 0}
                  podeDescer={index < blocos.length - 1}
                />
              ))}
            </div>
          )}

          <div
            className="flex flex-wrap gap-2 rounded-card border border-dashed border-mt-border p-4"
          >
            <span className="w-full text-xs text-mt-apoio">
              Blocos sem texto de origem (imagem, divisor) ou para adicionar do zero:
            </span>
            {TIPOS.map(({ tipo, label }) => (
              <button
                key={tipo}
                onClick={() => adicionar(tipo)}
                className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium transition-opacity hover:opacity-70 border border-mt-border text-mt-green-dark"
              >
                <Plus className="size-3" />
                {label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function BlocoEditor({
  bloco,
  onChange,
  onRemover,
  onMoverCima,
  onMoverBaixo,
  podeSubir,
  podeDescer,
}: {
  bloco: Bloco
  onChange: (bloco: Bloco) => void
  onRemover: () => void
  onMoverCima: () => void
  onMoverBaixo: () => void
  podeSubir: boolean
  podeDescer: boolean
}) {
  const rotulo = TIPOS.find((t) => t.tipo === bloco.tipo)?.label ?? bloco.tipo

  return (
    <div
      className="card-mt flex flex-col gap-3 p-4"
    >
      <div className="flex items-center justify-between">
        <span
          className="text-xs font-semibold uppercase tracking-wide text-mt-apoio"
        >
          {rotulo}
        </span>
        <div className="flex items-center gap-1">
          <button
            onClick={onMoverCima}
            disabled={!podeSubir}
            className="flex size-7 items-center justify-center rounded-md transition-opacity disabled:opacity-30 text-mt-apoio"
            aria-label="Mover para cima"
          >
            <ChevronUp className="size-4" />
          </button>
          <button
            onClick={onMoverBaixo}
            disabled={!podeDescer}
            className="flex size-7 items-center justify-center rounded-md transition-opacity disabled:opacity-30 text-mt-apoio"
            aria-label="Mover para baixo"
          >
            <ChevronDown className="size-4" />
          </button>
          <button
            onClick={onRemover}
            className="flex size-7 items-center justify-center rounded-md transition-opacity hover:opacity-70 text-mt-red"
            aria-label="Remover bloco"
          >
            <Trash2 className="size-4" />
          </button>
        </div>
      </div>

      <CampoBloco bloco={bloco} onChange={onChange} />
    </div>
  )
}

const campoTextoClasse =
  'w-full rounded-elemento border border-mt-border bg-white px-3 py-2 text-sm text-mt-black outline-none focus:border-mt-green focus:ring-[3px] focus:ring-mt-green/25'

function CampoBloco({ bloco, onChange }: { bloco: Bloco; onChange: (b: Bloco) => void }) {
  switch (bloco.tipo) {
    case 'paragrafo':
      return (
        <TextareaComFormatacao
          value={bloco.texto}
          onChange={(texto) => onChange({ ...bloco, texto })}
          placeholder="Texto do bloco… (linha em branco separa parágrafos na leitura)"
          rows={10}
          className={campoTextoClasse}
        />
      )

    case 'titulo':
      return (
        <div className="flex gap-2">
          <select
            value={bloco.nivel}
            onChange={(e) => onChange({ ...bloco, nivel: Number(e.target.value) as 2 | 3 })}
            className="rounded-lg px-2 py-2 text-sm border border-mt-border text-mt-green-dark"
          >
            <option value={2}>H2</option>
            <option value={3}>H3</option>
          </select>
          <input
            value={bloco.texto}
            onChange={(e) => onChange({ ...bloco, texto: e.target.value })}
            placeholder="Texto do título…"
            className={campoTextoClasse}
          />
        </div>
      )

    case 'lista':
    case 'checklist':
      return (
        <ListaDeItens
          itens={bloco.itens}
          onChange={(itens) => onChange({ ...bloco, itens })}
        />
      )

    case 'callout':
      return (
        <div className="flex gap-2">
          <input
            value={bloco.icone}
            onChange={(e) => onChange({ ...bloco, icone: e.target.value })}
            placeholder="💡"
            className="w-14 rounded-lg px-2 py-2 text-center text-sm border border-mt-border text-mt-green-dark"
          />
          <TextareaComFormatacao
            value={bloco.texto}
            onChange={(texto) => onChange({ ...bloco, texto })}
            placeholder="Texto do callout…"
            rows={2}
            className={campoTextoClasse}
          />
        </div>
      )

    case 'destaque':
      return (
        <div className="flex flex-col gap-2">
          <div className="flex gap-1.5">
            {(['verde', 'amarelo', 'vermelho', 'cinza'] as const).map((cor) => (
              <button
                key={cor}
                onClick={() => onChange({ ...bloco, cor })}
                className={`rounded-full px-3 py-1 text-xs font-medium capitalize ${
                  bloco.cor === cor
                    ? 'border-[1.5px] border-mt-green text-mt-green-dark'
                    : 'border border-mt-border text-mt-apoio'
                }`}
              >
                {cor}
              </button>
            ))}
          </div>
          <TextareaComFormatacao
            value={bloco.texto}
            onChange={(texto) => onChange({ ...bloco, texto })}
            placeholder="Texto em destaque…"
            rows={2}
            className={campoTextoClasse}
          />
        </div>
      )

    case 'imagem':
      return <CampoImagem bloco={bloco} onChange={onChange} />

    case 'embed':
      return <CampoEmbed bloco={bloco} onChange={onChange} />

    case 'divisor':
      return (
        <p className="text-sm text-mt-apoio">
          Uma linha divisória entre seções. Nada para preencher.
        </p>
      )

    case 'citacao':
      return (
        <div className="flex flex-col gap-2">
          <TextareaComFormatacao
            value={bloco.texto}
            onChange={(texto) => onChange({ ...bloco, texto })}
            placeholder="Texto da citação…"
            rows={2}
            className={campoTextoClasse}
          />
          <input
            value={bloco.fonte ?? ''}
            onChange={(e) => onChange({ ...bloco, fonte: e.target.value })}
            placeholder="Fonte (opcional)"
            className={campoTextoClasse}
          />
        </div>
      )
  }
}

function ListaDeItens({
  itens,
  onChange,
}: {
  itens: string[]
  onChange: (itens: string[]) => void
}) {
  return (
    <div className="flex flex-col gap-2">
      {itens.map((item, i) => (
        <div key={i} className="flex items-center gap-2">
          <input
            value={item}
            onChange={(e) => onChange(itens.map((it, j) => (j === i ? e.target.value : it)))}
            placeholder="Item…"
            className={campoTextoClasse}
          />
          <button
            onClick={() => onChange(itens.filter((_, j) => j !== i))}
            className="flex size-8 shrink-0 items-center justify-center rounded-md transition-opacity hover:opacity-70 text-mt-red"
            aria-label="Remover item"
          >
            <Trash2 className="size-3.5" />
          </button>
        </div>
      ))}
      <button
        onClick={() => onChange([...itens, ''])}
        className="flex w-fit items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-opacity hover:opacity-70 border border-mt-border text-mt-green-dark"
      >
        <Plus className="size-3" />
        Item
      </button>
    </div>
  )
}

function CampoImagem({
  bloco,
  onChange,
}: {
  bloco: Extract<Bloco, { tipo: 'imagem' }>
  onChange: (b: Bloco) => void
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [enviando, setEnviando] = useState(false)
  const [erro, setErro] = useState<string | null>(null)

  async function selecionarArquivo(e: React.ChangeEvent<HTMLInputElement>) {
    const arquivo = e.target.files?.[0]
    if (!arquivo) return

    setErro(null)
    setEnviando(true)

    const formData = new FormData()
    formData.append('arquivo', arquivo)
    const resultado = await uploadImagemModulo(formData)

    setEnviando(false)
    if ('error' in resultado) {
      setErro(resultado.error)
      return
    }
    onChange({ ...bloco, url: resultado.url })
  }

  return (
    <div className="flex flex-col gap-3">
      {bloco.url ? (
        <div className="flex flex-col gap-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={bloco.url} alt="" className="max-h-48 w-full rounded-lg object-cover" />
          <button
            onClick={() => onChange({ ...bloco, url: '' })}
            className="flex w-fit items-center gap-1.5 text-xs font-medium transition-opacity hover:opacity-70 text-mt-red"
          >
            <Trash2 className="size-3.5" />
            Remover imagem
          </button>
        </div>
      ) : (
        <button
          onClick={() => inputRef.current?.click()}
          disabled={enviando}
          className="flex items-center justify-center gap-2 rounded-card border border-dashed border-mt-border py-6 text-sm font-medium text-mt-apoio transition-colors hover:border-mt-green hover:text-mt-green-dark disabled:opacity-60"
        >
          {enviando ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <ImagePlus className="size-4" />
          )}
          {enviando ? 'Enviando…' : 'Enviar imagem'}
        </button>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={selecionarArquivo}
        className="hidden"
      />

      {erro && (
        <p className="text-xs text-mt-red">
          {erro}
        </p>
      )}

      <input
        value={bloco.legenda ?? ''}
        onChange={(e) => onChange({ ...bloco, legenda: e.target.value })}
        placeholder="Legenda (opcional)"
        className={campoTextoClasse}
      />
    </div>
  )
}

function CampoEmbed({
  bloco,
  onChange,
}: {
  bloco: Extract<Bloco, { tipo: 'embed' }>
  onChange: (b: Bloco) => void
}) {
  // O admin cola o iframe inteiro do Excalidraw: extrair o src daqui evita
  // pedir que ele edite HTML à mão só para achar a URL.
  function aoColar(valor: string) {
    const doIframe = valor.match(/src=["']([^"']+)["']/i)
    onChange({ ...bloco, url: doIframe ? doIframe[1] : valor })
  }

  const urlValida = bloco.url ? normalizarUrlEmbed(bloco.url) : null

  return (
    <div className="flex flex-col gap-2">
      <TextareaComFormatacao
        value={bloco.url}
        onChange={aoColar}
        placeholder='Cole a URL ou o <iframe src="https://link.excalidraw.com/readonly/…">'
        rows={2}
        className={campoTextoClasse}
      />

      {bloco.url && !urlValida && (
        <p className="text-xs text-mt-red">
          URL não aceita. Só https de: {HOSTS_EMBED.join(', ')}.
        </p>
      )}

      <div className="flex items-center gap-2">
        <label className="text-xs text-mt-apoio">
          Altura (px)
        </label>
        <input
          type="number"
          min={240}
          max={1200}
          value={bloco.altura ?? ALTURA_EMBED_PADRAO}
          onChange={(e) => onChange({ ...bloco, altura: Number(e.target.value) })}
          className="w-24 rounded-lg px-2 py-1.5 text-sm border border-mt-border text-mt-green-dark"
        />
      </div>

      <input
        value={bloco.legenda ?? ''}
        onChange={(e) => onChange({ ...bloco, legenda: e.target.value })}
        placeholder="Legenda (opcional)"
        className={campoTextoClasse}
      />

      {urlValida && (
        <iframe
          src={urlValida}
          title="Pré-visualização do quadro"
          loading="lazy"
          sandbox="allow-scripts allow-same-origin allow-popups"
          referrerPolicy="no-referrer"
          className="h-60 w-full rounded-elemento border border-mt-border"
        />
      )}
    </div>
  )
}
