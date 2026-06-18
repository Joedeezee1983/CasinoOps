'use client'

import Link from 'next/link'
import { signOut } from 'next-auth/react'
import type { UserRole } from '@prisma/client'

export interface NavBarProps {
  user: {
    name: string
    email: string
    role: UserRole
  }
}

export default function NavBar({ user }: NavBarProps) {
  const isSupervisor = ['SUPERVISOR', 'ADMIN'].includes(user.role)
  const isAdmin = user.role === 'ADMIN'

  return (
    <nav className="bg-casino-card border-b border-casino-border px-4 py-3">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/dashboard" className="text-casino-accent font-bold text-lg">
            CasinoOps
          </Link>
          <div className="flex items-center gap-4 text-sm">
            <Link href="/dashboard" className="text-casino-muted hover:text-casino-text transition-colors">
              Dashboard
            </Link>
            <Link href="/briefing" className="text-casino-muted hover:text-casino-text transition-colors">
              Briefing
            </Link>
            <Link href="/machines" className="text-casino-muted hover:text-casino-text transition-colors">
              Machines
            </Link>
            <Link href="/history" className="text-casino-muted hover:text-casino-text transition-colors">
              History
            </Link>
            {isSupervisor && (
              <Link href="/supervisor" className="text-casino-muted hover:text-casino-text transition-colors">
                Supervisor
              </Link>
            )}
            {isAdmin && (
              <Link href="/admin/users" className="text-casino-muted hover:text-casino-text transition-colors">
                Users
              </Link>
            )}
          </div>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-casino-muted">{user.name}</span>
          <span className="text-xs bg-casino-border text-casino-muted px-2 py-1 rounded">
            {user.role}
          </span>
          <button
            onClick={() => signOut({ callbackUrl: '/login' })}
            className="text-sm text-casino-muted hover:text-casino-danger transition-colors"
          >
            Sign out
          </button>
        </div>
      </div>
    </nav>
  )
}

export { NavBar }
