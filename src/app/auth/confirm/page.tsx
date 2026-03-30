import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { CheckCircle } from 'lucide-react'

export default function ConfirmPage() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-md space-y-6 text-center">
        <div className="flex justify-center">
          <CheckCircle className="h-16 w-16 text-green-500" />
        </div>

        <div className="space-y-2">
          <h1 className="text-3xl font-bold">E-mail confirmado!</h1>
          <p className="text-muted-foreground">
            Sua conta foi criada com sucesso. Agora você pode fazer login na plataforma.
          </p>
        </div>

        <Button render={<Link href="/auth/login" />} className="w-full">
          Ir para Login
        </Button>
      </div>
    </div>
  )
}
