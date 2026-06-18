import { db } from '@/lib/db'
import type { UserRole } from '@prisma/client'
import type { UserSummary } from '@/types'
import bcrypt from 'bcryptjs'

const USER_SELECT = {
  id: true,
  name: true,
  email: true,
  role: true,
  isActive: true,
  createdAt: true,
} as const

const BCRYPT_SALT_ROUNDS = 12

/**
 * Returns all users ordered by creation date descending.
 */
export async function getAllUsers(): Promise<UserSummary[]> {
  return db.user.findMany({
    select: USER_SELECT,
    orderBy: { createdAt: 'desc' },
  })
}

/**
 * Creates a new user with a hashed password.
 * Throws if the email is already registered.
 */
export async function createUser(
  name: string,
  email: string,
  password: string,
  role: UserRole,
): Promise<UserSummary> {
  const hashedPassword = await bcrypt.hash(password, BCRYPT_SALT_ROUNDS)

  return db.user.create({
    data: { name, email, hashedPassword, role },
    select: USER_SELECT,
  })
}

/**
 * Toggles the isActive status of a user.
 * Throws if the user does not exist.
 */
export async function setUserActive(id: string, isActive: boolean): Promise<UserSummary> {
  return db.user.update({
    where: { id },
    data: { isActive },
    select: USER_SELECT,
  })
}
