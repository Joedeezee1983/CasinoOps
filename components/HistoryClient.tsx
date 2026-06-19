'use client'

import { useState } from 'react'
import type { ShiftReportSummary } from '@/types'
import { formatDate } from '@/utils/format-date'

export interface HistoryClientProps {
  initialReports: ShiftReportSummary[]
}

const PAGE_SIZE = 10

export default function HistoryClient({ initialReports }: HistoryClientProps) {
  const [reports, setReports] = useState<ShiftReportSummary[]>(initialReports)
  const [page, setPage] = useState(1)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [hasMore, setHasMore] = useState(initialReports.length === PAGE_SIZE)
  const [exportingId, setExportingId] = useState<string | null>(null)

  const handleLoadMore = async () => {
    setIsLoadingMore(true)
    try {
      const nextPage = page + 1
      const res = await fetch(`/api/history?page=${nextPage}&pageSize=${PAGE_SIZE}`)
      const json = await res.json()
      const newReports = json.data as ShiftReportSummary[]
      setReports([...reports, ...newReports])
      setPage(nextPage)
      setHasMore(newReports.length === PAGE_SIZE)
    } catch {
      // Silent — load more is non-critical; existing reports remain visible
    } finally {
      setIsLoadingMore(false)
    }
  }

  const handleExportPDF = async (shiftId: string, startTime: Date | string) => {
    if (exportingId) return
    setExportingId(shiftId)
    try {
      const res = await fetch(`/api/shifts/${shiftId}/export`)
      if (!res.ok) throw new Error('Export failed')
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `shift-report-${new Date(startTime).toISOString().slice(0, 10)}.pdf`
      a.click()
      URL.revokeObjectURL(url)
    } catch {
      // Non-critical: export failure does not affect history display
    } finally {
      setExportingId(null)
    }
  }

  if (reports.length === 0) {
    return (
      <div className="bg-casino-card border border-casino-border rounded-xl p-8 text-center">
        <p className="text-casino-muted">No shift reports yet.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {reports.map((report) => (
        <div key={report.id} className="bg-casino-card border border-casino-border rounded-xl p-5">
          <div className="flex items-center justify-between mb-3">
            <div>
              <span className="font-semibold text-casino-text">{report.shift.tech.name}</span>
              <span className="text-casino-muted text-xs ml-3">{formatDate(report.shift.startTime)}</span>
              {report.shift.endTime && (
                <span className="text-casino-muted text-xs ml-1">→ {formatDate(report.shift.endTime)}</span>
              )}
            </div>
            <button
              onClick={() => handleExportPDF(report.shiftId, report.shift.startTime)}
              disabled={exportingId === report.shiftId}
              className="px-3 py-1.5 text-xs font-medium bg-casino-border hover:bg-casino-border/70 text-casino-text rounded-lg transition-colors disabled:opacity-50 flex-shrink-0"
            >
              {exportingId === report.shiftId ? 'Generating…' : 'Export PDF'}
            </button>
          </div>
          <div className="text-casino-text text-sm whitespace-pre-wrap leading-relaxed">
            {report.aiSummary}
          </div>
        </div>
      ))}
      {hasMore && (
        <button
          onClick={handleLoadMore}
          disabled={isLoadingMore}
          className="w-full py-3 text-casino-muted hover:text-casino-text text-sm border border-casino-border rounded-xl transition-colors disabled:opacity-50"
        >
          {isLoadingMore ? 'Loading...' : 'Load More'}
        </button>
      )}
    </div>
  )
}

export { HistoryClient }
