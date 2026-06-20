import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { NavBar } from '@/components/NavBar'
import { CleanupPanel } from '@/components/CleanupPanel'
import { ClearAllHistoryPanel } from '@/components/ClearAllHistoryPanel'
import { getAllUsers } from '@/lib/user-service'

export default async function AdminSettingsPage() {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/login')
  if (session.user.role !== 'ADMIN') redirect('/dashboard')

  const users = await getAllUsers()

  return (
    <div className="min-h-screen bg-casino-dark">
      <NavBar user={session.user} />
      <main className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        <h1 className="text-2xl font-bold text-casino-text">Admin Settings</h1>
        <CleanupPanel />
        <ClearAllHistoryPanel users={users} />
      </main>
    </div>
  )
}
