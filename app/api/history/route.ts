import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getShiftHistory } from '@/lib/briefing-service'
import {
  deleteCompletedShiftsForUser,
  deleteAllCompletedShifts,
} from '@/lib/cleanup-service'
import { rateLimit, getRequestIp } from '@/lib/rate-limit'

const DEFAULT_PAGE = 1
const DEFAULT_PAGE_SIZE = 10

export async function GET(req: NextRequest): Promise<NextResponse> {
  try {
    if (!rateLimit(getRequestIp(req))) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
    }

    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const page = parseInt(searchParams.get('page') ?? String(DEFAULT_PAGE), 10)
    const pageSize = parseInt(searchParams.get('pageSize') ?? String(DEFAULT_PAGE_SIZE), 10)

    const reports = await getShiftHistory(page, pageSize)
    return NextResponse.json({ data: reports })
  } catch (error) {
    console.error('[history/GET] Unexpected error:', error)
    return NextResponse.json({ error: 'Failed to fetch history' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest): Promise<NextResponse> {
  try {
    if (!rateLimit(getRequestIp(req))) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
    }

    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body: unknown = await req.json().catch(() => null)
    const userId = extractUserId(body)

    // Targeting another user or all users requires ADMIN
    const isAdminOperation = userId === 'all' || (userId !== null && userId !== session.user.id)
    if (isAdminOperation && session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const deleted = userId === 'all'
      ? await deleteAllCompletedShifts()
      : await deleteCompletedShiftsForUser(userId ?? session.user.id)

    return NextResponse.json({ data: { deleted } })
  } catch (error) {
    console.error('[history/DELETE] Unexpected error:', error)
    return NextResponse.json({ error: 'Failed to delete history' }, { status: 500 })
  }
}

function extractUserId(body: unknown): string | null {
  if (typeof body !== 'object' || body === null) return null
  const b = body as Record<string, unknown>
  return typeof b.userId === 'string' ? b.userId : null
}
