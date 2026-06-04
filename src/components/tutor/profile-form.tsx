'use client'

import { useActionState, useState } from 'react'
import { toast } from 'sonner'
import { Loader2, Plus, X } from 'lucide-react'
import { upsertTutorProfile, type TutorProfileFormState } from '@/app/actions/tutor-profile'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { TechStackSelector } from './tech-stack-selector'
import { VideoUploader } from './video-uploader'
import { INTERVIEW_FORMATS, SENIORITY_LEVELS, LANGUAGES } from '@/lib/tutor-options'
import type { Company, Database } from '@/types/supabase'

type TutorProfileRow = Database['public']['Tables']['tutor_profiles']['Row']

interface Props {
  profile: TutorProfileRow | null
}

const initialState: TutorProfileFormState = { status: 'idle' }

function BadgeMultiSelect({
  name,
  options,
  value,
  onChange,
}: Readonly<{
  name: string
  options: readonly string[]
  value: string[]
  onChange: (next: string[]) => void
}>) {
  const toggle = (opt: string) =>
    onChange(value.includes(opt) ? value.filter((v) => v !== opt) : [...value, opt])

  return (
    <>
      {value.map((v) => (
        <input key={v} type="hidden" name={name} value={v} />
      ))}
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => (
          <Badge
            key={opt}
            variant={value.includes(opt) ? 'default' : 'secondary'}
            className="cursor-pointer"
            onClick={() => toggle(opt)}
          >
            {opt}
          </Badge>
        ))}
      </div>
    </>
  )
}

export function TutorProfileForm({ profile }: Readonly<Props>) {
  const [techStack, setTechStack] = useState<string[]>(profile?.tech_stack ?? [])
  const [formats, setFormats] = useState<string[]>(profile?.interview_formats ?? [])
  const [seniority, setSeniority] = useState<string[]>(profile?.seniority_levels ?? [])
  const [languages, setLanguages] = useState<string[]>(profile?.languages ?? [])
  const [companies, setCompanies] = useState<Company[]>(profile?.companies ?? [])
  const [introVideoUrl, setIntroVideoUrl] = useState(profile?.intro_video_url ?? '')

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

  const updateCompany = (i: number, patch: Partial<Company>) =>
    setCompanies((prev) => prev.map((c, idx) => (idx === i ? { ...c, ...patch } : c)))

  return (
    <form action={action} className="space-y-6">
      {/* Hidden inputs for array/object fields */}
      {techStack.map((tech) => (
        <input key={tech} type="hidden" name="tech_stack" value={tech} />
      ))}
      <input type="hidden" name="companies" value={JSON.stringify(companies.filter((c) => c.name.trim()))} />

      {/* Headline */}
      <div className="space-y-2">
        <Label htmlFor="headline">Título do perfil</Label>
        <Input
          id="headline"
          name="headline"
          maxLength={120}
          placeholder="Ex: Eng. Sênior @ Nubank · ex-iFood"
          defaultValue={profile?.headline ?? ''}
          aria-invalid={!!errors.headline}
          className={errors.headline ? 'border-destructive' : ''}
        />
        {errors.headline && <p className="text-sm text-destructive">{errors.headline[0]}</p>}
        <p className="text-xs text-muted-foreground">
          Uma linha que resume quem você é. Aparece em destaque no seu perfil e na busca.
        </p>
      </div>

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
        {errors.bio && <p className="text-sm text-destructive">{errors.bio[0]}</p>}
        <p className="text-xs text-muted-foreground">Mínimo 50 caracteres</p>
      </div>

      {/* Intro video */}
      <div className="space-y-2">
        <input type="hidden" name="intro_video_url" value={introVideoUrl} />
        <VideoUploader
          currentVideoUrl={introVideoUrl}
          onVideoUrlChange={setIntroVideoUrl}
        />
        {errors.intro_video_url && (
          <p className="text-sm text-destructive">{errors.intro_video_url[0]}</p>
        )}
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

      {/* Interview formats */}
      <div className="space-y-2">
        <Label>Formatos de entrevista</Label>
        <BadgeMultiSelect
          name="interview_formats"
          options={INTERVIEW_FORMATS}
          value={formats}
          onChange={setFormats}
        />
      </div>

      {/* Seniority levels */}
      <div className="space-y-2">
        <Label>Senioridades que você entrevista</Label>
        <BadgeMultiSelect
          name="seniority_levels"
          options={SENIORITY_LEVELS}
          value={seniority}
          onChange={setSeniority}
        />
      </div>

      {/* Languages */}
      <div className="space-y-2">
        <Label>Idiomas</Label>
        <BadgeMultiSelect name="languages" options={LANGUAGES} value={languages} onChange={setLanguages} />
      </div>

      {/* Tech stack */}
      <div className="space-y-2">
        <Label>Stack de tecnologias</Label>
        <TechStackSelector value={techStack} onChange={setTechStack} error={errors.tech_stack?.[0]} />
      </div>

      {/* Companies */}
      <div className="space-y-3">
        <Label>Empresas onde trabalhou</Label>
        <div className="space-y-2">
          {companies.map((company, i) => (
            <div key={i} className="flex flex-wrap items-center gap-2">
              <Input
                placeholder="Empresa"
                value={company.name}
                onChange={(e) => updateCompany(i, { name: e.target.value })}
                className="w-40"
              />
              <Input
                placeholder="Cargo (opcional)"
                value={company.role ?? ''}
                onChange={(e) => updateCompany(i, { role: e.target.value })}
                className="w-40"
              />
              <label className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <input
                  type="checkbox"
                  checked={!!company.current}
                  onChange={(e) => updateCompany(i, { current: e.target.checked })}
                />
                Atual
              </label>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                onClick={() => setCompanies((prev) => prev.filter((_, idx) => idx !== i))}
                aria-label="Remover empresa"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setCompanies((prev) => [...prev, { name: '', role: '', current: false }])}
        >
          <Plus className="mr-1 h-4 w-4" />
          Adicionar empresa
        </Button>
      </div>

      {/* Certifications */}
      <div className="space-y-2">
        <Label htmlFor="certifications">Certificações</Label>
        <Input
          id="certifications"
          name="certifications"
          placeholder="AWS Solutions Architect, CKA, ..."
          defaultValue={(profile?.certifications ?? []).join(', ')}
        />
        <p className="text-xs text-muted-foreground">Separe por vírgula.</p>
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
          Você receberá 90% do valor após a taxa da plataforma (10%)
        </p>
      </div>

      {/* Bank account for payouts */}
      <div className="space-y-4">
        <div>
          <Label>Dados bancários para recebimento</Label>
          <p className="mt-1 text-xs text-muted-foreground">
            Você recebe 90% do valor de cada sessão. Os repasses são processados todo final de mês via transferência bancária.
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="cpf" className="text-sm">CPF</Label>
            <Input
              id="cpf"
              name="cpf"
              placeholder="00000000000"
              defaultValue={profile?.cpf ?? ''}
              maxLength={11}
            />
            {errors.cpf && <p className="text-xs text-destructive">{errors.cpf[0]}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="bank_code" className="text-sm">Código do banco</Label>
            <Input
              id="bank_code"
              name="bank_code"
              placeholder="260 (Nubank), 341 (Itaú)…"
              defaultValue={profile?.bank_code ?? ''}
              maxLength={10}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="bank_agency" className="text-sm">Agência (sem dígito)</Label>
            <Input
              id="bank_agency"
              name="bank_agency"
              placeholder="0001"
              defaultValue={profile?.bank_agency ?? ''}
              maxLength={10}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="bank_account_type" className="text-sm">Tipo de conta</Label>
            <select
              id="bank_account_type"
              name="bank_account_type"
              defaultValue={profile?.bank_account_type ?? ''}
              className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
            >
              <option value="" disabled>Selecionar…</option>
              <option value="checking">Corrente</option>
              <option value="savings">Poupança</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="bank_account" className="text-sm">Número da conta</Label>
            <Input
              id="bank_account"
              name="bank_account"
              placeholder="12345678"
              defaultValue={profile?.bank_account ?? ''}
              maxLength={20}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="bank_account_digit" className="text-sm">Dígito verificador</Label>
            <Input
              id="bank_account_digit"
              name="bank_account_digit"
              placeholder="9"
              defaultValue={profile?.bank_account_digit ?? ''}
              maxLength={2}
            />
          </div>
        </div>

        {profile?.pagarme_recipient_id && (
          <p className="text-xs text-green-600">✓ Conta bancária verificada na Pagar.me</p>
        )}
      </div>

      <Button type="submit" disabled={isPending} className="w-full sm:w-auto">
        {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {isPending ? 'Salvando…' : 'Salvar perfil'}
      </Button>
    </form>
  )
}
