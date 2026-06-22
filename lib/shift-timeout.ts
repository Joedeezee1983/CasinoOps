import { autoEndStaleShifts } from '@/lib/shift-service'
import { SHIFT_TIMEOUT_CHECK_INTERVAL_MS, SHIFT_TIMEOUT_HOURS } from '@/constants'

declare global {
  // eslint-disable-next-line no-var
  var _shiftTimeoutStarted: boolean | undefined
}

/**
 * Starts the server-side shift timeout interval.
 * Uses a global flag so only one interval runs per process, even under hot reload.
 * Should be called once from instrumentation.ts on server startup.
 */
export function initShiftTimeoutChecker(): void {
  if (global._shiftTimeoutStarted) return
  global._shiftTimeoutStarted = true

  setInterval(async () => {
    try {
      const count = await autoEndStaleShifts()
      if (count > 0) {
        console.log(`[shift-timeout] Auto-ended ${count} stale shift(s) after ${SHIFT_TIMEOUT_HOURS}h`)
      }
    } catch (error) {
      console.error('[shift-timeout] Error checking stale shifts:', error)
    }
  }, SHIFT_TIMEOUT_CHECK_INTERVAL_MS)
}
