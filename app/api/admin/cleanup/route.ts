import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { deleteOldShifts, countShiftsOlderThan } from '@/lib/cleanup-service'

const MIN_RETENTION_DAYS = 30

function parseDaysToKeep(value: unknown): number | null {
  const n = Number(value)
  if (!Number.isInteger(n) || n < MIN_RETENTION_DAYS) return null
  return n
}

export async function GET(req: NextRequest): Promise<NextResponse> {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const daysToKeep = parseDaysToKeep(req.nextUrl.searchParams.get('daysToKeep'))
    if (daysToKeep === null) {
      return NextResponse.json({ error: 'daysToKeep must be an integer >= 30' }, { status: 400 })
    }

    const count = await countShiftsOlderThan(daysToKeep)
    return NextResponse.json({ data: { count } })
  } catch (error) {
    console.error('[admin/cleanup/GET] Unexpected error:', error)
    return NextResponse.json({ error: 'Failed to count records' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest): Promise<NextResponse> {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body: unknown = await req.json()
    if (typeof body !== 'object' || body === null) {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
    }

    const daysToKeep = parseDaysToKeep((body as Record<string, unknown>).daysToKeep)
    if (daysToKeep === null) {
      return NextResponse.json({ error: 'daysToKeep must be an integer >= 30' }, { status: 400 })
    }

    const deleted = await deleteOldShifts(daysToKeep)
    console.log(`[admin/cleanup/DELETE] Deleted ${deleted} shifts older than ${daysToKeep} days`)
    return NextResponse.json({ data: { deleted } })
  } catch (error) {
    console.error('[admin/cleanup/DELETE] Unexpected error:', error)
    return NextResponse.json({ error: 'Failed to delete records' }, { status: 500 })
  }
}
