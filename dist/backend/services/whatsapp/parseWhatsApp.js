"use strict";
/**
 * WhatsApp chat parser.
 * Input: string content of exported .txt. Output: candidate transactions.
 * Install: npm i chrono-node
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseWhatsAppText = parseWhatsAppText;
const chrono = __importStar(require("chrono-node"));
const AMOUNT_REGEX = /(?:NGN|₦|N\s?|naira\s?)?\s*([0-9]{1,3}(?:,[0-9]{3})*(?:\.[0-9]{1,2})?|[0-9]+(?:\.[0-9]{1,2})?)/i;
const DATE_REGEX = /(\d{1,2}\/\d{1,2}\/\d{2,4}|\d{4}-\d{1,2}-\d{1,2}|\b\w{3,9}\s\d{1,2}\b)/i;
const INCOME_TRIGGERS = ['paid', 'sent', 'received', 'deposit', 'transfer', 'credit', 'sold', 'payment for', 'pd', 'pt'];
const EXPENSE_TRIGGERS = ['paid to', 'bought', 'paid', 'spent', 'withdrawal', 'charge', 'fee', 'purchase', 'paid for'];
function parseWhatsAppText(txt) {
    const lines = txt.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
    const results = [];
    for (const rawLine of lines) {
        // remove sender prefix like "Ada: " or "234803..."
        const line = rawLine.replace(/^[^\:]{1,50}\:\s*/, '').trim();
        // attempt to find amount
        const amountMatch = AMOUNT_REGEX.exec(line);
        const dateMatch = DATE_REGEX.exec(line);
        let parsedDate = null;
        if (dateMatch) {
            const dt = chrono.parseDate(dateMatch[0]);
            if (dt)
                parsedDate = dt.toISOString();
        }
        let amount = null;
        if (amountMatch) {
            const raw = amountMatch[1].replace(/,/g, '');
            amount = parseFloat(raw);
        }
        // basic tagging via keywords
        const lower = line.toLowerCase();
        let tag = 'unknown';
        for (const t of INCOME_TRIGGERS) {
            if (lower.includes(t)) {
                tag = 'income';
                break;
            }
        }
        if (tag === 'unknown') {
            for (const t of EXPENSE_TRIGGERS) {
                if (lower.includes(t)) {
                    tag = 'expense';
                    break;
                }
            }
        }
        // confidence heuristic
        let confidence = 0.5;
        if (amount)
            confidence += 0.3;
        if (parsedDate)
            confidence += 0.1;
        if (tag !== 'unknown')
            confidence += 0.1;
        if (confidence > 1)
            confidence = 1;
        if (amount || tag !== 'unknown') {
            results.push({
                line,
                date: parsedDate,
                amount,
                tag,
                confidence
            });
        }
    }
    // dedupe near identical amounts within short time windows
    const deduped = [];
    for (const r of results) {
        const exists = deduped.find((d) => d.amount === r.amount && d.line === r.line);
        if (!exists)
            deduped.push(r);
    }
    return deduped;
}
/* Example usage:
import fs from 'fs'
const txt = fs.readFileSync('WhatsApp Chat with Ada.txt','utf8')
const parsed = parseWhatsAppText(txt)
console.log(parsed)
*/
