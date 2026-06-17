import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { getAllActiveShifts } from '@/lib/shift-service'
import { NavBar } from '@/components/NavBar'
import { SupervisorView } from '@/components/SupervisorView'
import { MachinesDown } from '@/components/MachinesDown'

export default async function SupervisorPage() {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/login')
  if (!['SUPERVISOR', 'ADMIN'].includes(session.user.role)) redirect('/dashboard')

  const activeShifts = await getAllActiveShifts()

  return (
    <div className="min-h-screen bg-casino-dark">
      <NavBar user={session.user} />
      <main className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-casino-text mb-6">Supervisor View</h1>
        <div className="mb-6">
          <MachinesDown />
        </div>
        <SupervisorView initialShifts={activeShifts} />
      </main>
    </div>
  )
}
