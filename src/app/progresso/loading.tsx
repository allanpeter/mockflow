export default function ProgressoLoading() {
  return (
    <div className="mx-auto max-w-3xl space-y-10 px-4 py-10 animate-pulse">
      <div className="space-y-1">
        <div className="h-7 w-48 rounded bg-muted" />
        <div className="h-4 w-72 rounded bg-muted" />
      </div>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        <div className="h-24 rounded-xl border bg-muted" />
        <div className="h-24 rounded-xl border bg-muted" />
        <div className="h-24 rounded-xl border bg-muted" />
      </div>
      <div className="h-32 rounded-xl border bg-muted" />
      <div className="space-y-4">
        <div className="h-5 w-44 rounded bg-muted" />
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-16 rounded-xl border bg-muted" />
        ))}
      </div>
    </div>
  )
}
