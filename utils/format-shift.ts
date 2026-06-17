import type { ShiftWithTasks } from '@/types'
import { ISSUE_TYPE_LABELS, TASK_STATUS_LABELS } from '@/constants'

/**
 * Formats a shift and its tasks into a plain-text string for inclusion in AI briefing context.
 */
export function formatShiftForBriefing(shift: ShiftWithTasks): string {
  const techName = shift.tech.name
  const start = shift.startTime.toLocaleString()
  const taskLines = shift.tasks
    .map(
      (t) =>
        `  - Machine ${t.machineNumber} (${t.location}): ${ISSUE_TYPE_LABELS[t.issueType]} — ${t.actionTaken} [${TASK_STATUS_LABELS[t.status]}]`
    )
    .join('\n')

  return `Tech: ${techName} | Started: ${start}\nTasks:\n${taskLines || '  (no tasks logged)'}`
}
