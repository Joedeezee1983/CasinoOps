'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { signOut } from 'next-auth/react'
import type { ShiftWithTasks, TaskSummary, ActiveUser } from '@/types'
import { SHIFT_TIMEOUT_MS, SHIFT_WARNING_AT_MS } from '@/constants'
import { ShiftStatus } from '@/components/ShiftStatus'
import { TaskForm } from '@/components/TaskForm'
import { TaskCard } from '@/components/TaskCard'
import { PreExistingDownModal } from '@/components/PreExistingDownModal'
import { TechSelectModal } from '@/components/TechSelectModal'

export interface DashboardClientProps {
  initialShift: ShiftWithTasks | null
  techName: string
  currentUserId: string
  activeUsers: ActiveUser[]
}

export default function DashboardClient({
  initialShift,
  techName: _techName,
  currentUserId,
  activeUsers,
}: DashboardClientProps) {
  const router = useRouter()
  const [shift, setShift] = useState<ShiftWithTasks | null>(initialShift)
  const [isStarting, setIsStarting] = useState(false)
  const [isEnding, setIsEnding] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showTechSelectModal, setShowTechSelectModal] = useState(false)
  const [showPreExistingModal, setShowPreExistingModal] = useState(false)
  const [showTimeoutWarning, setShowTimeoutWarning] = useState(false)

  useEffect(() => {
    if (!shift) return

    const checkElapsed = () => {
      const elapsed = Date.now() - new Date(shift.startTime).getTime()
      if (elapsed >= SHIFT_TIMEOUT_MS) {
        signOut({ callbackUrl: '/login' })
      } else if (elapsed >= SHIFT_WARNING_AT_MS) {
        setShowTimeoutWarning(true)
      }
    }

    checkElapsed()
    const interval = setInterval(checkElapsed, 60 * 1000)
    return () => clearInterval(interval)
  }, [shift?.id, shift?.startTime])

  const handleStartShift = () => {
    setError(null)
    setShowTechSelectModal(true)
  }

  const handleTechSelectConfirm = async (techIds: string[]) => {
    setIsStarting(true)
    setError(null)
    try {
      const res = await fetch('/api/shifts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ techIds }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error)
      setShowTechSelectModal(false)
      setShowPreExistingModal(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start shift')
      setShowTechSelectModal(false)
    } finally {
      setIsStarting(false)
    }
  }

  const handleTechSelectCancel = () => {
    setShowTechSelectModal(false)
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
      {showTechSelectModal && (
        <TechSelectModal
          currentUserId={currentUserId}
          activeUsers={activeUsers}
          onConfirm={handleTechSelectConfirm}
          onCancel={handleTechSelectCancel}
          isStarting={isStarting}
        />
      )}

      {showPreExistingModal && (
        <PreExistingDownModal onDone={handlePreExistingDone} />
      )}

      {showTimeoutWarning && (
        <div className="bg-amber-900/30 border border-amber-700 text-amber-300 text-sm rounded-lg px-4 py-3 flex items-center justify-between gap-3">
          <span>Your shift will automatically end in 15 minutes. End your shift manually to generate your AI briefing.</span>
          <button
            onClick={() => setShowTimeoutWarning(false)}
            className="text-amber-400 hover:text-amber-200 font-bold flex-shrink-0 text-base leading-none"
            aria-label="Dismiss warning"
          >
            ✕
          </button>
        </div>
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
