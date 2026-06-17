import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getActiveMachinesDown } from '@/lib/task-service'

export async function GET(): Promise<NextResponse> {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const machines = await getActiveMachinesDown()
    return NextResponse.json({ data: machines })
  } catch (error) {
    console.error(
      '[supervisor/machines-down/GET] Unexpected error:',
      error instanceof Error ? error.message : error
    )
    return NextResponse.json({ error: 'Failed to fetch down machines' }, { status: 500 })
  }
}
