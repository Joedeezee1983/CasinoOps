import { db } from '@/lib/db'
import type { ShiftWithTasks, ShiftExportData } from '@/types'
import { SHIFT_TIMEOUT_MS } from '@/constants'

const TECH_ON_SHIFT_SELECT = {
  id: true,
  userId: true,
  user: { select: { id: true, name: true } },
} as const

const SHIFT_WITH_TASKS_SELECT = {
  id: true,
  techId: true,
  startTime: true,
  endTime: true,
  status: true,
  autoEnded: true,
  createdAt: true,
  tech: { select: { id: true, name: true, email: true, role: true } },
  techs: { select: TECH_ON_SHIFT_SELECT },
  tasks: {
    select: {
      id: true,
      shiftId: true,
      machineNumber: true,
      location: true,
      issueType: true,
      actionTaken: true,
      status: true,
      section: true,
      createdAt: true,
    },
    orderBy: { createdAt: 'desc' as const },
  },
} as const

/**
 * Starts a new shift for the given tech and records all techs on shift via ShiftTech.
 * techId is always included in ShiftTech regardless of what techIds contains.
 * Throws if the tech already has an active shift.
 */
export async function startShift(techId: string, techIds: string[]): Promise<{ id: string }> {
  const existing = await db.shift.findFirst({
    where: { techId, status: 'ACTIVE' },
    select: { id: true },
  })

  if (existing) {
    throw new Error('You already have an active shift. End it before starting a new one.')
  }

  const shift = await db.shift.create({
    data: { techId, status: 'ACTIVE' },
    select: { id: true },
  })

  const uniqueTechIds = Array.from(new Set([techId, ...techIds]))
  await db.shiftTech.createMany({
    data: uniqueTechIds.map((userId) => ({ shiftId: shift.id, userId })),
    skipDuplicates: true,
  })

  return shift
}

/**
 * Ends the active shift for the given tech and marks it COMPLETED.
 * Returns the full completed shift with tasks so a briefing can be generated.
 * Throws if no active shift is found for the tech.
 */
export async function endShift(techId: string): Promise<ShiftWithTasks> {
  const active = await db.shift.findFirst({
    where: { techId, status: 'ACTIVE' },
    select: { id: true },
  })

  if (!active) {
    throw new Error('No active shift found.')
  }

  await db.shift.update({
    where: { id: active.id },
    data: { status: 'COMPLETED', endTime: new Date() },
  })

  const completed = await db.shift.findUnique({
    where: { id: active.id },
    select: SHIFT_WITH_TASKS_SELECT,
  })

  if (!completed) throw new Error('Failed to fetch completed shift.')
  return completed
}

/**
 * Returns the currently active shift for a tech, including tasks and all techs on shift.
 * Returns null if no active shift exists.
 */
export async function getActiveShift(techId: string): Promise<ShiftWithTasks | null> {
  return db.shift.findFirst({
    where: { techId, status: 'ACTIVE' },
    select: SHIFT_WITH_TASKS_SELECT,
  })
}

/**
 * Fetches a shift by ID with all task and report data needed for PDF export.
 * techNames is built from ShiftTech records, falling back to the primary tech if none exist.
 * Returns null if the shift does not exist.
 */
export async function getShiftForExport(shiftId: string): Promise<ShiftExportData | null> {
  const shift = await db.shift.findUnique({
    where: { id: shiftId },
    select: {
      id: true,
      startTime: true,
      endTime: true,
      autoEnded: true,
      tech: { select: { name: true } },
      techs: { select: { user: { select: { name: true } } } },
      tasks: {
        select: {
          machineNumber: true,
          location: true,
          issueType: true,
          actionTaken: true,
          status: true,
          section: true,
        },
        orderBy: { createdAt: 'asc' },
      },
      report: { select: { aiSummary: true } },
    },
  })

  if (!shift) return null

  const techNames = shift.techs.length > 0
    ? shift.techs.map((t) => t.user.name)
    : [shift.tech.name]

  return {
    id: shift.id,
    startTime: shift.startTime,
    endTime: shift.endTime,
    autoEnded: shift.autoEnded,
    techNames,
    tasks: shift.tasks,
    aiSummary: shift.report?.aiSummary ?? null,
  }
}

/**
 * Finds all active shifts older than SHIFT_TIMEOUT_MS and marks them COMPLETED.
 * Sets autoEnded=true so supervisors can see why they closed without a manual end.
 * Returns the number of shifts auto-ended.
 */
export async function autoEndStaleShifts(): Promise<number> {
  const cutoff = new Date(Date.now() - SHIFT_TIMEOUT_MS)

  const stale = await db.shift.findMany({
    where: { status: 'ACTIVE', startTime: { lt: cutoff } },
    select: { id: true },
  })

  if (stale.length === 0) return 0

  await db.shift.updateMany({
    where: { id: { in: stale.map((s) => s.id) } },
    data: { status: 'COMPLETED', endTime: new Date(), autoEnded: true },
  })

  return stale.length
}

/**
 * Force-ends any active shift by ID. Used by admins to close stuck or abandoned shifts.
 * Sets autoEnded=true so the closure reason is visible in history and PDF export.
 * Throws if the shift does not exist or is not currently active.
 */
export async function forceEndShift(shiftId: string): Promise<ShiftWithTasks> {
  const shift = await db.shift.findUnique({
    where: { id: shiftId },
    select: { id: true, status: true },
  })

  if (!shift) throw new Error('Shift not found.')
  if (shift.status !== 'ACTIVE') throw new Error('Shift is not active.')

  await db.shift.update({
    where: { id: shiftId },
    data: { status: 'COMPLETED', endTime: new Date(), autoEnded: true },
  })

  const completed = await db.shift.findUnique({
    where: { id: shiftId },
    select: SHIFT_WITH_TASKS_SELECT,
  })

  if (!completed) throw new Error('Failed to fetch completed shift.')
  return completed
}

/**
 * Returns all active shifts across all techs, including tasks and co-techs. Used by supervisors.
 */
export async function getAllActiveShifts(): Promise<ShiftWithTasks[]> {
  return db.shift.findMany({
    where: { status: 'ACTIVE' },
    select: SHIFT_WITH_TASKS_SELECT,
    orderBy: { startTime: 'desc' },
  })
}
