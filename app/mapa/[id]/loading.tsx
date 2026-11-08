import { Skeleton } from '@/components/ui/skeleton'

export default function MapaLoading() {
  return (
    <div className="flex flex-col h-screen">
      <header
        className="sticky top-0 z-50 h-[52px] shrink-0 border-b-linha border-mt-border bg-white"
      >
        <div
          className="mx-auto grid h-full max-w-5xl grid-cols-[1fr_auto_1fr] items-center px-5"
        >
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-5 w-32" />
          <div className="flex justify-end gap-3">
            <Skeleton className="h-8 w-24 rounded-lg" />
            <Skeleton className="h-8 w-28 rounded-lg" />
          </div>
        </div>
      </header>
      <div className="flex-1 bg-mt-off-white">
        <Skeleton className="w-full h-full rounded-none" />
      </div>
    </div>
  )
}
