import { db } from '@/lib/db'
import type { CreateTaskInput, TaskSummary } from '@/types'

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
    },
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
  })
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
      createdAt: true,
    },
  })
}
