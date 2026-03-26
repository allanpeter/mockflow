export default function TermosPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-10 px-4 py-16">
      <div className="space-y-3">
        <h1 className="text-4xl font-bold tracking-tight">Termos de uso</h1>
        <p className="text-sm text-muted-foreground">Última atualização: março de 2025</p>
      </div>

      <div className="prose prose-neutral dark:prose-invert max-w-none space-y-8 text-sm leading-relaxed text-muted-foreground">

        <section className="space-y-3">
          <h2 className="text-base font-semibold text-foreground">1. Aceitação dos termos</h2>
          <p>
            Ao acessar ou usar a plataforma MockFlow, você concorda com estes Termos de Uso. Se não concordar com algum item, não utilize a plataforma.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-base font-semibold text-foreground">2. Descrição do serviço</h2>
          <p>
            A MockFlow é uma plataforma que conecta candidatos a vagas de tecnologia com profissionais experientes para a prática de entrevistas técnicas (mock interviews). A MockFlow atua como intermediária e não é parte da relação entre candidato e entrevistador.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-base font-semibold text-foreground">3. Cadastro e conta</h2>
          <p>
            Para utilizar os serviços da MockFlow é necessário criar uma conta com informações verídicas. Você é responsável pela segurança da sua conta e por todas as atividades realizadas com ela.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-base font-semibold text-foreground">4. Pagamentos e reembolsos</h2>
          <p>
            O pagamento é processado no momento do agendamento via Pagar.me. Cancelamentos com mais de 24 horas de antecedência recebem reembolso integral. Cancelamentos com menos de 24 horas não são reembolsáveis. Caso o entrevistador não compareça, o candidato recebe reembolso integral em até 24 horas.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-base font-semibold text-foreground">5. Taxa da plataforma</h2>
          <p>
            A MockFlow retém 10% do valor de cada sessão como taxa de serviço. Os entrevistadores recebem 90% do valor cobrado por sessão, transferidos automaticamente após a conclusão.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-base font-semibold text-foreground">6. Conduta dos usuários</h2>
          <p>
            É proibido utilizar a plataforma para fins ilegais, abusivos ou que violem direitos de terceiros. A MockFlow se reserva o direito de suspender contas que violem estas diretrizes.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-base font-semibold text-foreground">7. Propriedade intelectual</h2>
          <p>
            Todo o conteúdo da plataforma (marca, design, código) é de propriedade da MockFlow e protegido por leis de propriedade intelectual.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-base font-semibold text-foreground">8. Limitação de responsabilidade</h2>
          <p>
            A MockFlow não se responsabiliza por resultados em processos seletivos, pelo conteúdo das sessões ou por danos indiretos decorrentes do uso da plataforma.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-base font-semibold text-foreground">9. Alterações nos termos</h2>
          <p>
            A MockFlow pode atualizar estes termos a qualquer momento. O uso continuado da plataforma após as alterações implica aceitação dos novos termos.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-base font-semibold text-foreground">10. Contato</h2>
          <p>
            Dúvidas sobre estes termos podem ser enviadas para <a href="mailto:juridico@mockflow.com.br" className="text-primary hover:underline">juridico@mockflow.com.br</a>.
          </p>
        </section>
      </div>
    </div>
  )
}
