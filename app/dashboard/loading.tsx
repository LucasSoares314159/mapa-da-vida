import { CascaCarregando } from '@/components/CascaCarregando'
import { Skeleton } from '@/components/ui/skeleton'

function Esqueleto() {
  return (
    <div className="mx-auto w-full max-w-2xl px-6 py-8 flex flex-col gap-6">
      <Skeleton className="h-[88px] w-full rounded-xl" />
      <Skeleton className="h-14 w-full rounded-xl" />
      {[0, 1, 2].map((i) => (
        <div key={i} className="card-mt p-card-lg">
          <div className="flex items-center justify-between">
            <div className="flex flex-col gap-2">
              <Skeleton className="h-4 w-36" />
              <Skeleton className="h-3 w-24" />
            </div>
            <div className="flex items-center gap-2">
              <Skeleton className="h-7 w-10 rounded-badge" />
              <Skeleton className="h-7 w-10 rounded-badge" />
              <Skeleton className="h-7 w-10 rounded-badge" />
            </div>
          </div>
          <div className="mt-4 border-t-linha border-mt-border pt-3">
            <div className="flex gap-4">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-32" />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

export default function DashboardLoading() {
  return (
    <CascaCarregando titulo="Seus mapas">
      <Esqueleto />
    </CascaCarregando>
  )
}
