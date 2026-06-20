import type { ShiftWithTasks, TaskSection } from '@/types'
import { ISSUE_TYPE_LABELS, TASK_STATUS_LABELS, TASK_SECTION_LABELS, TASK_SECTION_ORDER } from '@/constants'

/**
 * Formats a shift and its tasks into a plain-text string for inclusion in AI briefing context.
 * Tasks are grouped by section so the model can summarize each area of work separately.
 */
export function formatShiftForBriefing(shift: ShiftWithTasks): string {
  const techName = shift.tech.name
  const start = shift.startTime.toLocaleString()

  const tasksBySection = groupTasksBySection(shift.tasks)

  const sections = TASK_SECTION_ORDER
    .filter((section) => tasksBySection[section].length > 0)
    .map((section) => {
      const label = TASK_SECTION_LABELS[section]
      const lines = tasksBySection[section]
        .map(
          (t) =>
            `  - Machine ${t.machineNumber} (${t.location}): ${ISSUE_TYPE_LABELS[t.issueType]} — ${t.actionTaken} [${TASK_STATUS_LABELS[t.status]}]`
        )
        .join('\n')
      return `${label}:\n${lines}`
    })
    .join('\n\n')

  return `Tech: ${techName} | Started: ${start}\n${sections || '  (no tasks logged)'}`
}

function groupTasksBySection(
  tasks: ShiftWithTasks['tasks']
): Record<TaskSection, ShiftWithTasks['tasks']> {
  const groups = Object.fromEntries(
    TASK_SECTION_ORDER.map((s) => [s, [] as ShiftWithTasks['tasks']])
  ) as Record<TaskSection, ShiftWithTasks['tasks']>

  for (const task of tasks) {
    groups[task.section].push(task)
  }

  return groups
}
