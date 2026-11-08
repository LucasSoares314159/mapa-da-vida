'use client'

import { useState, useCallback } from 'react'
import { salvarRotina, vincularRotina } from '@/app/actions/rotina'
import { calcularRotina, getZonaConfig } from '@/lib/rotina'
import type { InputRotina } from '@/lib/rotina'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

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
  const [horasTela, setHorasTela] = useState(defaultValues?.horasTela ?? 2)
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
    horasTela,
  })

  const zonaConfig = getZonaConfig(resultado.zona)

  const handleSalvar = useCallback(async () => {
    setIsSaving(true)
    const result = await salvarRotina(
      { horasSono, horasTrabalho, horasBasicas, diasTrabalho, horasTela },
      mapaId
    )

    setIsSaving(false)

    if ('success' in result || 'redirectTo' in result) {
      setSaveSuccess(true)
    }
  }, [horasSono, horasTrabalho, horasBasicas, diasTrabalho, horasTela, mapaId])

  const handleVincularMapa = useCallback(async () => {
    if (!selectedMapId) return

    setIsLinking(true)

    // garante que a rotina existe no banco antes de vincular
    await salvarRotina(
      { horasSono, horasTrabalho, horasBasicas, diasTrabalho, horasTela },
      selectedMapId
    )

    const result = await vincularRotina(selectedMapId)

    if ('success' in result || 'redirectTo' in result) {
      setLinkedMapId(selectedMapId)
      setSelectedMapId('')
      setSaveSuccess(true)
    }

    setIsLinking(false)
  }, [selectedMapId, horasSono, horasTrabalho, horasBasicas, diasTrabalho, horasTela])

  const sliderStyle = (value: number, min: number, max: number) => {
    const pct = ((value - min) / (max - min)) * 100
    return { background: `linear-gradient(to right, #57AA8F ${pct}%, #57AA8F ${pct}%, #3d5a62 ${pct}%)` }
  }

  const sliderStyleTela = (value: number) => {
    const pct = (value / 12) * 100
    const t = value / 12
    const r = Math.round(192 + (255 - 192) * t)
    const g = Math.round(80 * (1 - t))
    const b = Math.round(80 * (1 - t))
    return { background: `linear-gradient(to right, rgb(${r},${g},${b}) ${pct}%, #3d5a62 ${pct}%)` }
  }

  return (
    <div className="w-full min-h-screen bg-mt-green-dark font-sans">
      <div className="mx-auto max-w-[560px] px-4 py-8 flex flex-col gap-10">
        {/* Botão Dashboard */}
        <Link
          href="/dashboard"
          className="flex w-fit items-center gap-1.5 text-sm font-medium text-mt-off-white/80 transition-colors hover:text-mt-off-white"
        >
          <ArrowLeft className="size-4" />
          Dashboard
        </Link>

        {/* Intro */}
        <div className="flex flex-col gap-5">
          <span className="flex items-center gap-2 text-rotulo font-medium uppercase text-mt-green">
            <span className="inline-block w-5 h-[2px] bg-mt-green rounded" />
            Calculadora de Rotina
          </span>
          <h1 className="font-heading text-titulo font-medium text-mt-off-white">
            Antes de definir objetivos, veja quanto tempo você realmente tem.
          </h1>
        </div>

        {/* Inputs Section */}
        <div className="flex flex-col gap-6">
        <h2 className="font-sans text-rotulo font-medium uppercase text-mt-green">
          Ajuste para a sua realidade
        </h2>
        <div className="flex flex-col gap-0">
          {/* Horas de sono */}
          <div className="flex flex-col gap-2.5 pb-5 border-b border-mt-linha-escura">
            <div className="flex items-end justify-between">
              <label className="text-sm text-mt-off-white">Horas de sono por noite</label>
              <span className="font-heading font-medium text-base text-mt-green">{horasSono}h</span>
            </div>
            <input
              type="range"
              min="4"
              max="12"
              step="0.5"
              value={horasSono}
              onChange={(e) => setHorasSono(parseFloat(e.target.value))}
              style={sliderStyle(horasSono, 4, 12)}
              className="w-full h-1 rounded-lg appearance-none cursor-pointer"
            />
          </div>

          {/* Horas de trabalho */}
          <div className="flex flex-col gap-2.5 pb-5 border-b border-mt-linha-escura">
            <div className="flex items-end justify-between">
              <label className="text-sm text-mt-off-white">Horas de trabalho por dia</label>
              <span className="font-heading font-medium text-base text-mt-green">{horasTrabalho}h</span>
            </div>
            <input
              type="range"
              min="2"
              max="14"
              step="0.5"
              value={horasTrabalho}
              onChange={(e) => setHorasTrabalho(parseFloat(e.target.value))}
              style={sliderStyle(horasTrabalho, 2, 14)}
              className="w-full h-1 rounded-lg appearance-none cursor-pointer"
            />
          </div>

          {/* Necessidades básicas */}
          <div className="flex flex-col gap-2.5 pb-5 border-b border-mt-linha-escura">
            <div className="flex items-end justify-between">
              <div>
                <label className="text-sm text-mt-off-white">Necessidades básicas por dia</label>
                <p className="text-xs text-mt-off-white/70 mt-1">comer, higiene, casa, descanso, família</p>
              </div>
              <span className="font-heading font-medium text-base text-mt-green">{horasBasicas}h</span>
            </div>
            <input
              type="range"
              min="2"
              max="8"
              step="0.5"
              value={horasBasicas}
              onChange={(e) => setHorasBasicas(parseFloat(e.target.value))}
              style={sliderStyle(horasBasicas, 2, 8)}
              className="w-full h-1 rounded-lg appearance-none cursor-pointer"
            />
          </div>

          {/* Horas na tela */}
          <div className="flex flex-col gap-2.5 pb-5 border-b border-mt-linha-escura">
            <div className="flex items-end justify-between">
              <div>
                <label className="text-sm text-mt-off-white">Horas na tela por dia</label>
                <p className="text-xs text-mt-off-white/70 mt-1">redes sociais, jogos e entretenimento improdutivo</p>
              </div>
              <span className="font-heading font-medium text-base" style={{ color: horasTela === 0 ? '#a8c4bc' : `rgb(${Math.round(192 + (255 - 192) * horasTela / 12)},${Math.round(80 * (1 - horasTela / 12))},${Math.round(80 * (1 - horasTela / 12))})` }}>{horasTela}h</span>
            </div>
            <input
              type="range"
              min="0"
              max="12"
              step="0.5"
              value={horasTela}
              onChange={(e) => setHorasTela(parseFloat(e.target.value))}
              style={sliderStyleTela(horasTela)}
              className="w-full h-1 rounded-lg appearance-none cursor-pointer"
            />
          </div>

          {/* Dias de trabalho */}
          <div className="flex flex-col gap-2.5">
            <div className="flex items-end justify-between">
              <label className="text-sm text-mt-off-white">Dias de trabalho por semana</label>
              <span className="font-heading font-medium text-base text-mt-green">{diasTrabalho} dias</span>
            </div>
            <input
              type="range"
              min="1"
              max="7"
              step="1"
              value={diasTrabalho}
              onChange={(e) => setDiasTrabalho(parseInt(e.target.value))}
              style={sliderStyle(diasTrabalho, 1, 7)}
              className="w-full h-1 rounded-lg appearance-none cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* Resultado Section */}
      <div className="flex flex-col items-center gap-3 rounded-painel bg-black/20 p-painel">
        <div className="text-[72px] font-heading font-medium leading-none tracking-[-2px]"
             style={{ color: zonaConfig.percentualCor }}>
          {resultado.percentualLivre}%
        </div>
        <p className="text-sm text-mt-off-white/70 -mt-1">do seu tempo acordado está livre</p>
        <p className="text-base font-medium text-mt-off-white">
          ≈ {resultado.horasLivresSemana} horas livres por semana
        </p>
        <p className="text-xs text-mt-off-white/70 text-center leading-[1.6] max-w-[340px]">
          Calculado sobre as horas que você está acordado durante a jornada — descontando sono, trabalho e necessidades básicas.
        </p>
        <span
          className={`rounded-badge px-4 py-1.5 text-xs font-medium uppercase tracking-[1px] border ${zonaConfig.badgeClass}`}
          style={{ borderColor: zonaConfig.borderColor, color: zonaConfig.textColor }}
        >
          {zonaConfig.badgeLabel}
        </span>
        <p className="max-w-[380px] text-center font-editorial text-[15px] leading-[1.7] text-mt-off-white/80">
          {zonaConfig.descricao}
        </p>
        <div className="w-full border-t border-mt-linha-escura mt-1" />
        <div className="w-full grid grid-cols-[1fr_1px_1fr] pt-2">
          <div className="flex flex-col items-center gap-1 px-4">
            <div className="text-[32px] font-heading font-medium leading-none"
                 style={{ color: zonaConfig.percentualCor }}>
              {resultado.horasLivresDiaUtil}h
            </div>
            <div className="text-[13px] text-mt-off-white/70 mt-0.5">horas livres</div>
            <div className="mt-1.5 text-rotulo font-medium uppercase text-mt-off-white/70">Dia Útil</div>
          </div>
          <div className="bg-mt-linha-escura w-px self-stretch mx-auto" />
          <div className="flex flex-col items-center gap-1 px-4">
            <div className="text-[32px] font-heading font-medium leading-none"
                 style={{ color: zonaConfig.percentualCor }}>
              {resultado.horasLivresDiaFDS}h
            </div>
            <div className="text-[13px] text-mt-off-white/70 mt-0.5">horas livres</div>
            <div className="mt-1.5 text-rotulo font-medium uppercase text-mt-off-white/70">Fim de semana</div>
          </div>
        </div>
        </div>

        {/* Save Section */}
        <div className="flex flex-col gap-2.5">
        <Button
          onClick={handleSalvar}
          disabled={isSaving}
          size="lg" className="w-full focus-visible:outline-mt-off-white"
        >
          {isSaving ? 'Salvando...' : 'Salvar rotina'}
        </Button>
        <p className="text-xs text-mt-off-white/70 text-center">Você pode ajustar isso a qualquer momento</p>
        {saveSuccess && (
          <p className="text-center text-sm text-mt-green font-medium">
            ✓ Rotina salva com sucesso!
          </p>
        )}
        </div>

        {/* Link to Map Section - only show if not already linked to a map */}
        {!mapaId && !linkedMapId && mapas.length > 0 && (
        <div className="flex flex-col gap-3">
          <h2 className="font-heading text-titulo-card font-bold text-mt-off-white">
            Vincular a um mapa
          </h2>
          <p className="text-sm text-mt-off-white/70">
            Associe essa rotina a um diagnóstico para preservar o contexto temporal.
          </p>
          <div className="flex gap-3">
            <select
              value={selectedMapId}
              onChange={(e) => setSelectedMapId(e.target.value)}
              className="campo-escuro flex-1 bg-[#1e2f34]"
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
              className="focus-visible:outline-mt-off-white"
            >
              {isLinking ? 'Vinculando…' : 'Vincular'}
            </Button>
          </div>
        </div>
        )}

        {/* No maps message */}
        {!mapaId && !linkedMapId && mapas.length === 0 && (
        <div className="text-center">
          <p className="text-sm text-mt-off-white/70 mb-4">
            Você ainda não tem mapas. Crie seu primeiro diagnóstico para vincular a rotina.
          </p>
          <Link href="/mapa/preparacao">
            <Button className="focus-visible:outline-mt-off-white">
              Criar meu mapa →
            </Button>
          </Link>
        </div>
        )}

        {/* Linked confirmation */}
        {linkedMapId && (
        <div className="text-center">
          <p className="text-sm text-mt-green font-medium mb-4">
            ✓ Rotina vinculada ao mapa com sucesso!
          </p>
          <Link href={`/diagnostico/${linkedMapId}`}>
            <Button className="focus-visible:outline-mt-off-white">
              Ver diagnóstico →
            </Button>
          </Link>
        </div>
        )}

      </div>
    </div>
  )
}
