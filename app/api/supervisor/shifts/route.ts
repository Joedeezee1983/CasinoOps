import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getAllActiveShifts } from '@/lib/shift-service'

export async function GET(): Promise<NextResponse> {
  try {
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
