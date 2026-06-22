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
  const handleEndShift = () => {
    const confirmed = window.confirm(
      'Are you sure you want to end your shift? This will generate your AI briefing and cannot be undone.'
    )
    if (!confirmed) return
    onEnd()
  }

  if (!shift) {
    return (
      <div className="bg-casino-card border border-casino-border rounded-xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <p className="text-casino-text font-semibold">No Active Shift</p>
          <p className="text-casino-muted text-sm mt-1">Start a shift to begin logging tasks.</p>
        </div>
        <button
          onClick={onStart}
          disabled={isStarting}
          className="w-full sm:w-auto min-h-[44px] bg-casino-accent hover:bg-casino-accent-hover disabled:opacity-50 text-black font-semibold rounded-lg px-5 py-2 text-sm transition-colors"
        >
          {isStarting ? 'Starting...' : 'Start Shift'}
        </button>
      </div>
    )
  }

  return (
    <div className="bg-casino-card border border-green-800 rounded-xl p-6">
      <div className="flex items-center gap-2 mb-1">
        <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
        <span className="text-green-400 text-sm font-medium">Shift Active</span>
      </div>
      <p className="text-casino-text font-semibold">Started {formatDate(shift.startTime)}</p>
      {shift.techs.length > 0 && (
        <p className="text-casino-muted text-sm mt-0.5">
          On Shift: {shift.techs.map((t) => t.user.name).join(', ')}
        </p>
      )}
      <p className="text-casino-muted text-sm mt-1">
        Elapsed: {elapsedTime(shift.startTime)} · {shift.tasks.length} task{shift.tasks.length !== 1 ? 's' : ''} logged
      </p>

      <div className="mt-6 pt-5 border-t border-red-900/50">
        <p className="text-red-400 text-xs font-semibold uppercase tracking-widest mb-3">End Shift</p>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <p className="text-casino-muted text-xs flex-1">
            Ending the shift will generate your AI briefing. This action cannot be undone.
          </p>
          <button
            onClick={handleEndShift}
            disabled={isEnding}
            className="w-full sm:w-auto min-h-[44px] bg-red-800 hover:bg-red-700 disabled:opacity-50 text-white font-semibold rounded-lg px-6 py-2 text-sm transition-colors border border-red-600 ring-1 ring-red-900"
          >
            {isEnding ? 'Ending...' : '⚠ End Shift'}
          </button>
        </div>
      </div>
    </div>
  )
}

export { ShiftStatus }
