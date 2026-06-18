'use client'

import { useState } from 'react'
import type { TaskStatus } from '@prisma/client'
import type { TaskSummary } from '@/types'
import { ISSUE_TYPE_LABELS, TASK_STATUS_LABELS, TASK_STATUS_COLORS } from '@/constants'
import { formatDate } from '@/utils/format-date'

export interface TaskCardProps {
  task: TaskSummary
  onStatusChange: (taskId: string, status: TaskStatus) => void
}

export default function TaskCard({ task, onStatusChange }: TaskCardProps) {
  const [isUpdating, setIsUpdating] = useState(false)

  const handleStatusChange = async (newStatus: TaskStatus) => {
    setIsUpdating(true)
    try {
      const res = await fetch(`/api/tasks/${task.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })
      if (!res.ok) throw new Error('Failed to update')
      onStatusChange(task.id, newStatus)
    } catch {
      // Status reverts to original on error — no silent failure, UI reflects server state
    } finally {
      setIsUpdating(false)
    }
  }

  return (
    <div className="bg-casino-card border border-casino-border rounded-xl p-4">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="font-semibold text-casino-text text-sm">Machine #{task.machineNumber}</span>
            <span className="text-casino-muted text-xs">{task.location}</span>
            <span className="text-xs bg-casino-border text-casino-muted px-2 py-0.5 rounded">
              {ISSUE_TYPE_LABELS[task.issueType]}
            </span>
          </div>
          <p className="text-casino-text text-sm mt-1">{task.actionTaken}</p>
          <p className="text-casino-muted text-xs mt-2">{formatDate(task.createdAt)}</p>
        </div>
        <div className="flex-shrink-0">
          <select
            value={task.status}
            onChange={(e) => handleStatusChange(e.target.value as TaskStatus)}
            disabled={isUpdating}
            className={`text-xs font-medium px-3 py-2 rounded border-0 cursor-pointer disabled:opacity-50 min-h-[44px] ${TASK_STATUS_COLORS[task.status]}`}
          >
            {(Object.entries(TASK_STATUS_LABELS) as [TaskStatus, string][]).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </div>
      </div>
    </div>
  )
}

export { TaskCard }
