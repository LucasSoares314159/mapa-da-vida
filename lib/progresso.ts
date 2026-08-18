import { MODULOS } from './modulos'

/**
 * Ponte entre a UI e a tabela `progresso_aulas`.
 *
 * A interface trabalha com índices numéricos (posição do módulo na trilha), mas o
 * banco guarda `modulo_id` textual ('modulo-0'). Guardar texto evita que o
 * progresso de todo mundo se corrompa caso a ordem dos módulos mude algum dia —
 * um índice é posicional, um id é estável.
 */

export function indiceParaModuloId(indice: number): string | null {
  return MODULOS[indice]?.id ?? null
}

export function moduloIdParaIndice(moduloId: string): number {
  return MODULOS.findIndex((m) => m.id === moduloId)
}

/** Converte as linhas do banco nos índices que os componentes já esperam. */
export function linhasParaIndices(linhas: { modulo_id: string }[]): number[] {
  return linhas
    .map((l) => moduloIdParaIndice(l.modulo_id))
    .filter((i) => i >= 0)
    .sort((a, b) => a - b)
}
