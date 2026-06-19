import NextAuth from 'next-auth'
import { authOptions } from '@/lib/auth'
import { NextRequest, NextResponse } from 'next/server'
import { rateLimit, getRequestIp } from '@/lib/rate-limit'

const nextAuthHandler = NextAuth(authOptions)

export { nextAuthHandler as GET }

// Login attempts are rate-limited tighter than general API routes to prevent brute force
export async function POST(
  req: NextRequest,
  ctx: { params: { nextauth: string[] } }
): Promise<Response> {
  if (!rateLimit(getRequestIp(req), 5, 60000)) {
    return NextResponse.json(
      { error: 'Too many login attempts. Please try again later.' },
      { status: 429 }
    )
  }
  return nextAuthHandler(req, ctx)
}
