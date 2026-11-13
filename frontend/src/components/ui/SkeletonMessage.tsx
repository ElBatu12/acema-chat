export function SkeletonMessage({ own = false }: { own?: boolean }) {
  return (
    <div className={`flex ${own ? 'justify-end' : 'justify-start'} mb-3`}>
      <div className={`flex flex-col gap-1.5 ${own ? 'items-end' : 'items-start'}`}>
        {!own && <div className="h-3 w-20 rounded-full bg-gray-200 animate-pulse" />}
        <div className="h-10 w-48 rounded-2xl bg-gray-200 animate-pulse" />
        <div className="h-2.5 w-12 rounded-full bg-gray-100 animate-pulse" />
      </div>
    </div>
  )
}

export function SkeletonMessageList() {
  return (
    <div className="flex flex-col gap-1 p-4">
      <SkeletonMessage />
      <SkeletonMessage own />
      <SkeletonMessage />
      <SkeletonMessage />
      <SkeletonMessage own />
    </div>
  )
}
