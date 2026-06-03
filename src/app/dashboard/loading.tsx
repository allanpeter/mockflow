export default function DashboardLoading() {
  return (
    <div className="mx-auto max-w-3xl space-y-8 px-4 py-10 animate-pulse">
      <div className="space-y-2">
        <div className="h-4 w-32 rounded bg-muted" />
        <div className="h-7 w-48 rounded bg-muted" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="h-24 rounded-xl border bg-muted" />
        <div className="h-24 rounded-xl border bg-muted" />
      </div>
      <div>
        <div className="mb-4 h-4 w-36 rounded bg-muted" />
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="h-36 rounded-xl border bg-muted" />
          <div className="h-36 rounded-xl border bg-muted" />
          <div className="h-36 rounded-xl border bg-muted" />
          <div className="h-36 rounded-xl border bg-muted" />
        </div>
      </div>
    </div>
  )
}
