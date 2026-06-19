import { db } from '@/lib/db'

const DEFAULT_RETENTION_DAYS = 90
const CLEANUP_INTERVAL_MS = 24 * 60 * 60 * 1000

/**
 * Deletes completed shifts older than the given retention period.
 * Tasks, ShiftReports, and PartsOrders are removed via database cascade.
 * Active shifts are never deleted.
 * Returns the count of deleted shifts.
 */
export async function deleteOldShifts(daysToKeep: number): Promise<number> {
  const cutoff = buildCutoffDate(daysToKeep)
  const { count } = await db.shift.deleteMany({
    where: {
      startTime: { lt: cutoff },
      status: 'COMPLETED',
    },
  })
  return count
}

/**
 * Returns the count of completed shifts that would be deleted with the given retention period.
 */
export async function countShiftsOlderThan(daysToKeep: number): Promise<number> {
  const cutoff = buildCutoffDate(daysToKeep)
  return db.shift.count({
    where: {
      startTime: { lt: cutoff },
      status: 'COMPLETED',
    },
  })
}

let cleanupScheduled = false

/**
 * Schedules auto-cleanup to run immediately on startup and every 24 hours after.
 * Safe to call multiple times — only one interval is ever registered.
 */
export function scheduleAutoCleanup(): void {
  if (cleanupScheduled) return
  cleanupScheduled = true

  const run = async (): Promise<void> => {
    try {
      const deleted = await deleteOldShifts(DEFAULT_RETENTION_DAYS)
      if (deleted > 0) {
        console.log(
          `[cleanup-service] Auto-deleted ${deleted} shift${deleted !== 1 ? 's' : ''} older than ${DEFAULT_RETENTION_DAYS} days`
        )
      }
    } catch (error) {
      console.error(
        '[cleanup-service] Auto-cleanup failed:',
        error instanceof Error ? error.message : error
      )
    }
  }

  void run()
  setInterval(() => void run(), CLEANUP_INTERVAL_MS)
}

function buildCutoffDate(daysToKeep: number): Date {
  const cutoff = new Date()
  cutoff.setDate(cutoff.getDate() - daysToKeep)
  return cutoff
}
