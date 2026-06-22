'use client'

import { useState } from 'react'
import type { ShiftWithTasks } from '@/types'
import { ISSUE_TYPE_LABELS, TASK_STATUS_COLORS, TASK_STATUS_LABELS } from '@/constants'
import { elapsedTime, formatDate } from '@/utils/format-date'
import type { TaskStatus, UserRole } from '@prisma/client'

export interface SupervisorViewProps {
  initialShifts: ShiftWithTasks[]
  userRole: UserRole
}

export default function SupervisorView({ initialShifts, userRole }: SupervisorViewProps) {
  const isAdmin = userRole === 'ADMIN'
  const [shifts, setShifts] = useState<ShiftWithTasks[]>(initialShifts)

  const handleForceEnded = (shiftId: string) => {
    setShifts((prev) => prev.filter((s) => s.id !== shiftId))
  }

  if (shifts.length === 0) {
    return (
      <div className="bg-casino-card border border-casino-border rounded-xl p-8 text-center">
        <p className="text-casino-muted">No active shifts at this time.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <p className="text-casino-muted text-sm">{shifts.length} active shift{shifts.length !== 1 ? 's' : ''}</p>
      {shifts.map((shift) => (
        <ShiftPanel key={shift.id} shift={shift} isAdmin={isAdmin} onForceEnded={handleForceEnded} />
      ))}
    </div>
  )
}

interface ShiftPanelProps {
  shift: ShiftWithTasks
  isAdmin: boolean
  onForceEnded: (shiftId: string) => void
}

function formatShortName(fullName: string): string {
  const parts = fullName.trim().split(/\s+/)
  if (parts.length < 2) return fullName
  return `${parts[0]} ${parts[parts.length - 1][0]}.`
}

function ShiftPanel({ shift, isAdmin, onForceEnded }: ShiftPanelProps) {
  const [isForceEnding, setIsForceEnding] = useState(false)
  const [forceEndError, setForceEndError] = useState<string | null>(null)

  const techDisplay = shift.techs.length > 0
    ? `On Shift: ${shift.techs.map((t) => formatShortName(t.user.name)).join(', ')}`
    : shift.tech.name

  const handleForceEnd = async () => {
    const confirmed = window.confirm(
      `Force end ${shift.tech.name}'s shift? This cannot be undone.`
    )
    if (!confirmed) return

    setIsForceEnding(true)
    setForceEndError(null)
    try {
      const res = await fetch(`/api/shifts/${shift.id}/force-end`, { method: 'POST' })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error)
      onForceEnded(shift.id)
    } catch (err) {
      setForceEndError(err instanceof Error ? err.message : 'Failed to force end shift')
    } finally {
      setIsForceEnding(false)
    }
  }

  return (
    <div className="bg-casino-card border border-casino-border rounded-xl overflow-hidden">
      <div className="px-5 py-4 border-b border-casino-border flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse flex-shrink-0" />
            <span className="font-semibold text-casino-text">{techDisplay}</span>
          </div>
          <p className="text-casino-muted text-xs mt-1">
            Started {formatDate(shift.startTime)} · {elapsedTime(shift.startTime)} elapsed
          </p>
          {forceEndError && (
            <p className="text-red-400 text-xs mt-1">{forceEndError}</p>
          )}
        </div>
        <div className="flex items-center gap-3">
          <div className="sm:text-right">
            <p className="text-casino-text text-sm font-semibold">{shift.tasks.length}</p>
            <p className="text-casino-muted text-xs">tasks</p>
          </div>
          {isAdmin && (
            <button
              onClick={handleForceEnd}
              disabled={isForceEnding}
              className="min-h-[36px] px-3 py-1.5 bg-orange-900/40 hover:bg-orange-800/60 disabled:opacity-50 text-orange-400 hover:text-orange-300 font-semibold text-xs rounded-lg border border-orange-800 transition-colors whitespace-nowrap"
            >
              {isForceEnding ? 'Ending...' : 'Force End'}
            </button>
          )}
        </div>
      </div>
      <div className="divide-y divide-casino-border">
        {shift.tasks.length === 0 ? (
          <p className="px-5 py-4 text-casino-muted text-sm">No tasks logged.</p>
        ) : (
          shift.tasks.map((task) => (
            <div key={task.id} className="px-5 py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                  <span className="text-casino-text text-sm font-medium">#{task.machineNumber}</span>
                  <span className="text-casino-muted text-xs">{task.location}</span>
                  <span className="text-xs text-casino-muted">{ISSUE_TYPE_LABELS[task.issueType]}</span>
                </div>
                <p className="text-casino-text text-xs mt-0.5 break-words">{task.actionTaken}</p>
              </div>
              <span className={`self-start sm:self-auto text-xs font-medium px-2 py-1 rounded whitespace-nowrap ${TASK_STATUS_COLORS[task.status as TaskStatus]}`}>
                {TASK_STATUS_LABELS[task.status as TaskStatus]}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export { SupervisorView }
