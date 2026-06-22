import { Resend } from 'resend'
import type { ShiftWithTasks } from '@/types'

const FROM_EMAIL = 'casinoops@jay-de.com'

/**
 * Sends the AI-generated shift summary to the configured supervisor email.
 * Skips silently if RESEND_API_KEY or SUPERVISOR_EMAIL are not set.
 * Never throws — email failure must not block shift completion.
 */
export async function sendShiftSummaryEmail(
  shift: ShiftWithTasks,
  aiSummary: string
): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY
  const supervisorEmail = process.env.SUPERVISOR_EMAIL

  if (!apiKey || !supervisorEmail) {
    console.warn('[email-service] Skipped: RESEND_API_KEY or SUPERVISOR_EMAIL not configured')
    return
  }

  if (shift.tasks.length === 0) {
    return
  }

  const shiftDate = new Date(shift.startTime).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
  const techNames = shift.techs.length > 0
    ? shift.techs.map((t) => t.user.name).join(', ')
    : shift.tech.name
  const subject = `CasinoOps Shift Report — ${techNames} — ${shiftDate}`
  const summaryHtml = markdownToHtml(aiSummary)
  const html = buildEmailHtml(techNames, shiftDate, summaryHtml, shift.tasks.length)

  try {
    const resend = new Resend(apiKey)
    await resend.emails.send({ from: FROM_EMAIL, to: supervisorEmail, subject, html })
    console.log(`[email-service] Shift summary sent for shift ${shift.id} to ${supervisorEmail}`)
  } catch (error) {
    console.error(
      '[email-service] Failed to send shift summary email:',
      error instanceof Error ? error.message : error
    )
  }
}

function buildEmailHtml(
  techName: string,
  date: string,
  summaryHtml: string,
  taskCount: number
): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background-color:#0a0a0f;font-family:system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color:#e5e7eb;">
  <div style="max-width:600px;margin:0 auto;padding:32px 16px;">
    <div style="margin-bottom:24px;">
      <span style="color:#f59e0b;font-size:22px;font-weight:700;letter-spacing:-0.5px;">CasinoOps</span>
      <p style="color:#6b7280;font-size:12px;margin:4px 0 0 0;">Shift Summary Report</p>
    </div>
    <div style="background-color:#13131a;border:1px solid #1e1e2e;border-radius:12px;overflow:hidden;">
      <div style="padding:20px 24px;border-bottom:1px solid #1e1e2e;">
        <p style="font-size:16px;font-weight:600;margin:0;color:#e5e7eb;">${escapeHtml(techName)}</p>
        <p style="font-size:12px;color:#6b7280;margin:4px 0 0 0;">${escapeHtml(date)} &middot; ${taskCount} task${taskCount !== 1 ? 's' : ''} logged</p>
        <p style="font-size:11px;color:#f59e0b;margin:10px 0 0 0;font-weight:600;letter-spacing:0.3px;">AI SUMMARY &middot; CLAUDE</p>
      </div>
      <div style="padding:20px 24px;color:#e5e7eb;font-size:14px;line-height:1.7;">
        ${summaryHtml}
      </div>
    </div>
    <p style="text-align:center;color:#374151;font-size:11px;margin-top:24px;">
      CasinoOps &middot; JD Tek LLC
    </p>
  </div>
</body>
</html>`
}

function markdownToHtml(markdown: string): string {
  const lines = markdown.split('\n')
  const output: string[] = []
  let inList = false

  for (const line of lines) {
    if (line.startsWith('### ')) {
      if (inList) { output.push('</ul>'); inList = false }
      output.push(`<h3 style="color:#f59e0b;font-size:13px;font-weight:700;margin:18px 0 6px 0;text-transform:uppercase;letter-spacing:0.5px;">${formatInline(line.slice(4))}</h3>`)
    } else if (line.startsWith('## ')) {
      if (inList) { output.push('</ul>'); inList = false }
      output.push(`<h2 style="color:#f59e0b;font-size:15px;font-weight:700;margin:20px 0 8px 0;">${formatInline(line.slice(3))}</h2>`)
    } else if (line.startsWith('# ')) {
      if (inList) { output.push('</ul>'); inList = false }
      output.push(`<h1 style="color:#f59e0b;font-size:18px;font-weight:700;margin:0 0 16px 0;">${formatInline(line.slice(2))}</h1>`)
    } else if (line.startsWith('- ') || line.startsWith('* ')) {
      if (!inList) { output.push('<ul style="margin:8px 0;padding-left:20px;">'); inList = true }
      output.push(`<li style="margin:5px 0;color:#e5e7eb;">${formatInline(line.slice(2))}</li>`)
    } else if (line.trim() === '') {
      if (inList) { output.push('</ul>'); inList = false }
    } else {
      if (inList) { output.push('</ul>'); inList = false }
      output.push(`<p style="margin:8px 0;color:#e5e7eb;">${formatInline(line)}</p>`)
    }
  }

  if (inList) output.push('</ul>')
  return output.join('\n')
}

function formatInline(text: string): string {
  return escapeHtml(text)
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/__(.+?)__/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}
