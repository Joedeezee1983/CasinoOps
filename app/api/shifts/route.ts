import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { startShift, getActiveShift } from '@/lib/shift-service'
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

    const shift = await getActiveShift(session.user.id)
    return NextResponse.json({ data: shift })
  } catch (error) {
    console.error('[shifts/GET] Unexpected error:', error)
    return NextResponse.json({ error: 'Failed to fetch shift' }, { status: 500 })
  }
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    if (!rateLimit(getRequestIp(req))) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
    }

    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body: unknown = await req.json().catch(() => ({}))
    const rawTechIds =
      body !== null && typeof body === 'object' && 'techIds' in body && Array.isArray((body as { techIds: unknown }).techIds)
        ? (body as { techIds: unknown[] }).techIds
        : []
    const techIds = rawTechIds.filter((id): id is string => typeof id === 'string')
    if (!techIds.includes(session.user.id)) {
      techIds.unshift(session.user.id)
    }

    const shift = await startShift(session.user.id, techIds)
    return NextResponse.json({ data: shift }, { status: 201 })
  } catch (error) {
    if (error instanceof Error && error.message.includes('already have an active shift')) {
      return NextResponse.json({ error: error.message }, { status: 409 })
    }
    console.error('[shifts/POST] Unexpected error:', error)
    return NextResponse.json({ error: 'Failed to start shift' }, { status: 500 })
  }
}
