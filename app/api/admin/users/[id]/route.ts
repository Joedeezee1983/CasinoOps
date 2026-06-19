import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { setUserActive } from '@/lib/user-service'
import { rateLimit, getRequestIp } from '@/lib/rate-limit'

interface RouteParams {
  params: { id: string }
}

export async function PATCH(req: NextRequest, { params }: RouteParams): Promise<NextResponse> {
  try {
    if (!rateLimit(getRequestIp(req))) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
    }

    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body: unknown = await req.json()
    if (!isPatchBody(body)) {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
    }

    const user = await setUserActive(params.id, body.isActive)
    return NextResponse.json({ data: user })
  } catch (error) {
    if (isNotFoundError(error)) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }
    console.error('[admin/users/PATCH] Unexpected error:', error)
    return NextResponse.json({ error: 'Failed to update user' }, { status: 500 })
  }
}

interface PatchBody {
  isActive: boolean
}

function isPatchBody(value: unknown): value is PatchBody {
  return (
    typeof value === 'object' &&
    value !== null &&
    'isActive' in value &&
    typeof (value as Record<string, unknown>).isActive === 'boolean'
  )
}

function isNotFoundError(error: unknown): boolean {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    (error as { code: string }).code === 'P2025'
  )
}
