'use client'

import { useMemo } from 'react'
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import type { Mapa, StatusArea } from '@/types'

/**
 * Cores das séries.
 *
 * São versões mais saturadas da paleta MindTrail (mt-green/yellow/red), porque
 * as originais foram calibradas para preenchimentos grandes (pills, cards) e
 * ficam abaixo do piso de croma quando aplicadas a uma linha de 2px — o verde
 * chega a ler como cinza. Estas passam nas checagens de contraste e de
 * separação para daltonismo; a UI segue usando a paleta original.
 */
const COR_SERIE: Record<StatusArea, string> = {
  verde: '#268C6B',
  amarelo: '#C08A1E',
  vermelho: '#B03A3A',
}

const SERIES: { chave: StatusArea; label: string }[] = [
  { chave: 'verde', label: 'Estou bem' },
  { chave: 'amarelo', label: 'Precisa de atenção' },
  { chave: 'vermelho', label: 'Mudança urgente' },
]

const TOTAL_AREAS = 9

type Ponto = {
  data: string
  verde: number
  amarelo: number
  vermelho: number
}

type Props = {
  mapas: Mapa[]
}

/**
 * Evolução do balanço do mapa ao longo do tempo: quantas áreas em cada status,
 * mapa a mapa. As três séries somam sempre nove.
 */
export function EvolucaoMapas({ mapas }: Props) {
  const pontos = useMemo<Ponto[]>(() => {
    // O dashboard entrega do mais recente para o mais antigo; o eixo do tempo
    // precisa da ordem inversa.
    return [...mapas]
      .sort((a, b) => new Date(a.criado_em).getTime() - new Date(b.criado_em).getTime())
      .map((mapa) => {
        const totais: Record<StatusArea, number> = { verde: 0, amarelo: 0, vermelho: 0 }
        for (const area of mapa.areas ?? []) totais[area.status]++

        return {
          data: new Date(mapa.criado_em).toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: 'short',
          }),
          ...totais,
        }
      })
  }, [mapas])

  // Com um único mapa não há trajetória para mostrar.
  if (pontos.length < 2) return null

  const primeiro = pontos[0]
  const ultimo = pontos[pontos.length - 1]
  const deltaVerde = ultimo.verde - primeiro.verde
  const deltaVermelho = ultimo.vermelho - primeiro.vermelho

  return (
    <div className="flex flex-col gap-5 rounded-card bg-white px-7 py-6" style={{ border: '0.5px solid #c8d8d2' }}>
      <div className="flex flex-col gap-1">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Sua evolução
        </h2>
        <p className="text-sm text-mt-green-dark">{montarResumo(deltaVerde, deltaVermelho)}</p>
      </div>

      {/* Legenda: identidade nunca fica só na cor */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
        {SERIES.map(({ chave, label }) => (
          <span key={chave} className="flex items-center gap-1.5 text-xs text-mt-green-dark">
            <span
              className="inline-block shrink-0 rounded-full"
              style={{ width: 8, height: 8, backgroundColor: COR_SERIE[chave] }}
            />
            {label}
          </span>
        ))}
      </div>

      <div style={{ width: '100%', height: 220 }}>
        <ResponsiveContainer>
          <LineChart data={pontos} margin={{ top: 8, right: 12, bottom: 4, left: -22 }}>
            <CartesianGrid stroke="#e8f0ed" vertical={false} />
            <XAxis
              dataKey="data"
              tick={{ fontSize: 11, fill: '#6f8f87' }}
              tickLine={false}
              axisLine={{ stroke: '#e8f0ed' }}
            />
            <YAxis
              domain={[0, TOTAL_AREAS]}
              ticks={[0, 3, 6, 9]}
              tick={{ fontSize: 11, fill: '#6f8f87' }}
              tickLine={false}
              axisLine={false}
              width={40}
            />
            <Tooltip
              contentStyle={{
                borderRadius: 10,
                border: '0.5px solid #c8d8d2',
                fontSize: 13,
                boxShadow: '0 4px 12px rgba(42,63,69,0.08)',
              }}
              labelStyle={{ color: '#2A3F45', fontWeight: 600, marginBottom: 4 }}
              formatter={(valor, nome) => {
                const n = Number(valor)
                return [`${n} ${n === 1 ? 'área' : 'áreas'}`, String(nome)]
              }}
            />
            {SERIES.map(({ chave, label }) => (
              <Line
                key={chave}
                type="monotone"
                dataKey={chave}
                name={label}
                stroke={COR_SERIE[chave]}
                strokeWidth={2}
                dot={{ r: 4, strokeWidth: 2, stroke: '#fff', fill: COR_SERIE[chave] }}
                activeDot={{ r: 6, strokeWidth: 2, stroke: '#fff' }}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

/** Resume a trajetória entre o primeiro e o último mapa, sem inflar o resultado. */
function montarResumo(deltaVerde: number, deltaVermelho: number): string {
  if (deltaVerde > 0 && deltaVermelho < 0) {
    return `Desde o primeiro mapa, você ganhou ${contar(deltaVerde, 'área')} no verde e reduziu ${contar(Math.abs(deltaVermelho), 'área')} no vermelho.`
  }
  if (deltaVerde > 0) {
    return `Desde o primeiro mapa, você ganhou ${contar(deltaVerde, 'área')} no verde.`
  }
  if (deltaVermelho < 0) {
    return `Desde o primeiro mapa, o vermelho caiu em ${contar(Math.abs(deltaVermelho), 'área')}.`
  }
  if (deltaVerde < 0 || deltaVermelho > 0) {
    return 'O balanço do seu mapa piorou desde o primeiro. Vale olhar quais áreas mudaram.'
  }
  return 'O balanço geral segue o mesmo desde o primeiro mapa.'
}

function contar(n: number, substantivo: string): string {
  return `${n} ${n === 1 ? substantivo : `${substantivo}s`}`
}
