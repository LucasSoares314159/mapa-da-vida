import nodemailer from 'nodemailer'

const smtpUser = process.env.SMTP_USER
const smtpPass = process.env.SMTP_PASS

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST!,
  port: Number(process.env.SMTP_PORT ?? 587),
  secure: process.env.SMTP_SECURE === 'true',
  auth: smtpUser ? { user: smtpUser, pass: smtpPass } : undefined,
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
