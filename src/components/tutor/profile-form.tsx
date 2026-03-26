'use client'

import { useActionState, useState } from 'react'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'
import { upsertTutorProfile, type TutorProfileFormState } from '@/app/actions/tutor-profile'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { TechStackInput } from './tech-stack-input'
import type { Database } from '@/types/supabase'

type TutorProfileRow = Database['public']['Tables']['tutor_profiles']['Row']

interface Props {
  profile: TutorProfileRow | null
}

const initialState: TutorProfileFormState = { status: 'idle' }

export function TutorProfileForm({ profile }: Readonly<Props>) {
  const [techStack, setTechStack] = useState<string[]>(profile?.tech_stack ?? [])

  const [state, action, isPending] = useActionState(
    async (prev: TutorProfileFormState, formData: FormData) => {
      const result = await upsertTutorProfile(prev, formData)
      if (result.status === 'success') toast.success('Perfil salvo!')
      if (result.status === 'server_error') toast.error(result.message)
      return result
    },
    initialState
  )

  const errors = state.status === 'error' ? state.errors : {}

  return (
    <form action={action} className="space-y-6">
      {/* Bio */}
      <div className="space-y-2">
        <Label htmlFor="bio">Bio profissional</Label>
        <Textarea
          id="bio"
          name="bio"
          rows={4}
          placeholder="Conte sobre sua experiência, empresas em que trabalhou, e como conduz entrevistas..."
          defaultValue={profile?.bio ?? ''}
          aria-invalid={!!errors.bio}
          className={errors.bio ? 'border-destructive' : ''}
        />
        {errors.bio && (
          <p className="text-sm text-destructive">{errors.bio[0]}</p>
        )}
        <p className="text-xs text-muted-foreground">Mínimo 50 caracteres</p>
      </div>

      {/* Experience */}
      <div className="space-y-2">
        <Label htmlFor="years_experience">Anos de experiência</Label>
        <Input
          id="years_experience"
          name="years_experience"
          type="number"
          inputMode="numeric"
          min={0}
          max={50}
          defaultValue={profile?.years_experience ?? 0}
          aria-invalid={!!errors.years_experience}
          className={`w-32 ${errors.years_experience ? 'border-destructive' : ''}`}
        />
        {errors.years_experience && (
          <p className="text-sm text-destructive">{errors.years_experience[0]}</p>
        )}
      </div>

      {/* Tech stack */}
      <div className="space-y-2">
        <Label>Stack de tecnologias</Label>
        <TechStackInput
          value={techStack}
          onChange={setTechStack}
          error={errors.tech_stack?.[0]}
        />
      </div>

      {/* Price */}
      <div className="space-y-2">
        <Label htmlFor="price_per_session">Preço por sessão (R$)</Label>
        <div className="relative w-40">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
            R$
          </span>
          <Input
            id="price_per_session"
            name="price_per_session"
            type="number"
            inputMode="decimal"
            min={30}
            max={2000}
            step={10}
            defaultValue={profile?.price_per_session ?? 150}
            aria-invalid={!!errors.price_per_session}
            className={`pl-9 ${errors.price_per_session ? 'border-destructive' : ''}`}
          />
        </div>
        {errors.price_per_session && (
          <p className="text-sm text-destructive">{errors.price_per_session[0]}</p>
        )}
        <p className="text-xs text-muted-foreground">
          Você receberá R${' '}
          {/* show 90% dynamically — can't do math in JSX without state, so show static note */}
          90% do valor após a taxa da plataforma (10%)
        </p>
      </div>

      <Button type="submit" disabled={isPending} className="w-full sm:w-auto">
        {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {isPending ? 'Salvando…' : 'Salvar perfil'}
      </Button>
    </form>
  )
}
