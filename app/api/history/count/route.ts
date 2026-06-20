import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { countCompletedShiftsForUser, countAllCompletedShifts } from '@/lib/cleanup-service'
import { rateLimit, getRequestIp } from '@/lib/rate-limit'

export async function GET(req: NextRequest): Promise<NextResponse> {
  try {
    if (!rateLimit(getRequestIp(req))) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
    }

    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const userId = req.nextUrl.searchParams.get('userId')
    if (!userId) {
      return NextResponse.json({ error: 'userId query parameter is required' }, { status: 400 })
    }

    const count = userId === 'all'
      ? await countAllCompletedShifts()
      : await countCompletedShiftsForUser(userId)

    return NextResponse.json({ data: { count } })
  } catch (error) {
    console.error('[history/count/GET] Unexpected error:', error)
    return NextResponse.json({ error: 'Failed to count history' }, { status: 500 })
  }
}
