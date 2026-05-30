import { CheckCircle2, Circle, Zap } from 'lucide-react'
import type { Database } from '@/types/supabase'

type TutorProfileRow = Database['public']['Tables']['tutor_profiles']['Row']

const checks: { label: string; description: string; done: (p: TutorProfileRow, hasAvatar: boolean) => boolean }[] = [
  {
    label: 'Foto de perfil',
    description: 'Perfis com foto recebem 3× mais cliques.',
    done: (_p, hasAvatar) => hasAvatar,
  },
  {
    label: 'Bio profissional',
    description: 'Mínimo 50 caracteres.',
    done: (p) => (p.bio?.length ?? 0) >= 50,
  },
  {
    label: 'Título (headline)',
    description: 'Ex: "Eng. Sênior @ Nubank, ex-iFood".',
    done: (p) => !!p.headline,
  },
  {
    label: 'Vídeo de apresentação',
    description: 'Tutores com vídeo convertem muito mais.',
    done: (p) => !!p.intro_video_url,
  },
  {
    label: 'Empresa atual',
    description: 'Candidatos valorizam experiência em empresas conhecidas.',
    done: (p) => Array.isArray(p.companies) && (p.companies as { name: string }[]).some((c) => c.name),
  },
  {
    label: 'Stack de tecnologias',
    description: 'Pelo menos 1 tecnologia.',
    done: (p) => (p.tech_stack?.length ?? 0) > 0,
  },
  {
    label: 'Formatos de entrevista',
    description: 'Coding, System Design, Behavioral…',
    done: (p) => (p.interview_formats?.length ?? 0) > 0,
  },
  {
    label: 'Idiomas',
    description: 'Candidatos filtram por idioma.',
    done: (p) => (p.languages?.length ?? 0) > 0,
  },
]

export function ProfileCompleteness({
  profile,
  hasAvatar,
}: Readonly<{ profile: TutorProfileRow; hasAvatar: boolean }>) {
  const results = checks.map((c) => ({ ...c, done: c.done(profile, hasAvatar) }))
  const completed = results.filter((r) => r.done).length
  const pct = Math.round((completed / results.length) * 100)
  const isFull = completed === results.length

  return (
    <div className="rounded-xl border bg-card p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Zap className="h-5 w-5 text-primary" />
          <h2 className="font-semibold">Completude do perfil</h2>
        </div>
        <span className={`text-2xl font-bold ${isFull ? 'text-success' : 'text-primary'}`}>
          {pct}%
        </span>
      </div>

      {/* Progress bar */}
      <div className="h-2 overflow-hidden rounded-full bg-muted">
        <div
          className={`h-full rounded-full transition-all ${isFull ? 'bg-success' : 'bg-primary'}`}
          style={{ width: `${pct}%` }}
        />
      </div>

      {isFull ? (
        <p className="text-sm text-success font-medium">
          Perfil completo! Você está maximizando suas chances de agendamento.
        </p>
      ) : (
        <p className="text-sm text-muted-foreground">
          Preencha os itens abaixo para aparecer mais para candidatos.
        </p>
      )}

      <ul className="space-y-2">
        {results.map((item) => (
          <li key={item.label} className="flex items-start gap-3 text-sm">
            {item.done ? (
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-success" />
            ) : (
              <Circle className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground/40" />
            )}
            <div>
              <span className={item.done ? 'font-medium line-through text-muted-foreground' : 'font-medium'}>
                {item.label}
              </span>
              {!item.done && (
                <p className="text-xs text-muted-foreground">{item.description}</p>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
