import { Resend } from 'resend'
import { formatDatePtBr, formatTimePtBr } from '@/lib/date'

const resend = new Resend(process.env.RESEND_API_KEY)

const FROM = 'MockFlow <noreply@mockflow.com.br>'

// ---------- helpers ----------

function formatDate(iso: string) {
  return formatDatePtBr(iso, {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })
}

function formatTime(iso: string) {
  return formatTimePtBr(iso)
}

// ---------- templates ----------

function bookingConfirmedLearner(opts: {
  learnerName: string
  tutorName: string
  startsAt: string
  endsAt: string
  amount: number
  confirmationUrl: string
  sessionUrl: string
}) {
  const date = formatDate(opts.startsAt)
  const time = formatTime(opts.startsAt)

  return {
    subject: 'Sessão confirmada — MockFlow',
    html: `
<!DOCTYPE html>
<html lang="pt-BR">
<head><meta charset="UTF-8" /><meta name="viewport" content="width=device-width,initial-scale=1" /></head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:system-ui,sans-serif;color:#18181b">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 16px">
    <tr><td align="center">
      <table width="100%" style="max-width:520px;background:#fff;border-radius:12px;overflow:hidden;border:1px solid #e4e4e7">

        <!-- Header -->
        <tr><td style="background:#18181b;padding:24px 32px">
          <p style="margin:0;font-size:20px;font-weight:700;color:#fff">
            <span style="color:#a78bfa">Mock</span>Flow
          </p>
        </td></tr>

        <!-- Body -->
        <tr><td style="padding:32px">
          <p style="margin:0 0 8px;font-size:22px;font-weight:700">Sessão confirmada!</p>
          <p style="margin:0 0 24px;color:#71717a">Olá, ${opts.learnerName}. Seu pagamento foi processado com sucesso.</p>

          <table width="100%" style="border:1px solid #e4e4e7;border-radius:8px;overflow:hidden;margin-bottom:24px">
            <tr style="background:#fafafa">
              <td style="padding:12px 16px;font-size:13px;color:#71717a;border-bottom:1px solid #e4e4e7">Entrevistador</td>
              <td style="padding:12px 16px;font-size:13px;font-weight:600;border-bottom:1px solid #e4e4e7;text-align:right">${opts.tutorName}</td>
            </tr>
            <tr style="background:#fafafa">
              <td style="padding:12px 16px;font-size:13px;color:#71717a;border-bottom:1px solid #e4e4e7">Data</td>
              <td style="padding:12px 16px;font-size:13px;font-weight:600;border-bottom:1px solid #e4e4e7;text-align:right;text-transform:capitalize">${date}</td>
            </tr>
            <tr style="background:#fafafa">
              <td style="padding:12px 16px;font-size:13px;color:#71717a;border-bottom:1px solid #e4e4e7">Horário</td>
              <td style="padding:12px 16px;font-size:13px;font-weight:600;border-bottom:1px solid #e4e4e7;text-align:right">${time} (60 min)</td>
            </tr>
            <tr style="background:#fafafa">
              <td style="padding:12px 16px;font-size:13px;color:#71717a">Valor pago</td>
              <td style="padding:12px 16px;font-size:13px;font-weight:600;text-align:right">R$ ${opts.amount.toFixed(2).replace('.', ',')}</td>
            </tr>
          </table>

          <a href="${opts.sessionUrl}" style="display:block;text-align:center;background:#18181b;color:#fff;text-decoration:none;padding:12px 24px;border-radius:8px;font-weight:600;font-size:14px;margin-bottom:12px">
            Entrar na sessão
          </a>
          <a href="${opts.confirmationUrl}" style="display:block;text-align:center;color:#71717a;text-decoration:none;padding:8px;font-size:13px">
            Ver detalhes do agendamento
          </a>
        </td></tr>

        <!-- Footer -->
        <tr><td style="padding:16px 32px;border-top:1px solid #e4e4e7;background:#fafafa">
          <p style="margin:0;font-size:12px;color:#a1a1aa;text-align:center">
            MockFlow · Feito para devs brasileiros<br />
            Em caso de dúvidas, acesse <a href="https://mockflow.com.br/ajuda" style="color:#a78bfa">Central de Ajuda</a>
          </p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`,
  }
}

function newBookingTutor(opts: {
  tutorName: string
  learnerName: string
  startsAt: string
  dashboardUrl: string
  sessionUrl: string
}) {
  const date = formatDate(opts.startsAt)
  const time = formatTime(opts.startsAt)

  return {
    subject: 'Novo agendamento recebido — MockFlow',
    html: `
<!DOCTYPE html>
<html lang="pt-BR">
<head><meta charset="UTF-8" /><meta name="viewport" content="width=device-width,initial-scale=1" /></head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:system-ui,sans-serif;color:#18181b">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 16px">
    <tr><td align="center">
      <table width="100%" style="max-width:520px;background:#fff;border-radius:12px;overflow:hidden;border:1px solid #e4e4e7">

        <tr><td style="background:#18181b;padding:24px 32px">
          <p style="margin:0;font-size:20px;font-weight:700;color:#fff">
            <span style="color:#a78bfa">Mock</span>Flow
          </p>
        </td></tr>

        <tr><td style="padding:32px">
          <p style="margin:0 0 8px;font-size:22px;font-weight:700">Novo agendamento!</p>
          <p style="margin:0 0 24px;color:#71717a">Olá, ${opts.tutorName}. Um candidato reservou uma sessão com você.</p>

          <table width="100%" style="border:1px solid #e4e4e7;border-radius:8px;overflow:hidden;margin-bottom:24px">
            <tr style="background:#fafafa">
              <td style="padding:12px 16px;font-size:13px;color:#71717a;border-bottom:1px solid #e4e4e7">Candidato</td>
              <td style="padding:12px 16px;font-size:13px;font-weight:600;border-bottom:1px solid #e4e4e7;text-align:right">${opts.learnerName}</td>
            </tr>
            <tr style="background:#fafafa">
              <td style="padding:12px 16px;font-size:13px;color:#71717a;border-bottom:1px solid #e4e4e7">Data</td>
              <td style="padding:12px 16px;font-size:13px;font-weight:600;border-bottom:1px solid #e4e4e7;text-align:right;text-transform:capitalize">${date}</td>
            </tr>
            <tr style="background:#fafafa">
              <td style="padding:12px 16px;font-size:13px;color:#71717a">Horário</td>
              <td style="padding:12px 16px;font-size:13px;font-weight:600;text-align:right">${time} (60 min)</td>
            </tr>
          </table>

          <a href="${opts.sessionUrl}" style="display:block;text-align:center;background:#18181b;color:#fff;text-decoration:none;padding:12px 24px;border-radius:8px;font-weight:600;font-size:14px;margin-bottom:12px">
            Entrar na sessão
          </a>
          <a href="${opts.dashboardUrl}" style="display:block;text-align:center;color:#71717a;text-decoration:none;padding:8px;font-size:13px">
            Ver minha agenda
          </a>
        </td></tr>

        <tr><td style="padding:16px 32px;border-top:1px solid #e4e4e7;background:#fafafa">
          <p style="margin:0;font-size:12px;color:#a1a1aa;text-align:center">
            MockFlow · Feito para devs brasileiros
          </p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`,
  }
}

function sessionReminder(opts: {
  recipientName: string
  otherPartyLabel: string
  otherPartyName: string
  startsAt: string
  sessionUrl: string
}) {
  const date = formatDate(opts.startsAt)
  const time = formatTime(opts.startsAt)

  return {
    subject: 'Lembrete: sua sessão começa em 24h — MockFlow',
    html: `
<!DOCTYPE html>
<html lang="pt-BR">
<head><meta charset="UTF-8" /><meta name="viewport" content="width=device-width,initial-scale=1" /></head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:system-ui,sans-serif;color:#18181b">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 16px">
    <tr><td align="center">
      <table width="100%" style="max-width:520px;background:#fff;border-radius:12px;overflow:hidden;border:1px solid #e4e4e7">

        <tr><td style="background:#18181b;padding:24px 32px">
          <p style="margin:0;font-size:20px;font-weight:700;color:#fff">
            <span style="color:#a78bfa">Mock</span>Flow
          </p>
        </td></tr>

        <tr><td style="padding:32px">
          <p style="margin:0 0 8px;font-size:22px;font-weight:700">Sua sessão é amanhã</p>
          <p style="margin:0 0 24px;color:#71717a">Olá, ${opts.recipientName}. Só passando para lembrar da sua sessão.</p>

          <table width="100%" style="border:1px solid #e4e4e7;border-radius:8px;overflow:hidden;margin-bottom:24px">
            <tr style="background:#fafafa">
              <td style="padding:12px 16px;font-size:13px;color:#71717a;border-bottom:1px solid #e4e4e7">${opts.otherPartyLabel}</td>
              <td style="padding:12px 16px;font-size:13px;font-weight:600;border-bottom:1px solid #e4e4e7;text-align:right">${opts.otherPartyName}</td>
            </tr>
            <tr style="background:#fafafa">
              <td style="padding:12px 16px;font-size:13px;color:#71717a;border-bottom:1px solid #e4e4e7">Data</td>
              <td style="padding:12px 16px;font-size:13px;font-weight:600;border-bottom:1px solid #e4e4e7;text-align:right;text-transform:capitalize">${date}</td>
            </tr>
            <tr style="background:#fafafa">
              <td style="padding:12px 16px;font-size:13px;color:#71717a">Horário</td>
              <td style="padding:12px 16px;font-size:13px;font-weight:600;text-align:right">${time} (60 min)</td>
            </tr>
          </table>

          <a href="${opts.sessionUrl}" style="display:block;text-align:center;background:#18181b;color:#fff;text-decoration:none;padding:12px 24px;border-radius:8px;font-weight:600;font-size:14px">
            Ver sessão
          </a>
        </td></tr>

        <tr><td style="padding:16px 32px;border-top:1px solid #e4e4e7;background:#fafafa">
          <p style="margin:0;font-size:12px;color:#a1a1aa;text-align:center">
            MockFlow · Feito para devs brasileiros
          </p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`,
  }
}

function bookingCancelled(opts: {
  recipientName: string
  otherPartyLabel: string
  otherPartyName: string
  startsAt: string
  refunded: boolean
  amount: number
}) {
  const date = formatDate(opts.startsAt)
  const time = formatTime(opts.startsAt)

  return {
    subject: 'Sessão cancelada — MockFlow',
    html: `
<!DOCTYPE html>
<html lang="pt-BR">
<head><meta charset="UTF-8" /><meta name="viewport" content="width=device-width,initial-scale=1" /></head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:system-ui,sans-serif;color:#18181b">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 16px">
    <tr><td align="center">
      <table width="100%" style="max-width:520px;background:#fff;border-radius:12px;overflow:hidden;border:1px solid #e4e4e7">

        <tr><td style="background:#18181b;padding:24px 32px">
          <p style="margin:0;font-size:20px;font-weight:700;color:#fff">
            <span style="color:#a78bfa">Mock</span>Flow
          </p>
        </td></tr>

        <tr><td style="padding:32px">
          <p style="margin:0 0 8px;font-size:22px;font-weight:700">Sessão cancelada</p>
          <p style="margin:0 0 24px;color:#71717a">Olá, ${opts.recipientName}. Uma sessão foi cancelada.</p>

          <table width="100%" style="border:1px solid #e4e4e7;border-radius:8px;overflow:hidden;margin-bottom:24px">
            <tr style="background:#fafafa">
              <td style="padding:12px 16px;font-size:13px;color:#71717a;border-bottom:1px solid #e4e4e7">${opts.otherPartyLabel}</td>
              <td style="padding:12px 16px;font-size:13px;font-weight:600;border-bottom:1px solid #e4e4e7;text-align:right">${opts.otherPartyName}</td>
            </tr>
            <tr style="background:#fafafa">
              <td style="padding:12px 16px;font-size:13px;color:#71717a;border-bottom:1px solid #e4e4e7">Data</td>
              <td style="padding:12px 16px;font-size:13px;font-weight:600;border-bottom:1px solid #e4e4e7;text-align:right;text-transform:capitalize">${date}</td>
            </tr>
            <tr style="background:#fafafa">
              <td style="padding:12px 16px;font-size:13px;color:#71717a">Horário</td>
              <td style="padding:12px 16px;font-size:13px;font-weight:600;text-align:right">${time} (60 min)</td>
            </tr>
          </table>

          ${opts.refunded
            ? `<div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:12px 16px;font-size:13px;color:#166534">
                Reembolso de R$ ${opts.amount.toFixed(2).replace('.', ',')} será processado em até 5 dias úteis.
               </div>`
            : `<div style="background:#fef9c3;border:1px solid #fde047;border-radius:8px;padding:12px 16px;font-size:13px;color:#713f12">
                Cancelamento com menos de 24h de antecedência — sem reembolso conforme política da plataforma.
               </div>`
          }
        </td></tr>

        <tr><td style="padding:16px 32px;border-top:1px solid #e4e4e7;background:#fafafa">
          <p style="margin:0;font-size:12px;color:#a1a1aa;text-align:center">
            MockFlow · Dúvidas? <a href="https://mockflow.com.br/ajuda" style="color:#a78bfa">Central de Ajuda</a>
          </p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`,
  }
}

// ---------- public send functions ----------

export async function sendBookingConfirmedLearner(opts: {
  to: string
  learnerName: string
  tutorName: string
  startsAt: string
  endsAt: string
  amount: number
  bookingId: string
  sessionUrl: string
  appUrl: string
}) {
  const template = bookingConfirmedLearner({
    ...opts,
    confirmationUrl: `${opts.appUrl}/booking/${opts.bookingId}/confirmation`,
  })
  try {
    const result = await resend.emails.send({ from: FROM, to: opts.to, ...template })
    console.log('[email] learner booking confirmed sent:', result)
    return result
  } catch (error) {
    console.error('[email] learner booking confirmed failed:', error)
    throw error
  }
}

export async function sendNewBookingTutor(opts: {
  to: string
  tutorName: string
  learnerName: string
  startsAt: string
  sessionUrl: string
  appUrl: string
}) {
  const template = newBookingTutor({
    ...opts,
    dashboardUrl: `${opts.appUrl}/agenda`,
  })
  try {
    const result = await resend.emails.send({ from: FROM, to: opts.to, ...template })
    console.log('[email] tutor new booking sent:', result)
    return result
  } catch (error) {
    console.error('[email] tutor new booking failed:', error)
    throw error
  }
}

export async function sendBookingCancelled(opts: {
  to: string
  recipientName: string
  otherPartyLabel: string
  otherPartyName: string
  startsAt: string
  refunded: boolean
  amount: number
}) {
  const template = bookingCancelled(opts)
  return resend.emails.send({ from: FROM, to: opts.to, ...template })
}

export async function sendSessionReminder(opts: {
  to: string
  recipientName: string
  otherPartyLabel: string
  otherPartyName: string
  startsAt: string
  sessionUrl: string
}) {
  const template = sessionReminder(opts)
  return resend.emails.send({ from: FROM, to: opts.to, ...template })
}

// ---------- liquidity / retention templates ----------

function reviewPrompt(opts: { learnerName: string; tutorName: string; reviewUrl: string }) {
  return {
    subject: `Como foi sua sessão com ${opts.tutorName}? — MockFlow`,
    html: `
<!DOCTYPE html>
<html lang="pt-BR">
<head><meta charset="UTF-8" /></head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:system-ui,sans-serif;color:#18181b">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 16px">
    <tr><td align="center">
      <table width="100%" style="max-width:520px;background:#fff;border-radius:12px;overflow:hidden;border:1px solid #e4e4e7">
        <tr><td style="background:#18181b;padding:24px 32px">
          <p style="margin:0;font-size:20px;font-weight:700;color:#fff"><span style="color:#a78bfa">Mock</span>Flow</p>
        </td></tr>
        <tr><td style="padding:32px">
          <p style="margin:0 0 8px;font-size:22px;font-weight:700">Como foi sua sessão?</p>
          <p style="margin:0 0 24px;color:#71717a">
            Olá, ${opts.learnerName}! Sua sessão com <strong>${opts.tutorName}</strong> já aconteceu.
            Avaliações ajudam outros candidatos a escolher o entrevistador certo — leva menos de 1 minuto.
          </p>
          <a href="${opts.reviewUrl}" style="display:block;text-align:center;background:#5b4cf3;color:#fff;text-decoration:none;padding:14px 24px;border-radius:8px;font-weight:600;font-size:14px;margin-bottom:16px">
            Avaliar sessão agora
          </a>
          <p style="margin:0;font-size:12px;color:#a1a1aa;text-align:center">
            Sua avaliação ficará pública no perfil do entrevistador.
          </p>
        </td></tr>
        <tr><td style="padding:16px 32px;border-top:1px solid #e4e4e7;background:#fafafa">
          <p style="margin:0;font-size:12px;color:#a1a1aa;text-align:center">MockFlow · <a href="https://mockflow.com.br/ajuda" style="color:#a78bfa">Ajuda</a></p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`,
  }
}

function feedbackPrompt(opts: { tutorName: string; learnerName: string; feedbackUrl: string }) {
  return {
    subject: `Envie o feedback para ${opts.learnerName} — MockFlow`,
    html: `
<!DOCTYPE html>
<html lang="pt-BR">
<head><meta charset="UTF-8" /></head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:system-ui,sans-serif;color:#18181b">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 16px">
    <tr><td align="center">
      <table width="100%" style="max-width:520px;background:#fff;border-radius:12px;overflow:hidden;border:1px solid #e4e4e7">
        <tr><td style="background:#18181b;padding:24px 32px">
          <p style="margin:0;font-size:20px;font-weight:700;color:#fff"><span style="color:#a78bfa">Mock</span>Flow</p>
        </td></tr>
        <tr><td style="padding:32px">
          <p style="margin:0 0 8px;font-size:22px;font-weight:700">O candidato aguarda seu feedback</p>
          <p style="margin:0 0 24px;color:#71717a">
            Olá, ${opts.tutorName}! Sua sessão com <strong>${opts.learnerName}</strong> já encerrou.
            O feedback estruturado é o principal diferencial do MockFlow — candidatos que recebem o plano de evolução voltam com muito mais frequência.
          </p>
          <a href="${opts.feedbackUrl}" style="display:block;text-align:center;background:#5b4cf3;color:#fff;text-decoration:none;padding:14px 24px;border-radius:8px;font-weight:600;font-size:14px;margin-bottom:16px">
            Enviar feedback agora
          </a>
          <p style="margin:0;font-size:12px;color:#a1a1aa;text-align:center">
            O feedback é privado — apenas o candidato terá acesso.
          </p>
        </td></tr>
        <tr><td style="padding:16px 32px;border-top:1px solid #e4e4e7;background:#fafafa">
          <p style="margin:0;font-size:12px;color:#a1a1aa;text-align:center">MockFlow · <a href="https://mockflow.com.br/ajuda" style="color:#a78bfa">Ajuda</a></p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`,
  }
}

function tutorReactivation(opts: { tutorName: string; availabilityUrl: string }) {
  return {
    subject: 'Sua agenda está vazia — candidatos te procuram — MockFlow',
    html: `
<!DOCTYPE html>
<html lang="pt-BR">
<head><meta charset="UTF-8" /></head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:system-ui,sans-serif;color:#18181b">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 16px">
    <tr><td align="center">
      <table width="100%" style="max-width:520px;background:#fff;border-radius:12px;overflow:hidden;border:1px solid #e4e4e7">
        <tr><td style="background:#18181b;padding:24px 32px">
          <p style="margin:0;font-size:20px;font-weight:700;color:#fff"><span style="color:#a78bfa">Mock</span>Flow</p>
        </td></tr>
        <tr><td style="padding:32px">
          <p style="margin:0 0 8px;font-size:22px;font-weight:700">Sua agenda está sem horários</p>
          <p style="margin:0 0 24px;color:#71717a">
            Olá, ${opts.tutorName}! Candidatos visitaram seu perfil mas não encontraram horários disponíveis.
            Adicione slots à sua agenda para não perder agendamentos.
          </p>
          <a href="${opts.availabilityUrl}" style="display:block;text-align:center;background:#5b4cf3;color:#fff;text-decoration:none;padding:14px 24px;border-radius:8px;font-weight:600;font-size:14px;margin-bottom:16px">
            Abrir minha agenda
          </a>
        </td></tr>
        <tr><td style="padding:16px 32px;border-top:1px solid #e4e4e7;background:#fafafa">
          <p style="margin:0;font-size:12px;color:#a1a1aa;text-align:center">MockFlow · <a href="https://mockflow.com.br/ajuda" style="color:#a78bfa">Ajuda</a></p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`,
  }
}

export async function sendReviewPrompt(opts: {
  to: string
  learnerName: string
  tutorName: string
  sessionId: string
  appUrl: string
}) {
  const template = reviewPrompt({
    learnerName: opts.learnerName,
    tutorName: opts.tutorName,
    reviewUrl: `${opts.appUrl}/agenda/${opts.sessionId}/review`,
  })
  return resend.emails.send({ from: FROM, to: opts.to, ...template })
}

export async function sendFeedbackPrompt(opts: {
  to: string
  tutorName: string
  learnerName: string
  sessionId: string
  appUrl: string
}) {
  const template = feedbackPrompt({
    tutorName: opts.tutorName,
    learnerName: opts.learnerName,
    feedbackUrl: `${opts.appUrl}/agenda/${opts.sessionId}/feedback`,
  })
  return resend.emails.send({ from: FROM, to: opts.to, ...template })
}

export async function sendTutorReactivation(opts: {
  to: string
  tutorName: string
  appUrl: string
}) {
  const template = tutorReactivation({
    tutorName: opts.tutorName,
    availabilityUrl: `${opts.appUrl}/dashboard/availability`,
  })
  return resend.emails.send({ from: FROM, to: opts.to, ...template })
}

// ---------- tutor cancellation ----------

function bookingCancelledByTutorLearner(opts: {
  recipientName: string
  tutorName: string
  startsAt: string
  amount: number
}) {
  const date = formatDate(opts.startsAt)
  const time = formatTime(opts.startsAt)

  return {
    subject: 'Sessão cancelada pelo entrevistador — MockFlow',
    html: `
<!DOCTYPE html>
<html lang="pt-BR">
<head><meta charset="UTF-8" /><meta name="viewport" content="width=device-width,initial-scale=1" /></head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:system-ui,sans-serif;color:#18181b">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 16px">
    <tr><td align="center">
      <table width="100%" style="max-width:520px;background:#fff;border-radius:12px;overflow:hidden;border:1px solid #e4e4e7">

        <tr><td style="background:#18181b;padding:24px 32px">
          <p style="margin:0;font-size:20px;font-weight:700;color:#fff">
            <span style="color:#a78bfa">Mock</span>Flow
          </p>
        </td></tr>

        <tr><td style="padding:32px">
          <p style="margin:0 0 8px;font-size:22px;font-weight:700">Sessão cancelada pelo entrevistador</p>
          <p style="margin:0 0 24px;color:#71717a">Olá, ${opts.recipientName}. Infelizmente o entrevistador precisou cancelar sua sessão.</p>

          <table width="100%" style="border:1px solid #e4e4e7;border-radius:8px;overflow:hidden;margin-bottom:24px">
            <tr style="background:#fafafa">
              <td style="padding:12px 16px;font-size:13px;color:#71717a;border-bottom:1px solid #e4e4e7">Entrevistador</td>
              <td style="padding:12px 16px;font-size:13px;font-weight:600;border-bottom:1px solid #e4e4e7;text-align:right">${opts.tutorName}</td>
            </tr>
            <tr style="background:#fafafa">
              <td style="padding:12px 16px;font-size:13px;color:#71717a;border-bottom:1px solid #e4e4e7">Data</td>
              <td style="padding:12px 16px;font-size:13px;font-weight:600;border-bottom:1px solid #e4e4e7;text-align:right;text-transform:capitalize">${date}</td>
            </tr>
            <tr style="background:#fafafa">
              <td style="padding:12px 16px;font-size:13px;color:#71717a">Horário</td>
              <td style="padding:12px 16px;font-size:13px;font-weight:600;text-align:right">${time} (60 min)</td>
            </tr>
          </table>

          <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:12px 16px;font-size:13px;color:#166534">
            Reembolso integral de R$ ${opts.amount.toFixed(2).replace('.', ',')} será processado em até 5 dias úteis.
          </div>
        </td></tr>

        <tr><td style="padding:16px 32px;border-top:1px solid #e4e4e7;background:#fafafa">
          <p style="margin:0;font-size:12px;color:#a1a1aa;text-align:center">
            MockFlow · Dúvidas? <a href="https://mockflow.com.br/ajuda" style="color:#a78bfa">Central de Ajuda</a>
          </p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`,
  }
}

function bookingCancelledByTutorConfirmation(opts: {
  tutorName: string
  startsAt: string
}) {
  const date = formatDate(opts.startsAt)
  const time = formatTime(opts.startsAt)

  return {
    subject: 'Cancelamento confirmado — MockFlow',
    html: `
<!DOCTYPE html>
<html lang="pt-BR">
<head><meta charset="UTF-8" /><meta name="viewport" content="width=device-width,initial-scale=1" /></head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:system-ui,sans-serif;color:#18181b">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 16px">
    <tr><td align="center">
      <table width="100%" style="max-width:520px;background:#fff;border-radius:12px;overflow:hidden;border:1px solid #e4e4e7">

        <tr><td style="background:#18181b;padding:24px 32px">
          <p style="margin:0;font-size:20px;font-weight:700;color:#fff">
            <span style="color:#a78bfa">Mock</span>Flow
          </p>
        </td></tr>

        <tr><td style="padding:32px">
          <p style="margin:0 0 8px;font-size:22px;font-weight:700">Cancelamento confirmado</p>
          <p style="margin:0 0 24px;color:#71717a">Olá, ${opts.tutorName}. Sua sessão foi cancelada com sucesso e o aluno será reembolsado integralmente.</p>

          <table width="100%" style="border:1px solid #e4e4e7;border-radius:8px;overflow:hidden">
            <tr style="background:#fafafa">
              <td style="padding:12px 16px;font-size:13px;color:#71717a;border-bottom:1px solid #e4e4e7">Data</td>
              <td style="padding:12px 16px;font-size:13px;font-weight:600;border-bottom:1px solid #e4e4e7;text-align:right;text-transform:capitalize">${date}</td>
            </tr>
            <tr style="background:#fafafa">
              <td style="padding:12px 16px;font-size:13px;color:#71717a">Horário</td>
              <td style="padding:12px 16px;font-size:13px;font-weight:600;text-align:right">${time} (60 min)</td>
            </tr>
          </table>
        </td></tr>

        <tr><td style="padding:16px 32px;border-top:1px solid #e4e4e7;background:#fafafa">
          <p style="margin:0;font-size:12px;color:#a1a1aa;text-align:center">
            MockFlow · Dúvidas? <a href="https://mockflow.com.br/ajuda" style="color:#a78bfa">Central de Ajuda</a>
          </p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`,
  }
}

export async function sendBookingCancelledByTutor(opts: {
  to: string
  recipientName: string
  tutorName: string
  startsAt: string
  amount: number
  appUrl: string
  isTutorCopy?: boolean
}) {
  const template = opts.isTutorCopy
    ? bookingCancelledByTutorConfirmation({ tutorName: opts.tutorName, startsAt: opts.startsAt })
    : bookingCancelledByTutorLearner({
        recipientName: opts.recipientName,
        tutorName: opts.tutorName,
        startsAt: opts.startsAt,
        amount: opts.amount,
      })
  return resend.emails.send({ from: FROM, to: opts.to, ...template })
}

// ---------- no-show ----------

function noShowReportedLearnerTemplate(opts: {
  recipientName: string
  tutorName: string
  startsAt: string
  amount: number
}) {
  const date = formatDate(opts.startsAt)
  const time = formatTime(opts.startsAt)

  return {
    subject: 'Reembolso em andamento — MockFlow',
    html: `
<!DOCTYPE html>
<html lang="pt-BR">
<head><meta charset="UTF-8" /><meta name="viewport" content="width=device-width,initial-scale=1" /></head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:system-ui,sans-serif;color:#18181b">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 16px">
    <tr><td align="center">
      <table width="100%" style="max-width:520px;background:#fff;border-radius:12px;overflow:hidden;border:1px solid #e4e4e7">

        <tr><td style="background:#18181b;padding:24px 32px">
          <p style="margin:0;font-size:20px;font-weight:700;color:#fff">
            <span style="color:#a78bfa">Mock</span>Flow
          </p>
        </td></tr>

        <tr><td style="padding:32px">
          <p style="margin:0 0 8px;font-size:22px;font-weight:700">Reporte de ausência recebido</p>
          <p style="margin:0 0 24px;color:#71717a">Olá, ${opts.recipientName}. Recebemos seu reporte de ausência do entrevistador ${opts.tutorName} na sessão abaixo.</p>

          <table width="100%" style="border:1px solid #e4e4e7;border-radius:8px;overflow:hidden;margin-bottom:24px">
            <tr style="background:#fafafa">
              <td style="padding:12px 16px;font-size:13px;color:#71717a;border-bottom:1px solid #e4e4e7">Entrevistador</td>
              <td style="padding:12px 16px;font-size:13px;font-weight:600;border-bottom:1px solid #e4e4e7;text-align:right">${opts.tutorName}</td>
            </tr>
            <tr style="background:#fafafa">
              <td style="padding:12px 16px;font-size:13px;color:#71717a;border-bottom:1px solid #e4e4e7">Data</td>
              <td style="padding:12px 16px;font-size:13px;font-weight:600;border-bottom:1px solid #e4e4e7;text-align:right;text-transform:capitalize">${date}</td>
            </tr>
            <tr style="background:#fafafa">
              <td style="padding:12px 16px;font-size:13px;color:#71717a">Horário</td>
              <td style="padding:12px 16px;font-size:13px;font-weight:600;text-align:right">${time} (60 min)</td>
            </tr>
          </table>

          <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:12px 16px;font-size:13px;color:#166534">
            Reembolso integral de R$ ${opts.amount.toFixed(2).replace('.', ',')} será processado em até 5 dias úteis.
          </div>
        </td></tr>

        <tr><td style="padding:16px 32px;border-top:1px solid #e4e4e7;background:#fafafa">
          <p style="margin:0;font-size:12px;color:#a1a1aa;text-align:center">
            MockFlow · Dúvidas? <a href="https://mockflow.com.br/ajuda" style="color:#a78bfa">Central de Ajuda</a>
          </p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`,
  }
}

function noShowNotifiedTutorTemplate(opts: {
  tutorName: string
  learnerName: string
  startsAt: string
}) {
  const date = formatDate(opts.startsAt)
  const time = formatTime(opts.startsAt)

  return {
    subject: 'Ausência reportada — MockFlow',
    html: `
<!DOCTYPE html>
<html lang="pt-BR">
<head><meta charset="UTF-8" /><meta name="viewport" content="width=device-width,initial-scale=1" /></head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:system-ui,sans-serif;color:#18181b">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 16px">
    <tr><td align="center">
      <table width="100%" style="max-width:520px;background:#fff;border-radius:12px;overflow:hidden;border:1px solid #e4e4e7">

        <tr><td style="background:#18181b;padding:24px 32px">
          <p style="margin:0;font-size:20px;font-weight:700;color:#fff">
            <span style="color:#a78bfa">Mock</span>Flow
          </p>
        </td></tr>

        <tr><td style="padding:32px">
          <p style="margin:0 0 8px;font-size:22px;font-weight:700">Ausência reportada</p>
          <p style="margin:0 0 24px;color:#71717a">Olá, ${opts.tutorName}. O candidato ${opts.learnerName} reportou sua ausência na sessão abaixo. O aluno foi reembolsado integralmente.</p>

          <table width="100%" style="border:1px solid #e4e4e7;border-radius:8px;overflow:hidden">
            <tr style="background:#fafafa">
              <td style="padding:12px 16px;font-size:13px;color:#71717a;border-bottom:1px solid #e4e4e7">Candidato</td>
              <td style="padding:12px 16px;font-size:13px;font-weight:600;border-bottom:1px solid #e4e4e7;text-align:right">${opts.learnerName}</td>
            </tr>
            <tr style="background:#fafafa">
              <td style="padding:12px 16px;font-size:13px;color:#71717a;border-bottom:1px solid #e4e4e7">Data</td>
              <td style="padding:12px 16px;font-size:13px;font-weight:600;border-bottom:1px solid #e4e4e7;text-align:right;text-transform:capitalize">${date}</td>
            </tr>
            <tr style="background:#fafafa">
              <td style="padding:12px 16px;font-size:13px;color:#71717a">Horário</td>
              <td style="padding:12px 16px;font-size:13px;font-weight:600;text-align:right">${time} (60 min)</td>
            </tr>
          </table>
        </td></tr>

        <tr><td style="padding:16px 32px;border-top:1px solid #e4e4e7;background:#fafafa">
          <p style="margin:0;font-size:12px;color:#a1a1aa;text-align:center">
            MockFlow · Dúvidas? <a href="https://mockflow.com.br/ajuda" style="color:#a78bfa">Central de Ajuda</a>
          </p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`,
  }
}

export async function sendNoShowReportedLearner(opts: {
  to: string
  recipientName: string
  tutorName: string
  startsAt: string
  amount: number
}) {
  const template = noShowReportedLearnerTemplate({
    recipientName: opts.recipientName,
    tutorName: opts.tutorName,
    startsAt: opts.startsAt,
    amount: opts.amount,
  })
  return resend.emails.send({ from: FROM, to: opts.to, ...template })
}

export async function sendNoShowNotifiedTutor(opts: {
  to: string
  tutorName: string
  learnerName: string
  startsAt: string
}) {
  const template = noShowNotifiedTutorTemplate({
    tutorName: opts.tutorName,
    learnerName: opts.learnerName,
    startsAt: opts.startsAt,
  })
  return resend.emails.send({ from: FROM, to: opts.to, ...template })
}
