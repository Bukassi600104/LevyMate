/**
 * WhatsApp chat parser.
 * Input: string content of exported .txt. Output: candidate transactions.
 * Install: npm i chrono-node
 */

import * as chrono from 'chrono-node'

const AMOUNT_REGEX = /(?:NGN|₦|N\s?|naira\s?)?\s*([0-9]{1,3}(?:,[0-9]{3})*(?:\.[0-9]{1,2})?|[0-9]+(?:\.[0-9]{1,2})?)/i
const DATE_REGEX = /(\d{1,2}\/\d{1,2}\/\d{2,4}|\d{4}-\d{1,2}-\d{1,2}|\b\w{3,9}\s\d{1,2}\b)/i

const INCOME_TRIGGERS = ['paid', 'sent', 'received', 'deposit', 'transfer', 'credit', 'sold', 'payment for', 'pd', 'pt']
const EXPENSE_TRIGGERS = ['paid to', 'bought', 'paid', 'spent', 'withdrawal', 'charge', 'fee', 'purchase', 'paid for']

export type WhatsAppCandidate = {
  line: string
  date?: string | null
  amount?: number | null
  tag?: 'income' | 'expense' | 'unknown'
  confidence: number // 0..1
}

export function parseWhatsAppText(txt: string): WhatsAppCandidate[] {
  const lines = txt.split(/\r?\n/).map((l) => l.trim()).filter(Boolean)
  const results: WhatsAppCandidate[] = []

  for (const rawLine of lines) {
    // remove sender prefix like "Ada: " or "234803..."
    const line = rawLine.replace(/^[^\:]{1,50}\:\s*/, '').trim()
    // attempt to find amount
    const amountMatch = AMOUNT_REGEX.exec(line)
    const dateMatch = DATE_REGEX.exec(line)
    let parsedDate: string | null = null
    if (dateMatch) {
      const dt = chrono.parseDate(dateMatch[0])
      if (dt) parsedDate = dt.toISOString()
    }
    let amount: number | null = null
    if (amountMatch) {
      const raw = amountMatch[1].replace(/,/g, '')
      amount = parseFloat(raw)
    }

    // basic tagging via keywords
    const lower = line.toLowerCase()
    let tag: WhatsAppCandidate['tag'] = 'unknown'
    for (const t of INCOME_TRIGGERS) {
      if (lower.includes(t)) {
        tag = 'income'
        break
      }
    }
    if (tag === 'unknown') {
      for (const t of EXPENSE_TRIGGERS) {
        if (lower.includes(t)) {
          tag = 'expense'
          break
        }
      }
    }

    // confidence heuristic
    let confidence = 0.5
    if (amount) confidence += 0.3
    if (parsedDate) confidence += 0.1
    if (tag !== 'unknown') confidence += 0.1
    if (confidence > 1) confidence = 1

    if (amount || tag !== 'unknown') {
      results.push({
        line,
        date: parsedDate,
        amount,
        tag,
        confidence
      })
    }
  }

  // dedupe near identical amounts within short time windows
  const deduped: WhatsAppCandidate[] = []
  for (const r of results) {
    const exists = deduped.find((d) => d.amount === r.amount && d.line === r.line)
    if (!exists) deduped.push(r)
  }

  return deduped
}

/* Example usage:
import fs from 'fs'
const txt = fs.readFileSync('WhatsApp Chat with Ada.txt','utf8')
const parsed = parseWhatsAppText(txt)
console.log(parsed)
*/
