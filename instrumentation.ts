export async function register(): Promise<void> {
  // Dynamic import prevents this from running in the Edge runtime
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { scheduleAutoCleanup } = await import('./lib/cleanup-service')
    scheduleAutoCleanup()
  }
}
