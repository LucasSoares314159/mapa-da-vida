'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { MoreVertical, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import {
  criarObjetivo,
  atualizarStatusObjetivo,
  arquivarObjetivo,
  editarObjetivo,
} from '@/app/actions/objetivos'
import type { Objetivo, PrazoObjetivo, NomePilar, StatusObjetivo } from '@/types'

const LIMITE_CURTO = 3

const PILAR_COR: Record<NomePilar, string> = {
  corpo: '#57AA8F',
  mente: '#D4A843',
  espirito: '#6B7FD7',
}

const PILAR_LABEL: Record<NomePilar, string> = {
  corpo: 'Corpo',
  mente: 'Mente',
  espirito: 'Espírito',
}

const STATUS_CONFIG: Record<StatusObjetivo, { label: string; bg: string; color: string }> = {
  ativo: { label: 'Ativo', bg: 'rgba(87,170,143,0.12)', color: '#57AA8F' },
  pausado: { label: 'Pausado', bg: 'rgba(212,168,67,0.15)', color: '#b88a30' },
  concluido: { label: 'Concluído', bg: 'rgba(111,143,135,0.12)', color: '#6f8f87' },
  arquivado: { label: 'Arquivado', bg: 'rgba(192,80,80,0.12)', color: '#C05050' },
}

const PRAZOS: { value: PrazoObjetivo; label: string }[] = [
  { value: 'curto', label: 'Curto' },
  { value: 'medio', label: 'Médio' },
  { value: 'longo', label: 'Longo' },
]

const getMesAtual = () => {
  const meses = [
    'jan', 'fev', 'mar', 'abr', 'mai', 'jun',
    'jul', 'ago', 'set', 'out', 'nov', 'dez',
  ]
  return meses[new Date().getMonth()]
}

const getZonaLabel = (zona: 'privilegio' | 'sacrificio') => {
  return zona === 'sacrificio' ? 'Zona Sacrifício' : 'Zona Privilégio'
}

type Props = {
  objetivos: Objetivo[]
  percentualLivre: number
  zona: 'privilegio' | 'sacrificio'
}

export function ObjetivosLista({ objetivos: objs, percentualLivre, zona }: Props) {
  const router = useRouter()
  const [tabAtiva, setTabAtiva] = useState<PrazoObjetivo>('curto')
  const [lista, setLista] = useState<Objetivo[]>(objs)

  const [modalAberto, setModalAberto] = useState(false)
  const [editandoObjetivo, setEditandoObjetivo] = useState<Objetivo | null>(null)

  const [formTexto, setFormTexto] = useState('')
  const [formPilar, setFormPilar] = useState<NomePilar>('corpo')
  const [formPrazo, setFormPrazo] = useState<PrazoObjetivo>('curto')
  const [formMotivo, setFormMotivo] = useState('')
  const [formDataAlvo, setFormDataAlvo] = useState('')
  const [formLoading, setFormLoading] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  const [toast, setToast] = useState({ mensagem: '', visivel: false })

  const porPrazo = (prazo: PrazoObjetivo) => lista.filter((o) => o.prazo === prazo)
  const curtos = porPrazo('curto')
  const medios = porPrazo('medio')
  const longos = porPrazo('longo')

  const curtosAtivos = curtos.filter((o) => o.status === 'ativo').length
  const atingiuLimite = curtosAtivos >= LIMITE_CURTO

  function mostrarToast(mensagem: string) {
    setToast({ mensagem, visivel: true })
    setTimeout(() => setToast((t) => ({ ...t, visivel: false })), 3000)
  }

  function handleAbrirModal(prazo: PrazoObjetivo, objetivo?: Objetivo) {
    if (objetivo) {
      setEditandoObjetivo(objetivo)
      setFormTexto(objetivo.texto)
      setFormPilar(objetivo.pilar)
      setFormPrazo(objetivo.prazo)
      setFormMotivo(objetivo.motivo || '')
      setFormDataAlvo(objetivo.data_alvo || '')
    } else {
      setEditandoObjetivo(null)
      setFormTexto('')
      setFormPilar('corpo')
      setFormPrazo(prazo)
      setFormMotivo('')
      setFormDataAlvo('')
    }
    setFormError(null)
    setModalAberto(true)
  }

  function handleFecharModal() {
    setModalAberto(false)
    setEditandoObjetivo(null)
    setFormError(null)
  }

  async function handleSalvarObjetivo() {
    if (!formTexto.trim()) {
      setFormError('Descreva o objetivo com clareza.')
      return
    }

    if (
      !editandoObjetivo &&
      formPrazo === 'curto' &&
      curtosAtivos >= LIMITE_CURTO
    ) {
      setFormError('Limite de 3 objetivos curtos atingido.')
      return
    }

    setFormLoading(true)
    setFormError(null)

    try {
      let result

      if (editandoObjetivo) {
        result = await editarObjetivo(editandoObjetivo.id, {
          texto: formTexto.trim(),
          pilar: formPilar,
          prazo: formPrazo,
          data_alvo: formDataAlvo || null,
          motivo: formMotivo.trim() || null,
        })
      } else {
        result = await criarObjetivo({
          texto: formTexto.trim(),
          pilar: formPilar,
          prazo: formPrazo,
          data_alvo: formDataAlvo || null,
          motivo: formMotivo.trim() || null,
        })
      }

      if ('redirectTo' in result) {
        router.push(result.redirectTo)
        return
      }

      if ('error' in result) {
        setFormError(result.error)
        return
      }

      if ('data' in result) {
        if (editandoObjetivo) {
          setLista((prev) =>
            prev.map((o) => (o.id === editandoObjetivo.id ? result.data : o))
          )
        } else {
          setLista((prev) => [result.data, ...prev])
        }
        handleFecharModal()
      }
    } finally {
      setFormLoading(false)
    }
  }

  async function handleConcluir(id: string) {
    const original = lista.find((o) => o.id === id)
    if (!original) return

    setLista((prev) =>
      prev.map((o) =>
        o.id === id ? { ...o, status: 'concluido', concluido_em: new Date().toISOString() } : o
      )
    )

    const result = await atualizarStatusObjetivo(id, 'concluido')

    if ('redirectTo' in result) {
      router.push(result.redirectTo)
      return
    }

    if ('error' in result) {
      setLista((prev) => prev.map((o) => (o.id === id ? original : o)))
      mostrarToast('Erro ao concluir objetivo.')
      return
    }

    mostrarToast('🎯 Objetivo concluído. Bom trabalho.')
  }

  async function handlePausar(id: string) {
    const original = lista.find((o) => o.id === id)
    if (!original) return

    setLista((prev) =>
      prev.map((o) =>
        o.id === id ? { ...o, status: 'pausado' } : o
      )
    )

    const result = await atualizarStatusObjetivo(id, 'pausado')

    if ('redirectTo' in result) {
      router.push(result.redirectTo)
      return
    }

    if ('error' in result) {
      setLista((prev) => prev.map((o) => (o.id === id ? original : o)))
      mostrarToast('Erro ao pausar objetivo.')
      return
    }

    mostrarToast('⏸ Objetivo pausado.')
  }

  async function handleRetomar(id: string) {
    const original = lista.find((o) => o.id === id)
    if (!original) return

    setLista((prev) =>
      prev.map((o) =>
        o.id === id ? { ...o, status: 'ativo', concluido_em: null } : o
      )
    )

    const result = await atualizarStatusObjetivo(id, 'ativo')

    if ('redirectTo' in result) {
      router.push(result.redirectTo)
      return
    }

    if ('error' in result) {
      setLista((prev) => prev.map((o) => (o.id === id ? original : o)))
      mostrarToast('Erro ao retomar objetivo.')
      return
    }

    mostrarToast('↩︎ Objetivo retomado. Sem julgamento.')
  }

  async function handleArquivar(id: string) {
    const original = lista.find((o) => o.id === id)
    if (!original) return

    setLista((prev) => prev.filter((o) => o.id !== id))

    const result = await arquivarObjetivo(id)

    if ('redirectTo' in result) {
      router.push(result.redirectTo)
      return
    }

    if ('error' in result) {
      setLista((prev) => [...prev, original])
      mostrarToast('Erro ao arquivar objetivo.')
      return
    }
  }

  const renderizar = (prazo: PrazoObjetivo) => {
    const items = porPrazo(prazo)

    if (items.length === 0) {
      return (
        <EmptyState
          prazo={prazo}
          onAdicionar={() => handleAbrirModal(prazo)}
        />
      )
    }

    return (
      <>
        {items.map((obj) => (
          <ObjetivoCard
            key={obj.id}
            objetivo={obj}
            onConcluir={handleConcluir}
            onPausar={handlePausar}
            onRetomar={handleRetomar}
            onEditar={() => handleAbrirModal(obj.prazo, obj)}
            onArquivar={handleArquivar}
          />
        ))}
      </>
    )
  }

  return (
    <div className="min-h-screen bg-gray-200 py-8">
      <div className="mx-auto w-full max-w-2xl px-4 sm:px-6 flex flex-col gap-4">
        {/* Header meta */}
        <p className="text-xs font-medium text-mt-muted">
          Mapa de {getMesAtual()} · {getZonaLabel(zona)} · {percentualLivre}% livre
        </p>

        {/* Zona banner */}
        {percentualLivre < 50 && (
          <Card className="border-mt-red/30 bg-mt-red/10">
            <div className="p-4">
              <p className="text-sm text-mt-red">
                <strong>Rotina sobrecarregada.</strong> Sua agenda já está no limite.
                Antes de adicionar novos objetivos, considere pausar ou concluir
                os existentes para criar espaço real.
              </p>
            </div>
          </Card>
        )}

        {/* Tabs */}
        <div className="flex gap-1 rounded-md border border-mt-border bg-white p-1">
          {PRAZOS.map((pz) => {
            const count = porPrazo(pz.value).filter(
              (o) => o.status === 'ativo'
            ).length
            const isLimiteCurto =
              pz.value === 'curto' && zona === 'sacrificio' && curtosAtivos >= LIMITE_CURTO

            return (
              <button
                key={pz.value}
                onClick={() => setTabAtiva(pz.value)}
                className={cn(
                  'flex flex-1 items-center justify-center gap-2 px-3 py-2 text-sm font-medium transition-colors rounded-lg',
                  tabAtiva === pz.value
                    ? 'bg-mt-off-white text-mt-black'
                    : 'bg-transparent text-mt-muted hover:bg-mt-off-white/50'
                )}
              >
                {pz.label}
                <span
                  className={cn(
                    'rounded-full px-2 py-0.5 text-[11px] font-medium',
                    isLimiteCurto
                      ? 'bg-mt-red text-white'
                      : 'bg-mt-off-white text-mt-black'
                  )}
                >
                  {count}
                </span>
              </button>
            )
          })}
        </div>

        {/* Lista */}
        <div className="flex flex-col gap-3">
          {renderizar(tabAtiva)}
          <Button
            onClick={() => handleAbrirModal(tabAtiva)}
            variant="ghost"
            className="justify-start gap-2 text-mt-green hover:bg-transparent hover:text-mt-green"
          >
            + Adicionar objetivo
          </Button>
        </div>
      </div>

      {/* Modal */}
      {modalAberto && (
        <ObjetivoModal
          editando={editandoObjetivo}
          formTexto={formTexto}
          onChangeTexto={setFormTexto}
          formPilar={formPilar}
          onChangePilar={setFormPilar}
          formPrazo={formPrazo}
          onChangePrazo={setFormPrazo}
          formMotivo={formMotivo}
          onChangeMotivo={setFormMotivo}
          formDataAlvo={formDataAlvo}
          onChangeDataAlvo={setFormDataAlvo}
          formError={formError}
          formLoading={formLoading}
          onSalvar={handleSalvarObjetivo}
          onFechar={handleFecharModal}
        />
      )}

      {/* Toast */}
      {toast.visivel && <Toast mensagem={toast.mensagem} />}
    </div>
  )
}

interface ObjetivoCardProps {
  objetivo: Objetivo
  onConcluir: (id: string) => void
  onPausar: (id: string) => void
  onRetomar: (id: string) => void
  onEditar: () => void
  onArquivar: (id: string) => void
}

function ObjetivoCard({
  objetivo,
  onConcluir,
  onPausar,
  onRetomar,
  onEditar,
  onArquivar,
}: ObjetivoCardProps) {
  const [menuAberto, setMenuAberto] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuAberto(false)
      }
    }

    if (menuAberto) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [menuAberto])

  return (
    <Card
      className={cn(
        'flex flex-col gap-3 p-5 transition-opacity duration-200',
        objetivo.status === 'concluido' ? 'opacity-60' : ''
      )}
    >
      <div className="flex items-start gap-3">
        {/* Checkbox circle */}
        <button
          onClick={() => onConcluir(objetivo.id)}
          className={cn(
            'shrink-0 mt-0.5 w-5.5 h-5.5 rounded-full flex items-center justify-center border-[1.5px] transition-all',
            objetivo.status === 'concluido'
              ? 'border-mt-green bg-mt-green'
              : 'border-mt-border hover:border-mt-green'
          )}
        >
          {objetivo.status === 'concluido' && (
            <Check size={11} className="text-white animate-check-spring" strokeWidth={2.2} />
          )}
        </button>

        {/* Conteúdo */}
        <div className="flex-1 flex flex-col gap-2">
          <span
            className={cn(
              'text-[15px] font-normal text-mt-black',
              objetivo.status === 'concluido' ? 'line-through' : ''
            )}
          >
            {objetivo.texto}
          </span>
          {objetivo.data_alvo && (
            <div className="flex items-center gap-1 text-[11px] text-mt-muted">
              📅 Até {new Date(objetivo.data_alvo).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
            </div>
          )}
          <div className="flex flex-wrap items-center gap-2">
            <span
              className="px-2 py-0.5 rounded-full text-[10px] font-medium uppercase tracking-wide text-white"
              style={{ background: PILAR_COR[objetivo.pilar] }}
            >
              {PILAR_LABEL[objetivo.pilar]}
            </span>
            <span
              className="px-2.5 py-0.5 rounded-full text-[11px] font-normal border"
              style={{
                borderColor: STATUS_CONFIG[objetivo.status].color,
                color: STATUS_CONFIG[objetivo.status].color,
                background: STATUS_CONFIG[objetivo.status].bg,
              }}
            >
              {STATUS_CONFIG[objetivo.status].label}
            </span>
            {objetivo.status === 'ativo' && (
              <Button
                onClick={() => onPausar(objetivo.id)}
                variant="ghost"
                className="ml-auto h-auto px-2.5 py-0.5 text-[11px] font-medium border border-mt-muted text-mt-muted bg-mt-off-white/50 hover:bg-mt-off-white"
              >
                ⏸ Pausar
              </Button>
            )}
            {objetivo.status === 'pausado' && (
              <Button
                onClick={() => onRetomar(objetivo.id)}
                variant="ghost"
                className="ml-auto h-auto px-2.5 py-0.5 text-[11px] font-medium border border-mt-yellow text-mt-yellow bg-mt-yellow/10 hover:bg-mt-yellow/20"
              >
                ↩︎ Retomar
              </Button>
            )}
          </div>
        </div>

        {/* Menu */}
        <div className="relative" ref={menuRef}>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 hover:bg-gray-100"
            onClick={() => setMenuAberto(!menuAberto)}
          >
            <MoreVertical size={14} className="text-mt-muted" />
          </Button>
          {menuAberto && (
            <div className="absolute top-full right-0 mt-0 w-32 bg-white border border-mt-border rounded-lg py-1 shadow-lg z-10">
              <button
                onClick={() => {
                  onEditar()
                  setMenuAberto(false)
                }}
                className="w-full px-4 py-2 text-left text-sm text-mt-black hover:bg-gray-100 transition-colors"
              >
                Editar
              </button>
              <button
                onClick={() => {
                  onArquivar(objetivo.id)
                  setMenuAberto(false)
                }}
                className="w-full px-4 py-2 text-left text-sm text-mt-red hover:bg-gray-100 transition-colors"
              >
                Arquivar
              </button>
            </div>
          )}
        </div>
      </div>
    </Card>
  )
}

interface EmptyStateProps {
  prazo: PrazoObjetivo
  onAdicionar: () => void
}

function EmptyState({ prazo, onAdicionar }: EmptyStateProps) {
  const isMensagemLongo = prazo === 'longo'

  return (
    <Card className="flex flex-col items-center gap-4 px-6 py-14 text-center">
      <p className={cn(
        'text-[15px] text-mt-muted leading-relaxed',
        isMensagemLongo ? 'font-editorial italic' : 'font-serif italic'
      )}>
        {isMensagemLongo
          ? 'O longo prazo é onde as vidas mudam. Que grande objetivo você quer alcançar nos próximos anos?'
          : prazo === 'curto'
            ? 'Nenhum objetivo ≤ 90 dias ainda.'
            : 'Nenhum objetivo 6–12 meses ainda.'}
      </p>
      <Button
        onClick={onAdicionar}
        className="bg-mt-green hover:bg-mt-green-dark text-white"
      >
        + Adicionar objetivo
      </Button>
    </Card>
  )
}

interface ObjetivoModalProps {
  editando: Objetivo | null
  formTexto: string
  onChangeTexto: (v: string) => void
  formPilar: NomePilar
  onChangePilar: (v: NomePilar) => void
  formPrazo: PrazoObjetivo
  onChangePrazo: (v: PrazoObjetivo) => void
  formMotivo: string
  onChangeMotivo: (v: string) => void
  formDataAlvo: string
  onChangeDataAlvo: (v: string) => void
  formError: string | null
  formLoading: boolean
  onSalvar: () => void
  onFechar: () => void
}

function ObjetivoModal({
  editando,
  formTexto,
  onChangeTexto,
  formPilar,
  onChangePilar,
  formPrazo,
  onChangePrazo,
  formMotivo,
  onChangeMotivo,
  formDataAlvo,
  onChangeDataAlvo,
  formError,
  formLoading,
  onSalvar,
  onFechar,
}: ObjetivoModalProps) {
  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onFechar()
      }}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-5"
    >
      <Card className="w-full max-w-[440px] p-8">
        <div className="flex flex-col gap-5">
          <h2 className="text-lg font-medium text-mt-black">
            {editando ? 'Editar objetivo' : 'Novo objetivo'}
          </h2>

          <div className="flex flex-col gap-2">
            <Label className="text-[11px] font-medium uppercase tracking-wide text-mt-muted">
              O que você quer alcançar?
            </Label>
            <Textarea
              value={formTexto}
              onChange={(e) => onChangeTexto(e.target.value)}
              rows={3}
              placeholder="Descreva o objetivo com clareza..."
              className="resize-none"
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label className="text-[11px] font-medium uppercase tracking-wide text-mt-muted">
              Prazo
            </Label>
            <div className="flex flex-wrap gap-2">
              {PRAZOS.map((p) => (
                <Button
                  key={p.value}
                  onClick={() => onChangePrazo(p.value)}
                  variant={formPrazo === p.value ? 'default' : 'outline'}
                  className={cn(
                    'px-3.5 py-1.5 text-sm font-medium',
                    formPrazo === p.value
                      ? 'bg-mt-green text-white hover:bg-mt-green-dark'
                      : 'border-mt-border text-mt-muted hover:bg-gray-50'
                  )}
                >
                  {p.label}
                </Button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Label className="text-[11px] font-medium uppercase tracking-wide text-mt-muted">
              Pilar
            </Label>
            <div className="flex flex-wrap gap-2">
              {(['corpo', 'mente', 'espirito'] as const).map((p) => (
                <Button
                  key={p}
                  onClick={() => onChangePilar(p)}
                  className={cn(
                    'px-3.5 py-1.5 text-sm font-medium rounded-full border',
                    formPilar === p
                      ? 'text-white'
                      : 'border-mt-border text-mt-muted hover:bg-gray-50'
                  )}
                  style={{
                    background: formPilar === p ? PILAR_COR[p] : 'transparent',
                    borderColor: formPilar === p ? PILAR_COR[p] : undefined,
                  }}
                >
                  {PILAR_LABEL[p]}
                </Button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Label className="text-[11px] font-medium uppercase tracking-wide text-mt-muted">
              Data alvo (opcional)
            </Label>
            <Input
              type="date"
              value={formDataAlvo}
              onChange={(e) => onChangeDataAlvo(e.target.value)}
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label className="text-[11px] font-medium uppercase tracking-wide text-mt-muted">
              Por que esse objetivo importa para você?{' '}
              <span className="text-[10px] font-normal normal-case tracking-normal">
                (opcional)
              </span>
            </Label>
            <Textarea
              value={formMotivo}
              onChange={(e) => onChangeMotivo(e.target.value)}
              rows={2}
              placeholder="Escreva brevemente o motivo..."
              className="resize-none"
            />
          </div>

          {formError && (
            <p className="text-sm text-mt-red">{formError}</p>
          )}

          <div className="flex flex-col gap-2.5 pt-1">
            <Button
              onClick={onSalvar}
              disabled={formLoading}
              className="bg-mt-green text-mt-black hover:bg-mt-green-dark disabled:opacity-60"
            >
              {formLoading ? 'Salvando...' : editando ? 'Atualizar objetivo' : 'Salvar objetivo'}
            </Button>
            <Button
              onClick={onFechar}
              variant="outline"
              className="border-mt-border text-mt-muted hover:border-mt-green hover:text-mt-green hover:bg-transparent"
            >
              Cancelar
            </Button>
          </div>
        </div>
      </Card>
    </div>
  )
}

interface ToastProps {
  mensagem: string
}

function Toast({ mensagem }: ToastProps) {
  return (
    <div className="fixed bottom-7 left-1/2 -translate-x-1/2 z-[200] bg-mt-black text-mt-off-white text-sm font-medium px-5 py-2.5 rounded-full shadow-lg">
      {mensagem}
    </div>
  )
}
