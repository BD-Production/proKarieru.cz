import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

const FROM_EMAIL = 'proKarieru <noreply@prokarieru.cz>'
const NOTIFICATION_EMAIL = process.env.NOTIFICATION_EMAIL || 'notifikace@prokarieru.cz'

interface SendEmailOptions {
  to: string | string[]
  subject: string
  html: string
  replyTo?: string
}

export async function sendEmail({ to, subject, html, replyTo }: SendEmailOptions) {
  try {
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: Array.isArray(to) ? to : [to],
      subject,
      html,
      replyTo,
    })

    if (error) {
      console.error('Email send error:', error)
      return { success: false, error }
    }

    return { success: true, data }
  } catch (err) {
    console.error('Email send exception:', err)
    return { success: false, error: err }
  }
}

// Email pro admina když přijde nová firemní poptávka
export async function sendCompanyInquiryNotification(inquiry: {
  companyName: string
  contactName: string
  email: string
  phone?: string
  message?: string
}) {
  const html = `
    <h2>Nová firemní poptávka na proKariéru</h2>
    <p><strong>Firma:</strong> ${inquiry.companyName}</p>
    <p><strong>Kontaktní osoba:</strong> ${inquiry.contactName}</p>
    <p><strong>Email:</strong> <a href="mailto:${inquiry.email}">${inquiry.email}</a></p>
    ${inquiry.phone ? `<p><strong>Telefon:</strong> ${inquiry.phone}</p>` : ''}
    ${inquiry.message ? `<p><strong>Zpráva:</strong></p><p>${inquiry.message}</p>` : ''}
    <hr>
    <p style="color: #666; font-size: 12px;">Tento email byl automaticky vygenerován systémem proKariéru.</p>
  `

  return sendEmail({
    to: NOTIFICATION_EMAIL,
    subject: `Nová poptávka: ${inquiry.companyName}`,
    html,
    replyTo: inquiry.email,
  })
}

// Email pro firmu když se někdo přihlásí přes kontaktní formulář
export async function sendNewLeadNotification(lead: {
  candidateName: string
  candidateEmail: string
  candidatePhone?: string
  message?: string
  companyName: string
  companyEmail: string
}) {
  const html = `
    <h2>Nový zájemce o vaši firmu</h2>
    <p>Někdo projevil zájem o firmu <strong>${lead.companyName}</strong> na portálu proKariéru.</p>
    <hr>
    <p><strong>Jméno:</strong> ${lead.candidateName}</p>
    <p><strong>Email:</strong> <a href="mailto:${lead.candidateEmail}">${lead.candidateEmail}</a></p>
    ${lead.candidatePhone ? `<p><strong>Telefon:</strong> ${lead.candidatePhone}</p>` : ''}
    ${lead.message ? `<p><strong>Zpráva:</strong></p><p>${lead.message}</p>` : ''}
    <hr>
    <p style="color: #666; font-size: 12px;">Tento email byl automaticky vygenerován systémem proKariéru.</p>
  `

  return sendEmail({
    to: lead.companyEmail,
    subject: `Nový zájemce: ${lead.candidateName}`,
    html,
    replyTo: lead.candidateEmail,
  })
}

// Email pro admina když přijde nový zájemce
export async function sendLeadNotificationToAdmin(lead: {
  candidateName: string
  candidateEmail: string
  candidatePhone?: string
  message?: string
  companyName: string
}) {
  const html = `
    <h2>Nový zájemce na proKariéru</h2>
    <p><strong>Firma:</strong> ${lead.companyName}</p>
    <p><strong>Jméno:</strong> ${lead.candidateName}</p>
    <p><strong>Email:</strong> <a href="mailto:${lead.candidateEmail}">${lead.candidateEmail}</a></p>
    ${lead.candidatePhone ? `<p><strong>Telefon:</strong> ${lead.candidatePhone}</p>` : ''}
    ${lead.message ? `<p><strong>Zpráva:</strong></p><p>${lead.message}</p>` : ''}
    <hr>
    <p style="color: #666; font-size: 12px;">Tento email byl automaticky vygenerován systémem proKariéru.</p>
  `

  return sendEmail({
    to: NOTIFICATION_EMAIL,
    subject: `Nový zájemce o ${lead.companyName}: ${lead.candidateName}`,
    html,
    replyTo: lead.candidateEmail,
  })
}
