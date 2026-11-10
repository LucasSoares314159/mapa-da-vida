import {
  Apple,
  BookOpen,
  Briefcase,
  Droplet,
  Footprints,
  Heart,
  MessageCircle,
  Moon,
  PenLine,
  Wallet,
  type LucideIcon,
} from 'lucide-react'
import type { IconeHabito } from '@/types'

// Desenho de cada ícone do catálogo ICONES_HABITO (types/index.ts). O banco
// guarda só o id; trocar o desenho aqui não exige migração.
export const ICONE_HABITO: Record<IconeHabito, LucideIcon> = {
  caminhar: Footprints,
  agua: Droplet,
  alimentacao: Apple,
  sono: Moon,
  leitura: BookOpen,
  financas: Wallet,
  trabalho: Briefcase,
  conversa: MessageCircle,
  escrita: PenLine,
  cuidado: Heart,
}
