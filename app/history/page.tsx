import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { getShiftHistory } from '@/lib/briefing-service'
import { NavBar } from '@/components/NavBar'
import { HistoryClient } from '@/components/HistoryClient'

const INITIAL_PAGE = 1
const INITIAL_PAGE_SIZE = 10

export default async function HistoryPage() {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/login')

  const reports = await getShiftHistory(INITIAL_PAGE, INITIAL_PAGE_SIZE)

  return (
    <div className="min-h-screen bg-casino-dark">
      <NavBar user={session.user} />
      <main className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-casino-text mb-6">Shift History</h1>
        <HistoryClient initialReports={reports} />
      </main>
    </div>
  )
}
