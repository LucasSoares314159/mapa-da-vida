'use client'

import { useMemo, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { ReactFlow, type Node, type Edge, type NodeMouseHandler } from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import { PILARES } from '@/types'
import type { Mapa, Area, NomePilar, StatusArea } from '@/types'

// Cores dos status — seguem o padrão das pills do questionário
const STATUS_STYLE: Record<StatusArea, { bg: string; border: string; ponto: string }> = {
  verde:    { bg: '#E8F5F1', border: '#57AA8F', ponto: '#57AA8F' },
  amarelo:  { bg: '#FBF5E6', border: '#D4A843', ponto: '#D4A843' },
  vermelho: { bg: '#FAECEC', border: '#C05050', ponto: '#C05050' },
}

// Dimensões dos nós
const NODE_W_ROOT  = 160
const NODE_W_PILAR = 120
const NODE_W_AREA  = 110
const ROOT_H  = 44
const PILAR_H = 38
const AREA_H  = 56

// Espaçamentos
const H_GAP_AREA   = 120  // gap horizontal entre nós de área
const V_ROOT_PILAR = 100  // vertical root → pilar
const V_PILAR_AREA = 100  // vertical pilar → área

type FlowEdge = Edge & { pathOptions?: { borderRadius: number } }

function buildFlow(mapa: Mapa): { nodes: Node[]; edges: FlowEdge[] } {
  const nodes: Node[] = []
  const edges: FlowEdge[] = []
  const areaMap = new Map<string, Area>()

  for (const area of mapa.areas ?? []) areaMap.set(area.area, area)

  const PILAR_ORDER: NomePilar[] = ['corpo', 'mente', 'espirito']
  const AREAS_PER_PILAR = 3
  const GROUP_W = AREAS_PER_PILAR * NODE_W_AREA + (AREAS_PER_PILAR - 1) * H_GAP_AREA
  const PILAR_GAP = 80
  const TOTAL_W = PILAR_ORDER.length * GROUP_W + (PILAR_ORDER.length - 1) * PILAR_GAP

  // Nó raiz
  nodes.push({
    id: 'root',
    position: { x: (TOTAL_W - NODE_W_ROOT) / 2, y: 0 },
    data: { label: mapa.titulo || 'Mapa da Vida' },
    style: {
      backgroundColor: '#2A3F45',
      border: 'none',
      borderRadius: 10,
      padding: '10px 20px',
      fontSize: 14,
      fontWeight: 600,
      color: '#EDF2EF',
      minWidth: NODE_W_ROOT,
      textAlign: 'center',
      height: ROOT_H,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    } as React.CSSProperties,
    draggable: false,
  })

  PILAR_ORDER.forEach((pilar, pi) => {
    const groupStartX = pi * (GROUP_W + PILAR_GAP)
    const pilarCenterX = groupStartX + GROUP_W / 2
    const pilarX = pilarCenterX - NODE_W_PILAR / 2
    const pilarY = ROOT_H + V_ROOT_PILAR

    // Nó de pilar
    nodes.push({
      id: pilar,
      position: { x: pilarX, y: pilarY },
      data: { label: PILARES[pilar].label },
      style: {
        backgroundColor: '#E8F5F1',
        border: '1px solid #57AA8F',
        borderRadius: 10,
        padding: '8px 16px',
        fontSize: 13,
        fontWeight: 600,
        color: '#2A3F45',
        minWidth: NODE_W_PILAR,
        textAlign: 'center',
        height: PILAR_H,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      } as React.CSSProperties,
      draggable: false,
    })

    edges.push({
      id: `root-${pilar}`,
      source: 'root',
      target: pilar,
      type: 'smoothstep',
      pathOptions: { borderRadius: 8 },
      style: { stroke: '#c8d8d2', strokeWidth: 1.5 },
    })

    const areaY = pilarY + PILAR_H + V_PILAR_AREA

    PILARES[pilar].areas.forEach((areaNome, ai) => {
      const area = areaMap.get(areaNome)
      const status = area?.status ?? 'verde'
      const s = STATUS_STYLE[status]
      const nodeId = `area-${areaNome}`
      const areaX = groupStartX + ai * (NODE_W_AREA + H_GAP_AREA)

      nodes.push({
        id: nodeId,
        position: { x: areaX, y: areaY },
        data: {
          label: (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 5,
              }}
            >
              <span
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  backgroundColor: s.ponto,
                  display: 'inline-block',
                  flexShrink: 0,
                }}
              />
              <span
                style={{
                  color: '#2A3F45',
                  fontSize: 11,
                  fontWeight: 500,
                  textAlign: 'center',
                  lineHeight: 1.3,
                }}
              >
                {areaNome}
              </span>
            </div>
          ),
        },
        style: {
          backgroundColor: s.bg,
          border: `1.5px solid ${s.border}`,
          borderRadius: 8,
          padding: '8px 6px',
          minWidth: NODE_W_AREA,
          width: NODE_W_AREA,
          height: AREA_H,
          textAlign: 'center',
          cursor: 'pointer',
        } as React.CSSProperties,
        draggable: false,
      })

      edges.push({
        id: `${pilar}-${nodeId}`,
        source: pilar,
        target: nodeId,
        type: 'smoothstep',
        pathOptions: { borderRadius: 8 },
        style: { stroke: '#c8d8d2', strokeWidth: 1.5 },
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
  const router = useRouter()
  const { nodes, edges } = useMemo(() => buildFlow(mapa), [mapa])

  // Clique em nó de área redireciona para diagnóstico
  const onNodeClick: NodeMouseHandler = useCallback(
    (_event, node) => {
      if (node.id.startsWith('area-')) {
        router.push(`/diagnostico/${mapa.id}`)
      }
    },
    [router, mapa.id]
  )

  return (
    <div style={{ width: '100%', height: '100%' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        fitView
        fitViewOptions={{ padding: 0.15 }}
        nodesDraggable={false}
        nodesConnectable={false}
        elementsSelectable={false}
        panOnScroll={false}
        zoomOnScroll={false}
        proOptions={{ hideAttribution: true }}
        onNodeClick={onNodeClick}
      />
    </div>
  )
}
