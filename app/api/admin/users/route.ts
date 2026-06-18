import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getAllUsers, createUser } from '@/lib/user-service'
import type { UserRole } from '@prisma/client'

const VALID_ROLES: UserRole[] = ['TECH', 'SUPERVISOR', 'ADMIN']

export async function GET(): Promise<NextResponse> {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const users = await getAllUsers()
    return NextResponse.json({ data: users })
  } catch (error) {
    console.error('[admin/users/GET] Unexpected error:', error)
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 })
  }
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body: unknown = await req.json()
    if (!isCreateUserBody(body)) {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
    }

    const { name, email, password, role } = body
    const user = await createUser(name, email, password, role)
    return NextResponse.json({ data: user }, { status: 201 })
  } catch (error) {
    if (isUniqueConstraintError(error)) {
      return NextResponse.json({ error: 'Email is already registered' }, { status: 409 })
    }
    console.error('[admin/users/POST] Unexpected error:', error)
    return NextResponse.json({ error: 'Failed to create user' }, { status: 500 })
  }
}

interface CreateUserBody {
  name: string
  email: string
  password: string
  role: UserRole
}

function isCreateUserBody(value: unknown): value is CreateUserBody {
  if (typeof value !== 'object' || value === null) return false
  const v = value as Record<string, unknown>
  return (
    typeof v.name === 'string' && v.name.trim().length > 0 &&
    typeof v.email === 'string' && v.email.includes('@') &&
    typeof v.password === 'string' && v.password.length >= 6 &&
    typeof v.role === 'string' && VALID_ROLES.includes(v.role as UserRole)
  )
}

function isUniqueConstraintError(error: unknown): boolean {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    (error as { code: string }).code === 'P2002'
  )
}
