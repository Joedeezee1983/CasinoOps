'use client'

import { useState } from 'react'
import type { ActiveUser } from '@/types'

export interface TechSelectModalProps {
  currentUserId: string
  activeUsers: ActiveUser[]
  onConfirm: (techIds: string[]) => void
  onCancel: () => void
  isStarting: boolean
}

export default function TechSelectModal({
  currentUserId,
  activeUsers,
  onConfirm,
  onCancel,
  isStarting,
}: TechSelectModalProps) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set([currentUserId]))

  const toggle = (userId: string) => {
    if (userId === currentUserId) return
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(userId)) next.delete(userId)
      else next.add(userId)
      return next
    })
  }

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-casino-card border border-casino-border rounded-xl w-full max-w-md">
        <div className="p-6 border-b border-casino-border">
          <h2 className="text-casino-text font-semibold text-lg">Select Techs on Shift</h2>
          <p className="text-casino-muted text-sm mt-1">
            You are pre-selected. Add any co-techs working with you this shift.
          </p>
        </div>

        <div className="p-4 space-y-1 max-h-72 overflow-y-auto">
          {activeUsers.map((user) => {
            const isSelected = selectedIds.has(user.id)
            const isSelf = user.id === currentUserId
            return (
              <label
                key={user.id}
                className={`flex items-center gap-3 rounded-lg px-4 py-3 transition-colors ${
                  isSelf
                    ? 'opacity-75 cursor-not-allowed bg-casino-dark'
                    : 'cursor-pointer hover:bg-casino-dark'
                }`}
              >
                <input
                  type="checkbox"
                  checked={isSelected}
                  disabled={isSelf}
                  onChange={() => toggle(user.id)}
                  className="w-4 h-4 accent-casino-accent flex-shrink-0"
                />
                <span className="text-casino-text text-sm flex-1">{user.name}</span>
                <span className="text-xs text-casino-muted">{user.role}</span>
                {isSelf && (
                  <span className="text-xs text-casino-accent font-semibold">You</span>
                )}
              </label>
            )
          })}
        </div>

        <div className="p-6 border-t border-casino-border flex gap-3">
          <button
            onClick={onCancel}
            disabled={isStarting}
            className="flex-1 min-h-[44px] bg-casino-dark hover:bg-casino-border disabled:opacity-50 text-casino-text font-semibold rounded-lg px-4 py-2 text-sm transition-colors border border-casino-border"
          >
            Cancel
          </button>
          <button
            onClick={() => onConfirm(Array.from(selectedIds))}
            disabled={isStarting}
            className="flex-1 min-h-[44px] bg-casino-accent hover:bg-casino-accent-hover disabled:opacity-50 text-black font-semibold rounded-lg px-4 py-2 text-sm transition-colors"
          >
            {isStarting ? 'Starting...' : 'Start Shift'}
          </button>
        </div>
      </div>
    </div>
  )
}

export { TechSelectModal }
