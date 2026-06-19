'use client'

import { useState, useEffect } from 'react'

const RETENTION_OPTIONS = [
  { label: '30 days', value: 30 },
  { label: '60 days', value: 60 },
  { label: '90 days', value: 90 },
  { label: '180 days', value: 180 },
] as const

type RetentionDays = (typeof RETENTION_OPTIONS)[number]['value']

type ResultState =
  | { type: 'success'; deleted: number }
  | { type: 'error'; message: string }

export default function CleanupPanel() {
  const [daysToKeep, setDaysToKeep] = useState<RetentionDays>(90)
  const [previewCount, setPreviewCount] = useState<number | null>(null)
  const [isLoadingCount, setIsLoadingCount] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [result, setResult] = useState<ResultState | null>(null)

  useEffect(() => {
    const fetchCount = async (): Promise<void> => {
      setIsLoadingCount(true)
      setResult(null)
      setPreviewCount(null)
      try {
        const res = await fetch(`/api/admin/cleanup?daysToKeep=${daysToKeep}`)
        const json = await res.json()
        if (!res.ok) throw new Error(json.error)
        setPreviewCount((json.data as { count: number }).count)
      } catch {
        setPreviewCount(null)
      } finally {
        setIsLoadingCount(false)
      }
    }

    void fetchCount()
  }, [daysToKeep])

  const handleDelete = async (): Promise<void> => {
    if (!previewCount) return
    setIsDeleting(true)
    setResult(null)
    try {
      const res = await fetch('/api/admin/cleanup', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ daysToKeep }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error)
      const { deleted } = json.data as { deleted: number }
      setResult({ type: 'success', deleted })
      setPreviewCount(0)
    } catch (err) {
      setResult({
        type: 'error',
        message: err instanceof Error ? err.message : 'Failed to delete records',
      })
    } finally {
      setIsDeleting(false)
    }
  }

  const confirmLabel = (() => {
    if (isDeleting) return 'Deleting...'
    if (previewCount) return `Delete ${previewCount} shift${previewCount !== 1 ? 's' : ''} older than ${daysToKeep} days`
    return `Delete shifts older than ${daysToKeep} days`
  })()

  const isConfirmDisabled =
    isDeleting || isLoadingCount || previewCount === null || previewCount === 0

  return (
    <div className="bg-casino-card border border-casino-border rounded-xl p-6 space-y-5">
      <div>
        <h2 className="text-lg font-semibold text-casino-text">Clear History</h2>
        <p className="text-casino-muted text-sm mt-1">
          Permanently delete completed shifts and all associated tasks and AI reports.
        </p>
      </div>

      <div>
        <label className="block text-xs text-casino-muted mb-1">Retention Period</label>
        <select
          value={daysToKeep}
          onChange={(e) => setDaysToKeep(Number(e.target.value) as RetentionDays)}
          className="w-full sm:w-48 bg-casino-dark border border-casino-border rounded-lg px-3 py-2 text-casino-text text-sm focus:outline-none focus:border-casino-accent"
        >
          {RETENTION_OPTIONS.map(({ label, value }) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>
      </div>

      <div className="bg-casino-dark border border-casino-border rounded-lg px-4 py-3 text-sm min-h-[44px] flex items-center">
        {isLoadingCount ? (
          <span className="text-casino-muted">Counting records...</span>
        ) : previewCount === null ? (
          <span className="text-casino-danger">Could not load count — check your connection.</span>
        ) : previewCount === 0 ? (
          <span className="text-casino-muted">
            No completed shifts older than {daysToKeep} days — nothing to delete.
          </span>
        ) : (
          <span className="text-casino-text">
            <span className="font-semibold text-casino-danger">{previewCount}</span>{' '}
            completed shift{previewCount !== 1 ? 's' : ''} older than {daysToKeep} days will be
            permanently deleted, along with all associated tasks and AI reports.
          </span>
        )}
      </div>

      {result && (
        <div
          className={`rounded-lg px-4 py-3 text-sm ${
            result.type === 'success'
              ? 'bg-green-900/30 border border-green-800 text-green-300'
              : 'bg-red-900/30 border border-red-800 text-red-300'
          }`}
        >
          {result.type === 'success'
            ? `Deleted ${result.deleted} shift${result.deleted !== 1 ? 's' : ''} and all associated records.`
            : result.message}
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <button
          onClick={handleDelete}
          disabled={isConfirmDisabled}
          className="min-h-[44px] bg-casino-danger hover:bg-red-600 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold rounded-lg px-5 py-2 text-sm transition-colors"
        >
          {confirmLabel}
        </button>
        <p className="text-casino-muted text-xs">
          Active shifts are never deleted. This action cannot be undone.
        </p>
      </div>
    </div>
  )
}

export { CleanupPanel }
