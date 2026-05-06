import { Skeleton } from '@/components/ui/skeleton'

export default function ObjetivosLoading() {
  return (
    <div className="min-h-screen py-8">
      <div className="mx-auto w-full max-w-2xl px-4 sm:px-6 flex flex-col gap-4">
        <Skeleton className="h-7 w-44" />
        <Skeleton className="h-3 w-56 -mt-2" />
        <div className="flex gap-1 rounded-[10px] border border-mt-border bg-white p-1">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="flex-1 h-12 rounded-lg" />
          ))}
        </div>
        {[0, 1, 2].map((i) => (
          <div key={i} className="rounded-card bg-white px-5 py-5" style={{ border: '1px solid #e2ece8' }}>
            <div className="flex items-start gap-3">
              <Skeleton className="size-[22px] rounded-full shrink-0 mt-0.5" />
              <div className="flex flex-col gap-2 flex-1">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <div className="flex gap-2 mt-1">
                  <Skeleton className="h-5 w-14 rounded-badge" />
                  <Skeleton className="h-5 w-20 rounded-badge" />
                </div>
              </div>
              <div className="flex gap-1 shrink-0">
                <Skeleton className="size-7 rounded-md" />
                <Skeleton className="size-7 rounded-md" />
              </div>
            </div>
          </div>
        ))}
        <Skeleton className="h-11 w-full rounded-[10px]" />
      </div>
    </div>
  )
}
