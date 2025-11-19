# Backend Setup Guide

This guide will help you set up and run the complete LevyMate backend architecture.

## Prerequisites

- Node.js 18+ and npm
- PostgreSQL 14+
- Python 3.8+ (for OCR service, optional)
- Tesseract OCR v5+ (for OCR service, optional)

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Database Setup

Create a PostgreSQL database:

```bash
createdb levymate
```

Or using psql:

```sql
CREATE DATABASE levymate;
```

### 3. Environment Configuration

Copy the example environment file:

```bash
cp .env.example .env
```

Edit `.env` and configure your database:

```env
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=your_password
DB_NAME=levymate

JWT_SECRET=your-super-secret-jwt-key
JWT_REFRESH_SECRET=your-refresh-secret-key

BACKEND_PORT=4000
FRONTEND_URL=http://localhost:3000
NODE_ENV=development
```

### 4. Run Database Migrations

```bash
npm run migration:run
```

This will create all required tables (users, income, expenses, tax_rules) and seed initial tax rules.

### 5. Start Development Servers

Start both Next.js frontend and Express backend:

```bash
npm run dev
```

Or start them separately:

```bash
# Terminal 1 - Backend
npm run dev:server

# Terminal 2 - Frontend
npm run dev:next
```

- Backend API: http://localhost:4000
- Frontend: http://localhost:3000
- Health check: http://localhost:4000/health

## Architecture Overview

```
┌─────────────┐         ┌─────────────┐         ┌──────────────┐
│   Next.js   │ ──────► │   Express   │ ──────► │  PostgreSQL  │
│  Frontend   │         │   Backend   │         │   Database   │
│  (Port 3000)│         │  (Port 4000)│         └──────────────┘
└─────────────┘         └─────────────┘
                               │
                               ▼
                        ┌──────────────┐
                        │  Python OCR  │
                        │   Service    │
                        │ (Port 8000)  │
                        └──────────────┘
```

## API Endpoints

### Authentication
- `POST /auth/register` - Register new user
- `POST /auth/login` - Login user
- `POST /auth/refresh` - Refresh access token
- `POST /auth/forgot-password` - Request password reset
- `POST /auth/reset-password` - Reset password

### Transactions
- `GET /transactions` - List transactions (requires auth)
- `POST /transactions` - Create transaction (requires auth)
- `PUT /transactions/:id` - Update transaction (requires auth)
- `DELETE /transactions/:id` - Delete transaction (requires auth)

### Tax
- `GET /tax/rules` - Get tax rules (public)
- `POST /tax/rules` - Create tax rule (requires auth)
- `GET /tax/estimate` - Calculate tax estimate (requires auth)

### OCR
- `POST /ocr/receipt` - Process receipt image (requires auth)

### WhatsApp
- `POST /whatsapp/import` - Import WhatsApp chat (requires auth)

### Subscription
- `POST /subscription/start` - Start subscription (requires auth)
- `POST /subscription/webhook` - Handle payment webhook

### User
- `GET /user` - Get user profile (requires auth)
- `PUT /user` - Update user profile (requires auth)
- `DELETE /user` - Delete user account (requires auth)

## Authentication

The API uses JWT Bearer tokens for authentication.

### Register & Login

```bash
# Register
curl -X POST http://localhost:4000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "securepassword",
    "full_name": "John Doe"
  }'

# Response
{
  "user": { "id": "...", "email": "..." },
  "accessToken": "eyJhbG...",
  "refreshToken": "eyJhbG..."
}
```

### Using Access Tokens

Include the access token in the Authorization header:

```bash
curl -X GET http://localhost:4000/transactions \
  -H "Authorization: Bearer eyJhbG..."
```

### Refresh Tokens

When the access token expires (15 minutes), use the refresh token:

```bash
curl -X POST http://localhost:4000/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{ "refreshToken": "eyJhbG..." }'
```

## Database Schema

### Users Table
- id (uuid)
- email (varchar, unique)
- password_hash (varchar)
- full_name (varchar)
- business_name (varchar)
- business_type (varchar)
- subscription_plan (varchar) - "free" or "pro"
- subscription_expires_at (timestamp)
- onboarded (boolean)
- created_at (timestamp)
- updated_at (timestamp)

### Income Table
- id (uuid)
- user (relation to User)
- amount (numeric)
- category (varchar)
- description (varchar)
- date (date)
- tags (jsonb)
- ocr_meta (jsonb)
- source (varchar) - "manual", "ocr", or "whatsapp"
- created_at (timestamp)
- updated_at (timestamp)

### Expenses Table
- id (uuid)
- user (relation to User)
- amount (numeric)
- category (varchar)
- description (varchar)
- date (date)
- tags (jsonb)
- ocr_meta (jsonb)
- source (varchar) - "manual", "ocr", or "whatsapp"
- created_at (timestamp)
- updated_at (timestamp)

### Tax Rules Table
- id (uuid)
- rule_version (varchar, unique)
- effective_date (date)
- rule_json (jsonb)
- created_at (timestamp)
- updated_at (timestamp)

## Testing

Run all tests:

```bash
npm test
```

Run specific test suites:

```bash
npm test whatsapp
npm test tax-engine
npm test ocr
```

Watch mode for development:

```bash
npm run test:watch
```

## Database Migrations

### Create a new migration

```bash
npm run migration:generate -- migrations/AddNewColumn
```

### Run pending migrations

```bash
npm run migration:run
```

### Revert last migration

```bash
npm run migration:revert
```

## OCR Service Setup (Optional)

The OCR service is a separate Python microservice. See `services/ocr/README.md` for setup instructions.

Quick setup:

```bash
cd services/ocr
pip install -r requirements.txt
python ocr_service.py
```

The OCR service runs on port 8000 by default.

## Production Deployment

### Build the application

```bash
npm run build
```

This will:
1. Build the Next.js frontend
2. Compile the TypeScript backend

### Run in production

```bash
npm start
```

Or run backend separately:

```bash
npm run start:server
```

### Environment Variables for Production

```env
NODE_ENV=production
DB_HOST=your-db-host
DB_PORT=5432
DB_USERNAME=your-db-user
DB_PASSWORD=your-db-password
DB_NAME=levymate_prod

JWT_SECRET=your-production-secret
JWT_REFRESH_SECRET=your-refresh-secret
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

BACKEND_PORT=4000
FRONTEND_URL=https://your-domain.com

OCR_SERVICE_URL=https://your-ocr-service.com/ocr
WEBHOOK_SECRET=your-webhook-secret
```

## Troubleshooting

### Database Connection Failed

Check your PostgreSQL connection:

```bash
psql -h localhost -U postgres -d levymate
```

Ensure PostgreSQL is running:

```bash
sudo systemctl status postgresql
```

### Migration Errors

Reset database (WARNING: destroys all data):

```bash
dropdb levymate
createdb levymate
npm run migration:run
```

### Port Already in Use

Change ports in `.env`:

```env
BACKEND_PORT=4001
```

### OCR Service Unavailable

The OCR service is optional. If not running, OCR endpoints will return 503 errors. This is expected if you haven't set up the Python OCR service.

## Development Tips

### Hot Reload

The development server uses `ts-node-dev` for automatic restart on file changes.

### Database Logs

Enable query logging in development:

```env
NODE_ENV=development
```

TypeORM will log all SQL queries to the console.

### API Testing with Postman

Import the API collection (if available) or use curl commands from this guide.

### Debugging

Use VS Code debugger with this launch configuration:

```json
{
  "type": "node",
  "request": "launch",
  "name": "Debug Backend",
  "program": "${workspaceFolder}/backend/server.ts",
  "preLaunchTask": "npm: dev:server",
  "outFiles": ["${workspaceFolder}/dist/**/*.js"]
}
```

## Support

For issues or questions:
1. Check the logs: `npm run dev:server`
2. Review the API documentation in `backend/README.md`
3. Check service-specific docs in `services/README.md`
