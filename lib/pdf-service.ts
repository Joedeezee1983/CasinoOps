import type { ShiftExportData } from '@/types'
import { ISSUE_TYPE_LABELS } from '@/constants'

const REPORT_COLORS = {
  gold: '#D4A017',
  blue: '#00AEEF',
  red: '#cc0000',
  dark: '#2e2e2e',
} as const

function escape(text: string): string {
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function getShiftType(startTime: Date): 'DAY' | 'SWING' | 'GRAVE' {
  const hour = startTime.getHours()
  if (hour >= 6 && hour < 14) return 'DAY'
  if (hour >= 14 && hour < 22) return 'SWING'
  return 'GRAVE'
}

function formatReportDate(date: Date): string {
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function formatReportTime(date: Date): string {
  return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
}

function stripMarkdown(text: string): string {
  return text
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/\*([^*]+)\*/g, '$1')
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/^- /gm, '• ')
    .trim()
}

function buildStyles(): string {
  return `
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: Helvetica, Arial, sans-serif; font-size: 9pt; color: #2e2e2e; background: #fff; }
    .title-bar { background: ${REPORT_COLORS.gold}; color: #fff; text-align: center; padding: 20px 40px; font-size: 15pt; font-weight: bold; letter-spacing: 0.3px; }
    .info-bar { background: ${REPORT_COLORS.dark}; color: #fff; padding: 8px 40px; font-size: 9pt; }
    .content { padding: 0 40px 40px; }
    .section-header { padding: 6px 8px; font-size: 11pt; font-weight: bold; color: #fff; margin-top: 16px; }
    .blue { background: ${REPORT_COLORS.blue}; }
    .red { background: ${REPORT_COLORS.red}; }
    table { width: 100%; border-collapse: collapse; }
    th { background: #dedede; font-size: 9pt; font-weight: bold; padding: 5px 4px; text-align: left; }
    td { font-size: 9pt; padding: 5px 4px; border-bottom: 1px solid #e8e8e8; vertical-align: top; }
    tr:nth-child(even) td { background: #f3f3f3; }
    .notes { padding: 8px; font-size: 9pt; line-height: 1.6; white-space: pre-wrap; }
    @media print {
      @page { margin: 0.5in; size: letter; }
      body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    }
  `
}

function buildInfoBar(data: ShiftExportData): string {
  const shift = getShiftType(data.startTime)
  const date = formatReportDate(data.startTime)
  return `<div class="info-bar">Shift: ${escape(shift)}&nbsp;&nbsp;|&nbsp;&nbsp;Date: ${escape(date)}&nbsp;&nbsp;|&nbsp;&nbsp;Supervisor on Shift: N/A</div>`
}

function buildStaffSection(data: ShiftExportData): string {
  const timeIn = formatReportTime(data.startTime)
  const timeOut = data.endTime ? formatReportTime(data.endTime) : 'ACTIVE'
  return `
    <div class="section-header blue">STAFF ON SHIFT</div>
    <table>
      <thead><tr>
        <th style="width:36.7%">NAME</th>
        <th style="width:16.9%">TIME IN</th>
        <th style="width:16.9%">TIME OUT</th>
        <th style="width:29.5%">ASSIGNMENT</th>
      </tr></thead>
      <tbody><tr>
        <td>${escape(data.techName)}</td>
        <td>${escape(timeIn)}</td>
        <td>${escape(timeOut)}</td>
        <td>SLOT TECH</td>
      </tr></tbody>
    </table>`
}

function buildMachinesSection(data: ShiftExportData): string {
  const oos = data.tasks.filter((t) => t.status !== 'RESOLVED')
  const rows = oos.length === 0
    ? `<tr><td colspan="2" style="color:#666">All clear — no machines out of service</td></tr>`
    : oos.map((task, i) => {
        const machine = escape(`${task.location} #${task.machineNumber}`)
        const desc = escape(`${ISSUE_TYPE_LABELS[task.issueType]}: ${task.actionTaken}`)
        const bg = i % 2 === 1 ? 'background:#f3f3f3;' : ''
        return `<tr><td style="width:28.2%;${bg}">${machine}</td><td style="${bg}">${desc}</td></tr>`
      }).join('')
  return `
    <div class="section-header red">MACHINES OUT OF SERVICE</div>
    <table>
      <thead><tr>
        <th style="width:28.2%">MACHINE</th>
        <th>DESCRIPTION</th>
      </tr></thead>
      <tbody>${rows}</tbody>
    </table>`
}

function buildNotesSection(data: ShiftExportData): string {
  const content = data.aiSummary
    ? escape(stripMarkdown(data.aiSummary))
    : 'No shift summary available.'
  return `
    <div class="section-header blue">NOTES / SHIFT SUMMARY</div>
    <div class="notes">${content}</div>`
}

/**
 * Generates a printable HTML page for the River Rock Casino Slot Technical Shift Report.
 * The page auto-triggers window.print() on load so the user can save as PDF natively.
 */
export function generateShiftReportHTML(data: ShiftExportData): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>River Rock Casino — Slot Technical Shift Report</title>
  <style>${buildStyles()}</style>
</head>
<body>
  <div class="title-bar">RIVER ROCK CASINO — SLOT TECHNICAL SHIFT REPORT</div>
  ${buildInfoBar(data)}
  <div class="content">
    ${buildStaffSection(data)}
    ${buildMachinesSection(data)}
    ${buildNotesSection(data)}
  </div>
  <script>window.addEventListener('load', () => window.print())</script>
</body>
</html>`
}
