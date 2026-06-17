import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getShiftHistory } from '@/lib/briefing-service'

const DEFAULT_PAGE = 1
const DEFAULT_PAGE_SIZE = 10

export async function GET(req: NextRequest): Promise<NextResponse> {
  try {
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
