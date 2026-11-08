'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Compass, Pencil, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Alerta } from '@/components/ui/alerta'
import { cn } from '@/lib/utils'
import { definirMomento } from '@/app/actions/momento'
import { ESTACOES, DURACOES } from '@/types'
import type { MomentoVida, EstacaoMomento, DuracaoMomento } from '@/types'

const ESTACAO_OPTIONS = ['semear', 'construir', 'consolidar', 'recuperar', 'transicao'] as const
const DURACAO_OPTIONS = ['3_meses', '6_meses', '1_ano'] as const

// Dias até a data de revisão (calendário, sem horário). Negativo = vencido.
function diasAteRevisao(dataRevisao: string): number {
  const msPorDia = 1000 * 60 * 60 * 24
  const hoje = new Date()
  const alvo = new Date(dataRevisao + 'T00:00:00')
  const hojeUTC = Date.UTC(hoje.getFullYear(), hoje.getMonth(), hoje.getDate())
  const alvoUTC = Date.UTC(alvo.getFullYear(), alvo.getMonth(), alvo.getDate())
  return Math.round((alvoUTC - hojeUTC) / msPorDia)
}

type Props = {
  momento: MomentoVida | null
}

export function MomentoVida({ momento }: Props) {
  // Se já existe momento, começa no modo "visualização"; senão, direto na captura.
  const [editando, setEditando] = useState(momento === null)

  return (
    <div className="min-h-screen py-8">
      <div className="mx-auto w-full max-w-2xl px-4 sm:px-6 flex flex-col gap-6">
        {/* Cabeçalho */}
        <div className="flex flex-col gap-2">
          <h1 className="font-heading text-titulo font-medium text-mt-green-dark">
            Meu Momento de Vida
          </h1>
          <p className="max-w-[520px] font-editorial text-[17px] leading-[1.6] text-mt-apoio">
            Antes dos objetivos, antes da rotina: qual é a fase que você está vivendo agora?
            Esse é o princípio que guia todo o resto.
          </p>
        </div>

        {editando ? (
          <CapturaMomento
            momentoAtual={momento}
            onCancelar={momento ? () => setEditando(false) : undefined}
            onSalvo={() => setEditando(false)}
          />
        ) : (
          momento && <MomentoDefinido momento={momento} onEditar={() => setEditando(true)} />
        )}
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// MomentoDefinido — estado de visualização quando já existe um momento
// ---------------------------------------------------------------------------

function MomentoDefinido({ momento, onEditar }: { momento: MomentoVida; onEditar: () => void }) {
  const est = ESTACOES[momento.estacao]
  const dias = diasAteRevisao(momento.data_revisao)
  const vencido = dias < 0
  const proximo = dias >= 0 && dias <= 14

  const revisaoLabel = vencido
    ? 'Passou da hora de revisar'
    : dias === 0
      ? 'Hora de revisar hoje'
      : dias === 1
        ? 'Revisar amanhã'
        : `Revisar em ${dias} dias`

  return (
    <div className="flex flex-col gap-4">
      {/* Card principal do momento */}
      <div className="card-mt flex flex-col gap-[18px] p-card-lg">
        {/* Estação — a cor vem da estação, por isso fica em style */}
        <div className="flex items-center gap-2.5">
          <span
            className="inline-flex items-center gap-[7px] rounded-full px-3 py-[5px] text-rotulo font-semibold uppercase text-white"
            style={{ background: est.cor }}
          >
            <span className="text-[14px]">{est.emoji}</span>
            {est.label}
          </span>
          <button
            onClick={onEditar}
            className="ml-auto flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium text-mt-apoio transition-colors hover:bg-mt-off-white hover:text-mt-green-dark"
          >
            <Pencil size={13} />
            Revisar momento
          </button>
        </div>

        {/* Frase — a declaração da pessoa. O destaque é peso + cor da estação,
            como o <em> dos títulos da LP, não itálico. */}
        <p className="font-editorial text-[22px] leading-[1.5] text-mt-black">
          Meu momento de vida é{' '}
          <span className="font-semibold" style={{ color: est.cor }}>
            {momento.frase}
          </span>
        </p>

        {/* Rodapé: duração + revisão */}
        <div className="flex flex-wrap items-center gap-2.5 border-t-linha border-mt-border pt-3.5 text-xs">
          <span className="flex items-center gap-[5px] text-mt-apoio">
            <Clock size={13} />
            Fase de {DURACOES[momento.duracao].label}
          </span>
          <span className={`ml-auto font-medium ${vencido || proximo ? 'text-[#8a6620]' : 'text-mt-apoio'}`}>
            {revisaoLabel}
          </span>
        </div>
      </div>

      {/* Nudge de revisão quando está perto ou passou */}
      {(vencido || proximo) && (
        <Alerta
          variante={vencido ? 'atencao' : 'info'}
          titulo={vencido ? 'Sua fase chegou ao fim' : 'Sua fase está chegando ao fim'}
        >
          {vencido
            ? 'Ainda é esse o seu momento — ou algo mudou? Vale parar um instante e revisar.'
            : 'Em breve vale a pena parar e perguntar: ainda é esse o seu momento?'}
        </Alerta>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// CapturaMomento — a captura guiada: estação → frase → duração
// ---------------------------------------------------------------------------

function CapturaMomento({
  momentoAtual,
  onCancelar,
  onSalvo,
}: {
  momentoAtual: MomentoVida | null
  onCancelar?: () => void
  onSalvo: () => void
}) {
  const router = useRouter()
  const [estacao, setEstacao] = useState<EstacaoMomento | null>(momentoAtual?.estacao ?? null)
  const [frase, setFrase] = useState(momentoAtual?.frase ?? '')
  const [duracao, setDuracao] = useState<DuracaoMomento | null>(momentoAtual?.duracao ?? null)
  const [loading, setLoading] = useState(false)
  const [erro, setErro] = useState<string | null>(null)

  async function handleSalvar() {
    if (!estacao) { setErro('Escolha a estação que representa a sua fase.'); return }
    if (!frase.trim()) { setErro('Escreva em uma frase qual é o seu momento.'); return }
    if (!duracao) { setErro('Escolha por quanto tempo esse momento deve durar.'); return }

    setLoading(true)
    setErro(null)
    const result = await definirMomento({ estacao, frase: frase.trim(), duracao })
    setLoading(false)

    if ('redirectTo' in result) { router.push(result.redirectTo); return }
    if ('error' in result) { setErro(result.error); return }
    // Sucesso: recarrega os dados do server (novo momento ativo) e volta pra visualização
    router.refresh()
    onSalvo()
  }

  return (
    <div className="flex flex-col gap-7">
      {/* Passo 1 — Estação */}
      <div className="flex flex-col gap-3">
        <StepLabel numero={1} texto="Em que estação da vida você está?" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {ESTACAO_OPTIONS.map((key) => {
            const est = ESTACOES[key]
            const ativa = estacao === key
            return (
              <button
                key={key}
                onClick={() => setEstacao(key)}
                className={cn(
                  'flex items-start gap-3 rounded-card px-4 py-3.5 text-left transition-[border-color,background-color]',
                  ativa ? 'border-[1.5px]' : 'border border-mt-border bg-white hover:border-mt-green'
                )}
                // Cor por estação: dado, não token — fica em style.
                style={ativa ? { borderColor: est.cor, background: `${est.cor}0F` } : undefined}
              >
                <span
                  className="flex size-[34px] shrink-0 items-center justify-center rounded-elemento text-[17px]"
                  style={{ background: `${est.cor}1A` }}
                >
                  {est.emoji}
                </span>
                <span className="flex flex-col gap-[3px]">
                  <span
                    className={cn('font-heading text-[15px] font-bold', !ativa && 'text-mt-green-dark')}
                    style={ativa ? { color: est.cor } : undefined}
                  >
                    {est.label}
                  </span>
                  <span className="text-[12px] text-mt-apoio leading-[1.45]">
                    {est.contexto}
                  </span>
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Passo 2 — Frase (aparece quando escolheu estação) */}
      {estacao && (
        <div className="flex flex-col gap-3">
          <StepLabel numero={2} texto="Descreva em uma frase o seu momento" />
          <div className="card-mt p-card">
            <p className="mb-2.5 font-editorial text-[17px] leading-[1.5] text-mt-black">
              Meu momento de vida é…
            </p>
            <Textarea
              value={frase}
              onChange={(e) => setFrase(e.target.value)}
              rows={2}
              maxLength={280}
              placeholder={ESTACOES[estacao].placeholder}
              className="resize-none"
            />
          </div>
        </div>
      )}

      {/* Passo 3 — Duração (aparece quando escreveu algo) */}
      {estacao && frase.trim().length > 0 && (
        <div className="flex flex-col gap-3">
          <StepLabel numero={3} texto="Por quanto tempo essa fase deve durar?" />
          <p className="-mt-1.5 text-[13px] text-mt-apoio">
            Quando esse tempo passar, a gente te lembra de revisitar seu momento.
          </p>
          <div className="flex flex-wrap gap-2.5">
            {DURACAO_OPTIONS.map((key) => {
              const d = DURACOES[key]
              const ativa = duracao === key
              return (
                <button
                  key={key}
                  onClick={() => setDuracao(key)}
                  className={cn(
                    'flex flex-1 min-w-[110px] flex-col items-center gap-0.5 rounded-elemento border px-4 py-3 transition-colors',
                    ativa
                      ? 'border-mt-green bg-mt-green text-white'
                      : 'border-mt-border bg-white text-mt-apoio hover:border-mt-green'
                  )}
                >
                  <span className="text-sm font-semibold">{d.label}</span>
                  <span className={cn('text-[11px]', ativa ? 'text-white/75' : 'text-mt-apoio')}>
                    {d.sublabel}
                  </span>
                </button>
              )
            })}
          </div>
        </div>
      )}

      {erro && <p className="text-sm text-mt-red">{erro}</p>}

      {/* Ações */}
      <div className="flex flex-col gap-2.5">
        <Button onClick={handleSalvar} disabled={loading}>
          <Compass size={16} />
          {loading ? 'Salvando…' : momentoAtual ? 'Atualizar meu momento' : 'Definir meu momento'}
        </Button>
        {onCancelar && (
          <Button variant="outline" onClick={onCancelar} disabled={loading}>
            Cancelar
          </Button>
        )}
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// StepLabel — rótulo numerado dos passos da captura
// ---------------------------------------------------------------------------

function StepLabel({ numero, texto }: { numero: number; texto: string }) {
  return (
    <div className="flex items-center gap-2.5">
      <span className="flex size-[26px] shrink-0 items-center justify-center rounded-full bg-mt-green font-heading text-[13px] font-bold text-white">
        {numero}
      </span>
      <span className="font-heading text-titulo-card font-bold text-mt-green-dark">{texto}</span>
    </div>
  )
}
