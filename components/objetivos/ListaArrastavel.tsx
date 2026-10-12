'use client'

import { Reorder, useDragControls } from 'motion/react'
import { ObjetivoCard, type ObjetivoCardProps } from './ObjetivoCard'
import type { Objetivo } from '@/types'

type PropsCardCompartilhadas = Omit<ObjetivoCardProps, 'objetivo' | 'dragControls' | 'onMoverTeclado' | 'onEditar'>

export type ListaArrastavelProps = PropsCardCompartilhadas & {
  objetivos: Objetivo[]
  onReorder: (nova: Objetivo[]) => void
  onMoverTeclado: (id: string, direcao: -1 | 1) => void
  onEditar: (objetivo: Objetivo) => void
}

// Lista reordenável dos objetivos ativos. Vive em arquivo próprio porque é o
// único ponto da rota que importa `motion` — carregada por next/dynamic em
// ObjetivosLista, o Reorder (e o motor de animação inteiro) sai do First Load.
export default function ListaArrastavel({
  objetivos,
  onReorder,
  onMoverTeclado,
  onEditar,
  ...cardProps
}: ListaArrastavelProps) {
  return (
    <Reorder.Group
      axis="y"
      values={objetivos}
      onReorder={onReorder}
      className="flex list-none flex-col gap-3 p-0"
    >
      {objetivos.map((obj) => (
        <ItemArrastavel
          key={obj.id}
          objetivo={obj}
          onMoverTeclado={(dir) => onMoverTeclado(obj.id, dir)}
          onEditar={() => onEditar(obj)}
          {...cardProps}
        />
      ))}
    </Reorder.Group>
  )
}

// O Reorder.Item precisa dos dragControls criados no mesmo nível, para o handle
// do card poder iniciar o arraste.
function ItemArrastavel({
  objetivo,
  ...props
}: { objetivo: Objetivo } & Omit<ObjetivoCardProps, 'objetivo' | 'dragControls'>) {
  const controls = useDragControls()

  return (
    <Reorder.Item value={objetivo} dragListener={false} dragControls={controls} className="list-none">
      <ObjetivoCard objetivo={objetivo} dragControls={controls} {...props} />
    </Reorder.Item>
  )
}
