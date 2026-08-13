import { Skeleton } from '@/components/ui/skeleton'

export default function ModuloLoading() {
  return (
    <div className="flex flex-col">
      <div className="mx-auto w-full max-w-6xl px-6 py-8 pb-28">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-start">
          {/* Conteúdo principal */}
          <div className="flex flex-1 flex-col gap-6 min-w-0">
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

          {/* Sidebar de módulos */}
          <div
            className="hidden lg:flex h-fit w-[260px] shrink-0 flex-col rounded-xl overflow-hidden"
            style={{ border: '0.5px solid #c8d8d2' }}
          >
            <div className="px-5 py-4" style={{ backgroundColor: '#f0f7f5', borderBottom: '0.5px solid #c8d8d2' }}>
              <Skeleton className="h-4 w-20" />
            </div>
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="flex items-center gap-2.5 px-5 py-3"
                style={{ borderBottom: '0.5px solid #c8d8d2' }}
              >
                <Skeleton className="size-4 rounded-full shrink-0" />
                <Skeleton className="h-3.5 w-40" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Ação de conclusão — fixa no rodapé */}
      <div
        className="sticky bottom-0 flex justify-center px-6 py-4"
        style={{ backgroundColor: '#ffffff', borderTop: '0.5px solid #c8d8d2' }}
      >
        <Skeleton className="h-10 w-52 rounded-lg" />
      </div>
    </div>
  )
}
