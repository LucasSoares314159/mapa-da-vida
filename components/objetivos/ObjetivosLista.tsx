'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import { Target, Plus } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  criarObjetivo,
  atualizarStatusObjetivo,
  arquivarObjetivo,
  editarObjetivo,
  definirRitmoObjetivo,
  reordenarObjetivos,
} from '@/app/actions/objetivos'
import { MomentoDestaque } from '@/components/MomentoDestaque'
import { Alerta } from '@/components/ui/alerta'
import { ObjetivoCard } from './ObjetivoCard'
import {
  ObjetivoModal,
  FORM_VAZIO,
  formDeObjetivo,
  type FormObjetivo,
} from './ObjetivoModal'
import { validarPrazoComData, PRAZO_LABEL, PRAZO_SUBLABEL } from '@/lib/prazo'
import type {
  Objetivo,
  PrazoObjetivo,
  StatusObjetivo,
  MomentoVida,
  RitmoObjetivo,
} from '@/types'

/**
 * A lista reordenável entra sob demanda: `Reorder` arrasta o motor de animação do
 * `motion` inteiro (~59 kB) para o First Load de uma rota que antes não o usava.
 * Mesmo motivo do MapaFlow em RevelacaoMapa.
 *
 * O fallback renderiza os mesmos cards sem handle, então a lista aparece de
 * imediato e só o arraste chega um instante depois.
 */
const ListaArrastavel = dynamic(() => import('./ListaArrastavel'), {
  ssr: false,
  loading: () => null,
})

const PRAZOS: PrazoObjetivo[] = ['curto', 'medio', 'longo']

const EMPTY_SUBTEXTO: Record<PrazoObjetivo, string> = {
  curto: 'O que você quer mudar nos próximos 90 dias?',
  medio: 'O que você quer construir até o fim do ano?',
  longo: 'Onde você quer estar daqui a 1–3 anos?',
}

// Janela para agrupar arrastos seguidos numa única gravação: mover três cards em
// sequência vira uma chamada, não três.
const DEBOUNCE_ORDEM_MS = 600

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
  momento: MomentoVida | null
}

export function ObjetivosLista({ objetivos: objs, percentualLivre, zona, momento }: Props) {
  const router = useRouter()
  const [tabAtiva, setTabAtiva] = useState<PrazoObjetivo>('curto')
  const [lista, setLista] = useState<Objetivo[]>(objs)

  const [modalAberto, setModalAberto] = useState(false)
  const [etapaModal, setEtapaModal] = useState<'objetivo' | 'radar'>('objetivo')
  const [editandoObjetivo, setEditandoObjetivo] = useState<Objetivo | null>(null)
  const [form, setForm] = useState<FormObjetivo>(FORM_VAZIO)
  const [formLoading, setFormLoading] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  const [toast, setToast] = useState<{ mensagem: string; visivel: boolean }>({ mensagem: '', visivel: false })
  const [processingId, setProcessingId] = useState<string | null>(null)
  // Banner de Zona Sacrifício: dispensável durante a sessão (reaparece ao recarregar
  // enquanto a rotina continuar no limite).
  const [alertaSacrificioFechado, setAlertaSacrificioFechado] = useState(false)

  // Estado de antes do PRIMEIRO arrasto da rajada, para o rollback não restaurar
  // um passo intermediário quando a pessoa move vários cards em sequência.
  const listaAntesDoArrasto = useRef<Objetivo[] | null>(null)
  const timerOrdem = useRef<ReturnType<typeof setTimeout> | null>(null)
  // A gravação pendente fica num ref para poder ser disparada no desmonte: sem
  // isso, arrastar e sair da página na mesma janela do debounce perderia a ordem.
  const gravarOrdemPendente = useRef<(() => void) | null>(null)

  useEffect(() => () => {
    if (timerOrdem.current) {
      clearTimeout(timerOrdem.current)
      gravarOrdemPendente.current?.()
    }
  }, [])

  const porPrazo = useCallback(
    (prazo: PrazoObjetivo) => lista.filter((o) => o.prazo === prazo),
    [lista]
  )

  // Badge conta ativos + pausados (não concluídos nem arquivados)
  const contarAtivos = (prazo: PrazoObjetivo) =>
    porPrazo(prazo).filter((o) => o.status === 'ativo' || o.status === 'pausado').length

  // Concluídos afundam para o fim da aba: o foco fica em quem ainda exige ação,
  // sem esconder a conquista.
  const daAba = porPrazo(tabAtiva)
  const ativos = useMemo(() => daAba.filter((o) => o.status !== 'concluido'), [daAba])
  const concluidos = useMemo(() => daAba.filter((o) => o.status === 'concluido'), [daAba])

  function mostrarToast(mensagem: string) {
    setToast({ mensagem, visivel: true })
    setTimeout(() => setToast((t) => ({ ...t, visivel: false })), 2800)
  }

  function alterarForm<K extends keyof FormObjetivo>(campo: K, valor: FormObjetivo[K]) {
    setForm((f) => ({ ...f, [campo]: valor }))
  }

  function handleAbrirModal(prazo: PrazoObjetivo, objetivo?: Objetivo) {
    if (objetivo) {
      setEditandoObjetivo(objetivo)
      setForm(formDeObjetivo(objetivo))
    } else {
      setEditandoObjetivo(null)
      setForm({ ...FORM_VAZIO, prazo })
    }
    setFormError(null)
    setEtapaModal('objetivo')
    setModalAberto(true)
  }

  function handleFecharModal() {
    setModalAberto(false)
    setEditandoObjetivo(null)
    setFormError(null)
  }

  function handleAvancarParaRadar() {
    if (!form.texto.trim()) {
      setFormError('Descreva o objetivo com clareza.')
      return
    }
    if (!form.dataAlvo) {
      setFormError('Defina uma data alvo.')
      return
    }
    const erroPrazo = validarPrazoComData(form.prazo, form.dataAlvo)
    if (erroPrazo) {
      setFormError(erroPrazo)
      return
    }
    if (!form.frequencia) {
      setFormError('Escolha a frequência de lembrete.')
      return
    }
    setFormError(null)
    setEtapaModal('radar')
  }

  async function handleSalvarObjetivo() {
    if (!form.frequencia) {
      setFormError('Escolha a frequência de lembrete.')
      return
    }
    if (form.radarFazSentido === null || form.radarPorMim === null) {
      setFormError('Responda as duas perguntas antes de salvar.')
      return
    }
    setFormLoading(true)
    setFormError(null)
    try {
      const dados = {
        texto: form.texto.trim(),
        pilar: form.pilar,
        prazo: form.prazo,
        data_alvo: form.dataAlvo,
        frequencia_lembrete: form.frequencia,
        motivo: form.motivo.trim() || null,
        radar_faz_sentido: form.radarFazSentido,
        radar_por_mim: form.radarPorMim,
      }

      const result = editandoObjetivo
        ? await editarObjetivo(editandoObjetivo.id, dados)
        : await criarObjetivo(dados)

      if ('redirectTo' in result) { router.push(result.redirectTo); return }
      if ('error' in result) { setFormError(result.error); return }
      if ('data' in result) {
        setLista((prev) =>
          editandoObjetivo
            ? prev.map((o) => (o.id === editandoObjetivo.id ? result.data : o))
            : [result.data, ...prev.map((o) =>
                // O servidor empurrou os da mesma aba uma posição para baixo;
                // o estado local acompanha para a ordem não divergir até o reload.
                o.prazo === result.data.prazo && typeof o.ordem === 'number'
                  ? { ...o, ordem: o.ordem + 1 }
                  : o
              )]
        )
        // Mudou de prazo na edição: leva a pessoa para a aba onde o card foi parar.
        if (editandoObjetivo && result.data.prazo !== editandoObjetivo.prazo) {
          setTabAtiva(result.data.prazo)
        }
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
    mostrarToast(
      novoStatus === 'concluido'
        ? '🎯 Objetivo concluído. Bom trabalho.'
        : '↩︎ Objetivo retomado. Sem julgamento.'
    )
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

  async function handleDefinirRitmo(id: string, ritmo: RitmoObjetivo) {
    const original = lista.find((o) => o.id === id)
    if (!original) return
    setLista((prev) => prev.map((o) => (o.id === id ? { ...o, ritmo } : o)))
    const result = await definirRitmoObjetivo(id, ritmo)
    if ('redirectTo' in result) { router.push(result.redirectTo); return }
    if ('error' in result) {
      setLista((prev) => prev.map((o) => (o.id === id ? original : o)))
      mostrarToast('Erro ao atualizar o ritmo.')
    }
  }

  // Reordenação: o estado local muda na hora e a gravação é agrupada por debounce.
  function handleReorder(novaOrdemAtivos: Objetivo[]) {
    const ids = novaOrdemAtivos.map((o) => o.id)
    // A aba é capturada AGORA, não no disparo do timer: trocar de aba antes do
    // debounce vencer gravaria esses ids sob o prazo errado.
    const prazoDestes = tabAtiva
    const idsConcluidos = concluidos.map((o) => o.id)

    if (!listaAntesDoArrasto.current) listaAntesDoArrasto.current = lista

    setLista((prev) => {
      const fora = prev.filter((o) => !ids.includes(o.id))
      const reordenados = novaOrdemAtivos.map((o, i) => ({ ...o, ordem: i }))
      return [...reordenados, ...fora]
    })

    const gravar = async () => {
      const rollback = listaAntesDoArrasto.current
      listaAntesDoArrasto.current = null
      gravarOrdemPendente.current = null
      timerOrdem.current = null

      // Concluídos entram no fim da sequência salva, para não brigar com os ativos
      // na próxima leitura do servidor.
      const result = await reordenarObjetivos(prazoDestes, [...ids, ...idsConcluidos])
      if ('redirectTo' in result) { router.push(result.redirectTo); return }
      if ('error' in result) {
        if (rollback) setLista(rollback)
        mostrarToast(result.error)
      }
    }

    if (timerOrdem.current) clearTimeout(timerOrdem.current)
    gravarOrdemPendente.current = gravar
    timerOrdem.current = setTimeout(gravar, DEBOUNCE_ORDEM_MS)
  }

  // Reordenar sem mouse: DnD só com ponteiro exclui quem navega por teclado.
  function moverPorTeclado(id: string, direcao: -1 | 1) {
    const indice = ativos.findIndex((o) => o.id === id)
    const destino = indice + direcao
    if (indice === -1 || destino < 0 || destino >= ativos.length) return
    const copia = [...ativos]
    const [item] = copia.splice(indice, 1)
    copia.splice(destino, 0, item)
    handleReorder(copia)
  }

  return (
    <div className="min-h-screen py-8">
      <div className="mx-auto flex w-full max-w-2xl flex-col gap-4 px-4 sm:px-6">
        {/* Meta — o título vem do AuthLayout */}
        <p className="text-xs font-medium text-mt-muted">
          Mapa de {getMesAtual()} · {getZonaLabel(zona)} · {percentualLivre}% livre
        </p>

        {/* Momento de Vida — contexto que guia os objetivos, em faixa compacta */}
        <MomentoDestaque momento={momento} />

        {/* Tabs por prazo */}
        <div className="flex gap-1 rounded-[10px] border border-mt-border bg-white p-1">
          {PRAZOS.map((pz) => {
            const count = contarAtivos(pz)
            const ativa = tabAtiva === pz

            return (
              <button
                key={pz}
                onClick={() => {
                  // Grava a ordem pendente antes de sair da aba: o debounce desta
                  // aba não deve atravessar para a próxima.
                  if (timerOrdem.current) {
                    clearTimeout(timerOrdem.current)
                    gravarOrdemPendente.current?.()
                  }
                  setTabAtiva(pz)
                }}
                aria-pressed={ativa}
                className={cn(
                  'flex flex-1 flex-col items-center justify-center gap-0.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                  ativa
                    ? 'bg-mt-green text-white'
                    : 'bg-transparent text-mt-muted hover:bg-mt-green/10 hover:text-mt-green-dark'
                )}
              >
                <span className="flex items-center gap-1 text-xs uppercase tracking-wide">
                  {PRAZO_LABEL[pz]}
                  <span
                    className={cn(
                      'inline-flex items-center justify-center rounded-badge px-[5px] py-px text-[9px] font-medium leading-normal',
                      ativa ? 'bg-white/20 text-white' : 'bg-black/[0.08]'
                    )}
                  >
                    {count}
                  </span>
                </span>
                <span className={cn('text-[10px] font-normal', ativa ? 'text-white/70' : 'text-mt-muted')}>
                  {PRAZO_SUBLABEL[pz]}
                </span>
              </button>
            )
          })}
        </div>

        {/* Banner Zona Sacrifício — abaixo das tabs, dispensável */}
        {zona === 'sacrificio' && !alertaSacrificioFechado && (
          <Alerta
            variante="atencao"
            titulo="Sua rotina já está no limite"
            onFechar={() => setAlertaSacrificioFechado(true)}
          >
            Antes de adicionar um objetivo novo, considere o que você vai remover.
          </Alerta>
        )}

        <div className="flex flex-col gap-3">
          {daAba.length === 0 && <EmptyState prazo={tabAtiva} />}

          {/* Ativos e pausados: arrastáveis */}
          {ativos.length > 0 && (
            <ListaArrastavel
              objetivos={ativos}
              onReorder={handleReorder}
              onMoverTeclado={moverPorTeclado}
              processingId={processingId}
              onConcluir={handleConcluir}
              onPausar={handlePausar}
              onRetomar={handleRetomar}
              onEditar={(obj) => handleAbrirModal(obj.prazo, obj)}
              onArquivar={handleArquivar}
              onDefinirRitmo={handleDefinirRitmo}
            />
          )}

          {/* Concluídos: afundados no fim, fora da reordenação */}
          {concluidos.length > 0 && (
            <>
              <div className="flex items-center gap-3 pt-1">
                <span className="h-px flex-1 bg-mt-border" />
                <span className="text-[11px] font-medium uppercase tracking-wide text-mt-muted">
                  Concluídos ({concluidos.length})
                </span>
                <span className="h-px flex-1 bg-mt-border" />
              </div>
              {concluidos.map((obj) => (
                <ObjetivoCard
                  key={obj.id}
                  objetivo={obj}
                  processingId={processingId}
                  onConcluir={handleConcluir}
                  onPausar={handlePausar}
                  onRetomar={handleRetomar}
                  onEditar={() => handleAbrirModal(obj.prazo, obj)}
                  onArquivar={handleArquivar}
                  onDefinirRitmo={handleDefinirRitmo}
                />
              ))}
            </>
          )}

          {/* Botão adicionar — sempre visível */}
          <button
            onClick={() => handleAbrirModal(tabAtiva)}
            className="flex w-full items-center justify-center gap-1.5 rounded-[10px] border border-dashed border-mt-border bg-transparent px-6 py-3 text-sm font-medium text-mt-muted transition-colors hover:border-solid hover:border-mt-green hover:text-mt-green"
          >
            <Plus size={15} />
            Adicionar objetivo
          </button>
        </div>
      </div>

      <ObjetivoModal
        aberto={modalAberto}
        momento={momento}
        editando={editandoObjetivo}
        etapa={etapaModal}
        form={form}
        onChange={alterarForm}
        erro={formError}
        carregando={formLoading}
        onAvancar={handleAvancarParaRadar}
        onVoltar={() => { setFormError(null); setEtapaModal('objetivo') }}
        onSalvar={handleSalvarObjetivo}
        onFechar={handleFecharModal}
      />

      <Toast mensagem={toast.mensagem} visivel={toast.visivel} />
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
    <div className="flex flex-col items-center gap-2.5 rounded-card border-[0.5px] border-mt-border bg-white px-6 py-10 text-center shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
      <div className="flex size-10 items-center justify-center rounded-xl bg-gray-200 text-mt-muted">
        <Target size={18} />
      </div>
      <p className="m-0 text-sm font-medium text-mt-muted">{titulos[prazo]}</p>
      <p className="m-0 max-w-[280px] font-editorial text-sm italic leading-loose text-mt-muted">
        {EMPTY_SUBTEXTO[prazo]}
      </p>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Toast
// ---------------------------------------------------------------------------

function Toast({ mensagem, visivel }: { mensagem: string; visivel: boolean }) {
  return (
    <div
      role="status"
      aria-live="polite"
      className="pointer-events-none fixed bottom-7 left-1/2 z-[200] whitespace-nowrap rounded-badge bg-mt-green-dark px-5 py-2.5 text-[13px] font-medium text-white shadow-[0_4px_16px_rgba(0,0,0,0.15)] transition-[opacity,transform] duration-200"
      style={{
        transform: visivel ? 'translateX(-50%) translateY(0)' : 'translateX(-50%) translateY(16px)',
        opacity: visivel ? 1 : 0,
      }}
    >
      {mensagem}
    </div>
  )
}
