'use client'

import { useState, useCallback } from 'react'
import { salvarRotina, vincularRotina } from '@/app/actions/rotina'
import { calcularRotina, getZonaConfig } from '@/lib/rotina'
import type { InputRotina, ResultadoRotina } from '@/lib/rotina'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Clock } from 'lucide-react'

type Mapa = {
  id: string
  titulo: string | null
  criado_em: string
}

type Props = {
  defaultValues?: InputRotina & { mapaId?: string }
  mapas?: Mapa[]
  mapaId?: string
}

export default function CalculadoraRotina({ defaultValues, mapas = [], mapaId }: Props) {
  const [horasSono, setHorasSono] = useState(defaultValues?.horasSono ?? 8)
  const [horasTrabalho, setHorasTrabalho] = useState(defaultValues?.horasTrabalho ?? 8)
  const [horasBasicas, setHorasBasicas] = useState(defaultValues?.horasBasicas ?? 4)
  const [diasTrabalho, setDiasTrabalho] = useState(defaultValues?.diasTrabalho ?? 5)
  const [isSaving, setIsSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [linkedMapId, setLinkedMapId] = useState<string | null>(null)
  const [isLinking, setIsLinking] = useState(false)
  const [selectedMapId, setSelectedMapId] = useState<string>('')

  const resultado = calcularRotina({
    horasSono,
    horasTrabalho,
    horasBasicas,
    diasTrabalho,
  })

  const zonaConfig = getZonaConfig(resultado.zona)

  const handleSalvar = useCallback(async () => {
    setIsSaving(true)
    const result = await salvarRotina(
      {
        horasSono,
        horasTrabalho,
        horasBasicas,
        diasTrabalho,
      },
      mapaId
    )

    if (!result || !('error' in result)) {
      setSaveSuccess(true)
      setIsSaving(false)
      return
    }

    setIsSaving(false)
  }, [horasSono, horasTrabalho, horasBasicas, diasTrabalho, mapaId])

  const handleVincularMapa = useCallback(async () => {
    if (!selectedMapId) return

    setIsLinking(true)
    const result = await vincularRotina(selectedMapId)

    if ('success' in result) {
      setLinkedMapId(selectedMapId)
      setSelectedMapId('')
    }

    setIsLinking(false)
  }, [selectedMapId])

  return (
    <div className="w-full min-h-screen bg-mt-off-white font-sans text-mt-green-dark">
      {/* Intro */}
      <section className="border-b border-mt-border px-6 py-12 sm:px-8 md:py-16">
        <div className="mx-auto max-w-2xl">
          <span className="inline-block text-[11px] font-semibold tracking-[0.09em] uppercase text-mt-green bg-[#E8F5F1] px-[14px] py-[5px] rounded-badge mb-6">
            Calculadora de Rotina
          </span>
          <h1 className="font-heading text-[clamp(28px,4vw,42px)] font-semibold leading-[1.15] mb-4">
            Quanto tempo você realmente tem?
          </h1>
          <p className="text-base leading-relaxed text-mt-muted italic font-editorial mb-2">
            "A maioria das pessoas sabe quanto dinheiro gasta. Mas ninguém sabe quanto tempo gasta até
            perder."
          </p>
          <p className="text-sm text-mt-muted">
            Essa calculadora transforma as horas da sua rotina em um número simples: o percentual de tempo
            livre que você realmente tem. Sem essa clareza, objetivos realistas viram pura ficção.
          </p>
        </div>
      </section>

      {/* Inputs Section */}
      <section className="border-b border-mt-border px-6 py-12 sm:px-8">
        <div className="mx-auto max-w-2xl space-y-8">
          <div>
            <div className="flex items-end justify-between mb-4">
              <label className="text-sm font-medium text-mt-green-dark">Horas de sono</label>
              <span className="text-lg font-semibold text-mt-green">{horasSono}h</span>
            </div>
            <input
              type="range"
              min="4"
              max="12"
              step="0.5"
              value={horasSono}
              onChange={(e) => setHorasSono(parseFloat(e.target.value))}
              className="w-full h-2 bg-mt-border rounded-lg appearance-none cursor-pointer accent-mt-green"
            />
          </div>

          <div>
            <div className="flex items-end justify-between mb-4">
              <label className="text-sm font-medium text-mt-green-dark">Horas de trabalho</label>
              <span className="text-lg font-semibold text-mt-green">{horasTrabalho}h</span>
            </div>
            <input
              type="range"
              min="2"
              max="14"
              step="0.5"
              value={horasTrabalho}
              onChange={(e) => setHorasTrabalho(parseFloat(e.target.value))}
              className="w-full h-2 bg-mt-border rounded-lg appearance-none cursor-pointer accent-mt-green"
            />
          </div>

          <div>
            <div className="flex items-end justify-between mb-4">
              <div>
                <label className="text-sm font-medium text-mt-green-dark">Necessidades básicas</label>
                <p className="text-xs text-mt-muted mt-1">
                  comer, higiene, casa, descanso, família
                </p>
              </div>
              <span className="text-lg font-semibold text-mt-green">{horasBasicas}h</span>
            </div>
            <input
              type="range"
              min="2"
              max="8"
              step="0.5"
              value={horasBasicas}
              onChange={(e) => setHorasBasicas(parseFloat(e.target.value))}
              className="w-full h-2 bg-mt-border rounded-lg appearance-none cursor-pointer accent-mt-green"
            />
          </div>

          <div>
            <div className="flex items-end justify-between mb-4">
              <label className="text-sm font-medium text-mt-green-dark">Dias de trabalho</label>
              <span className="text-lg font-semibold text-mt-green">{diasTrabalho}d</span>
            </div>
            <input
              type="range"
              min="1"
              max="7"
              step="1"
              value={diasTrabalho}
              onChange={(e) => setDiasTrabalho(parseInt(e.target.value))}
              className="w-full h-2 bg-mt-border rounded-lg appearance-none cursor-pointer accent-mt-green"
            />
          </div>
        </div>
      </section>

      {/* Resultado Section */}
      <section className="border-b border-mt-border px-6 py-12 sm:px-8">
        <div className="mx-auto max-w-2xl">
          <div className={`rounded-card p-8 ${zonaConfig.cor}`}>
            <div className="text-center mb-6">
              <div className="text-6xl font-bold font-heading text-mt-green-dark mb-2">
                {resultado.percentualLivre}%
              </div>
              <p className="text-sm font-medium text-mt-green-dark">da sua semana está livre</p>
              <p className="text-base font-medium text-mt-green-dark mt-3">
                ≈ <span className="font-semibold">{resultado.horasLivresSemana}</span> horas livres por semana
              </p>
            </div>

            <div className="flex justify-center mb-6">
              <span
                className={`inline-block text-xs font-semibold uppercase tracking-[0.09em] px-4 py-2 rounded-badge ${zonaConfig.textoCor} bg-white bg-opacity-40`}
              >
                {resultado.zona === 'privilegio' ? 'Zona de Privilégio' : 'Zona de Sacrifício'}
              </span>
            </div>

            <p className="text-center text-sm leading-relaxed text-mt-green-dark mb-6">
              {zonaConfig.descricao}
            </p>

            <div className="h-px bg-mt-border opacity-50 my-6" />

            <div className="grid grid-cols-2 gap-6">
              <div className="text-center">
                <p className="text-xs uppercase font-semibold text-mt-muted tracking-[0.09em] mb-2">
                  Dia útil
                </p>
                <p className="text-3xl font-bold font-heading text-mt-green-dark">
                  {resultado.horasLivresDiaUtil}h
                </p>
              </div>
              <div className="text-center border-l border-mt-border border-opacity-50">
                <p className="text-xs uppercase font-semibold text-mt-muted tracking-[0.09em] mb-2">
                  Fim de semana
                </p>
                <p className="text-3xl font-bold font-heading text-mt-green-dark">
                  {resultado.horasLivresDiaFDS}h
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Save Section */}
      <section className="border-b border-mt-border px-6 py-8 sm:px-8">
        <div className="mx-auto max-w-2xl flex gap-3">
          <Button
            onClick={handleSalvar}
            disabled={isSaving}
            className="flex-1 bg-mt-green hover:bg-mt-green-dark text-white font-medium h-12"
          >
            {isSaving ? 'Salvando...' : 'Salvar rotina'}
          </Button>
          {!mapaId && (
            <Link href="/dashboard" className="flex-1">
              <Button
                variant="outline"
                className="w-full border-mt-border text-mt-green-dark hover:bg-mt-off-white h-12"
              >
                Voltar
              </Button>
            </Link>
          )}
        </div>
        {saveSuccess && (
          <p className="text-center text-sm text-mt-green font-medium mt-3">
            ✓ Rotina salva com sucesso!
          </p>
        )}
      </section>

      {/* Link to Map Section - only show if not already linked to a map */}
      {!mapaId && !linkedMapId && mapas.length > 0 && (
        <section className="border-b border-mt-border px-6 py-8 sm:px-8">
          <div className="mx-auto max-w-2xl">
            <h2 className="text-lg font-semibold font-heading text-mt-green-dark mb-4">
              Vincular a um mapa
            </h2>
            <p className="text-sm text-mt-muted mb-4">
              Associe essa rotina a um diagnóstico para preservar o contexto temporal.
            </p>
            <div className="flex gap-3">
              <select
                value={selectedMapId}
                onChange={(e) => setSelectedMapId(e.target.value)}
                className="flex-1 px-4 py-2.5 border border-mt-border rounded-lg text-sm text-mt-green-dark focus:outline-none focus:ring-2 focus:ring-mt-green focus:border-transparent"
              >
                <option value="">Escolha um mapa...</option>
                {mapas.map((mapa) => (
                  <option key={mapa.id} value={mapa.id}>
                    {mapa.titulo || 'Mapa sem título'} — {new Date(mapa.criado_em).toLocaleDateString('pt-BR')}
                  </option>
                ))}
              </select>
              <Button
                onClick={handleVincularMapa}
                disabled={!selectedMapId || isLinking}
                className="bg-mt-green hover:bg-mt-green-dark text-white font-medium px-6"
              >
                {isLinking ? '...' : 'Vincular'}
              </Button>
            </div>
          </div>
        </section>
      )}

      {/* No maps message */}
      {!mapaId && !linkedMapId && mapas.length === 0 && (
        <section className="px-6 py-8 sm:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm text-mt-muted mb-4">
              Você ainda não tem mapas. Crie seu primeiro diagnóstico para vincular a rotina.
            </p>
            <Link href="/mapa/preparacao">
              <Button className="bg-mt-green hover:bg-mt-green-dark text-white font-medium">
                Criar meu mapa →
              </Button>
            </Link>
          </div>
        </section>
      )}

      {/* Linked confirmation */}
      {linkedMapId && (
        <section className="px-6 py-8 sm:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm text-mt-green font-medium mb-4">
              ✓ Rotina vinculada ao mapa com sucesso!
            </p>
            <Link href={`/diagnostico/${linkedMapId}`}>
              <Button className="bg-mt-green hover:bg-mt-green-dark text-white font-medium">
                Ver diagnóstico →
              </Button>
            </Link>
          </div>
        </section>
      )}

      {/* CTA */}
      {saveSuccess && mapaId && (
        <section className="px-6 py-8 sm:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <Link href={`/diagnostico/${mapaId}`}>
              <Button className="bg-mt-green hover:bg-mt-green-dark text-white font-medium w-full sm:w-auto">
                Continuar para diagnóstico →
              </Button>
            </Link>
          </div>
        </section>
      )}
    </div>
  )
}
