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
import { blocoVazio, paragrafosDe, type Bloco } from '@/lib/conteudo-modulos'
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
          <h1 className="font-heading text-xl font-bold" style={{ color: '#1a2e29' }}>
            {moduloTitulo}
          </h1>
          <p className="text-sm" style={{ color: '#4a6b62' }}>
            Edite o conteúdo escrito que os alunos leem nesta aula.
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <button
            onClick={() => setMostrarPreview((v) => !v)}
            className="rounded-lg px-4 py-2 text-sm font-medium transition-opacity hover:opacity-80"
            style={{ border: '1px solid #c8d8d2', color: '#1a2e29' }}
          >
            {mostrarPreview ? 'Editar' : 'Pré-visualizar'}
          </button>
          <button
            onClick={salvar}
            disabled={salvando}
            className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
            style={{ backgroundColor: '#57AA8F' }}
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
        <p className="text-sm" style={{ color: '#C05050' }}>
          {erro}
        </p>
      )}

      {mostrarPreview ? (
        <div
          className="rounded-xl px-8 py-10"
          style={{ border: '0.5px solid #c8d8d2', backgroundColor: '#ffffff' }}
        >
          <ConteudoModulo blocos={blocos} />
          {blocos.length === 0 && (
            <p className="text-sm" style={{ color: '#4a6b62' }}>
              Nenhum bloco ainda.
            </p>
          )}
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          <div
            className="rounded-xl p-4"
            style={{ border: '0.5px solid #c8d8d2', backgroundColor: '#ffffff' }}
          >
            <RascunhoComSelecao
              texto={rascunho}
              onChangeTexto={setRascunho}
              onExtrairBloco={extrairBlocoDoRascunho}
            />
          </div>

          {blocos.length > 0 && (
            <div className="flex flex-col gap-4">
              <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: '#4a6b62' }}>
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
            className="flex flex-wrap gap-2 rounded-xl p-4"
            style={{ border: '1px dashed #c8d8d2' }}
          >
            <span className="w-full text-xs" style={{ color: '#4a6b62' }}>
              Blocos sem texto de origem (imagem, divisor) ou para adicionar do zero:
            </span>
            {TIPOS.map(({ tipo, label }) => (
              <button
                key={tipo}
                onClick={() => adicionar(tipo)}
                className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium transition-opacity hover:opacity-70"
                style={{ border: '1px solid #c8d8d2', color: '#1a2e29' }}
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
      className="flex flex-col gap-3 rounded-xl p-4"
      style={{ border: '0.5px solid #c8d8d2', backgroundColor: '#ffffff' }}
    >
      <div className="flex items-center justify-between">
        <span
          className="text-xs font-semibold uppercase tracking-wide"
          style={{ color: '#4a6b62' }}
        >
          {rotulo}
        </span>
        <div className="flex items-center gap-1">
          <button
            onClick={onMoverCima}
            disabled={!podeSubir}
            className="flex size-7 items-center justify-center rounded-md transition-opacity disabled:opacity-30"
            style={{ color: '#4a6b62' }}
            aria-label="Mover para cima"
          >
            <ChevronUp className="size-4" />
          </button>
          <button
            onClick={onMoverBaixo}
            disabled={!podeDescer}
            className="flex size-7 items-center justify-center rounded-md transition-opacity disabled:opacity-30"
            style={{ color: '#4a6b62' }}
            aria-label="Mover para baixo"
          >
            <ChevronDown className="size-4" />
          </button>
          <button
            onClick={onRemover}
            className="flex size-7 items-center justify-center rounded-md transition-opacity hover:opacity-70"
            style={{ color: '#C05050' }}
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
  'w-full rounded-lg px-3 py-2 text-sm outline-none focus:ring-1'

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
          style={{ border: '1px solid #c8d8d2', color: '#1a2e29' }}
        />
      )

    case 'titulo':
      return (
        <div className="flex gap-2">
          <select
            value={bloco.nivel}
            onChange={(e) => onChange({ ...bloco, nivel: Number(e.target.value) as 2 | 3 })}
            className="rounded-lg px-2 py-2 text-sm"
            style={{ border: '1px solid #c8d8d2', color: '#1a2e29' }}
          >
            <option value={2}>H2</option>
            <option value={3}>H3</option>
          </select>
          <input
            value={bloco.texto}
            onChange={(e) => onChange({ ...bloco, texto: e.target.value })}
            placeholder="Texto do título…"
            className={campoTextoClasse}
            style={{ border: '1px solid #c8d8d2', color: '#1a2e29' }}
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
            className="w-14 rounded-lg px-2 py-2 text-center text-sm"
            style={{ border: '1px solid #c8d8d2', color: '#1a2e29' }}
          />
          <TextareaComFormatacao
            value={bloco.texto}
            onChange={(texto) => onChange({ ...bloco, texto })}
            placeholder="Texto do callout…"
            rows={2}
            className={campoTextoClasse}
            style={{ border: '1px solid #c8d8d2', color: '#1a2e29' }}
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
                className="rounded-full px-3 py-1 text-xs font-medium capitalize"
                style={{
                  border: bloco.cor === cor ? '1.5px solid #57AA8F' : '1px solid #c8d8d2',
                  color: bloco.cor === cor ? '#57AA8F' : '#4a6b62',
                }}
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
            style={{ border: '1px solid #c8d8d2', color: '#1a2e29' }}
          />
        </div>
      )

    case 'imagem':
      return <CampoImagem bloco={bloco} onChange={onChange} />

    case 'divisor':
      return (
        <p className="text-sm" style={{ color: '#4a6b62' }}>
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
            style={{ border: '1px solid #c8d8d2', color: '#1a2e29' }}
          />
          <input
            value={bloco.fonte ?? ''}
            onChange={(e) => onChange({ ...bloco, fonte: e.target.value })}
            placeholder="Fonte (opcional)"
            className={campoTextoClasse}
            style={{ border: '1px solid #c8d8d2', color: '#1a2e29' }}
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
            style={{ border: '1px solid #c8d8d2', color: '#1a2e29' }}
          />
          <button
            onClick={() => onChange(itens.filter((_, j) => j !== i))}
            className="flex size-8 shrink-0 items-center justify-center rounded-md transition-opacity hover:opacity-70"
            style={{ color: '#C05050' }}
            aria-label="Remover item"
          >
            <Trash2 className="size-3.5" />
          </button>
        </div>
      ))}
      <button
        onClick={() => onChange([...itens, ''])}
        className="flex w-fit items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-opacity hover:opacity-70"
        style={{ border: '1px solid #c8d8d2', color: '#1a2e29' }}
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
            className="flex w-fit items-center gap-1.5 text-xs font-medium transition-opacity hover:opacity-70"
            style={{ color: '#C05050' }}
          >
            <Trash2 className="size-3.5" />
            Remover imagem
          </button>
        </div>
      ) : (
        <button
          onClick={() => inputRef.current?.click()}
          disabled={enviando}
          className="flex items-center justify-center gap-2 rounded-lg py-6 text-sm font-medium transition-opacity hover:opacity-70 disabled:opacity-60"
          style={{ border: '1px dashed #c8d8d2', color: '#4a6b62' }}
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
        <p className="text-xs" style={{ color: '#C05050' }}>
          {erro}
        </p>
      )}

      <input
        value={bloco.legenda ?? ''}
        onChange={(e) => onChange({ ...bloco, legenda: e.target.value })}
        placeholder="Legenda (opcional)"
        className={campoTextoClasse}
        style={{ border: '1px solid #c8d8d2', color: '#1a2e29' }}
      />
    </div>
  )
}
