import { Skeleton } from '@/components/ui/skeleton'

// Carregamento de /habitos/novo e /habitos/[id], no formato do FormularioHabito.
export function EsqueletoFormularioHabito() {
  return (
    <div className="mx-auto flex w-full max-w-xl flex-col px-5 pb-16 pt-8 sm:px-8">
      <Skeleton className="mb-titulo h-8 w-44" />
      <div className="mb-10 flex justify-center">
        <Skeleton className="size-[140px] rounded-full" />
      </div>
      <div className="flex flex-col gap-9">
        <Skeleton className="h-12 w-full" />
        <div className="grid grid-cols-5 gap-2">
          {Array.from({ length: 10 }, (_, i) => (
            <Skeleton key={i} className="aspect-square w-full" />
          ))}
        </div>
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-12 w-full rounded-full" />
      </div>
    </div>
  )
}
