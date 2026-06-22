import { db } from '@/lib/db'
import type { ShiftReportSummary } from '@/types'

const RECENT_REPORTS_LIMIT = 5

/**
 * Returns the most recently saved ShiftReport.
 * Shown on the /briefing page after a tech ends their shift.
 */
export async function getMostRecentReport(): Promise<ShiftReportSummary | null> {
  return db.shiftReport.findFirst({
    select: {
      id: true,
      shiftId: true,
      aiSummary: true,
      sentAt: true,
      createdAt: true,
      shift: {
        select: {
          startTime: true,
          endTime: true,
          autoEnded: true,
          tech: { select: { name: true } },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  })
}

/**
 * Returns the most recent completed shift reports.
 * Used to provide context for the incoming shift AI briefing.
 */
export async function getRecentReports(): Promise<ShiftReportSummary[]> {
  return db.shiftReport.findMany({
    take: RECENT_REPORTS_LIMIT,
    select: {
      id: true,
      shiftId: true,
      aiSummary: true,
      sentAt: true,
      createdAt: true,
      shift: {
        select: {
          startTime: true,
          endTime: true,
          autoEnded: true,
          tech: { select: { name: true } },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  })
}

/**
 * Saves a generated AI shift report to the database.
 * Links the report to the shift it summarizes.
 */
export async function saveShiftReport(
  shiftId: string,
  aiSummary: string
): Promise<{ id: string }> {
  return db.shiftReport.create({
    data: { shiftId, aiSummary },
    select: { id: true },
  })
}

/**
 * Returns paginated shift history with reports, ordered by most recent.
 */
export async function getShiftHistory(page: number, pageSize: number): Promise<ShiftReportSummary[]> {
  return db.shiftReport.findMany({
    skip: (page - 1) * pageSize,
    take: pageSize,
    select: {
      id: true,
      shiftId: true,
      aiSummary: true,
      sentAt: true,
      createdAt: true,
      shift: {
        select: {
          startTime: true,
          endTime: true,
          autoEnded: true,
          tech: { select: { name: true } },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  })
}
