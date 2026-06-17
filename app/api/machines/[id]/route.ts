import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { updateMachineStatus } from '@/lib/machine-service'
import { validateMachineStatus } from '@/lib/validation'

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse> {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const status = validateMachineStatus((body as Record<string, unknown>).status)
    const machine = await updateMachineStatus(params.id, status)

    return NextResponse.json({ data: machine })
  } catch (error) {
    if (error instanceof Error && error.message.includes('must be one of')) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }
    console.error('[machines/[id]/PATCH] Unexpected error:', error)
    return NextResponse.json({ error: 'Failed to update machine status' }, { status: 500 })
  }
}
