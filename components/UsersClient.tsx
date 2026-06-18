'use client'

import { useState } from 'react'
import type { UserSummary } from '@/types'
import AddUserForm from '@/components/AddUserForm'

export interface UsersClientProps {
  initialUsers: UserSummary[]
}

export default function UsersClient({ initialUsers }: UsersClientProps) {
  const [users, setUsers] = useState<UserSummary[]>(initialUsers)
  const [showAddForm, setShowAddForm] = useState(false)
  const [togglingId, setTogglingId] = useState<string | null>(null)

  const handleUserCreated = (user: UserSummary) => {
    setUsers((prev) => [user, ...prev])
    setShowAddForm(false)
  }

  const handleToggleActive = async (user: UserSummary) => {
    setTogglingId(user.id)
    try {
      const res = await fetch(`/api/admin/users/${user.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !user.isActive }),
      })

      if (!res.ok) return

      setUsers((prev) =>
        prev.map((u) => (u.id === user.id ? { ...u, isActive: !u.isActive } : u)),
      )
    } finally {
      setTogglingId(null)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-casino-text">User Management</h1>
        {!showAddForm && (
          <button
            onClick={() => setShowAddForm(true)}
            className="bg-casino-accent text-white px-4 py-2 rounded text-sm font-medium hover:opacity-90 transition-opacity"
          >
            Add User
          </button>
        )}
      </div>

      {showAddForm && (
        <AddUserForm
          onUserCreated={handleUserCreated}
          onCancel={() => setShowAddForm(false)}
        />
      )}

      <div className="bg-casino-card border border-casino-border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-casino-border">
              <th className="text-left px-4 py-3 text-casino-muted font-medium">Name</th>
              <th className="text-left px-4 py-3 text-casino-muted font-medium">Email</th>
              <th className="text-left px-4 py-3 text-casino-muted font-medium">Role</th>
              <th className="text-left px-4 py-3 text-casino-muted font-medium">Status</th>
              <th className="text-left px-4 py-3 text-casino-muted font-medium">Created</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="border-b border-casino-border last:border-0 hover:bg-casino-dark/50 transition-colors">
                <td className="px-4 py-3 text-casino-text">{user.name}</td>
                <td className="px-4 py-3 text-casino-muted">{user.email}</td>
                <td className="px-4 py-3">
                  <span className="text-xs bg-casino-border text-casino-muted px-2 py-1 rounded">
                    {user.role}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`text-xs px-2 py-1 rounded ${
                      user.isActive
                        ? 'bg-green-900 text-green-400'
                        : 'bg-red-950 text-casino-danger'
                    }`}
                  >
                    {user.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-4 py-3 text-casino-muted">
                  {new Date(user.createdAt).toLocaleDateString()}
                </td>
                <td className="px-4 py-3 text-right">
                  <button
                    onClick={() => handleToggleActive(user)}
                    disabled={togglingId === user.id}
                    className={`text-xs px-3 py-1 rounded border transition-colors disabled:opacity-50 ${
                      user.isActive
                        ? 'border-casino-danger text-casino-danger hover:bg-red-950'
                        : 'border-green-600 text-green-400 hover:bg-green-950'
                    }`}
                  >
                    {togglingId === user.id
                      ? '...'
                      : user.isActive
                        ? 'Deactivate'
                        : 'Activate'}
                  </button>
                </td>
              </tr>
            ))}
            {users.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-casino-muted">
                  No users found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
