'use client'

import { useState, useEffect } from 'react'
import type { DownMachineEntry } from '@/types'
import { elapsedTime } from '@/utils/format-date'

export default function MachinesDown() {
  const [machines, setMachines] = useState<DownMachineEntry[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchMachinesDown = async () => {
      try {
        const res = await fetch('/api/supervisor/machines-down')
        const json = await res.json()
        if (!res.ok) throw new Error(json.error)
        setMachines(json.data as DownMachineEntry[])
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load down machines')
      } finally {
        setIsLoading(false)
      }
    }

    fetchMachinesDown()
  }, [])

  if (isLoading) {
    return (
      <div className="rounded-xl border border-[#8B2E1A]/40 bg-[#8B2E1A]/10 px-5 py-4">
        <div className="h-4 bg-[#8B2E1A]/20 rounded animate-pulse w-48" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-xl border border-red-800 bg-red-900/30 px-5 py-4 text-red-300 text-sm">
        {error}
      </div>
    )
  }

  if (machines.length === 0) {
    return (
      <div className="rounded-xl border border-green-700 bg-green-900/20 px-5 py-4 flex items-center gap-3">
        <span className="inline-flex items-center gap-1.5 bg-green-500 text-black text-xs font-bold px-3 py-1 rounded-full">
          <span className="w-1.5 h-1.5 bg-black rounded-full" />
          All Clear
        </span>
        <span className="text-green-300 text-sm">No machines currently down</span>
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-[#8B2E1A] bg-[#8B2E1A]/10 overflow-hidden">
      <div className="px-5 py-4 border-b border-[#8B2E1A]/50 flex items-center gap-3">
        <span className="inline-flex items-center gap-1.5 bg-[#8B2E1A] text-[#D4A017] text-xs font-bold px-3 py-1 rounded-full">
          <span className="w-1.5 h-1.5 bg-[#D4A017] rounded-full animate-pulse" />
          {machines.length} Down
        </span>
        <span className="text-[#D4A017] text-sm font-medium">Machines Currently Down</span>
      </div>
      <div className="divide-y divide-[#8B2E1A]/30">
        {machines.map((machine, index) => (
          <div key={`${machine.machineNumber}-${index}`} className="px-5 py-3 flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <span className="text-[#D4A017] font-bold text-sm">#{machine.machineNumber}</span>
              <span className="text-casino-text text-sm">{machine.location}</span>
              <span className="text-casino-muted text-xs">Tech: {machine.techName}</span>
            </div>
            <span className="text-[#D4A017] text-xs font-medium whitespace-nowrap">
              Down {elapsedTime(machine.createdAt)}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

export { MachinesDown }
