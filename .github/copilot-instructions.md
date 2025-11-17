# LevyMate AI Coding Agent Instructions

## Project Overview

**LevyMate** is a Nigerian-focused personal & small-business tax estimation SaaS platform. It helps salary earners, artisans, freelancers, and micro-business owners estimate tax liability, track income/expenses, and learn about Nigerian tax laws—**without handling real money or filing taxes**. 

Core value: educate, estimate, empower. Core constraint: never process payments, connect to banks, or claim legal certainty.

---

## Architecture & Key Components

### Monorepo Structure
```
/levymate
  /apps
    /mobile       → React Native (Expo)
    /web          → Next.js 15 (App Router)
  /services
    /api          → NestJS backend + auth + user profile
    /tax-engine   → stateless microservice (calculations only)
    /ocr          → Tesseract + Python (receipts & parsing)
    /ai-assistant → stateless LLM wrapper + disclaimers
  /infra
    /scripts      → deployment & migration scripts
  /docs
    /api-spec     → OpenAPI schemas
    /tax-rules    → seed JSON files
```

### Core Services & Responsibilities

1. **Backend API** (NestJS/FastAPI)
   - JWT auth + refresh tokens (no OAuth to banks)
   - User profile service (persona, industry)
   - Income/expense CRUD endpoints
   - Subscription webhook handling (Paystack/Flutterwave only)
   - **Pattern**: all endpoints document input/output with OpenAPI

2. **Tax Engine** (isolated, stateless)
   - Accepts profile type + income + deductions + rent_paid
   - Returns: taxable_income, tax_due, rent_relief, rule_version
   - Uses versioned `tax_rules.json` (PIT bands + rent relief rules)
   - **Must include**: `rule_version` in all outputs (for audit trail in PDFs)
   - Support: PIT, business tax, mixed income, CGT

3. **Frontend** (Next.js mobile-first, React Native mobile)
   - Offline-first queue for income/expense entries
   - Bottom navigation (mobile) / sidebar (desktop)
   - Lazy loading + Lighthouse 90+ target
   - **No login with banks or money transfer**

4. **OCR Microservice** (Python/Tesseract)
   - Receipt endpoint: `/ocr/parse` accepts image → returns {amount, date, merchant, confidence}
   - WhatsApp parser: `.txt` export → NLP extraction of amounts + transaction hints
   - Integration: called by frontend upload flows

5. **AI Assistant** (stateless wrapper)
   - Context: user profile + last 2-3 entries
   - Prompt template: always append "Educational only—LevyMate is not a tax professional."
   - Capabilities: explain tax concepts, clarify rules, interpret OCR results
   - **Hard boundary**: never provide legal or accounting services

---

## Critical Data Model: Tax Rules (Versioned & Immutable)

**All tax calculations must use versioned rules from `tax_rules` table.**

### Example Structure (2025-v1)
```json
{
  "rule_version": "2025-v1",
  "effective_date": "2025-07-01",
  "pit_bands": [
    {"band_from": 0, "band_to": 800000, "rate": 0.0},
    {"band_from": 800001, "band_to": 3000000, "rate": 0.15},
    {"band_from": 3000001, "band_to": 12000000, "rate": 0.18},
    {"band_from": 12000001, "band_to": 25000000, "rate": 0.21},
    {"band_from": 25000001, "band_to": 50000000, "rate": 0.23},
    {"band_from": 50000001, "band_to": null, "rate": 0.25}
  ],
  "rent_relief": {
    "percent": 0.20,
    "cap": 500000
  }
}
```

**Implementation rule**: PIT calculation iterates through bands from lowest. For each band, apply `rate * min(remaining_income, band_width)`. Rent relief = min(cap, annual_rent_paid * percent).

---

## Frontend Architecture Constraints

### Technology Stack (Enforced)
- **Web**: Next.js 15 (App Router), TailwindCSS, ShadCN/UI, Zustand, TypeScript
- **Mobile**: React Native (Expo), same Zustand store
- **Animation**: Framer Motion (subtle micro-interactions)
- **Icons**: Lucide Icons
- **Forms**: React Hook Form + Zod validation

### Mobile-First Breakpoints
```
< 768px   → single column, bottom nav (4 tabs), floating action button
768–1024 → two-column card layout
> 1024px  → desktop: left sidebar nav, centered layout
```

### Design Tokens (Enforce Consistency)
```
Colors: primary #0F6B66 (teal), accent #FFCC33 (warm yellow), 
        text #222B2F, background #FAFBF9, success #2EC46B
Typography: display=Poppins, body=Inter
Spacing: xs=4px, sm=8px, md=16px, lg=24px, xl=32px
Radius: sm=4px, md=8px, lg=16px
```

### Screen Navigation Flow
1. **Onboarding** → persona selector (Salary earner, Micro-business, Freelancer, Crypto trader, Mixed) + quick questions (rent? crypto? income frequency?)
2. **Home Dashboard** → summary cards (income, expenses, tax estimate) + quick actions + tips carousel
3. **Income** → list + OCR upload + "Quick add" voice
4. **Expenses** → list + deductible toggle + industry-defaulted categories
5. **Tax Calculator** → summary + expandable bands breakdown + "what changed" rule version link + export PDF
6. **Learning Hub** → category cards (Salary, Business, Crypto) + micro-lessons
7. **AI Assistant** (modal) → chat + disclaimers
8. **Settings** → profile, billing, data export/delete

### Performance & UX Requirements
- Lazy load all route pages
- Preload critical fonts
- Offline-first: queue entries locally until sync
- Lighthouse score 90+
- Assets < 200KB per page
- Large tap targets (48px min), ARIA labels, full contrast compliance

---

## API Patterns & Contracts

### Authentication
```
POST /auth/register → {email, password, full_name}
POST /auth/login → {email, password} → returns JWT + refresh_token
POST /auth/logout → invalidates session
POST /auth/refresh → {refresh_token} → new JWT
```

### Core Endpoints (Minimal Pattern)
```
GET/PATCH /user/profile
POST/GET /income → /income/add, /income/list, /income/summary, /income/ocr-upload, /income/whatsapp-upload
POST/GET /expense → /expense/add, /expense/list, /expense/summary, /expense/ocr-upload
POST /tax/pit → {total_income, deductible_expenses, annual_rent_paid, profile_type} → {taxable_income, tax_due, rent_relief, rule_version}
POST /tax/cgt → {asset_type, buy_price, sell_price, holding_period, user_income_context} → {net_gain, cgt_due, rate_applied}
GET /tax/rules → latest tax_rules (for UI reference)
GET /learn/modules, GET /learn/module/:id
POST /reports/generate → {report_type: 'yearly'|'monthly'|'cgt'} → returns PDF
POST /billing/initialize → Paystack/Flutterwave session
POST /billing/webhook → subscription status updates
```

### Response Format
All endpoints return:
```json
{
  "success": true,
  "data": {...},
  "rule_version": "2025-v1",  // Include in tax calculations
  "error": null
}
```

### No Money Handling
- **Hard block**: no endpoints that transfer money, generate bank OTPs, or connect to bank APIs
- Payment flow: **only** Paystack/Flutterwave subscription billing (verified via webhook)
- Income/expense entries are **tracking only**, no settlement code

---

## Tax Engine Logic (Copy-Ready Pseudocode)

### PIT Calculation
```python
def rent_deduction(annual_rent_paid, rules):
    percent = rules['rent_relief']['percent']
    cap = rules['rent_relief']['cap']
    return min(cap, annual_rent_paid * percent)

def compute_pit(total_income, deductible_expenses, annual_rent_paid, rules):
    rent_rel = rent_deduction(annual_rent_paid, rules)
    taxable_income = max(0, total_income - deductible_expenses - rent_rel)
    
    remaining = taxable_income
    tax = 0.0
    for band in rules['pit_bands']:
        band_from = band['band_from']
        band_to = band['band_to'] if band['band_to'] else float('inf')
        band_width = band_to - band_from
        
        if taxable_income <= band_from:
            break
        
        amount_in_band = min(remaining, band_width)
        tax += amount_in_band * band['rate']
        remaining -= amount_in_band
        
        if remaining <= 0:
            break
    
    return {
        'taxable_income': taxable_income,
        'tax_due': round(tax, 0),
        'rent_relief': rent_rel,
        'breakdown': [{'band': b, 'amount': ...} for b in rules['pit_bands']]
    }
```

### Capital Gains Tax (Option A: Add to Taxable Income)
```python
def compute_tax_with_cgt(total_income, deductible_expenses, annual_rent, net_cg_gain, rules):
    total_income_including_gains = total_income + net_cg_gain
    return compute_pit(total_income_including_gains, deductible_expenses, annual_rent, rules)
```

### Mixed Income (Salary + Business)
```python
def compute_mixed(salary, business_profit, deductible_expenses, annual_rent, rules):
    total_income = salary + business_profit
    return compute_pit(total_income, deductible_expenses, annual_rent, rules)
```

---

## OCR Integration (Tesseract + Preprocessing + Confidence)

### Setup & Engine
- **Tesseract v5** (or latest stable)
- **Languages**: eng + osd (add fra, yor, hau later if needed)
- **Confidence threshold**: 0.80 for auto-import; < 0.80 routes to manual confirmation UI

### Preprocessing Pipeline (Apply Before OCR)
```
1. Resize to 2× original if DPI < 300
2. Convert to grayscale
3. Adaptive thresholding (Otsu's method)
4. Denoise (median filter, kernel 3×3)
5. Deskew (Hough line detection with fallback)
6. Crop receipt bounding box (OpenCV contour detection, optional)
```

### Tesseract Command
```bash
tesseract input.png stdout --oem 1 --psm 6 -l eng+osd
```

### Postprocessing & Confidence Scoring
- Extract currency values using regex (see WhatsApp parser patterns)
- Normalize numbers: remove commas, convert to float
- **Confidence = mean(confidence_of_detected_number_tokens)**
- If OCR confidence unavailable, assign 0.5 (manual override required)
- **Auto-import decision**: confidence >= 0.80 → import; else → manual QA queue

### Edge Cases & Error Handling
- **Glare/heavy skew**: return "low-quality image" error; prompt user to retake
- **Unreadable amounts**: set confidence 0.0, flag for manual entry
- **Multiple receipts in one image**: warn user, process largest document only

### Metrics to Capture
```
ocr_success_rate = successful_extractions / total_uploads
avg_confidence = mean(all_confidences)
ocr_latency_ms = p50, p95, p99 (latency per image)
manual_qa_rate = manual_confirmations / total_uploads
```

---

## WhatsApp Parser (Rule-Based NLP)

### Currency & Amount Pattern
```regex
(?:NGN|₦|N\s?|naira\s?)?\s*([0-9]{1,3}(?:,[0-9]{3})*(?:\.[0-9]{1,2})?|[0-9]+(?:\.[0-9]{1,2})?)
```
Matches: "₦45,000", "NGN 45000", "45000.50", "naira 45k" (normalize k to 000)

### Date Pattern
```regex
\b(\d{1,2}\/\d{1,2}\/\d{2,4}|\d{4}-\d{1,2}-\d{1,2}|\b\w{3,9}\s\d{1,2}\b)
```
Matches: "17/11/2025", "2025-11-17", "Nov 17"

### Keyword Triggers (Case-Insensitive)
```
Income keywords: (?:paid|sent|received|deposit|transfer|credit|sold|payment for|pd|pt)
Expense keywords: (?:paid to|bought|paid|spent|withdrawal|charge|fee|purchase)
Confirmation: received, ok, done, paid, thanks
```

### Parsing Flow
1. Load .txt chat export
2. Normalize lines (strip sender prefixes, timestamps, "12:34 - ")
3. For each line:
   - Run amount regex → extract `amount` and currency token
   - Check for income/expense keywords → tag `candidate_type`
   - Extract date if present
4. Group by date; deduplicate amounts within 5-minute windows
5. Present results to user: **Accept as Income** / **Accept as Expense** / **Ignore**

### Confidence & ML Classifier (Optional)
- If single keyword match → confidence 0.95 (high)
- If ambiguous or multiple keywords → train fastText/logistic regression on labeled 5k-line seed dataset
- Apply ML classifier; if score >= 0.80 → auto-tag; else → user confirmation required
- **Metrics**: parse_success_rate, avg_confidence, ambiguous_rate

---

## Offline Sync (Conflict Resolution & Retry Logic)

### Local Queue Design
```javascript
// Local event structure
{
  client_id: "uuid",
  event_id: "uuid",
  created_at: "2025-11-17T10:30:00Z",
  action: "add_income" | "add_expense" | "update_income",
  payload: {...},
  base_version: 1,
  sync_required: true,
  synced: false
}
```

### Sync Attempt Flow
1. POST `/api/transactions/sync` with queued events
2. Server responds: `{ success: true, synced_events, new_version }` or `{ conflict: true, conflict_type, conflict_data }`

### Retry & Backoff Strategy
- **Initial delay**: 2 seconds
- **Backoff multiplier**: 2× per retry
- **Max delay**: 64 seconds
- **Max retries**: 5
- **Jitter**: ±20% (prevent thundering herd)
- **Example**: 2s → 4s → 8s → 16s → 32s → 64s

### Conflict Handling (Automatic Merge)
When server returns `conflict_type: "field_merge_possible"`:
1. Server supplies `server_payload` and `client_payload` with diffs
2. Attempt automatic merge:
   - Combine receipt arrays (union by receipt_id)
   - Keep larger amount if timestamps differ by > 1 day
   - Merge notes/descriptions
3. If merge succeeds → accept merged version; mark synced
4. If merge fails → mark event as `needs_user_resolution`

### User Conflict Modal
Display when automatic merge fails:
```
Your change:     ₦45,000 | Oct 15
Server version:  ₦50,000 | Oct 16

[ Keep mine ] [ Keep server ] [ Merge (checkboxes) ]
```
After decision, re-POST event with `resolution_choice`.

### UI Indicators
- Show offline badge when `navigator.onLine === false`
- Display queued action count (e.g., "3 pending entries")
- Show sync status after each attempt (success/retry/conflict)

### Metrics
```
queue_length = current items awaiting sync
avg_sync_time_ms = mean duration per sync attempt
conflict_rate = conflicts / total_sync_attempts
auto_merge_success_rate = successful_merges / conflict_events
```

---

## Payment Webhook Signature Verification

### HMAC SHA-256 Verification (Node.js)
```javascript
const crypto = require('crypto');

// Express middleware
function verifyWebhook(req, res, next) {
  const signatureHeader = req.headers['x-signature'] || 
                         req.headers['x-paystack-signature'];
  const rawBody = req.rawBody || JSON.stringify(req.body);
  const secret = process.env.WEBHOOK_SECRET;

  if (!signatureHeader) {
    return res.status(400).json({ error: 'Missing signature header' });
  }

  const computed = crypto
    .createHmac('sha256', secret)
    .update(rawBody)
    .digest('hex');

  if (!crypto.timingSafeEqual(
    Buffer.from(computed),
    Buffer.from(signatureHeader)
  )) {
    return res.status(401).json({ error: 'Invalid signature' });
  }

  next();
}
```

### Implementation Notes
- **Raw body capture**: Use `express.raw({ type: 'application/json' })` middleware or manually save raw request buffer
- **Timing-safe comparison**: Use `crypto.timingSafeEqual()` to prevent timing attacks
- **Logging**: Log failed verification attempts (metadata only, no PII)
- **Secret rotation**: Support multiple active secrets; rotate quarterly
- **Payload validation**: After verification, validate event type and data structure (e.g., `event === 'charge.success'`)

---

## AI Assistant Rate Limiting (Per-User Throttling)

### Token-Bucket Implementation
```
User capacity: 60 tokens
Refill rate: 1 token/second (60 per minute)
Burst allowed: 10 tokens (short spikes)
Daily cap: 1000 requests per user (reset 00:00 local timezone)
```

### Per-Endpoint Quotas
```
POST /assistant/chat           → general bucket (60/min)
POST /assistant/parse-whatsapp → 10/min (LLM-heavy)
POST /ocr/parse                → 20/min per user (resource-heavy)
```

### Response Headers & Backoff
- **Rate-limited response**: HTTP 429
- **Retry-After header**: `Retry-After: 30` (seconds)
- **Daily cap reached**: Return 429 with message "Daily assistant limit reached. Resets at 00:00."

### Graceful Degradation
- When limit reached on `/assistant/chat`, return cached FAQ educational answers
- Example: "How do I claim rent deduction?" → return templated response (no LLM call)

### Metrics
```
assistant_req_per_min (p50, p95)
assistant_blocked_rate = blocked_requests / total_requests
daily_cap_exceeded_count = users hitting daily limit per day
```

---

## Database Migrations (TypeORM)

### TypeORM Setup
**Entities** (in `src/entities/`):
- `User.ts`, `Income.ts`, `Expense.ts`, `TaxRule.ts`, `Report.ts`, `Subscription.ts`, `OcrJob.ts`, `SyncEvent.ts`

**Migrations** (in `src/migrations/`):
- Version naming: `V1__seed_tax_rules.ts`, `V2__add_sync_events_table.ts`

### TypeORM Connection Config
```typescript
import { DataSource } from 'typeorm';

export const AppDataSource = new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL,
  synchronize: false,           // Always false in production
  logging: false,               // Set true for debugging
  entities: [__dirname + '/../**/*.entity{.ts,.js}'],
  migrations: [__dirname + '/../migrations/*{.ts,.js}'],
  subscribers: [],
});

// Initialize in main.ts
AppDataSource.initialize()
  .then(() => console.log('DB connected'))
  .catch(err => console.error('DB error:', err));
```

### Migration Workflow
1. **Create entity change** → modify `*.entity.ts`
2. **Generate migration** → `yarn typeorm:generate -n DescriptiveNameHere`
3. **Review migration SQL** (in `src/migrations/`)
4. **Test rollback** → `yarn typeorm:migration:revert`
5. **Re-run migration** → `yarn typeorm:migrate`
6. **Commit** → migrations + entity changes together

### Seed Data (Tax Rules)
Create migration `V1__seed_tax_rules.ts`:
```typescript
import { MigrationInterface, QueryRunner } from 'typeorm';

export class SeedTaxRules1234567890 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      INSERT INTO tax_rules (rule_version, effective_date, rule_data, created_at)
      VALUES (
        '2025-v1',
        '2025-07-01',
        '${JSON.stringify(TAX_RULES_2025_V1)}',
        NOW()
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DELETE FROM tax_rules WHERE rule_version = '2025-v1'`);
  }
}
```

### CI Pipeline for Migrations
```yaml
# .github/workflows/db-migration-check.yml
- name: Check migrations
  run: yarn typeorm:migration:show
- name: Run migrations (staging)
  run: yarn typeorm:migrate
- name: Verify rollback
  run: yarn typeorm:migration:revert && yarn typeorm:migrate
```

---

## Monitoring & Logging

### Metrics to Collect

**Platform Health**
```
http_request_duration_ms (per endpoint, p50/p95/p99)
error_rate_5m (errors / total requests)
db_connection_errors (count, rate)
api_availability (uptime %)
```

**Feature Health**
```
ocr_success_rate = successful_extractions / total_uploads
ocr_avg_confidence (mean across all OCR jobs)
whatsapp_parse_success_rate = parsed_successfully / total_uploads
sync_queue_length (current items)
conflict_rate = conflicts / sync_attempts
tax_calc_runs_per_day (DAU metric)
pdf_export_count
subscription_conversion_rate = new_paid_users / new_signups
```

**User Engagement**
```
dau (daily active users)
wau (weekly active users)
mau (monthly active users)
avg_session_time
avg_entries_per_user_per_week
offline_usage_rate = offline_entries / total_entries
```

### Alert Thresholds (Escalation)

| Metric | Threshold | Severity |
|--------|-----------|----------|
| ocr_success_rate | < 0.70 | P1 (page) |
| sync_queue_length | > 1000 | P1 (page) |
| error_rate_5m | > 2% | P1 (page) |
| webhook_failures_5m | > 5 | P2 (alert) |
| db_connection_errors | > 10/5m | P1 (page) |
| api_availability | < 99.5% | P1 (page) |
| ocr_latency_p95 | > 5s | P2 (alert) |

### Logging Format & Correlation
**JSON structured logs** (using winston/pino):
```json
{
  "timestamp": "2025-11-17T10:30:00.123Z",
  "request_id": "req-uuid-xxx",
  "service": "api",
  "level": "info",
  "user_id": "user-uuid",
  "endpoint": "/api/income/add",
  "method": "POST",
  "status": 201,
  "duration_ms": 145,
  "msg": "Income entry created",
  "meta": {
    "amount": "***", 
    "category": "business"
  }
}
```

**Avoid**: PII (email, full names in logs), sensitive amounts in plain text

**Correlation**: Pass `x-request-id` header from frontend through all services; include in logs & error traces

### Data Retention
```
Hot storage (queryable):   30 days (Datadog/CloudWatch)
Warm storage (searchable): 90 days (S3 Glacier)
Cold storage (archive):    1 year (S3 Deep Archive for audit)
```

---

## Implementation Checklist (Final)

### Raw Body Capture
- [ ] Configure Express body parser to capture raw body for webhook verification
- [ ] Example: `app.use(express.raw({ type: 'application/json' }))`

### Audit Trail
- [ ] Every tax calculation stores: `rule_version`, input hash, timestamp, user_id
- [ ] Audit logs: immutable append-only table for reproducibility (PDF export validation)

### Feature Flags
- [ ] All heavy features behind flags: `whatsapp_import`, `ocr_auto_accept`, `ai_assistant`, `pdf_export`
- [ ] Admin endpoint: `GET /admin/flags` → toggle feature flags in real-time

### Privacy & Data Export
- [ ] Endpoint: `GET /user/export-data` → returns JSON of all user data (encrypted download)
- [ ] Endpoint: `DELETE /user/account` → initiates background job (soft-delete after 30-day grace period)
- [ ] Show on Settings screen: "Your data will be permanently deleted after 30 days"

### Testing Fixtures
- [ ] Seed 20 user personas: salary earner, tailor, mechanic, POS agent, freelancer, crypto trader, mixed, etc.
- [ ] Generate 200 sample transactions per user (mix of income, expense, OCR, manual)
- [ ] Test data reset: `npm run seed:test` (resets DB, loads fixtures)

### CI Pipeline Checks
- [ ] **Lint**: ESLint (frontend), Black (Python), Prettier (auto-format)
- [ ] **Unit tests**: 70%+ coverage required
- [ ] **Integration tests**: auth, CRUD, webhook verification
- [ ] **Schema checks**: TypeORM migration validation, SQL syntax
- [ ] **Security scan**: OWASP Dependency-Check, SonarQube (if available)
- [ ] **Build artifact size**: frontend bundle < 300KB gzipped

---

## Database Schema (PostgreSQL)

### Key Tables
```sql
-- Users
CREATE TABLE users (
    id UUID PRIMARY KEY,
    email VARCHAR UNIQUE,
    password_hash VARCHAR,
    full_name VARCHAR,
    profile_type VARCHAR,  -- 'salary_earner', 'micro_business', 'freelancer', 'crypto_trader', 'mixed'
    industry VARCHAR,      -- 'tailor', 'mechanic', 'pos_agent', etc.
    created_at TIMESTAMP
);

-- Income entries
CREATE TABLE income (
    id UUID PRIMARY KEY,
    user_id UUID REFERENCES users,
    amount DECIMAL,
    category VARCHAR,      -- 'business', 'personal', 'crypto', 'capital_gains', 'salary'
    source VARCHAR,
    payment_method VARCHAR, -- 'cash', 'transfer', 'pos', 'digital'
    timestamp DATE,
    notes TEXT,
    attachment_url VARCHAR
);

-- Expense entries
CREATE TABLE expenses (
    id UUID PRIMARY KEY,
    user_id UUID REFERENCES users,
    amount DECIMAL,
    category VARCHAR,      -- industry-specific: 'fabric', 'parts', 'fees', etc.
    is_deductible BOOLEAN,
    timestamp DATE,
    attachment_url VARCHAR
);

-- Versioned tax rules (immutable)
CREATE TABLE tax_rules (
    id UUID PRIMARY KEY,
    rule_version VARCHAR UNIQUE,  -- '2025-v1'
    effective_date DATE,
    rule_data JSONB,              -- pit_bands, rent_relief, cgt_rules
    created_at TIMESTAMP
);

-- Subscriptions
CREATE TABLE subscriptions (
    id UUID PRIMARY KEY,
    user_id UUID REFERENCES users,
    plan VARCHAR,          -- 'free', 'premium'
    status VARCHAR,        -- 'active', 'cancelled', 'expired'
    renewal_date DATE,
    provider_ref VARCHAR,  -- Paystack/Flutterwave reference
    created_at TIMESTAMP
);

-- Reports (snapshots)
CREATE TABLE reports (
    id UUID PRIMARY KEY,
    user_id UUID REFERENCES users,
    report_type VARCHAR,   -- 'yearly', 'monthly', 'cgt'
    pdf_url VARCHAR,
    snapshot_data JSONB,   -- {taxable_income, tax_due, rule_version, ...}
    created_at TIMESTAMP
);
```

---

## Developer Workflows & Testing

### Local Development
```bash
# Backend (NestJS)
npm install && npm run dev

# Frontend (Next.js)
cd apps/web && npm run dev  # localhost:3000

# React Native
cd apps/mobile && npm start  # Expo

# Tax engine tests
cd services/tax-engine && pytest test_pit_bands.py -v
```

### Database Migrations
Use Alembic (Python) or TypeORM (Node):
```bash
# New migration
alembic revision --autogenerate -m "add tax_rules table"
alembic upgrade head
```

### Seed Tax Rules
On startup, check if `tax_rules` table is empty; if so, seed with `2025-v1.json`.

### Testing Strategy
- **Unit tests**: tax engine (pit_bands edge cases, rent relief cap, cgt scenarios)
- **Integration tests**: auth flow, income/expense CRUD, subscription webhook
- **E2E tests**: onboarding → add income → add expense → view tax estimate → export PDF

### Code Review Checklist (Enforce These)
- ✅ No bank API keys or money-transfer code
- ✅ All tax calculations include `rule_version` in output
- ✅ PDFs include disclaimers: "Educational only, not legal/tax advice"
- ✅ AI responses prefixed with: "Educational assistance only."
- ✅ Offline queue tested (sync after network restore)
- ✅ OCR confidence score returned (warn if < 75%)

---

## Common Patterns & Project-Specific Conventions

### Disclaimer Pattern
Every tax result, PDF export, and AI response must include:
```
"This is an estimate for educational purposes only. LevyMate is not a tax professional 
and does not provide legal or accounting advice. Always consult a qualified tax advisor 
or the Nigerian tax authority (FIRS) for official guidance."
```

### Rule Versioning Pattern
Every calculation response must include:
```json
{
  "result": {...},
  "rule_version": "2025-v1",
  "calculated_at": "2025-11-17T10:30:00Z"
}
```

### Offline Queue Pattern (Mobile/Web)
1. User enters income/expense while offline → stored in local AsyncStorage (mobile) / IndexedDB (web)
2. Queue marked with `sync_required: true` and local `id`
3. On network restore, POST all queued entries → server returns server-side `id`s
4. Replace local IDs; mark `sync_required: false`

### OCR Confidence Pattern
```json
{
  "amount": 45000,
  "confidence": 0.92,
  "merchant": "Shoprite",
  "date": "2025-11-15",
  "warning": "confidence < 0.75 — please verify amount"
}
```
UI: show warning if confidence < 75%, offer manual override.

### Industry-Specific Templates
Frontend pre-populates expense categories by industry:
- **Tailor**: fabric, thread, sewing machine maintenance, packaging
- **Mechanic**: parts, tools, fuel, rent (workshop)
- **POS Agent**: agent fees, charges, airtime
- **Online Seller**: packaging, shipping, platform fees
- **Freelancer**: internet, software tools, workspace

---

## Integration Points & External Dependencies

### Authentication
- **Provider**: Clerk or Supabase Auth
- **Pattern**: JWT stored in httpOnly cookie (frontend), refresh tokens rotated
- **No social auth from banks**

### Payment Processing
- **Subscription only** via Paystack or Flutterwave
- **Webhook handler**: verify signature, update subscription status in DB
- **No refund logic**—reference customer to provider

### OCR & NLP
- **Tesseract** (open source) or hosted OCR API (optional upgrade)
- **WhatsApp parser**: regex + simple NLP (no external LLM calls for parsing)

### AI Assistant
- **Provider**: OpenAI API (gpt-4-turbo or later)
- **Rate limiting**: max 5 calls per user per hour (free tier), unlimited premium
- **Prompt injection protection**: sanitize user input, use prompt templates

### File Storage
- **S3-compatible** (AWS S3, Backblaze B2, Linode Object Storage)
- **Retention policy**: delete receipts after 12 months, allow user export/deletion
- **Encryption**: encrypt files at rest using AWS KMS or provider-native encryption

---

## Security & Compliance Essentials

### Hard Blocks (Code Review Must Catch)
- No bank API integrations
- No OAuth to financial institutions
- No storage of bank credentials, OTPs, or PINs
- No money transfer or settlement code
- No claims of "100% accuracy" or "legally compliant"

### Data Privacy
- Hash passwords (bcrypt, min 10 rounds)
- Row-level security: users see only their own data
- Sessions: 15-minute idle timeout
- Rate limiting: 100 requests per minute per IP
- Logs: exclude personal data, tax amounts; log only action/timestamp/user_id

### Deployment Requirements
- **HTTPS only** (TLS 1.3+)
- **CORS**: frontend domain whitelist
- **CSRF tokens** on all state-modifying endpoints
- **SQL injection prevention**: parameterized queries everywhere
- **Error handling**: never expose internal server errors to frontend

---

## Deployment & Monitoring

### Environments
- **Development**: local monorepo, SQLite for quick testing
- **Staging**: full PostgreSQL, Supabase Auth, mock payments
- **Production**: managed PostgreSQL (Neon/AWS RDS), Vercel (web), Firebase/EAS (mobile), Render (backend)

### CI/CD Pipeline
```yaml
1. Lint (ESLint, Black)
2. Unit & integration tests
3. Build frontend & backend
4. Deploy to staging
5. Smoke tests (login, add income, calculate tax, export PDF)
6. Deploy to production
```

### Monitoring & Alerting
- **Error tracking**: Sentry (capture exceptions, app crashes)
- **Performance**: Datadog APM (tax engine latency, API p95)
- **Uptime**: StatusPage or UptimeRobot
- **Metrics to track**: DAU, new profiles, tax estimate runs, OCR success rate, subscription churn

---

## Quick Reference: Files to Understand First

1. **Product Spec** → `PRODUCT SPECIFICATION DOCUMENT.md` (what features, why boundaries)
2. **Tax Rules** → `pseudocode.md` (calculation algorithms, band logic)
3. **Onboarding & Architecture** → `DEVELOPER ONBOARDING DOCUMENT.md` (monorepo layout, tech stack)
4. **Brand & UI** → `BRANDING PACKAGE.md` (design tokens, screen specs, microcopy)
5. **Intro** → `Introduction.md` (project context, Nigeria tax regime primer)

---

## Questions? Iterate Here

This document should guide you from first file read to first PR. If you encounter unclear sections, ask for clarification:
- Ambiguous PIT band logic?
- Missing API contract details?
- Unclear offline queue workflow?

I'll update this doc with your feedback.
