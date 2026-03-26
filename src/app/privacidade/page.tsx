export default function PrivacidadePage() {
  return (
    <div className="mx-auto max-w-3xl space-y-10 px-4 py-16">
      <div className="space-y-3">
        <h1 className="text-4xl font-bold tracking-tight">Política de privacidade</h1>
        <p className="text-sm text-muted-foreground">Última atualização: março de 2025</p>
      </div>

      <div className="space-y-8 text-sm leading-relaxed text-muted-foreground">

        <section className="space-y-3">
          <h2 className="text-base font-semibold text-foreground">1. Quais dados coletamos</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li>Dados de cadastro: nome, e-mail, foto de perfil e função (candidato ou entrevistador).</li>
            <li>Dados de perfil profissional: bio, stack tecnológica, anos de experiência e preço por sessão (apenas entrevistadores).</li>
            <li>Dados de uso: horários de disponibilidade, agendamentos realizados e avaliações.</li>
            <li>Dados de pagamento: processados e armazenados pelo Pagar.me — a MockFlow não armazena dados de cartão.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-base font-semibold text-foreground">2. Como usamos seus dados</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li>Criar e gerenciar sua conta.</li>
            <li>Processar agendamentos e pagamentos.</li>
            <li>Exibir perfis de entrevistadores na plataforma.</li>
            <li>Enviar notificações relacionadas às suas sessões.</li>
            <li>Melhorar nossos serviços por meio de análises agregadas.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-base font-semibold text-foreground">3. Compartilhamento de dados</h2>
          <p>
            Não vendemos seus dados. Compartilhamos apenas com prestadores de serviço necessários para o funcionamento da plataforma (Supabase, Pagar.me, Whereby) e quando exigido por lei.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-base font-semibold text-foreground">4. Cookies e rastreamento</h2>
          <p>
            Utilizamos cookies essenciais para autenticação e funcionamento da plataforma. Consulte nossa{' '}
            <a href="/cookies" className="text-primary hover:underline">Política de Cookies</a> para mais detalhes.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-base font-semibold text-foreground">5. Seus direitos (LGPD)</h2>
          <p>Conforme a Lei Geral de Proteção de Dados, você tem direito a:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Acessar os dados que temos sobre você.</li>
            <li>Corrigir dados incorretos.</li>
            <li>Solicitar a exclusão dos seus dados.</li>
            <li>Revogar consentimentos anteriores.</li>
          </ul>
          <p>
            Para exercer esses direitos, entre em contato pelo e-mail <a href="mailto:privacidade@mockflow.com.br" className="text-primary hover:underline">privacidade@mockflow.com.br</a>.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-base font-semibold text-foreground">6. Retenção de dados</h2>
          <p>
            Mantemos seus dados enquanto sua conta estiver ativa ou conforme necessário para cumprir obrigações legais. Após exclusão da conta, os dados são removidos em até 30 dias, exceto quando a retenção for exigida por lei.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-base font-semibold text-foreground">7. Segurança</h2>
          <p>
            Utilizamos criptografia em trânsito (HTTPS) e em repouso. O acesso aos dados é restrito por políticas de controle de acesso no banco de dados (RLS).
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-base font-semibold text-foreground">8. Contato</h2>
          <p>
            Para dúvidas sobre esta política: <a href="mailto:privacidade@mockflow.com.br" className="text-primary hover:underline">privacidade@mockflow.com.br</a>.
          </p>
        </section>
      </div>
    </div>
  )
}
