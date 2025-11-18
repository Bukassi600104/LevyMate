/**
 * WhatsApp Parser Service
 * Extracts transaction amounts, dates, and categories from WhatsApp messages
 */

export interface ParsedTransaction {
  amount: number;
  date?: string;
  type: "income" | "expense" | "unknown";
  confidence: number;
  merchant?: string;
  raw: string;
}

// Currency patterns: ₦, NGN, N, naira - match full amount numbers
const AMOUNT_PATTERN = /(?:NGN|₦|N(?!\w)|naira)?\s*([0-9]{1,3}(?:,[0-9]{3})*(?:\.[0-9]{1,2})?|[0-9]+(?:\.[0-9]{1,2})?)/gi;

// Date patterns: DD/MM/YYYY, YYYY-MM-DD, Month DD
const DATE_PATTERN = /\b(\d{1,2}\/\d{1,2}\/\d{2,4}|\d{4}-\d{1,2}-\d{1,2}|\b[A-Za-z]{3,9}\s\d{1,2})\b/g;

// Keywords for transaction type classification
const INCOME_KEYWORDS = /(?:paid|sent|received|deposit|transfer|credit|sold|payment for|pd|pt|paid you|transferred|received from)/i;
const EXPENSE_KEYWORDS = /(?:paid to|bought|paid|spent|withdrawal|charge|fee|purchase|bought from|paid for|settled)/i;

/**
 * Parse WhatsApp text and extract transactions
 */
export function parseWhatsAppText(text: string): ParsedTransaction[] {
  if (!text || text.trim().length === 0) {
    return [];
  }

  const lines = text.split("\n");
  const transactions: ParsedTransaction[] = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    // Extract amounts with better pattern: look for currency symbols followed by numbers
    const amountMatches = Array.from(
      trimmed.matchAll(/[₦NGN\s]*([0-9]{1,3}(?:,[0-9]{3})*(?:\.[0-9]{1,2})?|[0-9]+(?:\.[0-9]{1,2})?)\b/g)
    );
    if (amountMatches.length === 0) continue;

    for (const match of amountMatches) {
      const amountStr = match[1].replace(/,/g, "");
      const amount = parseFloat(amountStr);

      if (isNaN(amount) || amount <= 0 || amount < 100) continue; // Filter out noise

      // Extract date
      const dateMatch = trimmed.match(DATE_PATTERN);
      const date = dateMatch ? dateMatch[0] : undefined;

      // Classify as income or expense
      let type: "income" | "expense" | "unknown" = "unknown";
      let confidence = 0.5;

      const hasIncomeKeyword = INCOME_KEYWORDS.test(trimmed);
      const hasExpenseKeyword = EXPENSE_KEYWORDS.test(trimmed);

      if (hasIncomeKeyword && !hasExpenseKeyword) {
        type = "income";
        confidence = 0.95;
      } else if (hasExpenseKeyword && !hasIncomeKeyword) {
        type = "expense";
        confidence = 0.95;
      } else if (hasIncomeKeyword && hasExpenseKeyword) {
        // Ambiguous - lower confidence
        type = "income"; // default to income
        confidence = 0.4;
      }

      transactions.push({
        amount,
        date,
        type,
        confidence,
        merchant: extractMerchantName(trimmed),
        raw: trimmed,
      });
    }
  }

  return transactions;
}

/**
 * Extract merchant name from transaction text
 */
function extractMerchantName(text: string): string | undefined {
  // Common patterns: "paid to X", "received from X", "at X", "from X"
  const patterns = [
    /(?:paid to|transferred to|sent to)\s+([A-Za-z\s]+?)(?:\s+(?:$|for|on|at|the))/i,
    /(?:received from|transfer from|from)\s+([A-Za-z\s]+?)(?:\s+(?:$|for|on|at|the))/i,
    /(?:at|from)\s+([A-Za-z0-9\s]+?)(?:\s+(?:$|for|on))/i,
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      return match[1].trim();
    }
  }

  return undefined;
}

/**
 * Normalize amount string to number (handle variations like 45k, 45,000, etc)
 */
export function normalizeAmount(amountStr: string): number {
  const normalized = amountStr.replace(/,/g, "").toLowerCase();

  // Handle 'k' suffix (45k = 45000)
  if (normalized.endsWith("k")) {
    const num = parseFloat(normalized.slice(0, -1));
    return isNaN(num) ? 0 : num * 1000;
  }

  return parseFloat(normalized) || 0;
}
