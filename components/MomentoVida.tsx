'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Compass, Pencil, Clock } from 'lucide-react'
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
          <h1 className="font-heading text-2xl font-semibold text-mt-black">
            Meu Momento de Vida
          </h1>
          <p
            style={{
              fontFamily: "'Lora', serif",
              fontStyle: 'italic',
              fontSize: '15px',
              color: '#6f8f87',
              lineHeight: '1.7',
              margin: 0,
              maxWidth: '520px',
            }}
          >
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
      <div
        style={{
          background: '#fff',
          borderRadius: '16px',
          border: `1px solid ${est.cor}55`,
          borderLeft: `4px solid ${est.cor}`,
          padding: '28px',
          display: 'flex',
          flexDirection: 'column',
          gap: '18px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
        }}
      >
        {/* Estação */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '7px',
              padding: '5px 12px',
              borderRadius: '100px',
              fontSize: '12px',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              color: '#fff',
              background: est.cor,
            }}
          >
            <span style={{ fontSize: '14px' }}>{est.emoji}</span>
            {est.label}
          </span>
          <button
            onClick={onEditar}
            className="ml-auto flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium text-mt-muted transition-colors hover:bg-mt-off-white hover:text-mt-green-dark"
          >
            <Pencil size={13} />
            Revisar momento
          </button>
        </div>

        {/* Frase */}
        <p
          style={{
            fontFamily: "'Lora', serif",
            fontSize: '22px',
            lineHeight: '1.5',
            color: '#0C0F0F',
            margin: 0,
          }}
        >
          Meu momento de vida é <span style={{ fontStyle: 'italic', color: est.cor }}>{momento.frase}</span>
        </p>

        {/* Rodapé: duração + revisão */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            gap: '10px',
            paddingTop: '4px',
            borderTop: '0.5px solid #e2ece8',
          }}
        >
          <span style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '12px', color: '#6f8f87', marginTop: '14px' }}>
            <Clock size={13} />
            Fase de {DURACOES[momento.duracao].label}
          </span>
          <span
            style={{
              marginTop: '14px',
              marginLeft: 'auto',
              fontSize: '12px',
              fontWeight: 500,
              color: vencido || proximo ? '#b88a30' : '#6f8f87',
            }}
          >
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
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '12px',
                  padding: '14px 16px',
                  borderRadius: '14px',
                  border: ativa ? `1.5px solid ${est.cor}` : '1px solid #e2ece8',
                  background: ativa ? `${est.cor}0F` : '#fff',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'border-color 0.15s, background 0.15s',
                }}
              >
                <span
                  style={{
                    flexShrink: 0,
                    width: '34px',
                    height: '34px',
                    borderRadius: '10px',
                    background: `${est.cor}1A`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '17px',
                  }}
                >
                  {est.emoji}
                </span>
                <span style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                  <span style={{ fontSize: '14px', fontWeight: 600, color: ativa ? est.cor : '#0C0F0F' }}>
                    {est.label}
                  </span>
                  <span style={{ fontSize: '12px', color: '#6f8f87', lineHeight: '1.45' }}>
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
          <div
            style={{
              background: '#fff',
              borderRadius: '14px',
              border: '1px solid #e2ece8',
              padding: '18px',
            }}
          >
            <p style={{ fontFamily: "'Lora', serif", fontSize: '17px', color: '#0C0F0F', margin: '0 0 10px', lineHeight: 1.5 }}>
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
          <p style={{ fontSize: '12px', color: '#6f8f87', margin: '-6px 0 0' }}>
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
                    'flex flex-1 min-w-[110px] flex-col items-center gap-0.5 rounded-[12px] border px-4 py-3 transition-colors',
                    ativa
                      ? 'border-mt-green bg-mt-green text-white'
                      : 'border-mt-border bg-white text-mt-muted hover:border-mt-green'
                  )}
                >
                  <span className="text-sm font-semibold">{d.label}</span>
                  <span className={cn('text-[11px]', ativa ? 'text-white/75' : 'text-mt-muted')}>
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
        <button
          onClick={handleSalvar}
          disabled={loading}
          className="flex items-center justify-center gap-2 rounded-lg bg-mt-green px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-mt-green-dark disabled:opacity-60"
        >
          <Compass size={16} />
          {loading ? 'Salvando…' : momentoAtual ? 'Atualizar meu momento' : 'Definir meu momento'}
        </button>
        {onCancelar && (
          <button
            onClick={onCancelar}
            disabled={loading}
            className="rounded-lg border border-mt-border px-4 py-3 text-sm font-medium text-mt-muted transition-colors hover:border-mt-green hover:text-mt-green disabled:opacity-60"
          >
            Cancelar
          </button>
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
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
      <span
        style={{
          flexShrink: 0,
          width: '22px',
          height: '22px',
          borderRadius: '50%',
          background: '#EDF2EF',
          color: '#57AA8F',
          fontSize: '12px',
          fontWeight: 600,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {numero}
      </span>
      <span style={{ fontSize: '15px', fontWeight: 600, color: '#0C0F0F' }}>{texto}</span>
    </div>
  )
}
