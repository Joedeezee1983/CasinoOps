'use client'

import { useState } from 'react'
import type { MachineSummary } from '@/types'
import type { MachineStatus } from '@prisma/client'
import { MACHINE_STATUS_LABELS, MACHINE_STATUS_COLORS } from '@/constants'

export interface MachinesClientProps {
  initialMachines: MachineSummary[]
  canAdd: boolean
}

const DEFAULT_FORM = { machineNumber: '', location: '', type: '' }

export default function MachinesClient({ initialMachines, canAdd }: MachinesClientProps) {
  const [machines, setMachines] = useState<MachineSummary[]>(initialMachines)
  const [form, setForm] = useState(DEFAULT_FORM)
  const [isAdding, setIsAdding] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleAdd = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsAdding(true)
    setError(null)
    try {
      const res = await fetch('/api/machines', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error)
      setMachines([...machines, json.data as MachineSummary])
      setForm(DEFAULT_FORM)
      setShowForm(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add machine')
    } finally {
      setIsAdding(false)
    }
  }

  const handleStatusChange = async (machineId: string, status: MachineStatus) => {
    try {
      const res = await fetch(`/api/machines/${machineId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      if (!res.ok) throw new Error('Failed to update')
      setMachines(machines.map((m) => (m.id === machineId ? { ...m, status } : m)))
    } catch {
      // UI will reflect stale state until page refresh — acceptable for status toggle
    }
  }

  return (
    <div className="space-y-4">
      {error && (
        <div className="bg-red-900/30 border border-red-800 text-red-300 text-sm rounded-lg px-4 py-3">
          {error}
        </div>
      )}
      {canAdd && (
        <div>
          {!showForm ? (
            <button
              onClick={() => setShowForm(true)}
              className="border-2 border-dashed border-casino-border hover:border-casino-accent rounded-xl py-3 px-6 text-casino-muted hover:text-casino-accent text-sm font-medium transition-colors"
            >
              + Add Machine
            </button>
          ) : (
            <form onSubmit={handleAdd} className="bg-casino-card border border-casino-border rounded-xl p-5 space-y-3">
              <div className="grid grid-cols-3 gap-3">
                <input
                  value={form.machineNumber}
                  onChange={(e) => setForm({ ...form, machineNumber: e.target.value })}
                  required placeholder="Machine #"
                  className="bg-casino-dark border border-casino-border rounded-lg px-3 py-2 text-casino-text text-sm focus:outline-none focus:border-casino-accent"
                />
                <input
                  value={form.location}
                  onChange={(e) => setForm({ ...form, location: e.target.value })}
                  required placeholder="Location"
                  className="bg-casino-dark border border-casino-border rounded-lg px-3 py-2 text-casino-text text-sm focus:outline-none focus:border-casino-accent"
                />
                <input
                  value={form.type}
                  onChange={(e) => setForm({ ...form, type: e.target.value })}
                  required placeholder="Type (e.g. IGT S2000)"
                  className="bg-casino-dark border border-casino-border rounded-lg px-3 py-2 text-casino-text text-sm focus:outline-none focus:border-casino-accent"
                />
              </div>
              <div className="flex gap-2">
                <button type="submit" disabled={isAdding}
                  className="bg-casino-accent hover:bg-casino-accent-hover disabled:opacity-50 text-black font-semibold rounded-lg px-4 py-2 text-sm transition-colors">
                  {isAdding ? 'Adding...' : 'Add'}
                </button>
                <button type="button" onClick={() => setShowForm(false)}
                  className="text-casino-muted hover:text-casino-text text-sm px-4 py-2 border border-casino-border rounded-lg transition-colors">
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>
      )}
      <div className="grid gap-3">
        {machines.length === 0 ? (
          <div className="bg-casino-card border border-casino-border rounded-xl p-8 text-center">
            <p className="text-casino-muted">No machines in registry.</p>
          </div>
        ) : (
          machines.map((machine) => (
            <div key={machine.id} className="bg-casino-card border border-casino-border rounded-xl px-5 py-4 flex items-center justify-between">
              <div>
                <span className="font-semibold text-casino-text">#{machine.machineNumber}</span>
                <span className="text-casino-muted text-sm ml-3">{machine.type}</span>
                <span className="text-casino-muted text-xs ml-3">{machine.location}</span>
              </div>
              <select
                value={machine.status}
                onChange={(e) => handleStatusChange(machine.id, e.target.value as MachineStatus)}
                className={`text-xs font-medium px-2 py-1 rounded border-0 cursor-pointer ${MACHINE_STATUS_COLORS[machine.status]}`}
              >
                {(Object.entries(MACHINE_STATUS_LABELS) as [MachineStatus, string][]).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export { MachinesClient }
