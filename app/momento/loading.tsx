import { Skeleton } from '@/components/ui/skeleton'

export default function MomentoLoading() {
  return (
    <div className="min-h-screen py-8">
      <div className="mx-auto w-full max-w-2xl px-4 sm:px-6 flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <Skeleton className="h-7 w-56" />
          <Skeleton className="h-4 w-full max-w-[420px]" />
        </div>
        <div className="rounded-card bg-white px-7 py-7" style={{ border: '1px solid #e2ece8' }}>
          <Skeleton className="h-6 w-28 rounded-badge" />
          <Skeleton className="h-6 w-full mt-5" />
          <Skeleton className="h-6 w-2/3 mt-2" />
          <div className="flex justify-between mt-6">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-24" />
          </div>
        </div>
      </div>
    </div>
  )
}
