'use client'

import { useState } from 'react'

export interface ClearHistoryButtonProps {
  onCleared: () => void
}

export default function ClearHistoryButton({ onCleared }: ClearHistoryButtonProps) {
  const [isClearing, setIsClearing] = useState(false)

  const handleClear = async (): Promise<void> => {
    if (!window.confirm('Delete all your shift history? This cannot be undone.')) return
    setIsClearing(true)
    try {
      const res = await fetch('/api/history', { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to clear history')
      onCleared()
    } catch {
      // Non-critical: clearing is optional, user can retry
    } finally {
      setIsClearing(false)
    }
  }

  return (
    <button
      onClick={handleClear}
      disabled={isClearing}
      className="px-4 py-2 bg-red-700 hover:bg-red-600 text-white text-sm font-semibold rounded-lg transition-colors disabled:opacity-50"
    >
      {isClearing ? 'Clearing…' : 'Clear My History'}
    </button>
  )
}

export { ClearHistoryButton }
