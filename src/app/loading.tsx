export default function Loading() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <div className="rounded-xl bg-gray-100 aspect-[16/9] animate-pulse" />
          <div className="grid grid-cols-2 gap-4 mt-4">
            <div className="rounded-lg bg-gray-100 h-44 animate-pulse" />
            <div className="rounded-lg bg-gray-100 h-44 animate-pulse" />
          </div>
        </div>
        <div>
          <div className="h-6 w-24 bg-gray-100 rounded animate-pulse mb-4" />
          {[1,2,3,4,5].map(i => (
            <div key={i} className="flex gap-3 mb-4">
              <div className="w-6 h-5 bg-gray-100 rounded animate-pulse" />
              <div className="flex-1">
                <div className="h-4 bg-gray-100 rounded animate-pulse mb-2" />
                <div className="h-3 w-2/3 bg-gray-100 rounded animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
