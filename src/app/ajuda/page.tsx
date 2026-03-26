const faqs = [
  {
    category: 'Agendamentos',
    items: [
      {
        q: 'Como agendar uma sessão?',
        a: 'Acesse a página de entrevistadores, escolha um profissional, selecione um horário disponível e conclua o pagamento. Você receberá a confirmação por e-mail.',
      },
      {
        q: 'Quanto tempo dura uma sessão?',
        a: 'Todas as sessões têm duração fixa de 60 minutos.',
      },
      {
        q: 'Posso cancelar um agendamento?',
        a: 'Cancelamentos com mais de 24h de antecedência recebem reembolso integral. Abaixo disso, não há reembolso.',
      },
      {
        q: 'E se o entrevistador não aparecer?',
        a: 'Caso o entrevistador não compareça, você recebe reembolso integral em até 24 horas.',
      },
    ],
  },
  {
    category: 'Pagamento',
    items: [
      {
        q: 'Quais formas de pagamento são aceitas?',
        a: 'Aceitamos PIX e cartão de crédito via Pagar.me. O valor é debitado no momento do agendamento.',
      },
      {
        q: 'Quando o entrevistador recebe o pagamento?',
        a: 'O repasse é feito automaticamente via Pagar.me após a conclusão da sessão. O entrevistador recebe 90% do valor.',
      },
      {
        q: 'Há alguma taxa para candidatos?',
        a: 'Não. Candidatos pagam apenas o valor definido pelo entrevistador, sem taxas adicionais.',
      },
    ],
  },
  {
    category: 'Sessões',
    items: [
      {
        q: 'Como funciona a videochamada?',
        a: 'A sessão acontece por videochamada. O link de acesso fica disponível na sua agenda antes do horário marcado.',
      },
      {
        q: 'Posso avaliar o entrevistador após a sessão?',
        a: 'Sim. Após a sessão, você pode dar uma nota e deixar um comentário sobre a experiência.',
      },
    ],
  },
  {
    category: 'Conta',
    items: [
      {
        q: 'Como me torno um entrevistador?',
        a: 'Crie uma conta e selecione o perfil "Entrevistador". Complete seu perfil com bio, stack e preço por sessão para aparecer na listagem.',
      },
      {
        q: 'Posso ter os dois perfis (candidato e entrevistador)?',
        a: 'No momento, cada conta possui um único perfil. Para usar as duas funções, crie contas separadas.',
      },
    ],
  },
]

export default function AjudaPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-12 px-4 py-16">
      <div className="space-y-3">
        <h1 className="text-4xl font-bold tracking-tight">Central de ajuda</h1>
        <p className="text-lg text-muted-foreground">
          Encontre respostas para as dúvidas mais comuns sobre a MockFlow.
        </p>
      </div>

      {faqs.map((section) => (
        <section key={section.category} className="space-y-4">
          <h2 className="text-xl font-semibold">{section.category}</h2>
          <div className="space-y-3">
            {section.items.map((item) => (
              <div key={item.q} className="rounded-lg border p-5 space-y-1">
                <p className="font-medium">{item.q}</p>
                <p className="text-sm text-muted-foreground leading-relaxed">{item.a}</p>
              </div>
            ))}
          </div>
        </section>
      ))}

      <div className="rounded-2xl bg-muted/50 border p-8 text-center space-y-3">
        <p className="font-semibold">Não encontrou o que precisava?</p>
        <p className="text-sm text-muted-foreground">
          Entre em contato com nosso suporte e responderemos em até 24 horas.
        </p>
        <a
          href="/contato"
          className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          Fale conosco
        </a>
      </div>
    </div>
  )
}
