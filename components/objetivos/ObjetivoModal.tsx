'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { cn } from '@/lib/utils'
import { PRAZO_LABEL } from '@/lib/prazo'
import { ESTACOES } from '@/types'
import type {
  Objetivo,
  PrazoObjetivo,
  NomePilar,
  FrequenciaLembrete,
  MomentoVida,
} from '@/types'

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

const PRAZOS: PrazoObjetivo[] = ['curto', 'medio', 'longo']
const PILARES_OPCOES: NomePilar[] = ['corpo', 'mente', 'espirito']

const FREQUENCIAS: { value: FrequenciaLembrete; label: string }[] = [
  { value: 'semanal', label: 'Semanal' },
  { value: 'quinzenal', label: 'Quinzenal' },
  { value: 'mensal', label: 'Mensal' },
]

// Estado do formulário num objeto único: antes eram 9 useState no container e
// 24 props atravessando o modal até as etapas.
export type FormObjetivo = {
  texto: string
  pilar: NomePilar
  prazo: PrazoObjetivo
  motivo: string
  dataAlvo: string
  frequencia: FrequenciaLembrete | null
  radarFazSentido: boolean | null
  radarPorMim: boolean | null
}

export const FORM_VAZIO: FormObjetivo = {
  texto: '',
  pilar: 'corpo',
  prazo: 'curto',
  motivo: '',
  dataAlvo: '',
  frequencia: null,
  radarFazSentido: null,
  radarPorMim: null,
}

export function formDeObjetivo(o: Objetivo): FormObjetivo {
  return {
    texto: o.texto,
    pilar: o.pilar,
    prazo: o.prazo,
    motivo: o.motivo || '',
    dataAlvo: o.data_alvo || '',
    frequencia: o.frequencia_lembrete || null,
    radarFazSentido: o.radar_faz_sentido ?? null,
    radarPorMim: o.radar_por_mim ?? null,
  }
}

type Props = {
  aberto: boolean
  momento: MomentoVida | null
  editando: Objetivo | null
  etapa: 'objetivo' | 'radar'
  form: FormObjetivo
  onChange: <K extends keyof FormObjetivo>(campo: K, valor: FormObjetivo[K]) => void
  erro: string | null
  carregando: boolean
  onAvancar: () => void
  onVoltar: () => void
  onSalvar: () => void
  onFechar: () => void
}

export function ObjetivoModal({
  aberto, momento, editando, etapa, form, onChange,
  erro, carregando, onAvancar, onVoltar, onSalvar, onFechar,
}: Props) {
  return (
    <Dialog open={aberto} onOpenChange={(v) => { if (!v) onFechar() }}>
      <DialogContent>
        {etapa === 'objetivo' ? (
          <div className="flex flex-col gap-5 overflow-y-auto p-6">
            <DialogHeader>
              <DialogTitle>{editando ? 'Editar objetivo' : 'Novo objetivo'}</DialogTitle>
            </DialogHeader>

            <div className="flex flex-col gap-2">
              <Label className="text-[11px] font-medium uppercase tracking-wide text-mt-muted">
                O que você quer alcançar?
              </Label>
              <Textarea
                value={form.texto}
                onChange={(e) => onChange('texto', e.target.value)}
                rows={3}
                placeholder="Descreva o objetivo com clareza..."
                className="resize-none"
                autoFocus
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label className="text-[11px] font-medium uppercase tracking-wide text-mt-muted">
                Prazo
              </Label>
              <div className="flex flex-wrap gap-2">
                {PRAZOS.map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => onChange('prazo', p)}
                    className={cn(
                      'rounded-lg border px-3.5 py-1.5 text-sm font-medium transition-colors',
                      form.prazo === p
                        ? 'border-mt-green bg-mt-green text-white'
                        : 'border-mt-border text-mt-muted hover:bg-gray-50'
                    )}
                  >
                    {PRAZO_LABEL[p]}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <Label className="text-[11px] font-medium uppercase tracking-wide text-mt-muted">
                Pilar
              </Label>
              <div className="flex flex-wrap gap-2">
                {PILARES_OPCOES.map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => onChange('pilar', p)}
                    className="rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors"
                    style={{
                      background: form.pilar === p ? PILAR_COR[p] : 'transparent',
                      borderColor: form.pilar === p ? PILAR_COR[p] : '#c8d8d2',
                      color: form.pilar === p ? '#fff' : '#6f8f87',
                    }}
                  >
                    {PILAR_LABEL[p]}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <Label className="text-[11px] font-medium uppercase tracking-wide text-mt-muted">
                Data alvo
              </Label>
              <Input
                type="date"
                value={form.dataAlvo}
                onChange={(e) => onChange('dataAlvo', e.target.value)}
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label className="text-[11px] font-medium uppercase tracking-wide text-mt-muted">
                Frequência de lembrete
              </Label>
              <div className="flex flex-wrap gap-2">
                {FREQUENCIAS.map((f) => (
                  <button
                    key={f.value}
                    type="button"
                    onClick={() => onChange('frequencia', f.value)}
                    className={cn(
                      'rounded-lg border px-3.5 py-1.5 text-sm font-medium transition-colors',
                      form.frequencia === f.value
                        ? 'border-mt-green bg-mt-green text-white'
                        : 'border-mt-border text-mt-muted hover:bg-gray-50'
                    )}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <Label className="text-[11px] font-medium uppercase tracking-wide text-mt-muted">
                Por que esse objetivo importa para você?{' '}
                <span className="text-[10px] font-normal normal-case tracking-normal">(opcional)</span>
              </Label>
              <Textarea
                value={form.motivo}
                onChange={(e) => onChange('motivo', e.target.value)}
                rows={2}
                placeholder="Escreva brevemente o motivo..."
                className="resize-none"
              />
            </div>

            {erro && <p className="text-sm text-mt-red">{erro}</p>}

            <DialogFooter>
              <Button onClick={onAvancar} className="bg-mt-green text-white hover:bg-mt-green-dark">
                Continuar
              </Button>
              <Button
                onClick={onFechar}
                variant="outline"
                className="border-mt-border text-mt-muted hover:border-mt-green hover:bg-transparent hover:text-mt-green"
              >
                Cancelar
              </Button>
            </DialogFooter>
          </div>
        ) : (
          <EtapaRadar
            momento={momento}
            editando={editando}
            form={form}
            onChange={onChange}
            erro={erro}
            carregando={carregando}
            onVoltar={onVoltar}
            onSalvar={onSalvar}
          />
        )}
      </DialogContent>
    </Dialog>
  )
}

// Etapa 2: a pausa reflexiva antes de salvar.
function EtapaRadar({
  momento, editando, form, onChange, erro, carregando, onVoltar, onSalvar,
}: Pick<Props, 'momento' | 'editando' | 'form' | 'onChange' | 'erro' | 'carregando' | 'onVoltar' | 'onSalvar'>) {
  const est = momento ? ESTACOES[momento.estacao] : null
  const podeSalvar = form.radarFazSentido !== null && form.radarPorMim !== null

  return (
    <div className="flex flex-col gap-6 overflow-y-auto p-6">
      <DialogHeader>
        <DialogTitle className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wide text-mt-muted">
          <span aria-hidden>▶</span> Radar de Coerência
        </DialogTitle>
        <DialogDescription className="font-editorial text-[13px] italic leading-normal text-mt-muted">
          Antes de salvar, uma pausa. Responda com honestidade.
        </DialogDescription>
      </DialogHeader>

      {est && momento && (
        <div
          className="flex items-center gap-2.5 rounded-[10px] px-3 py-2.5"
          style={{ background: `${est.cor}14`, border: `1px solid ${est.cor}40` }}
        >
          <span
            aria-hidden
            className="flex size-7 shrink-0 items-center justify-center rounded-lg text-sm"
            style={{ background: est.cor, boxShadow: `0 2px 6px ${est.cor}55` }}
          >
            {est.emoji}
          </span>
          <p className="m-0 text-[12.5px] leading-snug" style={{ color: '#4a5f59' }}>
            Seu momento é{' '}
            <span className="font-editorial italic font-medium" style={{ color: est.cor }}>
              {momento.frase}
            </span>
          </p>
        </div>
      )}

      <div className="flex flex-col gap-3">
        <Label className="text-base font-medium text-mt-black">
          Esse objetivo faz sentido com o meu momento de vida?
        </Label>
        <div className="flex gap-2">
          {[{ value: true, label: 'Sim' }, { value: false, label: 'Não' }].map((opt) => (
            <button
              key={String(opt.value)}
              type="button"
              onClick={() => onChange('radarFazSentido', opt.value)}
              className={cn(
                'flex-1 rounded-lg border px-4 py-3 text-sm font-medium transition-colors',
                form.radarFazSentido === opt.value
                  ? 'border-mt-green bg-mt-green text-white'
                  : 'border-mt-border text-mt-muted hover:bg-gray-50'
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <Label className="text-base font-medium text-mt-black">
          Estou fazendo isso por mim ou para outras pessoas?
        </Label>
        <div className="flex flex-wrap gap-2">
          {[{ value: true, label: 'Por mim' }, { value: false, label: 'Para outras pessoas' }].map((opt) => (
            <button
              key={String(opt.value)}
              type="button"
              onClick={() => onChange('radarPorMim', opt.value)}
              className={cn(
                'flex-1 rounded-lg border px-4 py-3 text-sm font-medium transition-colors',
                form.radarPorMim === opt.value
                  ? 'border-mt-green bg-mt-green text-white'
                  : 'border-mt-border text-mt-muted hover:bg-gray-50'
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <p className="m-0 text-center font-editorial text-[13px] italic text-mt-muted">
        A comparação é a ladra da alegria.
      </p>

      {erro && <p className="text-sm text-mt-red">{erro}</p>}

      <DialogFooter>
        <Button
          onClick={onSalvar}
          disabled={carregando || !podeSalvar}
          className="bg-mt-green text-white hover:bg-mt-green-dark disabled:opacity-60"
        >
          {carregando ? 'Salvando...' : editando ? 'Atualizar objetivo' : 'Salvar objetivo'}
        </Button>
        <Button
          onClick={onVoltar}
          variant="outline"
          className="border-mt-border text-mt-muted hover:border-mt-green hover:bg-transparent hover:text-mt-green"
        >
          Voltar
        </Button>
      </DialogFooter>
    </div>
  )
}
