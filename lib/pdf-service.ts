import { PDFDocument, PDFPage, PDFFont, StandardFonts, rgb } from 'pdf-lib'
import type { ShiftExportData } from '@/types'
import { ISSUE_TYPE_LABELS } from '@/constants'

// --- Page layout ---

const PAGE_W = 612
const PAGE_H = 792
const MARGIN = 40
const CONTENT_W = PAGE_W - MARGIN * 2

// --- Colors ---

const GOLD = rgb(212 / 255, 160 / 255, 23 / 255)    // #D4A017
const BLUE = rgb(0 / 255, 174 / 255, 239 / 255)     // #00AEEF
const RED = rgb(1, 0, 0)                              // #FF0000
const WHITE = rgb(1, 1, 1)
const BLACK = rgb(0, 0, 0)
const DARK = rgb(0.18, 0.18, 0.18)
const COL_BG = rgb(0.87, 0.87, 0.87)
const ROW_ALT = rgb(0.95, 0.95, 0.95)

// --- Sizes ---

const TITLE_SIZE = 15
const SECTION_SIZE = 11
const COL_SIZE = 9
const DATA_SIZE = 9
const INFO_SIZE = 9
const NOTES_SIZE = 9
const LINE_H = 13

const TITLE_BAR_H = 70
const INFO_H = 28
const SECTION_H = 24
const COL_H = 18
const ROW_H = 19

// --- Column definitions ---

interface ColDef { label: string; x: number; width: number }

const STAFF_COLS: ColDef[] = [
  { label: 'NAME',       x: MARGIN,       width: 195 },
  { label: 'TIME IN',    x: MARGIN + 195, width: 90  },
  { label: 'TIME OUT',   x: MARGIN + 285, width: 90  },
  { label: 'ASSIGNMENT', x: MARGIN + 375, width: 157 },
]

const MACHINE_COLS: ColDef[] = [
  { label: 'MACHINE',     x: MARGIN,       width: 150 },
  { label: 'DESCRIPTION', x: MARGIN + 150, width: 382 },
]

// --- Utility functions ---

function getShiftType(startTime: Date): 'DAY' | 'SWING' | 'GRAVE' {
  const hour = startTime.getHours()
  if (hour >= 6 && hour < 14) return 'DAY'
  if (hour >= 14 && hour < 22) return 'SWING'
  return 'GRAVE'
}

function formatPdfDate(date: Date): string {
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function formatPdfTime(date: Date): string {
  return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
}

function stripEmoji(text: string): string {
  return text
    .replace(/[^\x00-\x7F]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

function stripMarkdown(text: string): string {
  return text
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/\*([^*]+)\*/g, '$1')
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/^- /gm, '• ')
    .trim()
}

function wrapText(text: string, font: PDFFont, size: number, maxW: number): string[] {
  const lines: string[] = []
  for (const para of text.split('\n')) {
    if (!para.trim()) { lines.push(''); continue }
    const words = para.split(' ')
    let line = ''
    for (const word of words) {
      const test = line ? `${line} ${word}` : word
      if (font.widthOfTextAtSize(test, size) > maxW && line) {
        lines.push(line)
        line = word
      } else {
        line = test
      }
    }
    if (line) lines.push(line)
  }
  return lines
}

function truncateToFit(text: string, font: PDFFont, size: number, maxW: number): string {
  if (font.widthOfTextAtSize(text, size) <= maxW) return text
  let result = text
  while (result.length > 0 && font.widthOfTextAtSize(`${result}…`, size) > maxW) {
    result = result.slice(0, -1)
  }
  return `${result}…`
}

// --- Drawing primitives ---

type Color = ReturnType<typeof rgb>

function drawRect(page: PDFPage, x: number, y: number, w: number, h: number, color: Color): void {
  page.drawRectangle({ x, y, width: w, height: h, color })
}

function drawText(
  page: PDFPage, text: string, x: number, y: number,
  font: PDFFont, size: number, color: Color = BLACK
): void {
  page.drawText(stripEmoji(text), { x, y, font, size, color })
}

function drawCentered(
  page: PDFPage, text: string, barY: number, barH: number,
  font: PDFFont, size: number, color: Color
): void {
  const x = (PAGE_W - font.widthOfTextAtSize(text, size)) / 2
  const y = barY + (barH - size) / 2
  drawText(page, text, x, y, font, size, color)
}

// --- Section drawing ---

function drawTitleBar(page: PDFPage, bold: PDFFont, topY: number): number {
  const barY = topY - TITLE_BAR_H
  drawRect(page, 0, barY, PAGE_W, TITLE_BAR_H, GOLD)
  drawCentered(page, 'RIVER ROCK CASINO — SLOT TECHNICAL SHIFT REPORT', barY, TITLE_BAR_H, bold, TITLE_SIZE, WHITE)
  return barY
}

function drawInfoBar(page: PDFPage, regular: PDFFont, data: ShiftExportData, topY: number): number {
  const barY = topY - INFO_H
  drawRect(page, 0, barY, PAGE_W, INFO_H, DARK)
  const label = `Shift: ${getShiftType(data.startTime)}   |   Date: ${formatPdfDate(data.startTime)}   |   Supervisor on Shift: N/A`
  drawText(page, label, MARGIN, barY + (INFO_H - INFO_SIZE) / 2, regular, INFO_SIZE, WHITE)
  return barY
}

function drawSectionHeader(page: PDFPage, label: string, bold: PDFFont, color: Color, topY: number): number {
  const barY = topY - SECTION_H
  drawRect(page, MARGIN, barY, CONTENT_W, SECTION_H, color)
  drawText(page, label, MARGIN + 8, barY + (SECTION_H - SECTION_SIZE) / 2, bold, SECTION_SIZE, WHITE)
  return barY
}

function drawColHeaders(page: PDFPage, cols: ColDef[], bold: PDFFont, topY: number): number {
  const barY = topY - COL_H
  drawRect(page, MARGIN, barY, CONTENT_W, COL_H, COL_BG)
  for (const col of cols) {
    drawText(page, col.label, col.x + 4, barY + (COL_H - COL_SIZE) / 2, bold, COL_SIZE, BLACK)
  }
  return barY
}

function drawRow(
  page: PDFPage, cols: ColDef[], values: string[],
  regular: PDFFont, topY: number, isAlt: boolean
): number {
  const barY = topY - ROW_H
  if (isAlt) drawRect(page, MARGIN, barY, CONTENT_W, ROW_H, ROW_ALT)
  for (let i = 0; i < cols.length; i++) {
    const col = cols[i]
    const text = truncateToFit(values[i] ?? '', regular, DATA_SIZE, col.width - 8)
    drawText(page, text, col.x + 4, barY + (ROW_H - DATA_SIZE) / 2, regular, DATA_SIZE, BLACK)
  }
  return barY
}

// --- Content sections ---

function drawStaffSection(
  page: PDFPage, regular: PDFFont, bold: PDFFont,
  data: ShiftExportData, topY: number
): number {
  let y = drawSectionHeader(page, 'STAFF ON SHIFT', bold, BLUE, topY - 15)
  y = drawColHeaders(page, STAFF_COLS, bold, y)
  const timeIn = formatPdfTime(data.startTime)
  const timeOut = data.endTime ? formatPdfTime(data.endTime) : 'ACTIVE'
  return drawRow(page, STAFF_COLS, [data.techName, timeIn, timeOut, 'SLOT TECH'], regular, y, false)
}

function drawMachinesSection(
  page: PDFPage, regular: PDFFont, bold: PDFFont,
  data: ShiftExportData, topY: number
): number {
  let y = drawSectionHeader(page, 'MACHINES OUT OF SERVICE', bold, RED, topY - 15)
  y = drawColHeaders(page, MACHINE_COLS, bold, y)

  const oos = data.tasks.filter((t) => t.status !== 'RESOLVED')
  if (oos.length === 0) {
    return drawRow(page, MACHINE_COLS, ['All clear — no machines out of service', ''], regular, y, false)
  }

  oos.forEach((task, i) => {
    const machine = `${task.location} #${task.machineNumber}`
    const desc = `${ISSUE_TYPE_LABELS[task.issueType]}: ${task.actionTaken}`
    y = drawRow(page, MACHINE_COLS, [machine, desc], regular, y, i % 2 === 1)
  })
  return y
}

function drawNotesSection(
  page: PDFPage, regular: PDFFont, bold: PDFFont,
  data: ShiftExportData, topY: number
): number {
  let y = drawSectionHeader(page, 'NOTES / SHIFT SUMMARY', bold, BLUE, topY - 15)

  if (!data.aiSummary) {
    drawText(page, 'No shift summary available.', MARGIN + 8, y - NOTES_SIZE - 8, regular, NOTES_SIZE)
    return y - NOTES_SIZE - 16
  }

  const lines = wrapText(stripMarkdown(data.aiSummary), regular, NOTES_SIZE, CONTENT_W - 16)
  let noteY = y - LINE_H
  for (const line of lines) {
    if (noteY < MARGIN + 10) break
    if (line) drawText(page, line, MARGIN + 8, noteY, regular, NOTES_SIZE)
    noteY -= LINE_H
  }
  return noteY
}

// --- Main export ---

/**
 * Generates a River Rock Casino Slot Technical Shift Report PDF.
 * Returns the raw PDF bytes ready to stream as a response.
 */
export async function generateShiftPDF(data: ShiftExportData): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create()
  const page = pdfDoc.addPage([PAGE_W, PAGE_H])
  const bold = await pdfDoc.embedFont(StandardFonts.HelveticaBold)
  const regular = await pdfDoc.embedFont(StandardFonts.Helvetica)

  let y = drawTitleBar(page, bold, PAGE_H)
  y = drawInfoBar(page, regular, data, y)
  y = drawStaffSection(page, regular, bold, data, y)
  y = drawMachinesSection(page, regular, bold, data, y)
  drawNotesSection(page, regular, bold, data, y)

  return pdfDoc.save()
}
