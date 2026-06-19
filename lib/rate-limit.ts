import { NextRequest } from 'next/server'

const attempts = new Map<string, { count: number; resetAt: number }>()

/**
 * In-memory rate limiter keyed by IP address.
 * Returns true if the request is within the allowed window, false if it should be blocked.
 */
export function rateLimit(ip: string, maxAttempts = 10, windowMs = 60000): boolean {
  const now = Date.now()
  const record = attempts.get(ip)

  if (!record || now > record.resetAt) {
    attempts.set(ip, { count: 1, resetAt: now + windowMs })
    return true
  }

  if (record.count >= maxAttempts) return false

  record.count++
  return true
}

/**
 * Extracts the client IP from request headers.
 * Prefers x-forwarded-for (set by proxies/load balancers), then x-real-ip.
 */
export function getRequestIp(req: NextRequest): string {
  const forwarded = req.headers.get('x-forwarded-for')
  if (forwarded) return forwarded.split(',')[0].trim()
  return req.headers.get('x-real-ip') ?? 'unknown'
}
