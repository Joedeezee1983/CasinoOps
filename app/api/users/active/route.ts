import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getActiveUsers } from '@/lib/user-service'
import { rateLimit, getRequestIp } from '@/lib/rate-limit'

export async function GET(req: NextRequest): Promise<NextResponse> {
  try {
    if (!rateLimit(getRequestIp(req))) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
    }

    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const users = await getActiveUsers()
    return NextResponse.json({ data: users })
  } catch (error) {
    console.error('[users/active/GET] Unexpected error:', error)
    return NextResponse.json({ error: 'Failed to fetch active users' }, { status: 500 })
  }
}
