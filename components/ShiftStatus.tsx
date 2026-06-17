'use client'

import type { ShiftWithTasks } from '@/types'
import { elapsedTime, formatDate } from '@/utils/format-date'

export interface ShiftStatusProps {
  shift: ShiftWithTasks | null
  onStart: () => void
  onEnd: () => void
  isStarting: boolean
  isEnding: boolean
}

export default function ShiftStatus({ shift, onStart, onEnd, isStarting, isEnding }: ShiftStatusProps) {
  if (!shift) {
    return (
      <div className="bg-casino-card border border-casino-border rounded-xl p-6 flex items-center justify-between">
        <div>
          <p className="text-casino-text font-semibold">No Active Shift</p>
          <p className="text-casino-muted text-sm mt-1">Start a shift to begin logging tasks.</p>
        </div>
        <button
          onClick={onStart}
          disabled={isStarting}
          className="bg-casino-accent hover:bg-casino-accent-hover disabled:opacity-50 text-black font-semibold rounded-lg px-5 py-2 text-sm transition-colors"
        >
          {isStarting ? 'Starting...' : 'Start Shift'}
        </button>
      </div>
    )
  }

  return (
    <div className="bg-casino-card border border-green-800 rounded-xl p-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-green-400 text-sm font-medium">Shift Active</span>
          </div>
          <p className="text-casino-text font-semibold">Started {formatDate(shift.startTime)}</p>
          <p className="text-casino-muted text-sm mt-1">
            Elapsed: {elapsedTime(shift.startTime)} · {shift.tasks.length} task{shift.tasks.length !== 1 ? 's' : ''} logged
          </p>
        </div>
        <button
          onClick={onEnd}
          disabled={isEnding}
          className="bg-red-700 hover:bg-red-600 disabled:opacity-50 text-white font-semibold rounded-lg px-5 py-2 text-sm transition-colors"
        >
          {isEnding ? 'Ending...' : 'End Shift'}
        </button>
      </div>
    </div>
  )
}

export { ShiftStatus }
