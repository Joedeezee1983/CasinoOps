'use client'

import { useState, useEffect } from 'react'
import ReactMarkdown from 'react-markdown'
import type { ShiftReportSummary } from '@/types'
import { formatDate } from '@/utils/format-date'

export default function BriefingClient() {
  const [report, setReport] = useState<ShiftReportSummary | null | undefined>(undefined)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  useEffect(() => {
    const fetchReport = async () => {
      try {
        const res = await fetch('/api/briefing')
        const json = await res.json()
        if (!res.ok) throw new Error(json.error)
        setReport((json.data as ShiftReportSummary) ?? null)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load briefing')
      } finally {
        setIsLoading(false)
      }
    }

    fetchReport()
  }, [])

  if (isLoading) {
    return (
      <div className="bg-casino-card border border-casino-border rounded-xl p-6 space-y-3">
        <div className="h-4 bg-casino-border rounded animate-pulse w-3/4" />
        <div className="h-4 bg-casino-border rounded animate-pulse w-1/2" />
        <div className="h-4 bg-casino-border rounded animate-pulse w-5/6" />
        <p className="text-casino-muted text-xs pt-2">Loading shift report...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-900/30 border border-red-800 text-red-300 text-sm rounded-xl px-4 py-3">
        {error}
      </div>
    )
  }

  if (!report) {
    return (
      <div className="bg-casino-card border border-casino-border rounded-xl p-8 text-center">
        <p className="text-casino-text font-medium mb-2">No shift reports yet</p>
        <p className="text-casino-muted text-sm">
          Complete a shift on the dashboard to generate the first AI briefing.
        </p>
      </div>
    )
  }

  return (
    <div className="bg-casino-card border border-casino-border rounded-xl overflow-hidden">
      <div className="px-6 py-4 border-b border-casino-border flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <p className="text-casino-text font-semibold">{report.shift.tech.name}</p>
          <p className="text-casino-muted text-xs mt-0.5">
            {formatDate(report.shift.startTime)}
            {report.shift.endTime && ` → ${formatDate(report.shift.endTime)}`}
          </p>
        </div>
        <div className="flex items-center gap-3 flex-shrink-0">
          <span className="text-casino-accent text-xs font-medium">AI Summary</span>
          <span className="text-casino-muted text-xs">· Claude</span>
          <button
            onClick={() => window.open(`/api/shifts/${report.shiftId}/export`, '_blank')}
            className="px-3 py-1.5 text-xs font-medium bg-casino-border hover:bg-casino-border/70 text-casino-text rounded-lg transition-colors"
          >
            Export PDF
          </button>
        </div>
      </div>
      <div className="px-6 py-5">
        <div className="text-casino-text text-sm leading-relaxed prose prose-invert prose-sm max-w-none">
          <ReactMarkdown>{report.aiSummary}</ReactMarkdown>
        </div>
      </div>
    </div>
  )
}

export { BriefingClient }
