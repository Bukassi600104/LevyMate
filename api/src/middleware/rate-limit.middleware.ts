import { Injectable, NestMiddleware, HttpException, HttpStatus } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { UserService } from '../services/user.service';

/**
 * ✅ TIER-BASED RATE LIMITING FOR AI ASSISTANT
 * 
 * Free Tier: 5 RPM (requests per minute), 60/day
 * Pro Tier: 10 RPM, 500/day
 */
@Injectable()
export class RateLimitMiddleware implements NestMiddleware {
  private userBuckets = new Map<string, UserRateLimitBucket>();

  constructor(private userService: UserService) {}

  async use(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user?.id;

      if (!userId) {
        throw new HttpException('User not authenticated', HttpStatus.UNAUTHORIZED);
      }

      // Get user subscription tier
      const user = await this.userService.findById(userId);
      const subscription = user?.subscription_plan || 'free';

      // Check rate limit
      const limitStatus = this.checkLimit(userId, subscription);

      if (!limitStatus.allowed) {
        const retryAfter = limitStatus.reason === 'daily_cap' ? 86400 : 60;
        return res.status(429).json({
          success: false,
          error: limitStatus.message,
          tier: subscription,
          remaining: limitStatus.remaining,
          retry_after_seconds: retryAfter,
        });
      }

      // Add rate limit info to response headers
      res.setHeader('X-RateLimit-Tier', subscription);
      res.setHeader('X-RateLimit-Remaining', limitStatus.remaining.toString());
      res.setHeader('X-RateLimit-Reset', limitStatus.reset_at.toString());

      next();
    } catch (error) {
      throw new HttpException(
        'Rate limit check failed',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Check if user has rate limit capacity
   */
  private checkLimit(
    userId: string,
    subscription: 'free' | 'pro',
  ): RateLimitStatus {
    const now = Date.now();

    // Tier limits
    const rpmLimit = subscription === 'pro' ? 10 : 5;
    const dailyCap = subscription === 'pro' ? 500 : 60;

    let bucket = this.userBuckets.get(userId);

    if (!bucket) {
      bucket = {
        tokens: rpmLimit,
        requests_today: 0,
        last_refill: now,
        day_reset: this.getToday(),
      };
      this.userBuckets.set(userId, bucket);
    }

    // Reset daily counter if new day
    const today = this.getToday();
    if (bucket.day_reset !== today) {
      bucket.requests_today = 0;
      bucket.day_reset = today;
    }

    // Refill tokens (rate-per-second = RPM / 60)
    const elapsed = (now - bucket.last_refill) / 1000;
    bucket.tokens = Math.min(rpmLimit, bucket.tokens + (rpmLimit / 60) * elapsed);
    bucket.last_refill = now;

    // Check both RPM and daily cap
    const can_request_rpm = bucket.tokens >= 1;
    const can_request_daily = bucket.requests_today < dailyCap;

    if (!can_request_rpm) {
      return {
        allowed: false,
        reason: 'rpm_limit',
        message: `Rate limit exceeded (${rpmLimit} requests/min). Please wait.`,
        remaining: Math.floor(bucket.tokens),
        reset_at: now + 60000, // Reset in 1 minute
      };
    }

    if (!can_request_daily) {
      return {
        allowed: false,
        reason: 'daily_cap',
        message: `Daily limit reached (${dailyCap} requests/day). Resets at 00:00.`,
        remaining: 0,
        reset_at: this.getNextMidnight(),
      };
    }

    // ✅ ALLOWED
    bucket.tokens -= 1;
    bucket.requests_today += 1;

    return {
      allowed: true,
      remaining: Math.floor(bucket.tokens),
      reset_at: now + 60000,
    };
  }

  private getToday(): string {
    return new Date().toISOString().split('T')[0];
  }

  private getNextMidnight(): number {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    return tomorrow.getTime();
  }
}

interface UserRateLimitBucket {
  tokens: number; // For RPM limiting
  requests_today: number; // For daily cap
  last_refill: number;
  day_reset: string;
}

interface RateLimitStatus {
  allowed: boolean;
  reason?: 'rpm_limit' | 'daily_cap';
  message?: string;
  remaining: number;
  reset_at: number;
}
