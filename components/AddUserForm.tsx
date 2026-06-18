'use client'

import { useState } from 'react'
import type { UserRole } from '@prisma/client'
import type { UserSummary } from '@/types'

export interface AddUserFormProps {
  onUserCreated: (user: UserSummary) => void
  onCancel: () => void
}

interface FormState {
  name: string
  email: string
  password: string
  role: UserRole
}

const INITIAL_FORM: FormState = {
  name: '',
  email: '',
  password: '',
  role: 'TECH',
}

const ROLE_OPTIONS: { value: UserRole; label: string }[] = [
  { value: 'TECH', label: 'Tech' },
  { value: 'SUPERVISOR', label: 'Supervisor' },
  { value: 'ADMIN', label: 'Admin' },
]

export default function AddUserForm({ onUserCreated, onCancel }: AddUserFormProps) {
  const [form, setForm] = useState<FormState>(INITIAL_FORM)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleChange = (field: keyof FormState) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }))
    setError(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })

      const json: unknown = await res.json()

      if (!res.ok) {
        const msg = isErrorResponse(json) ? json.error : 'Failed to create user'
        setError(msg)
        return
      }

      if (isDataResponse<UserSummary>(json)) {
        onUserCreated(json.data)
        setForm(INITIAL_FORM)
      }
    } catch {
      setError('An unexpected error occurred. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-casino-card border border-casino-border rounded-lg p-6 space-y-4">
      <h2 className="text-lg font-semibold text-casino-text">Add New User</h2>

      {error && (
        <p className="text-casino-danger text-sm bg-red-950 border border-casino-danger rounded px-3 py-2">
          {error}
        </p>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-sm text-casino-muted mb-1" htmlFor="name">
            Name
          </label>
          <input
            id="name"
            type="text"
            value={form.name}
            onChange={handleChange('name')}
            required
            className="w-full bg-casino-dark border border-casino-border rounded px-3 py-2 text-casino-text text-sm focus:outline-none focus:border-casino-accent"
            placeholder="Jane Smith"
          />
        </div>

        <div>
          <label className="block text-sm text-casino-muted mb-1" htmlFor="email">
            Email
          </label>
          <input
            id="email"
            type="email"
            value={form.email}
            onChange={handleChange('email')}
            required
            className="w-full bg-casino-dark border border-casino-border rounded px-3 py-2 text-casino-text text-sm focus:outline-none focus:border-casino-accent"
            placeholder="jane@example.com"
          />
        </div>

        <div>
          <label className="block text-sm text-casino-muted mb-1" htmlFor="password">
            Password
          </label>
          <input
            id="password"
            type="text"
            value={form.password}
            onChange={handleChange('password')}
            required
            minLength={6}
            className="w-full bg-casino-dark border border-casino-border rounded px-3 py-2 text-casino-text text-sm focus:outline-none focus:border-casino-accent"
            placeholder="Minimum 6 characters"
          />
        </div>

        <div>
          <label className="block text-sm text-casino-muted mb-1" htmlFor="role">
            Role
          </label>
          <select
            id="role"
            value={form.role}
            onChange={handleChange('role')}
            className="w-full bg-casino-dark border border-casino-border rounded px-3 py-2 text-casino-text text-sm focus:outline-none focus:border-casino-accent"
          >
            {ROLE_OPTIONS.map(({ value, label }) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={isSubmitting}
          className="bg-casino-accent text-white px-4 py-2 rounded text-sm font-medium hover:opacity-90 disabled:opacity-50 transition-opacity"
        >
          {isSubmitting ? 'Creating...' : 'Create User'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="border border-casino-border text-casino-muted px-4 py-2 rounded text-sm hover:text-casino-text transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  )
}

function isErrorResponse(value: unknown): value is { error: string } {
  return typeof value === 'object' && value !== null && 'error' in value
}

function isDataResponse<T>(value: unknown): value is { data: T } {
  return typeof value === 'object' && value !== null && 'data' in value
}
