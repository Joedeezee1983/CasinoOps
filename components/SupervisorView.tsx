'use client'

import { useState } from 'react'
import type { ShiftWithTasks } from '@/types'
import { ISSUE_TYPE_LABELS, TASK_STATUS_COLORS, TASK_STATUS_LABELS } from '@/constants'
import { elapsedTime, formatDate } from '@/utils/format-date'
import type { TaskStatus } from '@prisma/client'

export interface SupervisorViewProps {
  initialShifts: ShiftWithTasks[]
}

export default function SupervisorView({ initialShifts }: SupervisorViewProps) {
  const [shifts] = useState<ShiftWithTasks[]>(initialShifts)

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
        <ShiftPanel key={shift.id} shift={shift} />
      ))}
    </div>
  )
}

interface ShiftPanelProps {
  shift: ShiftWithTasks
}

function ShiftPanel({ shift }: ShiftPanelProps) {
  return (
    <div className="bg-casino-card border border-casino-border rounded-xl overflow-hidden">
      <div className="px-5 py-4 border-b border-casino-border flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse flex-shrink-0" />
            <span className="font-semibold text-casino-text">{shift.tech.name}</span>
            <span className="text-xs bg-casino-border text-casino-muted px-2 py-0.5 rounded">
              {shift.tech.role}
            </span>
          </div>
          <p className="text-casino-muted text-xs mt-1">
            Started {formatDate(shift.startTime)} · {elapsedTime(shift.startTime)} elapsed
          </p>
        </div>
        <div className="sm:text-right">
          <p className="text-casino-text text-sm font-semibold">{shift.tasks.length}</p>
          <p className="text-casino-muted text-xs">tasks</p>
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
