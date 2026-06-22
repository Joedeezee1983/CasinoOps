import { NextRequest, NextResponse } from 'next/server'
import { autoEndStaleShifts } from '@/lib/shift-service'

const CRON_SECRET = process.env.CRON_SECRET

/**
 * GET /api/cron/shift-timeout
 * Triggers the stale-shift cleanup. Protected by X-Cron-Secret header when CRON_SECRET is set.
 * Call this from PM2 or an external cron if the setInterval approach is insufficient.
 */
export async function GET(req: NextRequest): Promise<NextResponse> {
  try {
    const secret = req.headers.get('x-cron-secret')
    if (CRON_SECRET && secret !== CRON_SECRET) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const count = await autoEndStaleShifts()
    if (count > 0) {
      console.log(`[cron/shift-timeout] Auto-ended ${count} stale shift(s)`)
    }
    return NextResponse.json({ data: { autoEnded: count } })
  } catch (error) {
    console.error('[cron/shift-timeout] Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
