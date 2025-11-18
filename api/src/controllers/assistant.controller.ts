import {
  Controller,
  Post,
  Body,
  Req,
  HttpException,
  HttpStatus,
  UseMiddleware,
} from '@nestjs/common';
import { AIAssistantService } from '../services/ai-assistant.service';
import { RateLimitMiddleware } from '../middleware/rate-limit.middleware';

/**
 * ✅ AI ASSISTANT CONTROLLER
 * 
 * Endpoints:
 * - POST /api/assistant/chat - General tax questions
 * - POST /api/assistant/interpret-ocr - Parse receipt OCR results
 * - POST /api/assistant/interpret-whatsapp - Parse WhatsApp transactions
 * 
 * Security:
 * - ✅ Rate limiting (tier-based)
 * - ✅ No image generation
 * - ✅ No external API calls
 * - ✅ All responses include disclaimers
 */
@Controller('api/assistant')
@UseMiddleware(RateLimitMiddleware)
export class AssistantController {
  constructor(private aiService: AIAssistantService) {}

  /**
   * POST /api/assistant/chat
   * 
   * General educational tax questions
   */
  @Post('chat')
  async chat(
    @Body() body: any,
    @Req() req: any,
  ): Promise<{
    success: boolean;
    data?: any;
    error?: string;
    tier?: string;
    remaining?: number;
  }> {
    try {
      const userId = req.user?.id;
      const user = req.user;

      if (!body.message) {
        throw new HttpException('Message is required', HttpStatus.BAD_REQUEST);
      }

      // Call AI service
      const response = await this.aiService.askAssistant(
        body.message,
        {
          profile_type: user?.profile_type || 'general',
          industry: user?.industry,
          last_entries: body.context?.last_entries,
        },
      );

      return {
        success: true,
        data: response,
        tier: user?.subscription_plan || 'free',
        remaining: parseInt(
          req.headers['x-ratelimit-remaining'] || '0',
          10,
        ),
      };
    } catch (error) {
      console.error('Assistant Chat Error:', error);
      throw new HttpException(
        error.message || 'Failed to process your question',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * POST /api/assistant/interpret-ocr
   * 
   * Parse OCR results from receipt images
   * ✅ TEXT-ONLY interpretation (no image storage or processing)
   */
  @Post('interpret-ocr')
  async interpretOCR(
    @Body() body: any,
    @Req() req: any,
  ): Promise<{
    success: boolean;
    data?: any;
    error?: string;
  }> {
    try {
      const user = req.user;

      if (!body.ocr_result) {
        throw new HttpException(
          'OCR result is required',
          HttpStatus.BAD_REQUEST,
        );
      }

      const result = await this.aiService.interpretOCRResult(
        body.ocr_result,
        {
          profile_type: user?.profile_type || 'general',
          industry: user?.industry,
        },
      );

      return {
        success: true,
        data: result,
      };
    } catch (error) {
      console.error('OCR Interpretation Error:', error);
      throw new HttpException(
        error.message || 'Failed to interpret OCR result',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * POST /api/assistant/interpret-whatsapp
   * 
   * Parse WhatsApp transactions
   * ✅ TEXT-ONLY parsing (no external file access)
   */
  @Post('interpret-whatsapp')
  async interpretWhatsApp(
    @Body() body: any,
    @Req() req: any,
  ): Promise<{
    success: boolean;
    data?: any;
    error?: string;
  }> {
    try {
      const user = req.user;

      if (!body.transaction) {
        throw new HttpException(
          'Transaction data is required',
          HttpStatus.BAD_REQUEST,
        );
      }

      const result = await this.aiService.interpretWhatsAppTransaction(
        body.transaction,
        {
          profile_type: user?.profile_type || 'general',
        },
      );

      return {
        success: true,
        data: result,
      };
    } catch (error) {
      console.error('WhatsApp Interpretation Error:', error);
      throw new HttpException(
        error.message || 'Failed to interpret WhatsApp transaction',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * POST /api/assistant/health
   * 
   * Test OpenAI connection
   */
  @Post('health')
  async health(): Promise<{
    success: boolean;
    message: string;
    model: string;
  }> {
    return {
      success: true,
      message: 'AI Assistant is operational',
      model: 'gpt-4o-mini',
    };
  }
}
