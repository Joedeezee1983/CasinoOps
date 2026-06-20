'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { ShiftWithTasks, TaskSummary } from '@/types'
import { ShiftStatus } from '@/components/ShiftStatus'
import { TaskForm } from '@/components/TaskForm'
import { TaskCard } from '@/components/TaskCard'
import { PreExistingDownModal } from '@/components/PreExistingDownModal'

export interface DashboardClientProps {
  initialShift: ShiftWithTasks | null
  techName: string
}

export default function DashboardClient({ initialShift, techName: _techName }: DashboardClientProps) {
  const router = useRouter()
  const [shift, setShift] = useState<ShiftWithTasks | null>(initialShift)
  const [isStarting, setIsStarting] = useState(false)
  const [isEnding, setIsEnding] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showPreExistingModal, setShowPreExistingModal] = useState(false)

  const handleStartShift = async () => {
    setIsStarting(true)
    setError(null)
    try {
      const res = await fetch('/api/shifts', { method: 'POST' })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error)
      setShowPreExistingModal(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start shift')
    } finally {
      setIsStarting(false)
    }
  }

  const handlePreExistingDone = async (_addedTasks: TaskSummary[]) => {
    setShowPreExistingModal(false)
    try {
      const updated = await fetch('/api/shifts').then((r) => r.json())
      setShift(updated.data)
    } catch {
      setError('Shift started but failed to load. Please refresh.')
    }
  }

  const handleEndShift = async () => {
    setIsEnding(true)
    setError(null)
    try {
      const res = await fetch('/api/shifts/end', { method: 'POST' })
      const json = await res.json()
      // 404 means server has no active shift — local state was stale, sync it
      if (res.status === 404) {
        setShift(null)
        return
      }
      if (!res.ok) throw new Error(json.error)
      setShift(null)
      router.push('/briefing')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to end shift')
    } finally {
      setIsEnding(false)
    }
  }

  const handleTaskAdded = (newTask: ShiftWithTasks['tasks'][number]) => {
    if (!shift) return
    setShift({ ...shift, tasks: [newTask, ...shift.tasks] })
  }

  const handleTaskStatusChange = (taskId: string, status: ShiftWithTasks['tasks'][number]['status']) => {
    if (!shift) return
    setShift({
      ...shift,
      tasks: shift.tasks.map((t) => (t.id === taskId ? { ...t, status } : t)),
    })
  }

  return (
    <div className="space-y-6">
      {showPreExistingModal && (
        <PreExistingDownModal onDone={handlePreExistingDone} />
      )}

      {error && (
        <div className="bg-red-900/30 border border-red-800 text-red-300 text-sm rounded-lg px-4 py-3">
          {error}
        </div>
      )}

      <ShiftStatus
        shift={shift}
        onStart={handleStartShift}
        onEnd={handleEndShift}
        isStarting={isStarting}
        isEnding={isEnding}
      />

      {shift && (
        <>
          <TaskForm shiftId={shift.id} onTaskAdded={handleTaskAdded} />
          <div className="space-y-3">
            <h2 className="text-lg font-semibold text-casino-text">Tasks This Shift</h2>
            {shift.tasks.length === 0 ? (
              <p className="text-casino-muted text-sm">No tasks logged yet.</p>
            ) : (
              shift.tasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onStatusChange={handleTaskStatusChange}
                />
              ))
            )}
          </div>
        </>
      )}
    </div>
  )
}

export { DashboardClient }
