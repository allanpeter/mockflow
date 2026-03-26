'use client'

import { useRef, useState, useTransition } from 'react'
import Image from 'next/image'
import { Camera, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { uploadAvatar } from '@/app/actions/tutor-profile'

interface Props {
  currentUrl: string | null
  name: string
}

export function AvatarUpload({ currentUrl, name }: Readonly<Props>) {
  const [preview, setPreview] = useState<string | null>(currentUrl)
  const [isPending, startTransition] = useTransition()
  const inputRef = useRef<HTMLInputElement>(null)

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 2 * 1024 * 1024) {
      toast.error('Imagem deve ter no máximo 2MB.')
      e.target.value = ''
      return
    }
    if (!file.type.startsWith('image/')) {
      toast.error('Apenas imagens são permitidas.')
      e.target.value = ''
      return
    }

    // Immediate local preview
    setPreview(URL.createObjectURL(file))

    const fd = new FormData()
    fd.append('avatar', file)

    startTransition(async () => {
      const result = await uploadAvatar(fd)
      if (result.error) {
        toast.error(result.error)
        setPreview(currentUrl)
      } else {
        toast.success('Foto atualizada!')
      }
    })
  }

  const initials = name
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

  return (
    <div className="flex flex-col items-center gap-3">
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={isPending}
        className="group relative h-24 w-24 overflow-hidden rounded-full border-2 border-dashed border-muted-foreground/30 transition-colors hover:border-primary"
        aria-label="Alterar foto de perfil"
      >
        {preview ? (
          <Image
            src={preview}
            alt={name}
            fill
            className="object-cover"
            sizes="96px"
          />
        ) : (
          <span className="flex h-full items-center justify-center text-2xl font-semibold text-muted-foreground">
            {initials}
          </span>
        )}

        <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
          {isPending ? (
            <Loader2 className="h-6 w-6 animate-spin text-white" />
          ) : (
            <Camera className="h-6 w-6 text-white" />
          )}
        </div>
      </button>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleChange}
      />

      <p className="text-xs text-muted-foreground">JPG, PNG ou WebP · Máx. 2MB</p>
    </div>
  )
}
