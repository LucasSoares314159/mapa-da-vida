import { Skeleton } from '@/components/ui/skeleton'

export default function LiveLoading() {
  return (
    <div className="mx-auto w-full max-w-3xl px-6 py-8">
      <div className="flex flex-col gap-6">
        {/* Cabeçalho com navegação */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex flex-col gap-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-6 w-72" />
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <Skeleton className="size-9 rounded-full" />
            <Skeleton className="size-9 rounded-full" />
          </div>
        </div>

        {/* Vídeo */}
        <Skeleton className="w-full rounded-xl" style={{ aspectRatio: '16/9' }} />

        {/* Materiais */}
        <div className="flex flex-col gap-3">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-4 w-56" />
        </div>
      </div>
    </div>
  )
}
