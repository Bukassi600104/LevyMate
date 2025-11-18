# 🎯 Audit Action Items - LevyMate

**Audit Date**: November 18, 2025  
**Generated**: Automatic Audit System  
**Overall Score**: 8.5/10

---

## 🔴 CRITICAL (Do Now - 45 minutes)

### 1. Update Next.js (15 min)
```bash
npm install next@latest --save
```
**Why**: 7 security vulnerabilities in current version  
**Impact**: High - Security fixes essential  
**Risk**: Low - Good test coverage recommended first

### 2. Run Audit Fix (10 min)
```bash
npm audit fix
```
**Why**: Fix transitive dependency vulnerabilities  
**Impact**: Medium - Reduce supply chain risk  
**Risk**: Low

### 3. Fix ESLint Warning #1 (10 min)
**File**: `src/components/transactions/add-transaction-form.tsx` (line 565)  
**Issue**: Using `<img>` instead of `next/image`  
**Fix**:
```tsx
// Before
<img src={preview} alt="Receipt preview" />

// After
<Image src={preview} alt="Receipt preview" width={300} height={300} />
```
**Why**: Performance optimization  
**Risk**: Low

### 4. Fix ESLint Warning #2 (10 min)
**File**: `src/components/transactions/receipt-upload.tsx` (line 204)  
**Issue**: Using `<img>` instead of `next/image`  
**Fix**:
```tsx
// Same pattern as above
<Image src={... /> instead of <img />
```

**Verification**:
```bash
npm run lint  # Should show 0 warnings
npm run build # Should complete successfully
```

---

## 🟠 HIGH PRIORITY (This Sprint - 8-10 hours)

### 1. Add Unit Tests (6-8 hours)

**Setup**:
```bash
npm install -D jest @testing-library/react @testing-library/jest-dom ts-jest @types/jest
```

**Create** `jest.config.js`:
```js
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  roots: ['<rootDir>/src'],
  testMatch: ['**/__tests__/**/*.ts?(x)', '**/?(*.)+(spec|test).ts?(x)'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
}
```

**Add to package.json**:
```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage"
  }
}
```

**Test Coverage Targets**:
- [ ] `src/lib/tax-engine.ts` (target: 90%+)
- [ ] `src/lib/storage.ts` (target: 85%+)
- [ ] `src/lib/api-client.ts` (target: 70%+)
- [ ] `src/lib/validation-schemas.ts` (target: 80%+)

**Time Breakdown**:
- Setup: 1 hour
- Tax engine tests: 2 hours
- Storage tests: 2 hours
- API client tests: 1 hour
- Validation tests: 1 hour

### 2. Add Input Validation (2-3 hours)

**Create** `src/lib/schemas.ts`:
```ts
import { z } from 'zod'

export const TaxCalculationSchema = z.object({
  annualIncome: z.number().positive('Income must be positive'),
  deductibleExpenses: z.number().nonnegative('Expenses cannot be negative'),
  annualRent: z.number().nonnegative('Rent cannot be negative'),
})

export const AddIncomeSchema = z.object({
  amount: z.number().positive(),
  category: z.enum(['personal_income', 'business_income', ...]),
  source: z.string().min(1),
  // ... more fields
})

export const AddExpenseSchema = z.object({
  amount: z.number().positive(),
  category: z.string().min(1),
  isDeductible: z.boolean(),
  // ... more fields
})
```

**Update API routes** to use schemas:
```ts
// src/app/api/tax/calculate/route.ts
const validated = TaxCalculationSchema.parse(body)
```

**Update forms** to show validation errors (already using react-hook-form + zod)

### 3. Add Rate Limiting (1-2 hours)

**Install**:
```bash
npm install express-rate-limit
```

**Create** `src/app/api/middleware/rateLimit.ts`:
```ts
import rateLimit from 'express-rate-limit'

export const taxCalcLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per window
  message: 'Too many requests, please try again later'
})
```

**Add to routes**:
```ts
// src/app/api/tax/calculate/route.ts
import { taxCalcLimiter } from '@/middleware/rateLimit'

export async function POST(request) {
  // Rate limiting happens before this
}
```

---

## 🟡 MEDIUM PRIORITY (Next Sprint - 5-7 hours)

### 1. Add API Documentation (3-4 hours)

**Option A: OpenAPI/Swagger** (Recommended)
```bash
npm install -D swagger-jsdoc swagger-ui-express
```

**Option B: Scalar** (Modern alternative)
```bash
npm install @scalar/express-api-reference
```

**Document endpoints**:
```
GET /api/tax/rules
POST /api/tax/calculate
GET /api/income/list
POST /api/income/add
GET /api/expense/list
POST /api/expense/add
```

### 2. Add React Error Boundaries (2 hours)

**Create** `src/components/error-boundary.tsx`:
```tsx
'use client'

import React from 'react'

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div>
          <h1>Something went wrong</h1>
          <p>{this.state.error?.message}</p>
        </div>
      )
    }

    return this.props.children
  }
}
```

**Use in layout**:
```tsx
<ErrorBoundary>
  <NavigationProvider>{children}</NavigationProvider>
</ErrorBoundary>
```

### 3. Set up CI/CD Pipeline (2-3 hours)

**Create** `.github/workflows/ci.yml`:
```yaml
name: CI

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        node-version: [18.x, 20.x]

    steps:
      - uses: actions/checkout@v3
      - name: Use Node.js ${{ matrix.node-version }}
        uses: actions/setup-node@v3
        with:
          node-version: ${{ matrix.node-version }}
          cache: 'npm'

      - run: npm ci
      - run: npm run lint
      - run: npm run test
      - run: npm run build
```

---

## 🟢 MEDIUM-LOW PRIORITY (Future)

### 1. Add Performance Monitoring
- Integrate Web Vitals
- Add Sentry for error tracking
- Add analytics

### 2. Add E2E Tests
- Set up Cypress or Playwright
- Test critical user flows
- Test offline functionality

### 3. Improve Accessibility
- Add skip-to-content link
- Test with screen readers
- Add focus visible outlines

---

## 📊 Tracking

### Checklist

**Critical (Today)**:
- [ ] Update Next.js
- [ ] Run audit fix
- [ ] Fix ESLint warning #1
- [ ] Fix ESLint warning #2
- [ ] Verify build passes
- [ ] Commit changes

**High Priority (Week 1)**:
- [ ] Set up Jest testing
- [ ] Write tax-engine tests
- [ ] Write storage tests
- [ ] Write API client tests
- [ ] Create validation schemas
- [ ] Add rate limiting

**Medium Priority (Week 2-3)**:
- [ ] Add API documentation
- [ ] Add Error Boundaries
- [ ] Set up CI/CD pipeline
- [ ] Configure pre-commit hooks

**Nice to Have**:
- [ ] Add E2E tests
- [ ] Add performance monitoring
- [ ] Improve monitoring/logging

---

## 📈 Success Metrics

After completing these items:

| Metric | Current | Target | Status |
|--------|---------|--------|--------|
| ESLint Errors | 2 | 0 | ✅ |
| Vulnerabilities | 2 | 0 | ✅ |
| Test Coverage | 0% | 70%+ | ⏳ |
| API Docs | None | Complete | ⏳ |
| CI/CD | None | Working | ⏳ |
| Production Ready | 7.5/10 | 9/10 | ⏳ |

---

## 🚀 Post-Implementation

After completing action items:

1. **Tag release**: Create git tag `v1.0.0-beta.1`
2. **Deploy**: Push to staging environment
3. **Test**: Run smoke tests
4. **Monitor**: Watch error tracking for 24 hours
5. **Release**: Deploy to production

---

## 📞 Questions?

See detailed audit report: `AUDIT_REPORT.md`  
See executive summary: `AUDIT_EXECUTIVE_SUMMARY.md`

---

**Last Updated**: November 18, 2025  
**Next Review**: After completing critical items

