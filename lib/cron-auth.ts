import { NextRequest } from 'next/server'

// Vercel injeta Authorization: Bearer <CRON_SECRET> automaticamente nas chamadas de cron
export function isCronAuthorized(req: NextRequest): boolean {
  const authHeader = req.headers.get('authorization')
  if (!authHeader) return false
  const token = authHeader.replace('Bearer ', '')
  return token === process.env.CRON_SECRET
}
