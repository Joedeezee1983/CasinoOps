import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { NavBar } from '@/components/NavBar'
import { BriefingClient } from '@/components/BriefingClient'

export default async function BriefingPage() {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/login')

  return (
    <div className="min-h-screen bg-casino-dark">
      <NavBar user={session.user} />
      <main className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-casino-text mb-6">Incoming Shift Briefing</h1>
        <BriefingClient />
      </main>
    </div>
  )
}
