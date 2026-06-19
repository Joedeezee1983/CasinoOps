'use client'

import { useState } from 'react'
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
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const isSupervisor = ['SUPERVISOR', 'ADMIN'].includes(user.role)
  const isAdmin = user.role === 'ADMIN'

  const navLinks = [
    { href: '/dashboard', label: 'Dashboard' },
    { href: '/briefing', label: 'Briefing' },
    { href: '/machines', label: 'Machines' },
    { href: '/history', label: 'History' },
    ...(isSupervisor ? [{ href: '/supervisor', label: 'Supervisor' }] : []),
    ...(isAdmin ? [{ href: '/admin/users', label: 'Users' }, { href: '/admin/settings', label: 'Settings' }] : []),
  ]

  return (
    <nav className="bg-casino-card border-b border-casino-border">
      <div className="max-w-6xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/dashboard" className="text-casino-accent font-bold text-lg">
              CasinoOps
            </Link>
            <div className="hidden md:flex items-center gap-4 text-sm">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-casino-muted hover:text-casino-text transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          <div className="hidden md:flex items-center gap-4">
            <span className="text-sm text-casino-muted">{user.name}</span>
            <span className="text-xs bg-casino-border text-casino-muted px-2 py-1 rounded">
              {user.role}
            </span>
            <button
              onClick={() => signOut({ callbackUrl: '/login' })}
              className="text-sm text-casino-muted hover:text-casino-danger transition-colors min-h-[44px] px-2"
            >
              Sign out
            </button>
          </div>

          <button
            onClick={() => setIsMenuOpen((prev) => !prev)}
            className="md:hidden flex flex-col justify-center gap-1.5 w-11 h-11 text-casino-muted hover:text-casino-text transition-colors"
            aria-label="Toggle navigation menu"
          >
            <span
              className={`block w-5 h-0.5 bg-current mx-auto transition-all duration-200 ${isMenuOpen ? 'rotate-45 translate-y-2' : ''}`}
            />
            <span
              className={`block w-5 h-0.5 bg-current mx-auto transition-all duration-200 ${isMenuOpen ? 'opacity-0' : ''}`}
            />
            <span
              className={`block w-5 h-0.5 bg-current mx-auto transition-all duration-200 ${isMenuOpen ? '-rotate-45 -translate-y-2' : ''}`}
            />
          </button>
        </div>
      </div>

      {isMenuOpen && (
        <div className="md:hidden border-t border-casino-border bg-casino-card px-4 pb-4">
          <div className="pt-2 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsMenuOpen(false)}
                className="block min-h-[44px] flex items-center text-casino-muted hover:text-casino-text transition-colors text-sm"
              >
                {link.label}
              </Link>
            ))}
          </div>
          <div className="border-t border-casino-border mt-2 pt-3 flex items-center justify-between">
            <div>
              <p className="text-sm text-casino-text font-medium">{user.name}</p>
              <span className="text-xs bg-casino-border text-casino-muted px-2 py-0.5 rounded inline-block mt-1">
                {user.role}
              </span>
            </div>
            <button
              onClick={() => signOut({ callbackUrl: '/login' })}
              className="min-h-[44px] px-4 text-sm text-casino-muted hover:text-casino-danger transition-colors"
            >
              Sign out
            </button>
          </div>
        </div>
      )}
    </nav>
  )
}

export { NavBar }
