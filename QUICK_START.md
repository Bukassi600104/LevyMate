# LevyMate Quick Start Guide

Get up and running with LevyMate in 5 minutes!

## Prerequisites

- Node.js 18+
- PostgreSQL 14+
- npm

## Setup

### 1. Clone and Install

```bash
npm install
```

### 2. Database Setup

Create PostgreSQL database:

```bash
createdb levymate
```

Or using psql:

```sql
CREATE DATABASE levymate;
```

### 3. Environment Configuration

Create `.env` file:

```bash
cp .env.example .env
```

Edit `.env` with your database credentials:

```env
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=your_password
DB_NAME=levymate

JWT_SECRET=your-secret-key-here
BACKEND_PORT=4000
```

### 4. Run Migrations

```bash
npm run migration:run
```

This creates all tables and seeds initial Nigerian 2025 tax rules.

### 5. Start Development

```bash
npm run dev
```

This starts:
- Frontend (Next.js): http://localhost:3000
- Backend (Express): http://localhost:4000

## Verify Installation

Check backend health:

```bash
curl http://localhost:4000/health
```

Expected response:
```json
{
  "status": "ok",
  "timestamp": "2024-..."
}
```

## Quick Test

Register a user:

```bash
curl -X POST http://localhost:4000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "full_name": "Test User"
  }'
```

You should get back an access token!

## Architecture

```
┌─────────────────┐
│   Next.js UI    │  Port 3000
│   (Frontend)    │
└────────┬────────┘
         │ HTTP
         ▼
┌─────────────────┐
│  Express API    │  Port 4000
│   (Backend)     │
└────────┬────────┘
         │ TypeORM
         ▼
┌─────────────────┐
│   PostgreSQL    │  Port 5432
│   (Database)    │
└─────────────────┘
```

## Available Scripts

- `npm run dev` - Start both frontend and backend
- `npm run dev:next` - Start frontend only
- `npm run dev:server` - Start backend only
- `npm test` - Run tests
- `npm run build` - Build for production

## API Endpoints

All endpoints at `http://localhost:4000`:

### Authentication (Public)
- `POST /auth/register` - Create account
- `POST /auth/login` - Login
- `POST /auth/refresh` - Refresh token

### Transactions (Protected)
- `GET /transactions` - List transactions
- `POST /transactions` - Create transaction
- `PUT /transactions/:id` - Update transaction
- `DELETE /transactions/:id` - Delete transaction

### Tax (Public/Protected)
- `GET /tax/rules` - Get tax rules (public)
- `GET /tax/estimate` - Calculate tax (protected)

### Files (Protected)
- `POST /ocr/receipt` - Upload receipt image
- `POST /whatsapp/import` - Upload WhatsApp chat

## Sample Requests

### Register & Login

```bash
# Register
curl -X POST http://localhost:4000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"user@test.com","password":"pass123","full_name":"John Doe"}'

# Login
curl -X POST http://localhost:4000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@test.com","password":"pass123"}'
```

### Create Transaction

```bash
curl -X POST http://localhost:4000/transactions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "type": "income",
    "amount": 50000,
    "category": "salary",
    "date": "2024-01-15",
    "description": "Monthly salary"
  }'
```

### Get Tax Estimate

```bash
curl -X GET "http://localhost:4000/tax/estimate" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## Troubleshooting

### "Cannot connect to database"

Check PostgreSQL is running:
```bash
sudo systemctl status postgresql
```

Verify connection:
```bash
psql -h localhost -U postgres -d levymate
```

### "Port already in use"

Change ports in `.env`:
```env
BACKEND_PORT=4001
```

### "Migration failed"

Reset database:
```bash
dropdb levymate
createdb levymate
npm run migration:run
```

### "Tests failing"

Run tests:
```bash
npm test
```

All 29 tests should pass.

## Next Steps

1. ✅ Database is set up
2. ✅ Backend is running
3. ✅ Frontend is running
4. 📝 Test API endpoints
5. 📝 Create your first transaction
6. 📝 Calculate tax estimate
7. 📝 Explore the UI

## Documentation

- `backend/README.md` - Backend API reference
- `BACKEND_SETUP.md` - Detailed setup guide
- `INTEGRATION_GUIDE.md` - Service integration
- `services/README.md` - Service documentation

## Need Help?

Check the logs:
```bash
# Backend logs
npm run dev:server

# Frontend logs
npm run dev:next
```

Happy coding! 🚀
