import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { getAllMachines } from '@/lib/machine-service'
import { NavBar } from '@/components/NavBar'
import { MachinesClient } from '@/components/MachinesClient'

export default async function MachinesPage() {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/login')

  const machines = await getAllMachines()

  return (
    <div className="min-h-screen bg-casino-dark">
      <NavBar user={session.user} />
      <main className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-casino-text mb-6">Machine Registry</h1>
        <MachinesClient
          initialMachines={machines}
          canAdd={['SUPERVISOR', 'ADMIN'].includes(session.user.role)}
        />
      </main>
    </div>
  )
}
