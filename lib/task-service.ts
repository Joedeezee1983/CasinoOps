import { db } from '@/lib/db'
import type { CreateTaskInput, TaskSummary, DownMachineEntry } from '@/types'

/**
 * Logs a new task under the given shift.
 * Throws if the shift does not exist or does not belong to the tech.
 */
export async function createTask(
  shiftId: string,
  techId: string,
  input: CreateTaskInput
): Promise<TaskSummary> {
  const shift = await db.shift.findFirst({
    where: { id: shiftId, techId, status: 'ACTIVE' },
    select: { id: true },
  })

  if (!shift) {
    throw new Error('Active shift not found. Cannot log task.')
  }

  return db.task.create({
    data: {
      shiftId,
      machineNumber: input.machineNumber,
      location: input.location,
      issueType: input.issueType,
      actionTaken: input.actionTaken,
      status: input.status,
      section: input.section,
    },
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
  })
}

/**
 * Returns all unresolved DOWN_MACHINE tasks tied to active shifts, sorted oldest first.
 * Used by the supervisor dashboard to show machines currently down on the floor.
 */
export async function getActiveMachinesDown(): Promise<DownMachineEntry[]> {
  const tasks = await db.task.findMany({
    where: {
      issueType: 'DOWN_MACHINE',
      status: { not: 'RESOLVED' },
      shift: { status: 'ACTIVE' },
    },
    select: {
      machineNumber: true,
      location: true,
      createdAt: true,
      shift: {
        select: {
          tech: { select: { name: true } },
        },
      },
    },
    orderBy: { createdAt: 'asc' },
  })

  return tasks.map((t) => ({
    machineNumber: t.machineNumber,
    location: t.location,
    techName: t.shift.tech.name,
    createdAt: t.createdAt,
  }))
}

/**
 * Updates the status of a task. Used for marking resolved, pending, or parts ordered.
 * Throws if the task is not found.
 */
export async function updateTaskStatus(
  taskId: string,
  status: TaskSummary['status']
): Promise<TaskSummary> {
  return db.task.update({
    where: { id: taskId },
    data: { status },
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
  })
}
