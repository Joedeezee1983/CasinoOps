import Anthropic from '@anthropic-ai/sdk'
import { CLAUDE_MODEL, CLAUDE_MAX_TOKENS, MAX_BRIEFING_CONTEXT_CHARS } from '@/constants'
import type { BriefingData, ShiftWithTasks } from '@/types'
import { formatShiftForBriefing } from '@/utils/format-shift'

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY
if (!ANTHROPIC_API_KEY) {
  throw new Error('Missing required env var: ANTHROPIC_API_KEY')
}

const client = new Anthropic({ apiKey: ANTHROPIC_API_KEY })

/**
 * Generates an AI summary for a single completed shift.
 * Called immediately when a tech ends their shift — the result is saved to ShiftReport.
 * Truncates task context to MAX_BRIEFING_CONTEXT_CHARS to stay within model limits.
 */
export async function generateShiftSummary(shift: ShiftWithTasks): Promise<string> {
  const context = formatShiftForBriefing(shift).slice(0, MAX_BRIEFING_CONTEXT_CHARS)

  const message = await client.messages.create({
    model: CLAUDE_MODEL,
    max_tokens: CLAUDE_MAX_TOKENS,
    messages: [{ role: 'user', content: buildShiftSummaryPrompt(context) }],
  })

  const content = message.content[0]
  if (content.type !== 'text') {
    throw new Error('Unexpected response type from Claude API')
  }

  return content.text
}

/**
 * Generates an AI incoming briefing by summarizing active shifts and recent reports.
 * Used for on-demand generation — kept for supervisor/admin context views.
 * Truncates input to MAX_BRIEFING_CONTEXT_CHARS to stay within model limits.
 */
export async function generateShiftBriefing(data: BriefingData): Promise<string> {
  const context = buildBriefingContext(data).slice(0, MAX_BRIEFING_CONTEXT_CHARS)

  const message = await client.messages.create({
    model: CLAUDE_MODEL,
    max_tokens: CLAUDE_MAX_TOKENS,
    messages: [{ role: 'user', content: buildBriefingPrompt(context) }],
  })

  const content = message.content[0]
  if (content.type !== 'text') {
    throw new Error('Unexpected response type from Claude API')
  }

  return content.text
}

function buildShiftSummaryPrompt(context: string): string {
  return `You are an AI assistant for a casino slot tech team. Summarize the completed shift below for the incoming team.

The shift data is organized by section. Summarize each section that has tasks:
- Pre-Existing Down Games: machines that were already down before the shift — note which remain unresolved
- Games Worked On This Shift: floor machines worked during the shift and their current status
- Kiosks: any kiosk issues and outcomes
- Bench / Office Work: shop repairs, button panels, monitors, reels, etc.
- Miscellaneous: anything that doesn't fit above

Also include:
- Any unresolved or pending tasks the incoming team needs to handle
- Parts ordered (if any)
- A 2-3 sentence overall shift summary at the end

Be direct and professional. Use bullet points. Omit sections with no tasks. No fluff.

SHIFT DATA:
${context}`
}

function buildBriefingContext(data: BriefingData): string {
  const activeSection = data.activeShifts.map(formatShiftForBriefing).join('\n\n')
  const recentSection = data.recentReports
    .map((r) => `Report from ${r.shift.tech.name}:\n${r.aiSummary}`)
    .join('\n\n')

  return `ACTIVE SHIFTS:\n${activeSection}\n\nRECENT REPORTS:\n${recentSection}`
}

function buildBriefingPrompt(context: string): string {
  return `You are an AI assistant for a casino slot tech team. Generate a concise incoming shift briefing based on the data below.

Include:
- Machines currently down or awaiting parts
- Pending tasks from the outgoing shift
- Any patterns or recurring issues
- Priority items for the incoming tech team

Be direct and professional. Use bullet points. No fluff.

DATA:
${context}`
}
