import { CascaCarregando } from '@/components/CascaCarregando'
import { Skeleton } from '@/components/ui/skeleton'

function Esqueleto() {
  return (
    <div className="mx-auto flex max-w-xl flex-col gap-4 px-6 py-8">
      <Skeleton className="h-4 w-20" />
      <div className="card-mt p-card-lg">
        <div className="flex flex-col gap-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>
      </div>
      <div className="card-mt flex items-center gap-2 p-card-lg">
        <Skeleton className="h-7 w-14 rounded-badge" />
        <Skeleton className="h-7 w-14 rounded-badge" />
        <Skeleton className="h-7 w-14 rounded-badge" />
      </div>
      <div className="card-mt flex flex-col gap-4 p-card-lg">
        <Skeleton className="h-3 w-28" />
        {[0, 1].map((i) => (
          <div key={i} className="flex flex-col gap-1.5">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-4/5" />
          </div>
        ))}
      </div>
      <Skeleton className="h-48 w-full rounded-card" />
    </div>
  )
}

export default function DiagnosticoLoading() {
  return (
    <CascaCarregando titulo="Diagnóstico Completo">
      <Esqueleto />
    </CascaCarregando>
  )
}
