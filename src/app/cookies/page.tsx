const cookieTypes = [
  {
    name: 'Essenciais',
    description: 'Necessários para o funcionamento básico da plataforma: autenticação, sessão e segurança. Não podem ser desativados.',
    examples: ['sb-access-token', 'sb-refresh-token'],
    required: true,
  },
  {
    name: 'Preferências',
    description: 'Armazenam suas preferências de uso, como o tema (claro/escuro) escolhido.',
    examples: ['theme'],
    required: false,
  },
]

export default function CookiesPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-10 px-4 py-16">
      <div className="space-y-3">
        <h1 className="text-4xl font-bold tracking-tight">Política de cookies</h1>
        <p className="text-sm text-muted-foreground">Última atualização: março de 2025</p>
      </div>

      <div className="space-y-8 text-sm leading-relaxed text-muted-foreground">

        <section className="space-y-3">
          <h2 className="text-base font-semibold text-foreground">O que são cookies?</h2>
          <p>
            Cookies são pequenos arquivos de texto armazenados no seu navegador quando você acessa um site. Eles permitem que o site lembre suas preferências e mantenha você autenticado entre as visitas.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-base font-semibold text-foreground">Como a MockFlow usa cookies</h2>
          <p>
            A MockFlow utiliza apenas cookies técnicos, necessários para o funcionamento da plataforma. Não utilizamos cookies de rastreamento publicitário ou de terceiros para fins de marketing.
          </p>
        </section>

        <section className="space-y-6">
          <h2 className="text-base font-semibold text-foreground">Tipos de cookies que utilizamos</h2>
          {cookieTypes.map((type) => (
            <div key={type.name} className="rounded-lg border p-5 space-y-3">
              <div className="flex items-center gap-2">
                <p className="font-medium text-foreground">{type.name}</p>
                {type.required && (
                  <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                    Obrigatório
                  </span>
                )}
              </div>
              <p>{type.description}</p>
              <div>
                <p className="text-xs font-medium text-foreground mb-1">Exemplos:</p>
                <div className="flex flex-wrap gap-1">
                  {type.examples.map((ex) => (
                    <code key={ex} className="rounded bg-muted px-1.5 py-0.5 text-xs">
                      {ex}
                    </code>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </section>

        <section className="space-y-3">
          <h2 className="text-base font-semibold text-foreground">Como gerenciar cookies</h2>
          <p>
            Você pode bloquear ou excluir cookies nas configurações do seu navegador. No entanto, desativar os cookies essenciais impedirá o funcionamento correto da plataforma — você não conseguirá fazer login.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-base font-semibold text-foreground">Cookies de terceiros</h2>
          <p>
            A MockFlow pode carregar recursos de terceiros (ex: Supabase Auth, Pagar.me) que podem definir seus próprios cookies. Consulte as políticas de privacidade desses serviços para mais informações.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-base font-semibold text-foreground">Contato</h2>
          <p>
            Dúvidas sobre o uso de cookies:{' '}
            <a href="mailto:privacidade@mockflow.com.br" className="text-primary hover:underline">
              privacidade@mockflow.com.br
            </a>
          </p>
        </section>
      </div>
    </div>
  )
}
