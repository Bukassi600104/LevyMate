# LevyMate Backend

Node.js + Express + TypeScript + TypeORM backend for LevyMate.

## Architecture

- **Framework**: Express.js
- **Database**: PostgreSQL with TypeORM
- **Authentication**: JWT (Access + Refresh tokens)
- **File Upload**: Multer
- **Security**: Helmet, CORS, bcrypt

## Structure

```
backend/
├── entities/           # TypeORM entities
│   ├── User.ts
│   ├── Income.ts
│   ├── Expense.ts
│   └── TaxRule.ts
├── controllers/        # Request handlers
│   ├── authController.ts
│   ├── transactionsController.ts
│   ├── taxController.ts
│   ├── ocrController.ts
│   ├── whatsappController.ts
│   ├── subscriptionController.ts
│   └── userController.ts
├── routes/            # Route definitions
├── middleware/        # Auth & validation
├── services/          # Business logic
├── utils/             # Helper functions
├── data-source.ts     # TypeORM configuration
└── server.ts          # Express app entry point
```

## API Endpoints

### Authentication
- `POST /auth/register` - Register new user
- `POST /auth/login` - Login user
- `POST /auth/refresh` - Refresh access token
- `POST /auth/forgot-password` - Request password reset
- `POST /auth/reset-password` - Reset password

### Transactions
- `GET /transactions` - List transactions (with filters)
- `POST /transactions` - Create transaction
- `PUT /transactions/:id` - Update transaction
- `DELETE /transactions/:id` - Delete transaction

### Tax
- `GET /tax/rules` - Get tax rules
- `POST /tax/rules` - Create tax rule (admin)
- `GET /tax/estimate` - Calculate tax estimate

### OCR
- `POST /ocr/receipt` - Process receipt image

### WhatsApp
- `POST /whatsapp/import` - Import WhatsApp chat

### Subscription
- `POST /subscription/start` - Start subscription
- `POST /subscription/webhook` - Handle webhook

### User
- `GET /user` - Get user profile
- `PUT /user` - Update user profile
- `DELETE /user` - Delete user account

## Setup

1. Install dependencies:
```bash
npm install
```

2. Configure environment variables:
```bash
cp .env.example .env
# Edit .env with your database credentials
```

3. Create database:
```bash
createdb levymate
```

4. Run migrations:
```bash
npm run migration:run
```

5. Start development server:
```bash
npm run dev
# Backend runs on port 4000
# Frontend runs on port 3000
```

## Database Migrations

Generate new migration:
```bash
npm run migration:generate -- migrations/MigrationName
```

Run migrations:
```bash
npm run migration:run
```

Revert last migration:
```bash
npm run migration:revert
```

## Testing

Run tests:
```bash
npm test
```

Watch mode:
```bash
npm run test:watch
```

## Production Build

Build backend:
```bash
npm run build
```

Start production server:
```bash
npm run start:server
```

## Security

- JWT tokens with expiration
- Password hashing with bcrypt
- Helmet security headers
- CORS configuration
- Input validation
- SQL injection protection via TypeORM
- Webhook signature verification

## Error Handling

All endpoints return consistent error responses:

```json
{
  "error": "Error message"
}
```

HTTP status codes:
- 200: Success
- 201: Created
- 400: Bad request
- 401: Unauthorized
- 403: Forbidden
- 404: Not found
- 500: Server error
- 503: Service unavailable
