import { CascaCarregando } from '@/components/CascaCarregando'
import { Skeleton } from '@/components/ui/skeleton'

export default function ProgressoLoading() {
  return (
    <CascaCarregando titulo="Meus Hábitos">
      <div className="mx-auto flex w-full max-w-3xl flex-col px-5 pb-16 pt-6 sm:px-8">
        <Skeleton className="mb-4 h-5 w-16" />
        <Skeleton className="mb-titulo h-8 w-48" />
        <div className="flex flex-col gap-pilha">
          <Skeleton className="h-40 w-full rounded-painel" />
          <Skeleton className="h-24 w-full rounded-card" />
          <div className="card-mt flex flex-col gap-2 p-card">
            {[0, 1, 2, 3, 4].map((i) => (
              <div key={i} className="grid grid-cols-7 gap-2">
                {[0, 1, 2, 3, 4, 5, 6].map((d) => (
                  <Skeleton key={d} className="aspect-square w-full" />
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </CascaCarregando>
  )
}
