'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Pencil, Trash2, Pause, RotateCcw, CalendarDays, Target } from 'lucide-react'
import { Button } from '@/components/ui/button'
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

const LIMITE = 3

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

const STATUS_CONCLUIDO = {
  border: '1px solid #a8d5c2',
  color: '#3d8f72',
  background: '#f0faf5',
}

const PRAZOS: { value: PrazoObjetivo; label: string; sublabel: string }[] = [
  { value: 'curto', label: 'Curto', sublabel: 'até 90 dias' },
  { value: 'medio', label: 'Médio', sublabel: '6–12 meses' },
  { value: 'longo', label: 'Longo', sublabel: '1–3 anos' },
]

const PILAR_OPTIONS = ['corpo', 'mente', 'espirito'] as const

const EMPTY_SUBTEXTO: Record<PrazoObjetivo, string> = {
  curto: 'O que você quer mudar nos próximos 90 dias?',
  medio: 'O que você quer construir até o fim do ano?',
  longo: 'Onde você quer estar daqui a 1–3 anos?',
}

const getMesAtual = () => {
  const meses = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez']
  return meses[new Date().getMonth()]
}

const getZonaLabel = (zona: 'privilegio' | 'sacrificio') =>
  zona === 'sacrificio' ? 'Zona Sacrifício' : 'Zona Privilégio'

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

  const [toast, setToast] = useState<{ mensagem: string; visivel: boolean }>({ mensagem: '', visivel: false })
  const [processingId, setProcessingId] = useState<string | null>(null)

  const porPrazo = (prazo: PrazoObjetivo) => lista.filter((o) => o.prazo === prazo)

  // Badge conta ativos + pausados (não concluídos nem arquivados)
  const contarAtivos = (prazo: PrazoObjetivo) =>
    porPrazo(prazo).filter((o) => o.status === 'ativo' || o.status === 'pausado').length

  function mostrarToast(mensagem: string) {
    setToast({ mensagem, visivel: true })
    setTimeout(() => setToast((t) => ({ ...t, visivel: false })), 2800)
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
    if (!editandoObjetivo && contarAtivos(formPrazo) >= LIMITE) {
      setFormError(`Limite de ${LIMITE} objetivos por prazo atingido.`)
      return
    }
    setFormLoading(true)
    setFormError(null)
    try {
      const result = editandoObjetivo
        ? await editarObjetivo(editandoObjetivo.id, {
            texto: formTexto.trim(),
            pilar: formPilar,
            prazo: formPrazo,
            data_alvo: formDataAlvo || null,
            motivo: formMotivo.trim() || null,
          })
        : await criarObjetivo({
            texto: formTexto.trim(),
            pilar: formPilar,
            prazo: formPrazo,
            data_alvo: formDataAlvo || null,
            motivo: formMotivo.trim() || null,
          })

      if ('redirectTo' in result) { router.push(result.redirectTo); return }
      if ('error' in result) { setFormError(result.error); return }
      if ('data' in result) {
        setLista((prev) =>
          editandoObjetivo
            ? prev.map((o) => (o.id === editandoObjetivo.id ? result.data : o))
            : [result.data, ...prev]
        )
        handleFecharModal()
      }
    } finally {
      setFormLoading(false)
    }
  }

  async function handleConcluir(id: string) {
    if (processingId) return
    const original = lista.find((o) => o.id === id)
    if (!original) return
    setProcessingId(id)
    // Optimistic: se já concluído → retomar; se ativo/pausado → concluir
    const novoStatus: StatusObjetivo = original.status === 'concluido' ? 'ativo' : 'concluido'
    const agora = new Date().toISOString()
    setLista((prev) =>
      prev.map((o) =>
        o.id === id
          ? { ...o, status: novoStatus, concluido_em: novoStatus === 'concluido' ? agora : null }
          : o
      )
    )
    const result = await atualizarStatusObjetivo(id, novoStatus)
    setProcessingId(null)
    if ('redirectTo' in result) { router.push(result.redirectTo); return }
    if ('error' in result) {
      setLista((prev) => prev.map((o) => (o.id === id ? original : o)))
      mostrarToast('Erro ao atualizar objetivo.')
      return
    }
    if (novoStatus === 'concluido') {
      mostrarToast('🎯 Objetivo concluído. Bom trabalho.')
    } else {
      mostrarToast('↩︎ Objetivo retomado. Sem julgamento.')
    }
  }

  async function handlePausar(id: string) {
    if (processingId) return
    const original = lista.find((o) => o.id === id)
    if (!original) return
    setProcessingId(id)
    setLista((prev) => prev.map((o) => o.id === id ? { ...o, status: 'pausado' } : o))
    const result = await atualizarStatusObjetivo(id, 'pausado')
    setProcessingId(null)
    if ('redirectTo' in result) { router.push(result.redirectTo); return }
    if ('error' in result) {
      setLista((prev) => prev.map((o) => (o.id === id ? original : o)))
      mostrarToast('Erro ao pausar objetivo.')
    }
  }

  async function handleRetomar(id: string) {
    if (processingId) return
    const original = lista.find((o) => o.id === id)
    if (!original) return
    setProcessingId(id)
    setLista((prev) => prev.map((o) => o.id === id ? { ...o, status: 'ativo', concluido_em: null } : o))
    const result = await atualizarStatusObjetivo(id, 'ativo')
    setProcessingId(null)
    if ('redirectTo' in result) { router.push(result.redirectTo); return }
    if ('error' in result) {
      setLista((prev) => prev.map((o) => (o.id === id ? original : o)))
      mostrarToast('Erro ao retomar objetivo.')
      return
    }
    mostrarToast('↩︎ Objetivo retomado. Sem julgamento.')
  }

  async function handleArquivar(id: string) {
    if (processingId) return
    const original = lista.find((o) => o.id === id)
    if (!original) return
    setProcessingId(id)
    setLista((prev) => prev.filter((o) => o.id !== id))
    const result = await arquivarObjetivo(id)
    setProcessingId(null)
    if ('redirectTo' in result) { router.push(result.redirectTo); return }
    if ('error' in result) {
      setLista((prev) => [...prev, original])
      mostrarToast('Erro ao arquivar objetivo.')
    }
  }

  return (
    <div className="min-h-screen py-8">
      <div className="mx-auto w-full max-w-2xl px-4 sm:px-6 flex flex-col gap-4">
        {/* Título */}
        <h1 className="font-heading text-2xl font-semibold text-mt-black">
          Meus Objetivos
        </h1>

        {/* Meta */}
        <p className="text-xs font-medium text-mt-muted -mt-2">
          Mapa de {getMesAtual()} · {getZonaLabel(zona)} · {percentualLivre}% livre
        </p>

        {/* Banner Zona Sacrifício */}
        {zona === 'sacrificio' && (
          <div style={{
            background: 'rgba(192, 80, 80, 0.07)',
            borderLeft: '3px solid #C05050',
            borderRadius: '8px',
            padding: '12px 16px',
          }}>
            <p style={{
              fontFamily: "'Lora', serif",
              fontStyle: 'italic',
              fontSize: '14px',
              color: '#C05050',
              lineHeight: '1.7',
              margin: 0,
            }}>
              Sua rotina já está no limite. Antes de adicionar um objetivo novo, considere o que você vai remover.
            </p>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-1 rounded-[10px] border border-mt-border bg-white p-1">
          {PRAZOS.map((pz) => {
            const count = contarAtivos(pz.value)
            const noLimite = count >= LIMITE
            const ativa = tabAtiva === pz.value

            return (
              <button
                key={pz.value}
                onClick={() => setTabAtiva(pz.value)}
                className={cn(
                  'flex flex-1 flex-col items-center justify-center gap-0.5 px-3 py-2 text-sm font-medium transition-colors rounded-lg',
                  ativa ? 'bg-mt-green text-white' : 'bg-transparent text-mt-muted hover:bg-mt-green/10 hover:text-mt-green-dark'
                )}
              >
                <div className="flex items-center gap-1 uppercase tracking-wide text-xs">
                  {pz.label}
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '9px',
                      fontWeight: 500,
                      borderRadius: '100px',
                      padding: '1px 5px',
                      lineHeight: '1.5',
                      background: noLimite
                        ? ativa ? 'rgba(255,255,255,0.25)' : 'rgba(192,80,80,0.15)'
                        : ativa ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.08)',
                      color: noLimite
                        ? ativa ? '#fff' : '#C05050'
                        : ativa ? '#fff' : 'inherit',
                    }}
                  >
                    {noLimite ? `${count}/${LIMITE}` : count}
                  </span>
                </div>
                <span className={cn('text-[10px] font-normal', ativa ? 'text-white/70' : 'text-mt-muted')}>{pz.sublabel}</span>
              </button>
            )
          })}
        </div>

        {/* Lista + empty state + botão */}
        <div className="flex flex-col gap-3">
          {porPrazo(tabAtiva).length === 0
            ? <EmptyState prazo={tabAtiva} />
            : porPrazo(tabAtiva).map((obj) => (
                <ObjetivoCard
                  key={obj.id}
                  objetivo={obj}
                  processingId={processingId}
                  onConcluir={handleConcluir}
                  onPausar={handlePausar}
                  onRetomar={handleRetomar}
                  onEditar={() => handleAbrirModal(obj.prazo, obj)}
                  onArquivar={handleArquivar}
                />
              ))
          }

          {/* Botão adicionar — sempre visível */}
          <button
            onClick={() => handleAbrirModal(tabAtiva)}
            style={{
              background: 'transparent',
              border: '1px dashed #c8d8d2',
              color: '#6f8f87',
              borderRadius: '10px',
              padding: '12px 24px',
              fontFamily: "'DM Sans', sans-serif",
              fontWeight: 500,
              fontSize: '14px',
              cursor: 'pointer',
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              transition: 'border-color 0.15s, color 0.15s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = '#57AA8F'
              e.currentTarget.style.borderStyle = 'solid'
              e.currentTarget.style.color = '#57AA8F'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = '#c8d8d2'
              e.currentTarget.style.borderStyle = 'dashed'
              e.currentTarget.style.color = '#6f8f87'
            }}
          >
            <span style={{ fontSize: '16px', lineHeight: 1 }}>+</span>
            Adicionar objetivo
          </button>
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
      <Toast mensagem={toast.mensagem} visivel={toast.visivel} />
    </div>
  )
}

// ---------------------------------------------------------------------------
// ObjetivoCard
// ---------------------------------------------------------------------------

interface ObjetivoCardProps {
  objetivo: Objetivo
  processingId: string | null
  onConcluir: (id: string) => void
  onPausar: (id: string) => void
  onRetomar: (id: string) => void
  onEditar: () => void
  onArquivar: (id: string) => void
}

function ObjetivoCard({ objetivo, processingId, onConcluir, onPausar, onRetomar, onEditar, onArquivar }: ObjetivoCardProps) {
  const [confirmandoArquivar, setConfirmandoArquivar] = useState(false)
  const confirmRef = useRef<HTMLDivElement>(null)
  const concluido = objetivo.status === 'concluido'
  const isProcessing = processingId !== null

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (confirmRef.current && !confirmRef.current.contains(event.target as Node)) {
        setConfirmandoArquivar(false)
      }
    }
    if (confirmandoArquivar) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [confirmandoArquivar])

  return (
    <div
      style={{
        background: concluido ? '#f9fdfb' : '#ffffff',
        borderRadius: '16px',
        border: concluido ? '1px solid #d4e8df' : '1px solid #e2ece8',
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        opacity: concluido ? 0.58 : 1,
        transition: 'opacity 0.3s, border-color 0.3s, background 0.3s',
        boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
        {/* Checkbox */}
        <button
          onClick={() => onConcluir(objetivo.id)}
          disabled={isProcessing}
          style={{
            flexShrink: 0,
            marginTop: '2px',
            width: '22px',
            height: '22px',
            borderRadius: '50%',
            border: concluido ? '1.5px solid #57AA8F' : '1.5px solid #c8d8d2',
            background: concluido ? '#57AA8F' : 'transparent',
            cursor: isProcessing ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'border-color 0.2s, background 0.2s',
            opacity: isProcessing && processingId !== objetivo.id ? 0.6 : 1,
          }}
          onMouseEnter={(e) => {
            if (!concluido && !isProcessing) e.currentTarget.style.borderColor = '#57AA8F'
          }}
          onMouseLeave={(e) => {
            if (!concluido) e.currentTarget.style.borderColor = '#c8d8d2'
          }}
        >
          {/* SVG check com animação via keyframes inline */}
          <svg
            width="11"
            height="9"
            viewBox="0 0 12 10"
            fill="none"
            style={{
              opacity: concluido ? 1 : 0,
              transform: concluido ? 'scale(1)' : 'scale(0.4)',
              transition: 'opacity 0.2s, transform 0.25s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
            }}
          >
            <polyline
              points="1.5,5.5 4.5,8.5 10.5,2"
              stroke="white"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>

        {/* Conteúdo */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <span
            style={{
              fontSize: '15px',
              fontWeight: 400,
              color: concluido ? '#6f8f87' : '#0C0F0F',
              lineHeight: '1.4',
              textDecoration: concluido ? 'line-through' : 'none',
              transition: 'color 0.3s',
            }}
          >
            {objetivo.texto}
          </span>

          {/* Data alvo */}
          {(objetivo.data_alvo || concluido) && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: '#6f8f87' }}>
              <CalendarDays size={11} />
              {concluido
                ? 'Concluído agora'
                : `Até ${new Date(objetivo.data_alvo!).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}`
              }
            </div>
          )}

          {/* Chips de status */}
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '8px' }}>
            <span
              style={{
                padding: '2px 8px',
                borderRadius: '100px',
                fontSize: '10px',
                fontWeight: 500,
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
                color: '#fff',
                background: PILAR_COR[objetivo.pilar],
              }}
            >
              {PILAR_LABEL[objetivo.pilar]}
            </span>

            {concluido ? (
              <span style={{ ...STATUS_CONCLUIDO, borderRadius: '100px', fontSize: '11px', padding: '3px 10px' }}>
                Concluído
              </span>
            ) : (
              <>
                {objetivo.status === 'pausado' && (
                  <span style={{
                    border: '1px solid #b88a30',
                    color: '#b88a30',
                    background: 'rgba(212,168,67,0.15)',
                    borderRadius: '100px',
                    fontSize: '11px',
                    padding: '3px 10px',
                  }}>
                    Pausado
                  </span>
                )}
                {objetivo.status === 'ativo' && (
                  <button
                    onClick={() => onPausar(objetivo.id)}
                    disabled={isProcessing}
                    style={{
                      marginLeft: 'auto',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      padding: '3px 10px',
                      fontSize: '11px',
                      fontWeight: 500,
                      border: '1px solid #c8d8d2',
                      color: '#6f8f87',
                      borderRadius: '100px',
                      background: 'transparent',
                      cursor: isProcessing ? 'not-allowed' : 'pointer',
                      opacity: isProcessing && processingId !== objetivo.id ? 0.6 : 1,
                    }}
                  >
                    <Pause size={10} />
                    Pausar
                  </button>
                )}
                {objetivo.status === 'pausado' && (
                  <button
                    onClick={() => onRetomar(objetivo.id)}
                    disabled={isProcessing}
                    style={{
                      marginLeft: 'auto',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      padding: '3px 10px',
                      fontSize: '11px',
                      fontWeight: 500,
                      border: '1px solid #D4A843',
                      color: '#D4A843',
                      borderRadius: '100px',
                      background: 'rgba(212,168,67,0.1)',
                      cursor: isProcessing ? 'not-allowed' : 'pointer',
                      opacity: isProcessing && processingId !== objetivo.id ? 0.6 : 1,
                    }}
                  >
                    <RotateCcw size={10} />
                    Retomar
                  </button>
                )}
              </>
            )}
          </div>
        </div>

        {/* Ações inline */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '2px', flexShrink: 0 }}>
          <button
            onClick={onEditar}
            disabled={isProcessing}
            style={{ cursor: isProcessing ? 'not-allowed' : 'pointer', opacity: isProcessing && processingId !== objetivo.id ? 0.6 : 1 }}
            className="flex items-center justify-center w-7 h-7 rounded-md text-mt-muted hover:bg-mt-off-white hover:text-mt-black transition-colors disabled:hover:bg-transparent"
          >
            <Pencil size={13} />
          </button>
          <div className="relative" ref={confirmRef}>
            <button
              onClick={() => setConfirmandoArquivar(true)}
              disabled={isProcessing}
              style={{ cursor: isProcessing ? 'not-allowed' : 'pointer', opacity: isProcessing && processingId !== objetivo.id ? 0.6 : 1 }}
              className="flex items-center justify-center w-7 h-7 rounded-md text-mt-muted hover:bg-red-50 hover:text-mt-red transition-colors disabled:hover:bg-transparent"
            >
              <Trash2 size={13} />
            </button>
            {confirmandoArquivar && (
              <div className="absolute top-full right-0 mt-1 w-40 bg-white border border-mt-border rounded-lg py-2 px-3 shadow-lg z-10 flex flex-col gap-2">
                <p className="text-[11px] text-mt-muted leading-snug">Arquivar este objetivo?</p>
                <div className="flex gap-1.5">
                  <button
                    onClick={() => { onArquivar(objetivo.id); setConfirmandoArquivar(false) }}
                    className="flex-1 py-1 text-[11px] font-medium bg-mt-red text-white rounded-md hover:opacity-90 transition-opacity"
                  >
                    Arquivar
                  </button>
                  <button
                    onClick={() => setConfirmandoArquivar(false)}
                    className="flex-1 py-1 text-[11px] font-medium border border-mt-border text-mt-muted rounded-md hover:bg-mt-off-white transition-colors"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// EmptyState
// ---------------------------------------------------------------------------

function EmptyState({ prazo }: { prazo: PrazoObjetivo }) {
  const titulos: Record<PrazoObjetivo, string> = {
    curto: 'Nenhum objetivo de curto prazo ainda.',
    medio: 'Nenhum objetivo de médio prazo ainda.',
    longo: 'Nenhum objetivo de longo prazo ainda.',
  }

  return (
    <div style={{
      background: '#fff',
      borderRadius: '16px',
      padding: '40px 24px',
      border: '0.5px solid #c8d8d2',
      boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '10px',
      textAlign: 'center',
    }}>
      <div style={{
        width: '40px',
        height: '40px',
        borderRadius: '12px',
        background: '#e5e7eb',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#6f8f87',
      }}>
        <Target size={18} />
      </div>
      <p style={{ fontSize: '14px', fontWeight: 500, color: '#6f8f87', margin: 0 }}>
        {titulos[prazo]}
      </p>
      <p style={{
        fontFamily: "'Lora', serif",
        fontStyle: 'italic',
        fontSize: '14px',
        color: '#6f8f87',
        lineHeight: '1.8',
        margin: 0,
        maxWidth: '280px',
      }}>
        {EMPTY_SUBTEXTO[prazo]}
      </p>
    </div>
  )
}

// ---------------------------------------------------------------------------
// ObjetivoModal
// ---------------------------------------------------------------------------

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
  editando, formTexto, onChangeTexto, formPilar, onChangePilar,
  formPrazo, onChangePrazo, formMotivo, onChangeMotivo, formDataAlvo,
  onChangeDataAlvo, formError, formLoading, onSalvar, onFechar,
}: ObjetivoModalProps) {
  return (
    <div
      onClick={(e) => { if (e.target === e.currentTarget) onFechar() }}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-5"
    >
      <div style={{
        background: '#fff',
        borderRadius: '16px',
        padding: '32px',
        width: '100%',
        maxWidth: '440px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
      }}>
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
                <button
                  key={p.value}
                  onClick={() => onChangePrazo(p.value)}
                  className={cn(
                    'px-3.5 py-1.5 text-sm font-medium rounded-lg border transition-colors',
                    formPrazo === p.value
                      ? 'bg-mt-green text-white border-mt-green'
                      : 'border-mt-border text-mt-muted hover:bg-gray-50'
                  )}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Label className="text-[11px] font-medium uppercase tracking-wide text-mt-muted">
              Pilar
            </Label>
            <div className="flex flex-wrap gap-2">
              {PILAR_OPTIONS.map((p) => (
                <button
                  key={p}
                  onClick={() => onChangePilar(p)}
                  className="px-3.5 py-1.5 text-sm font-medium rounded-full border transition-colors"
                  style={{
                    background: formPilar === p ? PILAR_COR[p] : 'transparent',
                    borderColor: formPilar === p ? PILAR_COR[p] : '#c8d8d2',
                    color: formPilar === p ? '#fff' : '#6f8f87',
                  }}
                >
                  {PILAR_LABEL[p]}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Label className="text-[11px] font-medium uppercase tracking-wide text-mt-muted">
              Data alvo <span className="text-[10px] font-normal normal-case tracking-normal">(opcional)</span>
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
              <span className="text-[10px] font-normal normal-case tracking-normal">(opcional)</span>
            </Label>
            <Textarea
              value={formMotivo}
              onChange={(e) => onChangeMotivo(e.target.value)}
              rows={2}
              placeholder="Escreva brevemente o motivo..."
              className="resize-none"
            />
          </div>

          {formError && <p className="text-sm text-mt-red">{formError}</p>}

          <div className="flex flex-col gap-2.5 pt-1">
            <Button
              onClick={onSalvar}
              disabled={formLoading}
              className="bg-mt-green text-white hover:bg-mt-green-dark disabled:opacity-60"
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
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Toast
// ---------------------------------------------------------------------------

function Toast({ mensagem, visivel }: { mensagem: string; visivel: boolean }) {
  return (
    <div
      style={{
        position: 'fixed',
        bottom: '28px',
        left: '50%',
        transform: visivel
          ? 'translateX(-50%) translateY(0)'
          : 'translateX(-50%) translateY(16px)',
        background: '#2A3F45',
        color: '#fff',
        fontFamily: "'DM Sans', sans-serif",
        fontSize: '13px',
        fontWeight: 500,
        padding: '10px 20px',
        borderRadius: '100px',
        boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
        whiteSpace: 'nowrap',
        zIndex: 200,
        opacity: visivel ? 1 : 0,
        transition: 'opacity 0.25s, transform 0.25s',
        pointerEvents: 'none',
      }}
    >
      {mensagem}
    </div>
  )
}
