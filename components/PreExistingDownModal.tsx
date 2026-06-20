'use client'

import { useState } from 'react'
import type { TaskSummary } from '@/types'

interface PreExistingEntry {
  machineNumber: string
  location: string
}

const EMPTY_ENTRY: PreExistingEntry = {
  machineNumber: '',
  location: '',
}

export interface PreExistingDownModalProps {
  onDone: (addedTasks: TaskSummary[]) => void
}

export default function PreExistingDownModal({ onDone }: PreExistingDownModalProps) {
  const [entry, setEntry] = useState<PreExistingEntry>(EMPTY_ENTRY)
  const [addedTasks, setAddedTasks] = useState<TaskSummary[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleAdd = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    try {
      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          machineNumber: entry.machineNumber,
          location: entry.location,
          section: 'PRE_EXISTING_DOWN',
          issueType: 'DOWN_MACHINE',
          actionTaken: 'Pre-existing — machine was already out of service at shift start.',
          status: 'PENDING',
        }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error)
      setAddedTasks((prev) => [...prev, json.data as TaskSummary])
      setEntry(EMPTY_ENTRY)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to log pre-existing down machine')
    } finally {
      setIsSubmitting(false)
    }
  }

  const doneLabel = addedTasks.length === 0
    ? 'Skip — Nothing Was Down'
    : `Done — ${addedTasks.length} machine${addedTasks.length !== 1 ? 's' : ''} logged`

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-casino-card border border-casino-border rounded-xl w-full max-w-lg">
        <div className="p-6 border-b border-casino-border">
          <h2 className="text-casino-text font-semibold text-lg">Pre-Existing Down Machines</h2>
          <p className="text-casino-muted text-sm mt-1">
            Log any machines that were already out of service before your shift started. Skip if nothing was down.
          </p>
        </div>

        <div className="p-6 space-y-4">
          <form onSubmit={handleAdd} className="space-y-3">
            {error && (
              <div className="bg-red-900/30 border border-red-800 text-red-300 text-sm rounded-lg px-4 py-3">
                {error}
              </div>
            )}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-casino-muted mb-1">Machine #</label>
                <input
                  value={entry.machineNumber}
                  onChange={(e) => setEntry({ ...entry, machineNumber: e.target.value })}
                  required
                  className="w-full bg-casino-dark border border-casino-border rounded-lg px-3 py-2 text-casino-text text-sm focus:outline-none focus:border-casino-accent"
                  placeholder="e.g. 1042"
                />
              </div>
              <div>
                <label className="block text-xs text-casino-muted mb-1">Location</label>
                <input
                  value={entry.location}
                  onChange={(e) => setEntry({ ...entry, location: e.target.value })}
                  required
                  className="w-full bg-casino-dark border border-casino-border rounded-lg px-3 py-2 text-casino-text text-sm focus:outline-none focus:border-casino-accent"
                  placeholder="e.g. Zone A Row 3"
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full min-h-[44px] bg-casino-accent hover:bg-casino-accent-hover disabled:opacity-50 text-black font-semibold rounded-lg px-4 py-2 text-sm transition-colors"
            >
              {isSubmitting ? 'Adding...' : '+ Add Machine'}
            </button>
          </form>

          {addedTasks.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs text-casino-muted font-semibold uppercase tracking-widest">Added</p>
              {addedTasks.map((task) => (
                <div
                  key={task.id}
                  className="flex items-center gap-2 text-sm text-casino-text bg-casino-dark rounded-lg px-3 py-2"
                >
                  <span className="w-2 h-2 bg-red-500 rounded-full flex-shrink-0" />
                  <span>#{task.machineNumber} — {task.location}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="p-6 border-t border-casino-border">
          <button
            onClick={() => onDone(addedTasks)}
            className="w-full min-h-[44px] bg-casino-accent hover:bg-casino-accent-hover text-black font-semibold rounded-lg px-4 py-2 text-sm transition-colors"
          >
            {doneLabel}
          </button>
        </div>
      </div>
    </div>
  )
}

export { PreExistingDownModal }
