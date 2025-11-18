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
/**
 * Parse WhatsApp text and extract transactions
 */
export declare function parseWhatsAppText(text: string): ParsedTransaction[];
/**
 * Normalize amount string to number (handle variations like 45k, 45,000, etc)
 */
export declare function normalizeAmount(amountStr: string): number;
//# sourceMappingURL=whatsapp-parser.d.ts.map