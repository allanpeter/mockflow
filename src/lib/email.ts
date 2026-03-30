import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

const FROM = 'MockFlow <noreply@mockflow.com.br>'

// ---------- helpers ----------

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('pt-BR', {
    weekday: 'long', day: '2-digit', month: 'long', year: 'numeric',
  })
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString('pt-BR', {
    hour: '2-digit', minute: '2-digit',
  })
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
