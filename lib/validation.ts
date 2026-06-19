import type { IssueType, TaskStatus, MachineStatus } from '@prisma/client'
import type { CreateTaskInput, CreateMachineInput } from '@/types'

export const MAX_FIELD_LENGTH = 500

function assertMaxLength(value: string, field: string): void {
  if (value.length > MAX_FIELD_LENGTH) {
    throw new Error(`${field} must not exceed ${MAX_FIELD_LENGTH} characters`)
  }
}

const VALID_ISSUE_TYPES: IssueType[] = [
  'DOWN_MACHINE', 'CPU_WORK', 'GMU_WORK', 'SDS_WORK', 'LOCK_CHANGE', 'BUTTON_PANEL', 'OTHER',
]

const VALID_TASK_STATUSES: TaskStatus[] = ['RESOLVED', 'PENDING', 'PARTS_ORDERED']
const VALID_MACHINE_STATUSES: MachineStatus[] = ['OPERATIONAL', 'DOWN', 'PENDING_PARTS']

/**
 * Validates and parses the body of a create-task request.
 * Throws with a descriptive message if any field is missing or invalid.
 */
export function validateCreateTaskInput(body: unknown): CreateTaskInput {
  if (typeof body !== 'object' || body === null) {
    throw new Error('Request body must be a JSON object')
  }

  const b = body as Record<string, unknown>

  if (typeof b.machineNumber !== 'string' || !b.machineNumber.trim()) {
    throw new Error('machineNumber is required')
  }
  assertMaxLength(b.machineNumber, 'machineNumber')
  if (typeof b.location !== 'string' || !b.location.trim()) {
    throw new Error('location is required')
  }
  assertMaxLength(b.location, 'location')
  if (!VALID_ISSUE_TYPES.includes(b.issueType as IssueType)) {
    throw new Error(`issueType must be one of: ${VALID_ISSUE_TYPES.join(', ')}`)
  }
  if (typeof b.actionTaken !== 'string' || !b.actionTaken.trim()) {
    throw new Error('actionTaken is required')
  }
  assertMaxLength(b.actionTaken, 'actionTaken')
  if (!VALID_TASK_STATUSES.includes(b.status as TaskStatus)) {
    throw new Error(`status must be one of: ${VALID_TASK_STATUSES.join(', ')}`)
  }

  return {
    machineNumber: b.machineNumber as string,
    location: b.location as string,
    issueType: b.issueType as IssueType,
    actionTaken: b.actionTaken as string,
    status: b.status as TaskStatus,
  }
}

/**
 * Validates and parses the body of a create-machine request.
 * Throws with a descriptive message if any field is missing or invalid.
 */
export function validateCreateMachineInput(body: unknown): CreateMachineInput {
  if (typeof body !== 'object' || body === null) {
    throw new Error('Request body must be a JSON object')
  }

  const b = body as Record<string, unknown>

  if (typeof b.machineNumber !== 'string' || !b.machineNumber.trim()) {
    throw new Error('machineNumber is required')
  }
  assertMaxLength(b.machineNumber, 'machineNumber')
  if (typeof b.location !== 'string' || !b.location.trim()) {
    throw new Error('location is required')
  }
  assertMaxLength(b.location, 'location')
  if (typeof b.type !== 'string' || !b.type.trim()) {
    throw new Error('type is required')
  }
  assertMaxLength(b.type, 'type')

  return {
    machineNumber: b.machineNumber as string,
    location: b.location as string,
    type: b.type as string,
  }
}

/**
 * Validates a machine status update value.
 * Throws if the status is not a valid MachineStatus enum value.
 */
export function validateMachineStatus(value: unknown): MachineStatus {
  if (!VALID_MACHINE_STATUSES.includes(value as MachineStatus)) {
    throw new Error(`status must be one of: ${VALID_MACHINE_STATUSES.join(', ')}`)
  }
  return value as MachineStatus
}

/**
 * Validates a task status update value.
 * Throws if the status is not a valid TaskStatus enum value.
 */
export function validateTaskStatus(value: unknown): TaskStatus {
  if (!VALID_TASK_STATUSES.includes(value as TaskStatus)) {
    throw new Error(`status must be one of: ${VALID_TASK_STATUSES.join(', ')}`)
  }
  return value as TaskStatus
}
