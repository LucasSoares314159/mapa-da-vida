import { Skeleton } from '@/components/ui/skeleton'

export default function MapaLoading() {
  return (
    <div className="flex flex-col h-screen">
      <header
        className="sticky top-0 z-50 bg-white shrink-0"
        style={{ borderBottom: '0.5px solid #c8d8d2', height: 52 }}
      >
        <div
          className="mx-auto grid max-w-5xl items-center px-5 h-full"
          style={{ gridTemplateColumns: '1fr auto 1fr' }}
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
