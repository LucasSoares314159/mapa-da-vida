import { Skeleton } from '@/components/ui/skeleton'

export default function ContentLoading() {
  return (
    <div className="mx-auto w-full max-w-2xl px-6 py-8 flex flex-col gap-4">
      {/* Cabeçalho da trilha */}
      <div className="card-mt flex flex-col gap-3 p-card">
        <div className="flex items-center justify-between">
          <Skeleton className="h-5 w-48" />
          <Skeleton className="h-5 w-5 rounded" />
        </div>
        <Skeleton className="h-3 w-32" />
        <Skeleton className="h-2 w-full rounded-full" />
      </div>

      {/* Itens de módulos */}
      {[0, 1, 2, 3, 4].map((i) => (
        <div key={i} className="card-mt flex items-center gap-4 px-card py-4">
          <Skeleton className="h-6 w-6 rounded-full shrink-0" />
          <div className="flex flex-col gap-2 flex-1">
            <Skeleton className="h-4 w-56" />
            <Skeleton className="h-3 w-16" />
          </div>
        </div>
      ))}

      {/* Seção materiais */}
      <div className="card-mt mt-2 flex flex-col gap-3 p-card">
        <div className="flex items-center justify-between">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-5 w-5 rounded" />
        </div>
      </div>

      {[0, 1].map((i) => (
        <div key={i} className="card-mt flex items-center gap-4 px-card py-4">
          <Skeleton className="h-6 w-6 rounded-full shrink-0" />
          <div className="flex flex-col gap-2 flex-1">
            <Skeleton className="h-4 w-48" />
            <Skeleton className="h-3 w-16" />
          </div>
        </div>
      ))}
    </div>
  )
}
