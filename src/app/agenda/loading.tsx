export default function AgendaLoading() {
  return (
    <div className="mx-auto max-w-3xl space-y-10 px-4 py-10 animate-pulse">
      <div className="space-y-1">
        <div className="h-7 w-40 rounded bg-muted" />
        <div className="h-4 w-64 rounded bg-muted" />
      </div>
      <div className="space-y-4">
        <div className="h-5 w-36 rounded bg-muted" />
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-24 rounded-xl border bg-muted" />
        ))}
      </div>
    </div>
  )
}
