import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getAllMachines, createMachine } from '@/lib/machine-service'
import { validateCreateMachineInput } from '@/lib/validation'

export async function GET(): Promise<NextResponse> {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const machines = await getAllMachines()
    return NextResponse.json({ data: machines })
  } catch (error) {
    console.error('[machines/GET] Unexpected error:', error)
    return NextResponse.json({ error: 'Failed to fetch machines' }, { status: 500 })
  }
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !['SUPERVISOR', 'ADMIN'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await req.json()
    const input = validateCreateMachineInput(body)
    const machine = await createMachine(input)

    return NextResponse.json({ data: machine }, { status: 201 })
  } catch (error) {
    if (error instanceof Error && error.message.includes('required')) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }
    console.error('[machines/POST] Unexpected error:', error)
    return NextResponse.json({ error: 'Failed to create machine' }, { status: 500 })
  }
}
