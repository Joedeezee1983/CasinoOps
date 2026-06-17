import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { endShift } from '@/lib/shift-service'
import { generateShiftSummary } from '@/lib/claude'
import { saveShiftReport } from '@/lib/briefing-service'

export async function POST(): Promise<NextResponse> {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const completedShift = await endShift(session.user.id)

    // Generate and save the AI summary — failure here does not block shift completion
    let reportId: string | null = null
    try {
      const aiSummary = await generateShiftSummary(completedShift)
      const report = await saveShiftReport(completedShift.id, aiSummary)
      reportId = report.id
    } catch (briefingError) {
      console.error(
        '[shifts/end/POST] Briefing generation failed:',
        briefingError instanceof Error ? briefingError.message : briefingError
      )
    }

    return NextResponse.json({ data: { shiftId: completedShift.id, reportId } })
  } catch (error) {
    if (error instanceof Error && error.message.includes('No active shift')) {
      return NextResponse.json({ error: error.message }, { status: 404 })
    }
    console.error(
      '[shifts/end/POST] Unexpected error:',
      error instanceof Error ? error.message : error
    )
    return NextResponse.json({ error: 'Failed to end shift' }, { status: 500 })
  }
}
