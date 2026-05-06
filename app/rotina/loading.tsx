import { Skeleton } from '@/components/ui/skeleton'

export default function RotinaLoading() {
  return (
    <div className="w-full min-h-screen bg-[#2A3F45]">
      <div className="mx-auto max-w-[560px] px-4 py-8 flex flex-col gap-10">
        <Skeleton className="h-4 w-24 bg-[#3d5a62]" />
        <div className="flex flex-col gap-4">
          <Skeleton className="h-3 w-40 bg-[#3d5a62]" />
          <Skeleton className="h-8 w-full bg-[#3d5a62]" />
          <Skeleton className="h-8 w-4/5 bg-[#3d5a62]" />
        </div>
        <div className="flex flex-col gap-0">
          {[0, 1, 2, 3, 4].map((i) => (
            <div key={i} className="flex flex-col gap-2.5 pb-5 border-b border-[#3d5a62] last:border-0 last:pb-0">
              <div className="flex items-end justify-between">
                <Skeleton className="h-4 w-48 bg-[#3d5a62]" />
                <Skeleton className="h-5 w-10 bg-[#3d5a62]" />
              </div>
              <Skeleton className="h-1 w-full rounded-lg bg-[#3d5a62]" />
            </div>
          ))}
        </div>
        <Skeleton className="h-64 w-full rounded-2xl bg-[#3d5a62]" />
        <Skeleton className="h-12 w-full rounded-[10px] bg-[#3d5a62]" />
      </div>
    </div>
  )
}
