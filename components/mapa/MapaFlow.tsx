'use client'

import { useMemo } from 'react'
import { ReactFlow, Background, Controls, type Node, type Edge } from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import { PILARES } from '@/types'
import type { Mapa, Area, NomePilar, StatusArea } from '@/types'

const STYLE_ROOT: React.CSSProperties = {
  background: '#f8fafc',
  border: '2px solid #94a3b8',
  borderRadius: 14,
  padding: '10px 20px',
  fontSize: 15,
  fontWeight: 700,
  color: '#1e293b',
  minWidth: 160,
  textAlign: 'center',
}

const PILAR_COLORS: Record<NomePilar, { bg: string; border: string; text: string }> = {
  corpo: { bg: '#dbeafe', border: '#3b82f6', text: '#1e40af' },
  mente: { bg: '#f3e8ff', border: '#a855f7', text: '#6b21a8' },
  espirito: { bg: '#ffedd5', border: '#f97316', text: '#9a3412' },
}

const STATUS_COLORS: Record<StatusArea, { bg: string; border: string }> = {
  verde: { bg: '#dcfce7', border: '#22c55e' },
  amarelo: { bg: '#fef9c3', border: '#eab308' },
  vermelho: { bg: '#fee2e2', border: '#ef4444' },
}

const STATUS_EMOJI: Record<StatusArea, string> = {
  verde: '🟢',
  amarelo: '🟡',
  vermelho: '🔴',
}

function buildFlow(mapa: Mapa): { nodes: Node[]; edges: Edge[] } {
  const nodes: Node[] = []
  const edges: Edge[] = []
  const areaMap = new Map<string, Area>()

  for (const area of mapa.areas ?? []) {
    areaMap.set(area.area, area)
  }

  const PILAR_ORDER: NomePilar[] = ['corpo', 'mente', 'espirito']
  const PILAR_X = [0, 420, 840]
  const ROOT_X = 420
  const PILAR_Y = 130
  const AREA_Y = 300

  nodes.push({
    id: 'root',
    position: { x: ROOT_X - 80, y: 0 },
    data: { label: mapa.titulo || 'Mapa da Vida' },
    style: STYLE_ROOT,
    draggable: false,
  })

  PILAR_ORDER.forEach((pilar, pi) => {
    const pilarX = PILAR_X[pi]
    const pilarInfo = PILARES[pilar]
    const pilarColor = PILAR_COLORS[pilar]

    nodes.push({
      id: pilar,
      position: { x: pilarX - 60, y: PILAR_Y },
      data: { label: pilarInfo.label },
      style: {
        background: pilarColor.bg,
        border: `2px solid ${pilarColor.border}`,
        borderRadius: 12,
        padding: '8px 18px',
        fontSize: 13,
        fontWeight: 600,
        color: pilarColor.text,
        minWidth: 120,
        textAlign: 'center',
      } as React.CSSProperties,
      draggable: false,
    })

    edges.push({
      id: `root-${pilar}`,
      source: 'root',
      target: pilar,
      style: { stroke: pilarColor.border, strokeWidth: 2 },
    })

    pilarInfo.areas.forEach((areaNome, ai) => {
      const area = areaMap.get(areaNome)
      const status = area?.status ?? 'verde'
      const statusColor = STATUS_COLORS[status]
      const nodeId = `area-${areaNome}`
      const areaX = pilarX - 160 + ai * 160
      const labelLines = areaNome.split(' ')
      const labelText =
        labelLines.length > 2
          ? `${labelLines.slice(0, 2).join(' ')}\n${labelLines.slice(2).join(' ')}`
          : areaNome

      nodes.push({
        id: nodeId,
        position: { x: areaX - 55, y: AREA_Y },
        data: {
          label: (
            <div className="flex flex-col items-center gap-0.5">
              <span className="text-base leading-none">{STATUS_EMOJI[status]}</span>
              <span className="text-center text-[11px] font-medium leading-tight">{labelText}</span>
              {area?.observacao && (
                <span className="mt-0.5 max-w-[110px] truncate text-[9px] text-zinc-500">
                  {area.observacao}
                </span>
              )}
            </div>
          ),
        },
        style: {
          background: statusColor.bg,
          border: `2px solid ${statusColor.border}`,
          borderRadius: 10,
          padding: '8px 6px',
          minWidth: 110,
          textAlign: 'center',
        } as React.CSSProperties,
        draggable: false,
      })

      edges.push({
        id: `${pilar}-${nodeId}`,
        source: pilar,
        target: nodeId,
        style: { stroke: statusColor.border, strokeWidth: 1.5 },
      })
    })
  })

  return { nodes, edges }
}

type Props = {
  mapa: Mapa
  minimal?: boolean
}

export function MapaFlow({ mapa, minimal = false }: Props) {
  const { nodes, edges } = useMemo(() => buildFlow(mapa), [mapa])

  return (
    <div style={{ width: '100%', height: '100%' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        nodesDraggable={false}
        nodesConnectable={false}
        elementsSelectable={false}
        panOnScroll={!minimal}
        zoomOnScroll={false}
        proOptions={{ hideAttribution: true }}
      >
        {!minimal && <Background gap={24} color="#e2e8f0" />}
        {!minimal && <Controls showInteractive={false} />}
      </ReactFlow>
    </div>
  )
}
