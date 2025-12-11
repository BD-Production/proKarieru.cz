import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

const FROM_EMAIL = 'proKarieru <noreply@prokarieru.cz>'
const NOTIFICATION_EMAIL = process.env.NOTIFICATION_EMAIL || 'info@prokarieru.cz'

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

// Email pro admina když prijde nová firemní poptávka
export async function sendCompanyInquiryNotification(inquiry: {
  companyName: string
  contactName: string
  email: string
  phone?: string
  message?: string
}) {
  const html = `
    <h2>Nova firemni poptavka na proKarieru</h2>
    <p><strong>Firma:</strong> ${inquiry.companyName}</p>
    <p><strong>Kontaktni osoba:</strong> ${inquiry.contactName}</p>
    <p><strong>Email:</strong> <a href="mailto:${inquiry.email}">${inquiry.email}</a></p>
    ${inquiry.phone ? `<p><strong>Telefon:</strong> ${inquiry.phone}</p>` : ''}
    ${inquiry.message ? `<p><strong>Zprava:</strong></p><p>${inquiry.message}</p>` : ''}
    <hr>
    <p style="color: #666; font-size: 12px;">Tento email byl automaticky vygenerovan systemem proKarieru.</p>
  `

  return sendEmail({
    to: NOTIFICATION_EMAIL,
    subject: `Nova poptavka: ${inquiry.companyName}`,
    html,
    replyTo: inquiry.email,
  })
}

// Email pro firmu kdyz se nekdo prihlasi pres kontaktni formular
export async function sendNewLeadNotification(lead: {
  candidateName: string
  candidateEmail: string
  candidatePhone?: string
  message?: string
  companyName: string
  companyEmail: string
}) {
  const html = `
    <h2>Novy zajemce o vasi firmu</h2>
    <p>Nekdo projevil zajem o firmu <strong>${lead.companyName}</strong> na portalu proKarieru.</p>
    <hr>
    <p><strong>Jmeno:</strong> ${lead.candidateName}</p>
    <p><strong>Email:</strong> <a href="mailto:${lead.candidateEmail}">${lead.candidateEmail}</a></p>
    ${lead.candidatePhone ? `<p><strong>Telefon:</strong> ${lead.candidatePhone}</p>` : ''}
    ${lead.message ? `<p><strong>Zprava:</strong></p><p>${lead.message}</p>` : ''}
    <hr>
    <p style="color: #666; font-size: 12px;">Tento email byl automaticky vygenerovan systemem proKarieru.</p>
  `

  return sendEmail({
    to: lead.companyEmail,
    subject: `Novy zajemce: ${lead.candidateName}`,
    html,
    replyTo: lead.candidateEmail,
  })
}

// Email pro admina kdyz prijde novy zajemce
export async function sendLeadNotificationToAdmin(lead: {
  candidateName: string
  candidateEmail: string
  candidatePhone?: string
  message?: string
  companyName: string
}) {
  const html = `
    <h2>Novy zajemce na proKarieru</h2>
    <p><strong>Firma:</strong> ${lead.companyName}</p>
    <p><strong>Jmeno:</strong> ${lead.candidateName}</p>
    <p><strong>Email:</strong> <a href="mailto:${lead.candidateEmail}">${lead.candidateEmail}</a></p>
    ${lead.candidatePhone ? `<p><strong>Telefon:</strong> ${lead.candidatePhone}</p>` : ''}
    ${lead.message ? `<p><strong>Zprava:</strong></p><p>${lead.message}</p>` : ''}
    <hr>
    <p style="color: #666; font-size: 12px;">Tento email byl automaticky vygenerovan systemem proKarieru.</p>
  `

  return sendEmail({
    to: NOTIFICATION_EMAIL,
    subject: `Novy zajemce o ${lead.companyName}: ${lead.candidateName}`,
    html,
    replyTo: lead.candidateEmail,
  })
}
