import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

const BCRYPT_ROUNDS = 12

async function main(): Promise<void> {
  const hashedPassword = await bcrypt.hash('CasinoOps2026!', BCRYPT_ROUNDS)

  const user = await prisma.user.create({
    data: {
      name: 'Joseph Dobbs',
      email: 'joseph.dobbs@jay-de.com',
      hashedPassword,
      role: 'ADMIN',
    },
  })

  console.log('Created admin user:', user.email)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
