import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST!,
  port: Number(process.env.SMTP_PORT ?? 587),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER!,
    pass: process.env.SMTP_PASS!,
  },
})

export interface EmailPayload {
  to: string
  subject: string
  html: string
}

export async function enviarEmail(payload: EmailPayload): Promise<void> {
  await transporter.sendMail({
    from: process.env.SMTP_FROM!,
    to: payload.to,
    subject: payload.subject,
    html: payload.html,
  })
}
