import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { getActiveShift } from '@/lib/shift-service'
import { getActiveUsers } from '@/lib/user-service'
import { NavBar } from '@/components/NavBar'
import { DashboardClient } from '@/components/DashboardClient'

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/login')

  const [activeShift, activeUsers] = await Promise.all([
    getActiveShift(session.user.id),
    getActiveUsers(),
  ])

  return (
    <div className="min-h-screen bg-casino-dark">
      <NavBar user={session.user} />
      <main className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-casino-text mb-6">Tech Dashboard</h1>
        <DashboardClient
          initialShift={activeShift}
          techName={session.user.name}
          currentUserId={session.user.id}
          activeUsers={activeUsers}
        />
      </main>
    </div>
  )
}
