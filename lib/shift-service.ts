import { db } from '@/lib/db'
import type { ShiftWithTasks } from '@/types'

/**
 * Starts a new shift for the given tech. Throws if the tech already has an active shift.
 */
export async function startShift(techId: string): Promise<{ id: string }> {
  const existing = await db.shift.findFirst({
    where: { techId, status: 'ACTIVE' },
    select: { id: true },
  })

  if (existing) {
    throw new Error('You already have an active shift. End it before starting a new one.')
  }

  return db.shift.create({
    data: { techId, status: 'ACTIVE' },
    select: { id: true },
  })
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
    select: {
      id: true,
      techId: true,
      startTime: true,
      endTime: true,
      status: true,
      createdAt: true,
      tech: { select: { id: true, name: true, email: true, role: true } },
      tasks: {
        select: {
          id: true,
          shiftId: true,
          machineNumber: true,
          location: true,
          issueType: true,
          actionTaken: true,
          status: true,
          createdAt: true,
        },
        orderBy: { createdAt: 'desc' },
      },
    },
  })

  if (!completed) throw new Error('Failed to fetch completed shift.')
  return completed
}

/**
 * Returns the currently active shift for a tech, including tasks.
 * Returns null if no active shift exists.
 */
export async function getActiveShift(techId: string): Promise<ShiftWithTasks | null> {
  return db.shift.findFirst({
    where: { techId, status: 'ACTIVE' },
    select: {
      id: true,
      techId: true,
      startTime: true,
      endTime: true,
      status: true,
      createdAt: true,
      tech: { select: { id: true, name: true, email: true, role: true } },
      tasks: {
        select: {
          id: true,
          shiftId: true,
          machineNumber: true,
          location: true,
          issueType: true,
          actionTaken: true,
          status: true,
          createdAt: true,
        },
        orderBy: { createdAt: 'desc' },
      },
    },
  })
}

/**
 * Returns all active shifts across all techs, including tasks. Used by supervisors.
 */
export async function getAllActiveShifts(): Promise<ShiftWithTasks[]> {
  return db.shift.findMany({
    where: { status: 'ACTIVE' },
    select: {
      id: true,
      techId: true,
      startTime: true,
      endTime: true,
      status: true,
      createdAt: true,
      tech: { select: { id: true, name: true, email: true, role: true } },
      tasks: {
        select: {
          id: true,
          shiftId: true,
          machineNumber: true,
          location: true,
          issueType: true,
          actionTaken: true,
          status: true,
          createdAt: true,
        },
        orderBy: { createdAt: 'desc' },
      },
    },
    orderBy: { startTime: 'desc' },
  })
}
