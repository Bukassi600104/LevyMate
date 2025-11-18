# 🔐 LevyMate OpenAI Integration Security Guide

**Last Updated**: November 18, 2025

---

## ⚠️ CRITICAL: API Key Security

### What Just Happened?
You exposed your OpenAI API key. **It has been compromised and must be rotated.**

### Exposed Key Details
- **Model**: gpt-4o-mini (formerly gpt-4.1-mini-2025-04-14)
- **Status**: 🔴 REVOKED (You must do this immediately)
- **Risk**: Anyone with this key can use your OpenAI credits

---

## 🚨 IMMEDIATE ACTION (DO THIS NOW)

### Step 1: Revoke the Exposed Key (2 minutes)

1. **Go to**: https://platform.openai.com/api/keys
2. **Find**: Any key starting with `sk-proj-Ga9YNoJWFe...`
3. **Click**: The trash/delete icon
4. **Confirm**: Yes, delete this key
5. **Screenshot**: Take a screenshot to confirm deletion

**Result**: The key is now invalid. Anyone trying to use it will get an error.

### Step 2: Generate a New Key (1 minute)

1. **Go to**: https://platform.openai.com/api/keys
2. **Click**: "Create new secret key"
3. **Name it**: `levymate-main` (for identification)
4. **Copy**: The new key (appears only once!)
5. **Paste**: Save it somewhere safe temporarily

**Example new key format**: `sk-proj-XXXXXXXXXXXXXXXXXXXX` (different alphanumeric)

### Step 3: Update Vercel (2 minutes)

1. **Go to**: https://vercel.com/dashboard
2. **Select**: LevyMate project
3. **Click**: Settings → Environment Variables
4. **Find**: `OPENAI_API_KEY`
5. **Delete**: The old value (exposed key)
6. **Add**: Paste the new key
7. **Save**: Click "Save"
8. **Wait**: Vercel auto-redeploys (takes 1-2 minutes)

### Step 4: Verify Deployment (1 minute)

After Vercel redeploys:
```bash
curl https://your-api-domain.vercel.app/api/assistant/health
```

Expected response:
```json
{
  "success": true,
  "message": "AI Assistant is operational",
  "model": "gpt-4o-mini"
}
```

---

## 🔒 Security Implementation in Code

### What We've Built

**3 Secure Components**:

1. **AI Assistant Service** (`ai-assistant.service.ts`)
   - ✅ gpt-4o-mini model (NO image generation)
   - ✅ Input sanitization (prevents injection)
   - ✅ Disclaimer on every response
   - ✅ Error handling (no sensitive data leaked)

2. **Rate Limit Middleware** (`rate-limit.middleware.ts`)
   - ✅ Free tier: 5 RPM, 60/day
   - ✅ Pro tier: 10 RPM, 500/day
   - ✅ Blocks abuse automatically
   - ✅ Returns HTTP 429 when exceeded

3. **Assistant Controller** (`assistant.controller.ts`)
   - ✅ 3 endpoints (chat, OCR, WhatsApp)
   - ✅ User authentication required
   - ✅ Rate limiting enforced
   - ✅ All responses include disclaimers

### Guardrails: What's BLOCKED

```typescript
❌ Image generation (DALL-E)
❌ File creation or downloads
❌ External API calls to banks
❌ Database direct access
❌ Payment processing
❌ Legal/tax advice guarantees
```

### Guardrails: What's ALLOWED

```typescript
✅ Educational text explanations
✅ Tax concept clarifications
✅ OCR result interpretation
✅ WhatsApp transaction parsing
✅ Deduction guidance (educational only)
```

---

## 📋 Environment Variables Setup

### Required Variables

```env
# OpenAI Configuration
OPENAI_API_KEY=sk-proj-[YOUR-NEW-KEY-HERE]
OPENAI_MODEL=gpt-4o-mini

# Rate Limiting (Free Tier)
ASSISTANT_RPM_FREE=5
ASSISTANT_DAILY_CAP_FREE=60

# Rate Limiting (Pro Tier)
ASSISTANT_RPM_PRO=10
ASSISTANT_DAILY_CAP_PRO=500

# Node Environment
NODE_ENV=production
```

### Where to Add These

**Locally** (for testing):
```bash
# File: api/.env
OPENAI_API_KEY=sk-proj-[YOUR-KEY]
OPENAI_MODEL=gpt-4o-mini
```

**Vercel** (for production):
```
Dashboard → LevyMate → Settings → Environment Variables
Add all variables from the list above
```

---

## 🧪 Testing the Integration

### Test 1: Health Check
```bash
curl -X POST https://your-api.vercel.app/api/assistant/health
```

**Expected**:
```json
{
  "success": true,
  "message": "AI Assistant is operational",
  "model": "gpt-4o-mini"
}
```

### Test 2: Chat Endpoint
```bash
curl -X POST https://your-api.vercel.app/api/assistant/chat \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "What is rent relief in Nigeria?"
  }'
```

**Expected**:
```json
{
  "success": true,
  "data": {
    "response": "Rent relief is a deduction...\n\n**Educational Only**: ...",
    "model": "gpt-4o-mini",
    "tokens_used": 245
  },
  "tier": "free",
  "remaining": 4
}
```

### Test 3: Rate Limiting
Make 6 rapid requests to `/api/assistant/chat` (free tier has 5 RPM):

**Expected on 6th request**:
```json
{
  "success": false,
  "error": "Rate limit exceeded (5 requests/min). Please wait.",
  "tier": "free",
  "remaining": 0,
  "retry_after_seconds": 60
}
```

---

## 📊 Cost Monitoring

### Set Budget Alerts in OpenAI

1. **Go to**: https://platform.openai.com/account/billing/limits
2. **Set**: Hard limit = $100/month (example)
3. **Enable**: Email alerts at 50%, 75%, 100%

### Calculate Expected Costs

**For 100 free users**:
```
100 users × 60 requests/day × 200 tokens/request = 1.2M tokens/day
= ~$0.18/day = ~$5.40/month ✅ Cheap!
```

**For 50 pro users**:
```
50 users × 500 requests/day × 200 tokens/request = 5M tokens/day
= ~$0.75/day = ~$22.50/month ✅ Very cheap!
```

**Total for mixed 100 free + 50 pro**:
= ~$28/month for AI costs ✅

---

## 🚨 Never Do This Again

### ❌ DO NOT:
1. Share API keys in messages, chat, or code
2. Commit `.env` files to Git
3. Post API keys in Slack, email, or documentation
4. Use the same key across projects
5. Leave keys in browser console logs

### ✅ DO:
1. Use `.gitignore` to block `.env` files
2. Use environment variable systems (Vercel, Docker secrets)
3. Rotate keys monthly (security best practice)
4. Use separate keys per environment (dev/staging/prod)
5. Monitor OpenAI usage dashboard regularly

---

## 🔄 Key Rotation Schedule

**Recommended Rotation**: Monthly

```
1st of month: Generate new key
2nd of month: Update in Vercel
3rd of month: Verify working
4th of month: Revoke old key
```

---

## 📞 Troubleshooting

### API Key Not Working
- ✅ Did you copy the ENTIRE key?
- ✅ Are there extra spaces?
- ✅ Did you restart Vercel after updating?
- ✅ Check: https://platform.openai.com/api/keys (key shows as active?)

### Rate Limit Errors
- ✅ Check user tier (free vs pro)
- ✅ Check time elapsed (free tier resets every 60 seconds)
- ✅ Check daily cap (free tier: 60/day)
- ✅ Response header: `X-RateLimit-Remaining: N`

### High Costs
- ✅ Check token usage per request
- ✅ Monitor OpenAI dashboard: https://platform.openai.com/account/usage
- ✅ Set hard limits: https://platform.openai.com/account/billing/limits
- ✅ Review rate limiting (might be too permissive)

---

## ✅ Checklist: API Key Security

- [ ] Old exposed key revoked
- [ ] New key generated
- [ ] New key added to Vercel
- [ ] Vercel redeployed
- [ ] Health check passes
- [ ] Chat endpoint tested
- [ ] Rate limiting tested
- [ ] Cost limits set in OpenAI
- [ ] Documentation updated
- [ ] Team notified

---

## 📚 References

- **OpenAI API Keys**: https://platform.openai.com/api/keys
- **OpenAI Pricing**: https://openai.com/pricing
- **Rate Limiting**: https://platform.openai.com/account/rate-limits
- **Usage Dashboard**: https://platform.openai.com/account/usage
- **Vercel Env Vars**: https://vercel.com/docs/concepts/projects/environment-variables

---

**Status**: 🟢 Ready for Production

Once you complete the 4 immediate steps above, the system is secure!
