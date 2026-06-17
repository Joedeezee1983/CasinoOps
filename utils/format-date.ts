/**
 * Formats a Date into a short human-readable string for display in the UI.
 * Example output: "Jun 17, 2026 14:32"
 */
export function formatDate(date: Date | string): string {
  return new Date(date).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

/**
 * Calculates elapsed time from a start date to now, returned as a string like "2h 14m".
 */
export function elapsedTime(startTime: Date | string): string {
  const ms = Date.now() - new Date(startTime).getTime()
  const totalMinutes = Math.floor(ms / 60000)
  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60
  if (hours === 0) return `${minutes}m`
  return `${hours}h ${minutes}m`
}
