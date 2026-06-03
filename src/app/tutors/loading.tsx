export default function TutorsLoading() {
  return (
    <div className="mx-auto max-w-6xl space-y-8 px-4 py-10 animate-pulse">
      <div className="space-y-1">
        <div className="h-9 w-48 rounded bg-muted" />
        <div className="h-5 w-80 rounded bg-muted" />
      </div>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="h-64 rounded-xl border bg-muted" />
        ))}
      </div>
    </div>
  )
}
