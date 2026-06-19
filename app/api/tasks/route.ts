import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { createTask } from '@/lib/task-service'
import { validateCreateTaskInput } from '@/lib/validation'
import { getActiveShift } from '@/lib/shift-service'
import { rateLimit, getRequestIp } from '@/lib/rate-limit'

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    if (!rateLimit(getRequestIp(req))) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
    }

    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const input = validateCreateTaskInput(body)

    const shift = await getActiveShift(session.user.id)
    if (!shift) {
      return NextResponse.json({ error: 'No active shift. Start a shift before logging tasks.' }, { status: 400 })
    }

    const task = await createTask(shift.id, session.user.id, input)
    return NextResponse.json({ data: task }, { status: 201 })
  } catch (error) {
    if (error instanceof Error && ['required', 'must be one of'].some((m) => error.message.includes(m))) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }
    console.error('[tasks/POST] Unexpected error:', error)
    return NextResponse.json({ error: 'Failed to log task' }, { status: 500 })
  }
}
