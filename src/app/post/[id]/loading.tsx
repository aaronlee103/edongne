export default function Loading() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <div className="h-8 w-3/4 bg-gray-100 rounded animate-pulse mb-4" />
      <div className="h-4 w-1/3 bg-gray-100 rounded animate-pulse mb-8" />
      <div className="space-y-3">
        {[1,2,3,4,5,6,7,8].map(i => (
          <div key={i} className="h-4 bg-gray-100 rounded animate-pulse" style={{ width: `${85 + Math.random() * 15}%` }} />
        ))}
      </div>
    </div>
  )
}
