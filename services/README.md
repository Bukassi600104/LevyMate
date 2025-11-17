# LevyMate Services

This directory contains various backend and utility services for the LevyMate application.

## Directory Structure

```
services/
├── ocr/                    # OCR processing service (Python)
├── whatsapp/              # WhatsApp chat parser (TypeScript)
├── offline/               # Offline sync queue logic (TypeScript)
└── README.md              # This file
```

## Services Overview

### 1. OCR Service (Python)

**Location:** `services/ocr/ocr_service.py`

Receipt OCR processing using Tesseract with advanced preprocessing.

#### Requirements

```bash
pip install opencv-python-headless pytesseract numpy Pillow
```

System requirement: Tesseract v5+ must be installed and in PATH.

#### Usage

```python
from services.ocr.ocr_service import ocr_extract_amounts

with open("receipt.jpg", "rb") as f:
    result = ocr_extract_amounts(f.read())

# result contains:
# - all: all extracted amounts
# - auto_import: high-confidence amounts (≥80%)
# - needs_user_confirm: low-confidence amounts requiring manual review
# - meta: OCR statistics
```

#### Features

- Image preprocessing (grayscale, denoise, deskew)
- Adaptive thresholding
- Auto-scaling for small images
- Nigerian Naira (NGN/₦) amount detection
- Confidence scoring
- Auto-import vs manual review segregation

---

### 2. WhatsApp Chat Parser (TypeScript)

**Location:** `services/whatsapp/parseWhatsApp.ts`

Parses exported WhatsApp .txt files to extract potential transaction data.

#### Usage

```typescript
import { parseWhatsAppText } from '@services/whatsapp/parseWhatsApp'

const txt = fs.readFileSync('WhatsApp Chat.txt', 'utf8')
const candidates = parseWhatsAppText(txt)

// candidates contain:
// - line: original text
// - date: parsed ISO date (if found)
// - amount: extracted amount in NGN
// - tag: 'income' | 'expense' | 'unknown'
// - confidence: 0-1 score
```

#### Features

- Automatic date parsing using chrono-node
- Amount extraction with NGN currency support
- Keyword-based income/expense classification
- Confidence scoring
- Automatic deduplication
- Sender prefix removal

---

### 3. Offline Sync Queue (TypeScript)

**Location:** `services/offline/`

Client-side offline queue with automatic sync and conflict resolution.

#### Files

- `types.ts`: SyncEvent type definitions
- `syncQueue.ts`: Queue management and sync logic

#### Usage

```typescript
import { enqueueEvent, syncQueueToServer } from '@services/offline/syncQueue'

// Enqueue a transaction while offline
const event = enqueueEvent('income_add', {
  amount: 50000,
  category: 'personal_income',
  source: 'Freelance work'
})

// Later, when online:
const result = await syncQueueToServer('https://api.levymate.com', authToken)
console.log(`Synced: ${result.synced}, Conflicts: ${result.conflicts}`)
```

#### Features

- LocalStorage-based queue (SSR-safe)
- Exponential backoff with jitter
- Automatic retry (max 5 attempts)
- Conflict detection and resolution
- Auto-cleanup of old synced events (7 days)
- Client session tracking

#### Event Types

- `income_add`: New income transaction
- `expense_add`: New expense transaction
- `income_update`: Update existing income
- `expense_update`: Update existing expense

#### Event Status

- `queued`: Waiting to sync
- `syncing`: Currently syncing
- `synced`: Successfully synced
- `conflict`: Server conflict detected
- `failed`: Max retries exceeded

---

## Integration Notes

### OCR Service

The OCR service is written in Python and should be deployed as a separate microservice (e.g., AWS Lambda, Cloud Run, or dedicated server). Create a Next.js API route to proxy requests to the Python service:

```typescript
// app/api/ocr/route.ts
export async function POST(request: Request) {
  const formData = await request.formData()
  const image = formData.get('image') as Blob
  
  // Forward to Python OCR service
  const response = await fetch(process.env.OCR_SERVICE_URL, {
    method: 'POST',
    body: await image.arrayBuffer()
  })
  
  return Response.json(await response.json())
}
```

### WhatsApp Parser

Can be used directly in Next.js API routes or client-side:

```typescript
// app/api/whatsapp/parse/route.ts
import { parseWhatsAppText } from '@/services/whatsapp/parseWhatsApp'

export async function POST(request: Request) {
  const { text } = await request.json()
  const candidates = parseWhatsAppText(text)
  return Response.json({ candidates })
}
```

### Offline Sync

Integrate into your app lifecycle:

```typescript
// app/layout.tsx or a custom hook
useEffect(() => {
  const syncInterval = setInterval(async () => {
    if (navigator.onLine) {
      const token = getAuthToken()
      await syncQueueToServer(process.env.NEXT_PUBLIC_API_BASE, token)
    }
  }, 60000) // sync every minute

  window.addEventListener('online', () => {
    syncQueueToServer(process.env.NEXT_PUBLIC_API_BASE, getAuthToken())
  })

  return () => clearInterval(syncInterval)
}, [])
```

---

## Environment Variables

```env
# OCR Service
OCR_SERVICE_URL=https://ocr.levymate.com

# API Base URL
NEXT_PUBLIC_API_BASE=https://api.levymate.com

# Webhook Secret (for middleware)
WEBHOOK_SECRET=your-secret-key
```

---

## Testing

### OCR Service

```bash
cd services/ocr
python ocr_service.py
```

### WhatsApp Parser

```bash
npm test -- services/whatsapp
```

### Offline Sync

```bash
npm test -- services/offline
```

---

## Production Considerations

1. **OCR Service**: Deploy as separate microservice with proper scaling
2. **WhatsApp Parser**: Consider rate limiting for bulk imports
3. **Offline Sync**: Migrate from LocalStorage to IndexedDB for better reliability
4. **Security**: Implement proper authentication and validation
5. **Monitoring**: Add logging and error tracking for all services

---

## Future Enhancements

- [ ] Add OCR service containerization (Docker)
- [ ] Implement IndexedDB for offline queue
- [ ] Add unit tests for all services
- [ ] Create UI components for conflict resolution
- [ ] Add batch processing for WhatsApp imports
- [ ] Implement end-to-end encryption for sync queue
- [ ] Add service worker for background sync
