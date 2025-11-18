# LevyMate Backend API

Complete Express.js + TypeORM backend for LevyMate tax estimation platform.

## Architecture

- **Framework**: Express.js with TypeScript
- **Database**: PostgreSQL + TypeORM
- **Authentication**: JWT
- **API Style**: RESTful
- **Middleware**: CORS, Helmet, Express Validator

## Directory Structure

```
api/
├── src/
│   ├── entities/          # TypeORM entities (User, Income, Expense, TaxRule)
│   ├── controllers/       # Request handlers (Auth, Transaction, Tax, OCR)
│   ├── middleware/        # Express middleware (auth, webhook verification)
│   ├── routes/            # API routes (organized by feature)
│   ├── services/          # Business logic
│   ├── database/
│   │   ├── data-source.ts # TypeORM connection config
│   │   └── seeds/         # Database seed data
│   ├── utils/             # Helper functions
│   └── index.ts           # Entry point
├── migrations/            # TypeORM migrations
├── tests/                 # Unit & integration tests
├── package.json
├── tsconfig.json
└── .env.example
```

## Quick Start

### 1. Install Dependencies

```bash
cd api
npm install
```

### 2. Setup Environment

```bash
cp .env.example .env
# Edit .env with your database credentials and secrets
```

### 3. Setup Database

```bash
# Create PostgreSQL database
createdb levymate_db

# Run migrations
npm run migration:run

# Seed tax rules
npm run seed
```

### 4. Start Development Server

```bash
npm run dev
```

Server will start on http://localhost:3001

## API Endpoints

### Authentication

- `POST /auth/register` - Register new user
- `POST /auth/login` - Login user
- `POST /auth/refresh` - Refresh JWT token
- `POST /auth/forgot-password` - Request password reset
- `POST /auth/reset-password` - Reset password with token

### Transactions (Income & Expenses)

- `GET /transactions` - Get all income entries (auth required)
- `POST /transactions` - Create income entry (auth required)
- `PUT /transactions/:id` - Update income entry (auth required)
- `DELETE /transactions/:id` - Delete income entry (auth required)
- `GET /transactions/expenses` - Get all expense entries (auth required)
- `POST /transactions/expenses` - Create expense entry (auth required)
- `PUT /transactions/expenses/:id` - Update expense entry (auth required)
- `DELETE /transactions/expenses/:id` - Delete expense entry (auth required)

### Tax Calculation

- `GET /tax/rules` - Get all tax rules
- `GET /tax/estimate` - Get tax estimate for user (auth required)
- `POST /tax/rules` - Create new tax rule (admin only)

### OCR & WhatsApp Import

- `POST /ocr/receipt` - Parse receipt image (auth required)
- `POST /whatsapp/import` - Import WhatsApp transactions (auth required)

### Subscription

- `POST /subscription/start` - Start subscription (auth required)
- `POST /subscription/webhook` - Paystack/Flutterwave webhook (verified)

### User Settings

- `GET /user` - Get user profile (auth required)
- `PUT /user` - Update user profile (auth required)
- `DELETE /user` - Delete user account (auth required)

### Health Check

- `GET /health` - API health status

## Authentication

All protected endpoints require a `Bearer` token in the `Authorization` header:

```bash
Authorization: Bearer <your-jwt-token>
```

## Database Schema

### Users Table

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY,
  email VARCHAR UNIQUE NOT NULL,
  password_hash VARCHAR NOT NULL,
  full_name VARCHAR,
  business_name VARCHAR,
  business_type VARCHAR,
  subscription_plan VARCHAR DEFAULT 'free',
  subscription_expires_at TIMESTAMPTZ,
  onboarded BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
);
```

### Income Table

```sql
CREATE TABLE income (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users ON DELETE CASCADE,
  amount NUMERIC,
  category VARCHAR,
  description VARCHAR,
  date DATE,
  tags JSONB,
  ocr_meta JSONB,
  source VARCHAR DEFAULT 'manual',
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
);
```

### Expenses Table

```sql
CREATE TABLE expenses (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users ON DELETE CASCADE,
  amount NUMERIC,
  category VARCHAR,
  description VARCHAR,
  date DATE,
  tags JSONB,
  ocr_meta JSONB,
  source VARCHAR DEFAULT 'manual',
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
);
```

### Tax Rules Table

```sql
CREATE TABLE tax_rules (
  id UUID PRIMARY KEY,
  rule_version VARCHAR UNIQUE,
  effective_date DATE,
  rule_json JSONB,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
);
```

## Scripts

```bash
# Development
npm run dev          # Start dev server with hot reload

# Production
npm run build        # Compile TypeScript
npm start            # Run compiled app

# Database
npm run migration:generate -n MigrationName  # Generate migration
npm run migration:run                        # Run migrations
npm run migration:revert                     # Revert last migration
npm run seed                                 # Seed initial data

# Testing
npm test             # Run all tests
npm run test:watch   # Run tests in watch mode

# Linting
npm run lint         # Lint code
npm run lint:fix     # Fix lint issues
```

## Environment Variables

```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_NAME=levymate_db

# Server
PORT=3001
NODE_ENV=development

# Authentication
JWT_SECRET=your-super-secret-key

# Webhooks
WEBHOOK_SECRET=your-webhook-secret

# External Services
OCR_SERVICE_URL=http://localhost:8000

# Payment Providers
PAYMENT_PROVIDER_KEY=your-key
```

## Testing

### Unit Tests

```bash
npm test
```

Tests cover:
- WhatsApp parser functionality
- OCR confidence scoring
- Tax engine calculations
- Auth middleware
- Error handling

### Integration Tests

Integration tests verify:
- Full auth flow (register → login → refresh)
- Transaction CRUD operations
- Tax estimate calculations
- Webhook signature verification

## Development Workflow

1. Create feature branch: `git checkout -b feature/your-feature`
2. Implement feature with tests
3. Ensure all tests pass: `npm test`
4. Commit changes: `git commit -m "Add feature"`
5. Push to GitHub and create Pull Request

## Deployment

### Docker

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY api/package*.json ./
RUN npm ci --only=production

COPY api/dist ./dist

EXPOSE 3001

CMD ["node", "dist/src/index.js"]
```

### Vercel (API Routes Alternative)

Deploy API as Vercel serverless functions or separate backend on Render/Railway.

## Monitoring & Logging

- Error tracking: Sentry (optional)
- Metrics: Prometheus + Grafana (optional)
- Logs: JSON structured logs to stdout

## Security Considerations

✅ JWT token expiration (7 days)
✅ HTTPS-only in production
✅ CORS configured per environment
✅ Helmet headers enabled
✅ SQL injection protection via TypeORM parameterized queries
✅ Password hashing with bcryptjs
✅ Webhook signature verification
✅ Rate limiting (implement per endpoint as needed)

## Troubleshooting

### Database Connection Error

```bash
# Check PostgreSQL is running
# Verify DATABASE_URL in .env
# Run migrations: npm run migration:run
```

### Token Invalid/Expired

```bash
# Refresh token using /auth/refresh endpoint
# Re-authenticate with /auth/login
```

### TypeORM Migration Issues

```bash
# Generate new migration: npm run migration:generate
# Check migration files in migrations/ directory
# Revert if needed: npm run migration:revert
```

## Contributing

1. Follow code style (ESLint configured)
2. Add tests for new features
3. Update documentation
4. Ensure CI/CD passes

## License

© 2025 LevyMate. All rights reserved.
