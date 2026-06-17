'use client'

import { useState } from 'react'
import type { IssueType, TaskStatus } from '@prisma/client'
import type { TaskSummary } from '@/types'
import { ISSUE_TYPE_LABELS } from '@/constants'

export interface TaskFormProps {
  shiftId: string
  onTaskAdded: (task: TaskSummary) => void
}

const ISSUE_TYPES = Object.entries(ISSUE_TYPE_LABELS) as [IssueType, string][]

const DEFAULT_FORM = {
  machineNumber: '',
  location: '',
  issueType: 'DOWN_MACHINE' as IssueType,
  actionTaken: '',
  status: 'PENDING' as TaskStatus,
}

export default function TaskForm({ onTaskAdded }: TaskFormProps) {
  const [form, setForm] = useState(DEFAULT_FORM)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isOpen, setIsOpen] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    try {
      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error)
      onTaskAdded(json.data as TaskSummary)
      setForm(DEFAULT_FORM)
      setIsOpen(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to log task')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="w-full border-2 border-dashed border-casino-border hover:border-casino-accent rounded-xl py-4 text-casino-muted hover:text-casino-accent text-sm font-medium transition-colors"
      >
        + Log New Task
      </button>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="bg-casino-card border border-casino-border rounded-xl p-6 space-y-4">
      <h2 className="font-semibold text-casino-text">Log Task</h2>
      {error && (
        <div className="bg-red-900/30 border border-red-800 text-red-300 text-sm rounded-lg px-4 py-3">
          {error}
        </div>
      )}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs text-casino-muted mb-1">Machine #</label>
          <input
            value={form.machineNumber}
            onChange={(e) => setForm({ ...form, machineNumber: e.target.value })}
            required
            className="w-full bg-casino-dark border border-casino-border rounded-lg px-3 py-2 text-casino-text text-sm focus:outline-none focus:border-casino-accent"
            placeholder="e.g. 1042"
          />
        </div>
        <div>
          <label className="block text-xs text-casino-muted mb-1">Location</label>
          <input
            value={form.location}
            onChange={(e) => setForm({ ...form, location: e.target.value })}
            required
            className="w-full bg-casino-dark border border-casino-border rounded-lg px-3 py-2 text-casino-text text-sm focus:outline-none focus:border-casino-accent"
            placeholder="e.g. Zone A Row 3"
          />
        </div>
      </div>
      <div>
        <label className="block text-xs text-casino-muted mb-1">Issue Type</label>
        <select
          value={form.issueType}
          onChange={(e) => setForm({ ...form, issueType: e.target.value as IssueType })}
          className="w-full bg-casino-dark border border-casino-border rounded-lg px-3 py-2 text-casino-text text-sm focus:outline-none focus:border-casino-accent"
        >
          {ISSUE_TYPES.map(([value, label]) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-xs text-casino-muted mb-1">Action Taken</label>
        <textarea
          value={form.actionTaken}
          onChange={(e) => setForm({ ...form, actionTaken: e.target.value })}
          required
          rows={3}
          className="w-full bg-casino-dark border border-casino-border rounded-lg px-3 py-2 text-casino-text text-sm focus:outline-none focus:border-casino-accent resize-none"
          placeholder="Describe what was done..."
        />
      </div>
      <div>
        <label className="block text-xs text-casino-muted mb-1">Status</label>
        <select
          value={form.status}
          onChange={(e) => setForm({ ...form, status: e.target.value as TaskStatus })}
          className="w-full bg-casino-dark border border-casino-border rounded-lg px-3 py-2 text-casino-text text-sm focus:outline-none focus:border-casino-accent"
        >
          <option value="RESOLVED">Resolved</option>
          <option value="PENDING">Pending</option>
          <option value="PARTS_ORDERED">Parts Ordered</option>
        </select>
      </div>
      <div className="flex gap-3">
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex-1 bg-casino-accent hover:bg-casino-accent-hover disabled:opacity-50 text-black font-semibold rounded-lg px-4 py-2 text-sm transition-colors"
        >
          {isSubmitting ? 'Logging...' : 'Log Task'}
        </button>
        <button
          type="button"
          onClick={() => { setIsOpen(false); setError(null) }}
          className="px-4 py-2 text-sm text-casino-muted hover:text-casino-text border border-casino-border rounded-lg transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  )
}

export { TaskForm }
