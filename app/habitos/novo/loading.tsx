import { CascaCarregando } from '@/components/CascaCarregando'
import { EsqueletoFormularioHabito } from '@/components/habitos/EsqueletoFormularioHabito'

export default function NovoHabitoLoading() {
  return (
    <CascaCarregando titulo="Meus Hábitos">
      <EsqueletoFormularioHabito />
    </CascaCarregando>
  )
}
