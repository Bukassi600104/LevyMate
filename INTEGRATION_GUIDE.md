# LevyMate Integration Guide

This guide covers the integration of new services: OCR, WhatsApp parsing, offline sync, tax rules migration, and webhook verification.

## Table of Contents

1. [Overview](#overview)
2. [Quick Start](#quick-start)
3. [Service Details](#service-details)
4. [Integration Examples](#integration-examples)
5. [Environment Setup](#environment-setup)
6. [Testing](#testing)
7. [Deployment](#deployment)

---

## Overview

The following services have been added to LevyMate:

| Service | Location | Language | Purpose |
|---------|----------|----------|---------|
| OCR Service | `services/ocr/` | Python | Extract amounts from receipt images |
| WhatsApp Parser | `services/whatsapp/` | TypeScript | Parse WhatsApp chat exports |
| Offline Sync | `services/offline/` | TypeScript | Queue transactions for offline-first support |
| Tax Rules Migration | `migrations/` | TypeScript | TypeORM migration for tax rules database |
| Webhook Middleware | `middleware/` | TypeScript | Verify webhook signatures |

---

## Quick Start

### 1. Install Dependencies

```bash
# Node.js dependencies
npm install

# Python dependencies (for OCR service)
cd services/ocr
pip install -r requirements.txt
```

### 2. System Requirements

**For OCR Service:**
- Tesseract v5+ must be installed on the system
- Ubuntu/Debian: `sudo apt-get install tesseract-ocr`
- macOS: `brew install tesseract`
- Windows: Download from [GitHub releases](https://github.com/UB-Mannheim/tesseract/wiki)

### 3. Environment Variables

Create a `.env.local` file:

```env
# API Configuration
NEXT_PUBLIC_API_BASE=http://localhost:3000
OCR_SERVICE_URL=http://localhost:8000/ocr

# Webhook Security
WEBHOOK_SECRET=your-secret-key-here

# Database (when implementing backend)
DATABASE_URL=postgresql://user:password@localhost:5432/levymate
```

---

## Service Details

### 1. OCR Service (Python)

**Purpose:** Extract monetary amounts from receipt images with confidence scoring.

**Key Features:**
- Image preprocessing (grayscale, denoise, deskew, adaptive thresholding)
- Nigerian Naira (NGN/₦) detection
- Confidence-based auto-import vs manual review
- Line-by-line amount extraction

**Usage:**

```python
from services.ocr.ocr_service import ocr_extract_amounts

with open("receipt.jpg", "rb") as f:
    result = ocr_extract_amounts(f.read())

# Returns:
{
  "all": [...],                 # All extracted amounts
  "auto_import": [...],         # High confidence (≥80%)
  "needs_user_confirm": [...],  # Low confidence (<80%)
  "meta": {
    "ocr_count": 5,
    "avg_confidence": 0.85
  }
}
```

**Deployment Options:**
1. **AWS Lambda** with Python 3.9+ runtime
2. **Google Cloud Run** with container
3. **Dedicated server** with FastAPI wrapper

---

### 2. WhatsApp Parser (TypeScript)

**Purpose:** Parse exported WhatsApp chat files to extract transaction candidates.

**Key Features:**
- Automatic date parsing with `chrono-node`
- Amount extraction with NGN support
- Income/expense classification via keywords
- Confidence scoring
- Duplicate detection

**Usage:**

```typescript
import { parseWhatsAppText } from '@services/whatsapp/parseWhatsApp'

const fileContent = await file.text()
const candidates = parseWhatsAppText(fileContent)

// Returns array of:
[
  {
    line: "I paid 5000 naira for data",
    date: "2025-01-15T10:30:00.000Z",
    amount: 5000,
    tag: "expense",
    confidence: 0.9
  },
  // ...
]
```

**Integration with File Upload:**

```typescript
// app/api/whatsapp/parse/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { parseWhatsAppText } from '@services/whatsapp/parseWhatsApp'

export async function POST(request: NextRequest) {
  const formData = await request.formData()
  const file = formData.get('file') as File
  
  if (!file) {
    return NextResponse.json({ error: 'No file provided' }, { status: 400 })
  }
  
  const text = await file.text()
  const candidates = parseWhatsAppText(text)
  
  return NextResponse.json({ 
    success: true, 
    candidates,
    count: candidates.length 
  })
}
```

---

### 3. Offline Sync Queue (TypeScript)

**Purpose:** Enable offline-first functionality with automatic sync and conflict resolution.

**Key Features:**
- LocalStorage-based queue (SSR-safe)
- Exponential backoff with jitter
- Automatic retry (max 5 attempts)
- Conflict detection
- 7-day auto-cleanup

**Usage:**

```typescript
import { enqueueEvent, syncQueueToServer } from '@services/offline/syncQueue'

// 1. Enqueue transaction when offline
function addTransaction(data: TransactionData) {
  const event = enqueueEvent('income_add', data)
  
  // Optimistically update UI
  updateLocalState(data)
  
  // Try to sync immediately
  if (navigator.onLine) {
    syncQueueToServer(process.env.NEXT_PUBLIC_API_BASE!)
  }
}

// 2. Set up automatic sync
useEffect(() => {
  // Sync every minute
  const interval = setInterval(() => {
    if (navigator.onLine) {
      syncQueueToServer(process.env.NEXT_PUBLIC_API_BASE!)
    }
  }, 60000)
  
  // Sync when coming online
  const handleOnline = () => {
    syncQueueToServer(process.env.NEXT_PUBLIC_API_BASE!)
  }
  
  window.addEventListener('online', handleOnline)
  
  return () => {
    clearInterval(interval)
    window.removeEventListener('online', handleOnline)
  }
}, [])
```

**Server-side Sync Endpoint:**

```typescript
// app/api/transactions/sync/route.ts
import { NextRequest, NextResponse } from 'next/server'
import type { SyncEvent } from '@services/offline/types'

export async function POST(request: NextRequest) {
  const event: SyncEvent = await request.json()
  
  try {
    // Validate event
    if (!event.eventId || !event.type || !event.payload) {
      return NextResponse.json(
        { status: 'error', message: 'Invalid event' },
        { status: 400 }
      )
    }
    
    // Check for conflicts (version-based)
    const existing = await db.transactions.findOne({
      where: { id: event.payload.id }
    })
    
    if (existing && existing.version !== event.baseVersion) {
      return NextResponse.json(
        {
          status: 'conflict',
          serverData: existing,
          clientData: event.payload
        },
        { status: 409 }
      )
    }
    
    // Apply event
    let result
    switch (event.type) {
      case 'income_add':
        result = await db.income.create(event.payload)
        break
      case 'expense_add':
        result = await db.expense.create(event.payload)
        break
      // ... other cases
    }
    
    return NextResponse.json({
      status: 'ok',
      serverVersion: result.version,
      id: result.id
    })
  } catch (error) {
    console.error('Sync error:', error)
    return NextResponse.json(
      { status: 'error', message: 'Sync failed' },
      { status: 500 }
    )
  }
}
```

---

### 4. Tax Rules Migration (TypeORM)

**Purpose:** Seed database with Nigerian 2025 tax rules.

**Usage:**

```bash
# When TypeORM is set up
npm run typeorm migration:run

# Or manually apply
psql -d levymate -f migrations/1680000000000-seed-tax-rules.sql
```

**Tax Rules Structure:**

```json
{
  "rule_version": "2025-v1",
  "effective_date": "2025-07-01",
  "pit_bands": [
    { "band_from": 0, "band_to": 800000, "rate": 0.0 },
    { "band_from": 800001, "band_to": 3000000, "rate": 0.15 },
    // ... more bands
  ],
  "rent_relief": { "percent": 0.2, "cap": 500000 },
  "cgt_rules": { "use_pit_rates": true, "exemption": 0 }
}
```

---

### 5. Webhook Verification Middleware

**Purpose:** Secure webhook endpoints from payment providers (Paystack, Flutterwave, etc.)

**Supported Headers:**
- `x-signature`
- `x-paystack-signature`
- `x-flw-signature`

**Usage (Express):**

```typescript
import { verifyWebhook } from '@middleware/verifyWebhook'

app.post('/api/webhooks/paystack', verifyWebhook, async (req, res) => {
  const event = req.body
  
  // Process verified webhook
  switch (event.event) {
    case 'charge.success':
      await handleSuccessfulPayment(event.data)
      break
    // ... other events
  }
  
  res.status(200).send('OK')
})
```

**Usage (Next.js API Route):**

Since Next.js API routes don't use Express middleware directly, you'll need to adapt it:

```typescript
// app/api/webhooks/paystack/route.ts
import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'

export async function POST(request: NextRequest) {
  const signature = request.headers.get('x-paystack-signature')
  const body = await request.text()
  
  if (!signature) {
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 })
  }
  
  const secret = process.env.WEBHOOK_SECRET!
  const hash = crypto.createHmac('sha256', secret).update(body).digest('hex')
  
  if (!crypto.timingSafeEqual(Buffer.from(hash), Buffer.from(signature))) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
  }
  
  // Process webhook
  const event = JSON.parse(body)
  // ... handle event
  
  return NextResponse.json({ status: 'ok' })
}
```

---

## Integration Examples

### Complete OCR Flow

```typescript
// Client-side component
'use client'

import { useState } from 'react'
import { enqueueEvent } from '@services/offline/syncQueue'

export function ReceiptUpload() {
  const [processing, setProcessing] = useState(false)
  
  async function handleUpload(file: File) {
    setProcessing(true)
    
    try {
      // 1. Upload to OCR service
      const formData = new FormData()
      formData.append('image', file)
      
      const ocrResult = await fetch('/api/ocr/process', {
        method: 'POST',
        body: formData
      }).then(r => r.json())
      
      // 2. Auto-import high-confidence amounts
      for (const item of ocrResult.auto_import) {
        enqueueEvent('expense_add', {
          amount: item.amount,
          category: 'business_expense',
          timestamp: new Date().toISOString(),
          ocrText: item.text,
          notes: `OCR confidence: ${item.confidence.toFixed(2)}`
        })
      }
      
      // 3. Show low-confidence items for manual review
      if (ocrResult.needs_user_confirm.length > 0) {
        showManualReviewDialog(ocrResult.needs_user_confirm)
      }
      
    } catch (error) {
      console.error('OCR failed:', error)
      showError('Failed to process receipt')
    } finally {
      setProcessing(false)
    }
  }
  
  return (
    <input 
      type="file" 
      accept="image/*"
      onChange={(e) => e.target.files?.[0] && handleUpload(e.target.files[0])}
      disabled={processing}
    />
  )
}
```

### Complete WhatsApp Import Flow

```typescript
// Client-side component
'use client'

import { parseWhatsAppText } from '@services/whatsapp/parseWhatsApp'

export function WhatsAppImport() {
  async function handleFileUpload(file: File) {
    const text = await file.text()
    const candidates = parseWhatsAppText(text)
    
    // Filter by confidence
    const highConfidence = candidates.filter(c => c.confidence >= 0.8)
    const needsReview = candidates.filter(c => c.confidence < 0.8)
    
    // Show review UI
    showReviewDialog({
      autoImport: highConfidence,
      needsReview: needsReview
    })
  }
  
  return (
    <div>
      <input 
        type="file" 
        accept=".txt"
        onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
      />
    </div>
  )
}
```

---

## Environment Setup

### Development

```bash
# 1. Clone and install
git clone <repo>
cd levymate
npm install

# 2. Set up environment
cp .env.example .env.local

# 3. Start development server
npm run dev

# 4. (Optional) Start OCR service
cd services/ocr
python -m uvicorn app:app --reload --port 8000
```

### Production

```bash
# Build
npm run build

# Start
npm start
```

---

## Testing

### Unit Tests

```bash
# Test WhatsApp parser
npm test -- services/whatsapp

# Test offline sync
npm test -- services/offline
```

### Manual Testing

**OCR Service:**
```bash
cd services/ocr
python ocr_service.py
```

**WhatsApp Parser:**
```typescript
import { parseWhatsAppText } from '@services/whatsapp/parseWhatsApp'
const result = parseWhatsAppText('Test message: paid 5000 naira')
console.log(result)
```

---

## Deployment

### OCR Service Deployment

**Option 1: AWS Lambda**

```bash
cd services/ocr
pip install -r requirements.txt -t .
zip -r function.zip .
aws lambda create-function --function-name levymate-ocr \
  --runtime python3.9 --handler ocr_service.lambda_handler \
  --zip-file fileb://function.zip
```

**Option 2: Docker + Cloud Run**

```dockerfile
# services/ocr/Dockerfile
FROM python:3.9-slim

RUN apt-get update && apt-get install -y tesseract-ocr

WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt

COPY ocr_service.py .
CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "8080"]
```

```bash
docker build -t levymate-ocr .
docker push gcr.io/project/levymate-ocr
gcloud run deploy levymate-ocr --image gcr.io/project/levymate-ocr
```

### Next.js Deployment

```bash
# Vercel (recommended)
vercel

# Or manual
npm run build
npm start
```

---

## Security Checklist

- [ ] Set strong `WEBHOOK_SECRET` in production
- [ ] Enable CORS only for trusted domains
- [ ] Validate all file uploads (type, size)
- [ ] Sanitize OCR text before storing
- [ ] Implement rate limiting on OCR/WhatsApp endpoints
- [ ] Use HTTPS for all API communications
- [ ] Encrypt sensitive data in offline sync queue
- [ ] Implement proper authentication for sync endpoints

---

## Support

For issues or questions:
1. Check the [service README](services/README.md)
2. Review the [Developer Onboarding Document](DEVELOPER%20ONBOARDING%20DOCUMENT.md)
3. Open an issue in the repository

---

## License

MIT License - see LICENSE file for details
