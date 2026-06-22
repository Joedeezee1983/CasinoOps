import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { forceEndShift } from '@/lib/shift-service'

export async function POST(
  _req: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse> {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    if (session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const shift = await forceEndShift(params.id)
    return NextResponse.json({ data: shift })
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === 'Shift not found.') {
        return NextResponse.json({ error: error.message }, { status: 404 })
      }
      if (error.message === 'Shift is not active.') {
        return NextResponse.json({ error: error.message }, { status: 409 })
      }
    }
    console.error('[shifts/force-end] Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
