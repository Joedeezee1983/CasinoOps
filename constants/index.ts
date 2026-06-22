import type { IssueType, TaskStatus, MachineStatus, TaskSection } from '@prisma/client'

export const ISSUE_TYPE_LABELS: Record<IssueType, string> = {
  DOWN_MACHINE: 'Down Machine',
  CPU_WORK: 'CPU Work',
  GMU_WORK: 'GMU Work',
  SDS_WORK: 'SDS Work',
  LOCK_CHANGE: 'Lock Change',
  BUTTON_PANEL: 'Button Panel',
  OTHER: 'Other',
}

export const TASK_STATUS_LABELS: Record<TaskStatus, string> = {
  RESOLVED: 'Resolved',
  PENDING: 'Pending',
  PARTS_ORDERED: 'Parts Ordered',
}

export const MACHINE_STATUS_LABELS: Record<MachineStatus, string> = {
  OPERATIONAL: 'Operational',
  DOWN: 'Down',
  PENDING_PARTS: 'Pending Parts',
}

export const TASK_STATUS_COLORS: Record<TaskStatus, string> = {
  RESOLVED: 'bg-green-500 text-black',
  PENDING: 'bg-amber-500 text-black',
  PARTS_ORDERED: 'bg-blue-500 text-white',
}

export const MACHINE_STATUS_COLORS: Record<MachineStatus, string> = {
  OPERATIONAL: 'bg-green-900 text-green-300',
  DOWN: 'bg-red-900 text-red-300',
  PENDING_PARTS: 'bg-yellow-900 text-yellow-300',
}

export const TASK_SECTION_LABELS: Record<TaskSection, string> = {
  FLOOR_GAME: 'Floor Game',
  PRE_EXISTING_DOWN: 'Pre-Existing Down',
  KIOSK: 'Kiosk',
  BENCH_OFFICE: 'Bench / Office Work',
  MISCELLANEOUS: 'Miscellaneous',
}

export const TASK_SECTION_ORDER: TaskSection[] = [
  'PRE_EXISTING_DOWN',
  'FLOOR_GAME',
  'KIOSK',
  'BENCH_OFFICE',
  'MISCELLANEOUS',
]

export const MAX_BRIEFING_CONTEXT_CHARS = 40000
export const CLAUDE_MODEL = 'claude-sonnet-4-6'
export const CLAUDE_MAX_TOKENS = 1024
export const SESSION_MAX_AGE_SECONDS = 10 * 60 * 60

export const SHIFT_TIMEOUT_HOURS = 10
export const SHIFT_TIMEOUT_MS = SHIFT_TIMEOUT_HOURS * 60 * 60 * 1000
export const SHIFT_WARNING_AT_MS = SHIFT_TIMEOUT_MS - 15 * 60 * 1000
export const SHIFT_TIMEOUT_CHECK_INTERVAL_MS = 5 * 60 * 1000
