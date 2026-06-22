export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { initShiftTimeoutChecker } = await import('@/lib/shift-timeout')
    initShiftTimeoutChecker()
  }
}
