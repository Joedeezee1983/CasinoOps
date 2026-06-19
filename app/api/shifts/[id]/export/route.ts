import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getShiftForExport } from '@/lib/shift-service'
import { generateShiftPDF } from '@/lib/pdf-service'

function formatExportDate(date: Date): string {
  return date.toISOString().slice(0, 10)
}

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse> {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const shift = await getShiftForExport(params.id)
    if (!shift) {
      return NextResponse.json({ error: 'Shift not found' }, { status: 404 })
    }

    const pdfBytes = await generateShiftPDF(shift)
    const filename = `shift-report-${formatExportDate(shift.startTime)}.pdf`

    return new NextResponse(Buffer.from(pdfBytes), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    })
  } catch (error) {
    console.error('[shifts/export/GET] Unexpected error:', error)
    return NextResponse.json({ error: 'Failed to generate PDF' }, { status: 500 })
  }
}
