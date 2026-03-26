'use client'

import { useEffect, useState, useTransition } from 'react'
import { AlertDialog } from '@base-ui/react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Trash2 } from 'lucide-react'

interface User {
  id: string
  email: string | undefined
  full_name: string | null
  role: string | null
  created_at: string
  last_sign_in_at: string | undefined
}

const roleLabels: Record<string, string> = {
  admin: 'Admin',
  tutor: 'Entrevistador',
  learner: 'Candidato',
}

const roleVariants: Record<string, 'default' | 'secondary' | 'outline'> = {
  admin: 'default',
  tutor: 'secondary',
  learner: 'outline',
}

export function UserTable() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<User | null>(null)
  const [deleteError, setDeleteError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  useEffect(() => {
    fetch('/api/admin/users')
      .then(r => r.json())
      .then(d => { setUsers(d.users ?? []); setLoading(false) })
      .catch(() => { setError('Erro ao carregar usuários.'); setLoading(false) })
  }, [])

  function confirmDelete() {
    if (!deleteTarget) return
    setDeleteError(null)
    startTransition(async () => {
      const res = await fetch(`/api/admin/users?id=${deleteTarget.id}`, { method: 'DELETE' })
      const data = await res.json()
      if (!res.ok) {
        setDeleteError(data.error ?? 'Erro ao deletar.')
        return
      }
      setUsers(prev => prev.filter(u => u.id !== deleteTarget.id))
      setDeleteTarget(null)
    })
  }

  if (loading) return <p className="text-muted-foreground text-sm">Carregando...</p>
  if (error) return <p className="text-destructive text-sm">{error}</p>

  return (
    <>
      <div className="rounded-xl border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-muted-foreground">
            <tr>
              <th className="px-4 py-3 text-left font-medium">Nome</th>
              <th className="px-4 py-3 text-left font-medium">E-mail</th>
              <th className="px-4 py-3 text-left font-medium">Perfil</th>
              <th className="px-4 py-3 text-left font-medium">Cadastro</th>
              <th className="px-4 py-3 text-left font-medium">Último acesso</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y">
            {users.map(u => (
              <tr key={u.id} className="bg-card hover:bg-muted/30 transition-colors">
                <td className="px-4 py-3 font-medium">{u.full_name ?? '—'}</td>
                <td className="px-4 py-3 text-muted-foreground">{u.email}</td>
                <td className="px-4 py-3">
                  {u.role ? (
                    <Badge variant={roleVariants[u.role] ?? 'outline'}>
                      {roleLabels[u.role] ?? u.role}
                    </Badge>
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </td>
                <td className="px-4 py-3 text-muted-foreground">
                  {new Date(u.created_at).toLocaleDateString('pt-BR')}
                </td>
                <td className="px-4 py-3 text-muted-foreground">
                  {u.last_sign_in_at
                    ? new Date(u.last_sign_in_at).toLocaleDateString('pt-BR')
                    : '—'}
                </td>
                <td className="px-4 py-3 text-right">
                  <button
                    onClick={() => { setDeleteTarget(u); setDeleteError(null) }}
                    className="text-muted-foreground hover:text-destructive transition-colors"
                    aria-label={`Deletar ${u.full_name ?? u.email}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {users.length === 0 && (
          <p className="px-4 py-8 text-center text-sm text-muted-foreground">Nenhum usuário encontrado.</p>
        )}
      </div>

      <AlertDialog.Root open={!!deleteTarget} onOpenChange={open => { if (!open) setDeleteTarget(null) }}>
        <AlertDialog.Portal>
          <AlertDialog.Backdrop className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm" />
          <AlertDialog.Popup className="fixed left-1/2 top-1/2 z-50 w-full max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-xl border bg-background p-6 shadow-lg space-y-4">
            <AlertDialog.Title className="text-lg font-semibold">
              Deletar usuário?
            </AlertDialog.Title>
            <AlertDialog.Description className="text-sm text-muted-foreground">
              Isso vai remover permanentemente <span className="font-medium text-foreground">{deleteTarget?.full_name ?? deleteTarget?.email}</span> e todos os seus dados. Esta ação não pode ser desfeita.
            </AlertDialog.Description>

            {deleteError && (
              <p className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {deleteError}
              </p>
            )}

            <div className="flex gap-3 pt-1">
              <Button
                variant="outline"
                className="flex-1"
                disabled={isPending}
                onClick={() => setDeleteTarget(null)}
              >
                Cancelar
              </Button>
              <Button
                variant="destructive"
                className="flex-1"
                disabled={isPending}
                onClick={confirmDelete}
              >
                {isPending ? 'Deletando…' : 'Confirmar'}
              </Button>
            </div>
          </AlertDialog.Popup>
        </AlertDialog.Portal>
      </AlertDialog.Root>
    </>
  )
}
