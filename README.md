# MockFlow

Plataforma de mock interviews para devs brasileiros. Conecta candidatos com engenheiros experientes para simulações reais de entrevistas técnicas, com pressão real e feedback direto.

## 🎯 Sobre

MockFlow é uma plataforma que permite:

- **Candidatos**: Agendar sessões de mock interviews com profissionais experientes
- **Entrevistadores**: Oferecer sessões de mock interviews e ganhar com isso
- **Transações seguras**: Pagamentos via PIX e cartão com AbacatePay
- **Videoconferência**: Entrevistas via Jitsi Meet com salas auto-geradas
- **Feedback direto**: Candidatos recebem feedback prático após cada sessão

## 🛠️ Stack Tecnológico

### Frontend
- **Next.js 16** - Framework React com Server Components
- **React** - UI components
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **shadcn/ui** - Component library
- **Lucide Icons** - Icons

### Backend
- **Next.js API Routes** - Server-side logic
- **Supabase** - Database PostgreSQL + Authentication + Storage
- **Edge Functions** - Serverless functions (webhooks)

### Serviços Externos
- **Supabase Auth** - Autenticação com email/OAuth Google
- **AbacatePay** - Pagamentos PIX e cartão (v1 Billing API)
- **Resend** - Email transacional
- **Jitsi Meet** - Videoconferência self-hosted
- **Google Analytics** - Analytics
- **Vercel** - Hosting + Crons

### Banco de Dados
- **PostgreSQL** (Supabase)
- **RLS Policies** - Row-level security
- **Custom RPCs** - Stored procedures para operações complexas

## 📋 Requisitos

- Node.js 18+
- npm ou yarn
- Conta Supabase
- Conta AbacatePay (sandbox para desenvolvimento)
- Conta Resend (para emails)
- Conta Vercel (para deploy com crons)

## 🚀 Configuração Local

### 1. Clone e instale dependências

```bash
git clone <repo-url>
cd mockflow
npm install
```

### 2. Configure variáveis de ambiente

Crie `.env.local` com:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# AbacatePay (v1 API)
ABACATEPAY_API_KEY=your-api-key

# Resend
RESEND_API_KEY=your-resend-api-key

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Crons (Vercel)
CRON_SECRET=your-random-secret-string

# Analytics (opcional)
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
```

### 3. Configure Supabase

```bash
# Instale CLI
npm install -g supabase

# Link ao projeto
supabase link --project-ref your-project-id

# Execute migrations
supabase db push
```

### 4. Inicie o servidor

```bash
npm run dev
```

Acesse `http://localhost:3000`

## 📁 Estrutura do Projeto

```
mockflow/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (auth)/             # Páginas autenticação
│   │   ├── api/                # API routes
│   │   │   ├── webhooks/       # Webhooks (AbacatePay, etc)
│   │   │   └── cron/           # Crons (tarefas agendadas)
│   │   ├── dashboard/          # Dashboard do usuário
│   │   ├── tutors/             # Listagem entrevistadores
│   │   ├── booking/            # Fluxo agendamento
│   │   └── ...                 # Outras páginas
│   ├── components/             # React components
│   │   ├── ui/                 # shadcn/ui components
│   │   ├── layout/             # Layout, header, footer
│   │   ├── tutors/             # Components de tutores
│   │   └── ...
│   ├── lib/                    # Utilities
│   │   ├── supabase/           # Clientes Supabase
│   │   ├── payment.ts          # Integração AbacatePay
│   │   ├── email.ts            # Templates e envio de emails
│   │   ├── meeting.ts          # Geração sala Jitsi
│   │   ├── tech-stack.ts       # Lista predefinida de tecnologias
│   │   └── ...
│   ├── app/actions/            # Server actions (Next.js)
│   │   ├── booking.ts          # Criar booking
│   │   ├── cancel-booking.ts   # Cancelar booking
│   │   ├── tutor-profile.ts    # Atualizar perfil tutor
│   │   └── ...
│   └── types/                  # TypeScript types
├── supabase/
│   ├── migrations/             # SQL migrations
│   └── schema.sql              # Schema inicial
├── public/                     # Static assets
├── CRONS.md                    # Documentação de crons
└── vercel.json                 # Configuração Vercel
```

## 🔑 Funcionalidades Principais

### Para Candidatos
- ✅ Cadastro/login com email ou Google
- ✅ Visualizar tutores disponíveis com filtros (preço, stack tecnológico)
- ✅ Agendar sessão de 60 minutos
- ✅ Pagar via PIX ou cartão (AbacatePay)
- ✅ Entrar em videoconferência via Jitsi
- ✅ Receber feedback após sessão
- ✅ Ver agenda de sessões

### Para Entrevistadores
- ✅ Cadastro/login
- ✅ Criar perfil com experiência, stack, preço
- ✅ Definir slots de disponibilidade
- ✅ Receber notificações de novas sessões
- ✅ Entrar em videoconferência como host
- ✅ Ver agenda
- ✅ Receber pagamento via PIX (90% do valor)

### Admin/Sistema
- ✅ Gestão de pagamentos (AbacatePay)
- ✅ Gestão de payouts (PIX aos tutores)
- ✅ Emails transacionais (Resend)
- ✅ Webhooks de confirmação de pagamento
- ✅ Limpeza automática de bookings abandonados (cron)
- ✅ Analytics (Google Analytics)

## 💰 Modelo de Negócio

- **Taxa da plataforma**: 10%
- **Para entrevistadores**: 90% do valor da sessão
- **Duração padrão**: 60 minutos
- **Preço mínimo**: R$ 30
- **Preço máximo**: R$ 2.000

## 🔐 Segurança

- **RLS Policies** - Usuários só veem seus próprios dados
- **Webhooks verificados** - HMAC-SHA256 signature validation
- **Tokens seguros** - JWT via Supabase Auth
- **Senhas hash** - bcrypt via Supabase Auth
- **HTTPS** - Em produção via Vercel

## 📝 Variáveis de Ambiente

| Variável | Descrição | Exemplo |
|----------|-----------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | URL do Supabase | `https://xxxx.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Anon key Supabase | `eyJ...` |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key | `eyJ...` |
| `ABACATEPAY_API_KEY` | API key AbacatePay | `sk_...` |
| `RESEND_API_KEY` | API key Resend | `re_...` |
| `NEXT_PUBLIC_APP_URL` | URL da aplicação | `https://mockflow.com.br` |
| `CRON_SECRET` | Secret para validar crons | `sua-senha-aleatoria` |
| `NEXT_PUBLIC_GA_ID` | Google Analytics ID | `G-XXXXXXXXXX` |

## 🚢 Deploy

### Vercel (Recomendado)

```bash
# Conecte seu repositório no Vercel dashboard

# Configure variáveis de ambiente na dashboard
# Vercel → Settings → Environment Variables

# Cada push para main faz deploy automático
```

### Preparar para produção

1. **Defina variáveis de ambiente** em Production
2. **Configure domínio** em vercel.json ou Vercel dashboard
3. **Verifique email domain** no Resend (mockflow.com.br)
4. **Configure webhooks** do AbacatePay:
   - URL: `https://seu-dominio.com/api/webhooks/abacatepay`
   - Events: `billing.paid`
5. **Configure crons** em Vercel
6. **Teste fluxo completo**:
   - Signup → Profile → Book → Payment → Confirmation → Meeting

## 📚 Documentação

- [CRONS.md](./CRONS.md) - Documentação de tarefas agendadas
- [Supabase Docs](https://supabase.com/docs)
- [Next.js Docs](https://nextjs.org/docs)
- [AbacatePay Docs](https://docs.abacatepay.com)

## 🐛 Issues Conhecidos

- Crons só funcionam em produção (Vercel)
- Jitsi Meet é self-hosted (exige configuração separada)
- AbacatePay está em beta (sandbox para testes)

## 👤 Autor

Desenvolvido para MockFlow.

## 📄 Licença

Propriedade privada de MockFlow.
