import { Injectable, BadRequestException, HttpException, HttpStatus } from '@nestjs/common';
import OpenAI from 'openai';
import { Logger } from '@nestjs/common';

@Injectable()
export class AIAssistantService {
  private openai: OpenAI;
  private logger = new Logger('AIAssistantService');

  constructor() {
    const apiKey = process.env.OPENAI_API_KEY;
    
    if (!apiKey) {
      throw new Error('OPENAI_API_KEY environment variable not set');
    }

    this.openai = new OpenAI({
      apiKey: apiKey,
    });
  }

  /**
   * Get AI assistant response for educational tax guidance
   * ✅ TEXT-ONLY responses
   * ❌ NO image generation, file creation, or external API calls
   */
  async askAssistant(
    userMessage: string,
    userContext: {
      profile_type: string;
      industry?: string;
      last_entries?: any[];
    },
  ): Promise<{
    response: string;
    model: string;
    tokens_used: number;
    confidence?: number;
  }> {
    try {
      // ✅ SECURITY: Sanitize input
      const sanitizedMessage = this.sanitizeInput(userMessage);

      // ✅ SECURITY: Validate message length (prevent token exhaustion)
      if (sanitizedMessage.length > 2000) {
        throw new BadRequestException('Question too long. Max 2000 characters.');
      }

      // ✅ Build system prompt with guardrails
      const systemPrompt = this.buildSystemPrompt(userContext);

      // ✅ Call OpenAI (TEXT ONLY - NO IMAGES, NO FILES)
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4o-mini', // ✅ Use gpt-4o-mini (not 4.1-mini)
        messages: [
          {
            role: 'system',
            content: systemPrompt,
          },
          {
            role: 'user',
            content: sanitizedMessage,
          },
        ],
        temperature: 0.7,
        max_tokens: 500,
        // ✅ SECURITY: Disable features we don't need
        top_p: 0.9,
      });

      // Extract response
      const assistantMessage = response.choices[0].message.content;

      if (!assistantMessage) {
        throw new HttpException(
          'Failed to generate response',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }

      // ✅ SECURITY: Append disclaimer (CRITICAL)
      const messageWithDisclaimer = `${assistantMessage}\n\n**Educational Only**: LevyMate is not a tax professional. This is educational guidance only. Always consult the Nigerian tax authority (FIRS) or a qualified accountant for official guidance.`;

      // ✅ Log usage (without sensitive data)
      this.logger.debug({
        model: 'gpt-4o-mini',
        tokens_used: response.usage.total_tokens,
        completion_tokens: response.usage.completion_tokens,
        prompt_tokens: response.usage.prompt_tokens,
      });

      return {
        response: messageWithDisclaimer,
        model: 'gpt-4o-mini',
        tokens_used: response.usage.total_tokens,
      };
    } catch (error) {
      this.logger.error('AI Assistant Error:', error);

      // Handle specific OpenAI errors
      if (error.status === 429) {
        throw new HttpException(
          'Rate limit exceeded. Please try again later.',
          HttpStatus.TOO_MANY_REQUESTS,
        );
      }

      if (error.status === 401) {
        throw new HttpException(
          'Authentication failed with OpenAI',
          HttpStatus.UNAUTHORIZED,
        );
      }

      throw new HttpException(
        'Failed to process your question',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Parse OCR result with AI assistance
   * ✅ TEXT-ONLY interpretation
   */
  async interpretOCRResult(
    ocrResult: {
      amount?: number;
      confidence?: number;
      merchant?: string;
      date?: string;
    },
    userContext: { profile_type: string; industry?: string },
  ): Promise<{
    interpretation: string;
    suggested_category?: string;
    deductible: boolean;
    confidence_warning?: string;
  }> {
    try {
      const message = `
I extracted this from a receipt:
- Amount: ₦${ocrResult.amount}
- Merchant: ${ocrResult.merchant || 'Unknown'}
- Date: ${ocrResult.date || 'Unknown'}
- OCR Confidence: ${(ocrResult.confidence * 100).toFixed(0)}%

For a ${userContext.profile_type} in ${userContext.industry || 'general'} sector:
1. What category is this likely?
2. Is it typically deductible?
3. Any concerns with the OCR confidence level?
      `;

      const result = await this.askAssistant(message, userContext);

      return {
        interpretation: result.response,
        suggested_category: this.extractCategory(result.response),
        deductible: this.isDeductible(result.response),
        confidence_warning:
          ocrResult.confidence < 0.8
            ? `OCR confidence ${(ocrResult.confidence * 100).toFixed(0)}% is below 80%. Please verify manually.`
            : undefined,
      };
    } catch (error) {
      this.logger.error('OCR Interpretation Error:', error);
      throw error;
    }
  }

  /**
   * Parse WhatsApp transaction with AI guidance
   * ✅ TEXT-ONLY parsing, no external calls
   */
  async interpretWhatsAppTransaction(
    transaction: {
      amount?: number;
      keywords?: string[];
      date?: string;
      message_text?: string;
    },
    userContext: { profile_type: string },
  ): Promise<{
    guidance: string;
    suggested_type?: 'income' | 'expense' | 'ambiguous';
    confidence: number;
  }> {
    try {
      const message = `
I extracted this from a WhatsApp message:
- Amount: ₦${transaction.amount}
- Date: ${transaction.date}
- Keywords: ${transaction.keywords?.join(', ') || 'None'}
- Original text: "${transaction.message_text}"

Is this income or an expense? Please help clarify.
      `;

      const result = await this.askAssistant(message, userContext);

      return {
        guidance: result.response,
        suggested_type: this.detectTransactionType(result.response),
        confidence: this.extractConfidence(result.response),
      };
    } catch (error) {
      this.logger.error('WhatsApp Interpretation Error:', error);
      throw error;
    }
  }

  // ============ HELPER METHODS ============

  /**
   * ✅ SECURITY: Sanitize user input to prevent injection
   */
  private sanitizeInput(input: string): string {
    return input
      .trim()
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/['"]/g, '"')
      .substring(0, 2000); // Max 2000 chars
  }

  /**
   * Build system prompt with guardrails
   */
  private buildSystemPrompt(userContext: any): string {
    return `
You are LevyMate's tax education assistant for Nigerian taxpayers.

ROLE:
- Explain Nigerian tax rules (PIT, CGT, business tax, rent relief)
- Help users understand their tax estimates
- Clarify deductions and tax categories
- Interpret financial documents (OCR, WhatsApp)

USER CONTEXT:
- Profile: ${userContext.profile_type}
- Industry: ${userContext.industry || 'General'}

CRITICAL CONSTRAINTS:
1. ❌ NEVER provide legal or accounting advice
2. ❌ NEVER guarantee tax outcomes or savings
3. ❌ NEVER recommend tax evasion or fraud
4. ✅ ALWAYS mention: "This is educational only"
5. ✅ ALWAYS suggest consulting FIRS or tax professionals
6. ✅ Keep responses under 500 words
7. ✅ Use simple language suitable for non-accountants

SECURITY:
- TEXT-ONLY responses (no images, files, or code generation)
- No external API calls or data transfers
- No access to banking or payment systems
- Educational purpose only

RESPONSE FORMAT:
- Clear, concise explanation
- Practical examples when helpful
- Always end with: "This is educational only. Consult a tax professional for official guidance."
    `;
  }

  /**
   * Extract suggested category from AI response
   */
  private extractCategory(response: string): string | undefined {
    const categoryMatch = response.match(/category[:\s]+([^\n.,]+)/i);
    if (categoryMatch) {
      return categoryMatch[1].trim();
    }
    return undefined;
  }

  /**
   * Determine if expense is deductible
   */
  private isDeductible(response: string): boolean {
    const deductibleKeywords = [
      'deductible',
      'can deduct',
      'is deductible',
      'may be deducted',
    ];
    const nonDeductibleKeywords = [
      'not deductible',
      'cannot deduct',
      'non-deductible',
      'personal use',
    ];

    const hasDeductible = deductibleKeywords.some((keyword) =>
      response.toLowerCase().includes(keyword),
    );
    const hasNonDeductible = nonDeductibleKeywords.some((keyword) =>
      response.toLowerCase().includes(keyword),
    );

    if (hasNonDeductible) return false;
    if (hasDeductible) return true;

    return false; // Default: not deductible if unclear
  }

  /**
   * Detect transaction type from AI response
   */
  private detectTransactionType(
    response: string,
  ): 'income' | 'expense' | 'ambiguous' {
    const incomeKeywords = [
      'income',
      'received',
      'paid to me',
      'sold',
      'revenue',
    ];
    const expenseKeywords = [
      'expense',
      'paid',
      'purchased',
      'spent',
      'cost',
      'fee',
    ];

    const responseLC = response.toLowerCase();
    const hasIncome = incomeKeywords.some((kw) => responseLC.includes(kw));
    const hasExpense = expenseKeywords.some((kw) => responseLC.includes(kw));

    if (hasIncome && !hasExpense) return 'income';
    if (hasExpense && !hasIncome) return 'expense';
    return 'ambiguous';
  }

  /**
   * Extract confidence score from AI response
   */
  private extractConfidence(response: string): number {
    const percentMatch = response.match(/(\d+)%/);
    if (percentMatch) {
      return parseInt(percentMatch[1], 10) / 100;
    }

    // Check for confidence keywords
    if (response.toLowerCase().includes('definitely')) return 0.95;
    if (response.toLowerCase().includes('likely')) return 0.75;
    if (response.toLowerCase().includes('probably')) return 0.65;
    if (response.toLowerCase().includes('ambiguous') || response.toLowerCase().includes('unclear'))
      return 0.4;

    return 0.6; // Default moderate confidence
  }
}
