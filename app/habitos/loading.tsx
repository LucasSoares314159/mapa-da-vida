import { CascaCarregando } from '@/components/CascaCarregando'
import { Skeleton } from '@/components/ui/skeleton'

// Sem este arquivo, o toque em "Hábitos" no menu deixava a tela anterior parada até
// o servidor responder, e o Next não tinha o que pré-carregar desta rota dinâmica.
export default function HabitosLoading() {
  return (
    <CascaCarregando titulo="Meus Hábitos">
      <div className="mx-auto flex w-full max-w-4xl flex-col px-5 pb-16 pt-8 sm:px-8">
        <div className="mb-6 flex flex-col gap-2">
          <Skeleton className="h-4 w-36" />
          <div className="flex items-baseline justify-between gap-3">
            <Skeleton className="h-8 w-24" />
            <Skeleton className="h-6 w-20" />
          </div>
        </div>
        <Skeleton className="h-[76px] w-full rounded-card" />
        <ul className="mt-10 grid grid-cols-2 justify-items-center gap-x-3 gap-y-9 sm:grid-cols-3 lg:grid-cols-4">
          {[0, 1, 2, 3].map((i) => (
            <li key={i} className="flex flex-col items-center gap-3">
              <Skeleton className="size-[140px] rounded-full" />
              <Skeleton className="h-4 w-20" />
            </li>
          ))}
        </ul>
      </div>
    </CascaCarregando>
  )
}
