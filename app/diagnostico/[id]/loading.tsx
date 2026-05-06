import { Skeleton } from '@/components/ui/skeleton'

export default function DiagnosticoLoading() {
  return (
    <div className="mx-auto flex max-w-xl flex-col gap-4 px-6 py-8">
      <Skeleton className="h-4 w-20" />
      <div className="rounded-card bg-white px-9 py-8" style={{ border: '0.5px solid #c8d8d2' }}>
        <div className="flex flex-col gap-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>
      </div>
      <div className="flex items-center gap-2 rounded-card bg-white px-9 py-6" style={{ border: '0.5px solid #c8d8d2' }}>
        <Skeleton className="h-7 w-14 rounded-badge" />
        <Skeleton className="h-7 w-14 rounded-badge" />
        <Skeleton className="h-7 w-14 rounded-badge" />
      </div>
      <div className="flex flex-col gap-4 rounded-card bg-white px-9 py-6" style={{ border: '0.5px solid #c8d8d2' }}>
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
