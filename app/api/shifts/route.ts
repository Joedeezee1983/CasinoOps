import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { startShift, getActiveShift } from '@/lib/shift-service'

export async function GET(): Promise<NextResponse> {
  try {
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

export async function POST(): Promise<NextResponse> {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const shift = await startShift(session.user.id)
    return NextResponse.json({ data: shift }, { status: 201 })
  } catch (error) {
    if (error instanceof Error && error.message.includes('already have an active shift')) {
      return NextResponse.json({ error: error.message }, { status: 409 })
    }
    console.error('[shifts/POST] Unexpected error:', error)
    return NextResponse.json({ error: 'Failed to start shift' }, { status: 500 })
  }
}
