import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { getAllUsers } from '@/lib/user-service'
import { NavBar } from '@/components/NavBar'
import UsersClient from '@/components/UsersClient'

export default async function AdminUsersPage() {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/login')
  if (session.user.role !== 'ADMIN') redirect('/dashboard')

  const users = await getAllUsers()

  return (
    <div className="min-h-screen bg-casino-dark">
      <NavBar user={session.user} />
      <main className="max-w-6xl mx-auto px-4 py-8">
        <UsersClient initialUsers={users} />
      </main>
    </div>
  )
}
