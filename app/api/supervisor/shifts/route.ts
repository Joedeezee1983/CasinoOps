import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getAllActiveShifts } from '@/lib/shift-service'
import { rateLimit, getRequestIp } from '@/lib/rate-limit'

export async function GET(req: NextRequest): Promise<NextResponse> {
  try {
    if (!rateLimit(getRequestIp(req))) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
    }

    const session = await getServerSession(authOptions)
    if (!session || !['SUPERVISOR', 'ADMIN'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const shifts = await getAllActiveShifts()
    return NextResponse.json({ data: shifts })
  } catch (error) {
    console.error('[supervisor/shifts/GET] Unexpected error:', error)
    return NextResponse.json({ error: 'Failed to fetch active shifts' }, { status: 500 })
  }
}
