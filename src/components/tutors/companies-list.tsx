import { BriefcaseBusiness } from 'lucide-react'
import type { Company } from '@/types/supabase'

export function CompaniesList({ companies }: Readonly<{ companies: Company[] }>) {
  if (!companies?.length) return null

  return (
    <ul className="space-y-2">
      {companies.map((c, i) => (
        <li key={`${c.name}-${i}`} className="flex items-center gap-2 text-sm">
          <BriefcaseBusiness className="h-4 w-4 shrink-0 text-muted-foreground" />
          <span className="font-medium">{c.name}</span>
          {c.role && <span className="text-muted-foreground">· {c.role}</span>}
          {c.current && (
            <span className="rounded-full bg-success/15 px-2 py-0.5 text-xs font-medium text-success">
              Atual
            </span>
          )}
        </li>
      ))}
    </ul>
  )
}
