import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getMostRecentReport } from '@/lib/briefing-service'

export async function GET(): Promise<NextResponse> {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const report = await getMostRecentReport()
    return NextResponse.json({ data: report })
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    console.error('[briefing/GET] Unexpected error:', message)
    const responseMessage =
      process.env.NODE_ENV === 'development' ? message : 'Failed to load briefing'
    return NextResponse.json({ error: responseMessage }, { status: 500 })
  }
}
