# Supabase Setup Guide for LevyMate

## Overview
Your LevyMate backend is now configured to use **Supabase PostgreSQL** as the database. This guide provides all the steps needed to complete the setup and deploy to Vercel.

---

## Supabase Project Details

| Setting | Value |
|---------|-------|
| **Project ID** | `mipyakisywdofczqaxlb` |
| **Project URL** | `https://mipyakisywdofczqaxlb.supabase.co` |
| **Database Host** | `mipyakisywdofczqaxlb.supabase.co` |
| **Database Port** | `5432` |
| **Database Name** | `postgres` |
| **Default Database User** | `postgres` |

---

## Step 1: Get Your Supabase Credentials

### From Supabase Dashboard:

1. **Go to** https://app.supabase.com/projects/mipyakisywdofczqaxlb/settings/api
2. **Copy These Keys:**
   - ✅ **SUPABASE_URL** (already in .env.example):
     ```
     https://mipyakisywdofczqaxlb.supabase.co
     ```
   - ✅ **SUPABASE_ANON_KEY** (already in .env.example):
     ```
     eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1pcHlha2lzeXdkb2ZjenFheGxiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMzOTIyMDgsImV4cCI6MjA3ODk2ODIwOH0.58008bNoWN5NWl_RyG2bpTxq0CFMrH-FBF20driila0
     ```
   - ⚠️ **SUPABASE_SERVICE_KEY** (for backend only, keep secret):
     - Go to Settings → API → Service Role Key
     - Copy this value (used for migrations and admin operations)

3. **Get Database Password:**
   - Go to https://app.supabase.com/projects/mipyakisywdofczqaxlb/settings/database
   - Click "Reset database password" and set a strong password
   - Save this password for `DB_PASSWORD`

---

## Step 2: Create Local `.env` File

Create `api/.env` with your actual credentials:

```bash
# Database Configuration (Supabase PostgreSQL)
DB_HOST=mipyakisywdofczqaxlb.supabase.co
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=your-actual-password-from-supabase
DB_NAME=postgres
DB_SSL=require

# Server Configuration
PORT=3001
NODE_ENV=development

# JWT Configuration (Generate a secure random string)
JWT_SECRET=your-actual-jwt-secret-key-min-32-chars

# Webhook Configuration (Generate a secure random string)
WEBHOOK_SECRET=your-actual-webhook-secret-key

# Supabase Configuration
SUPABASE_URL=https://mipyakisywdofczqaxlb.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1pcHlha2lzeXdkb2ZjenFheGxiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMzOTIyMDgsImV4cCI6MjA3ODk2ODIwOH0.58008bNoWN5NWl_RyG2bpTxq0CFMrH-FBF20driila0
SUPABASE_SERVICE_KEY=your-service-role-key-from-supabase

# External Services
OCR_SERVICE_URL=http://localhost:8000

# Paystack/Flutterwave (when implemented)
PAYMENT_PROVIDER_KEY=your-key-here
```

**⚠️ IMPORTANT:** Never commit `.env` to Git. It should be in `.gitignore`.

---

## Step 3: Create Database Tables

Run migrations to set up all tables:

```bash
cd api
npm run migration:run
```

This will create:
- `users` table
- `income` table
- `expenses` table
- `tax_rules` table
- Indexes and relationships

**Verify in Supabase Dashboard:**
- Go to https://app.supabase.com/projects/mipyakisywdofczqaxlb/editor
- You should see all 4 tables listed on the left

---

## Step 4: Seed Tax Rules

Populate the tax_rules table with 2025 Nigerian tax data:

```bash
npm run seed
```

**Verify in Supabase:**
- Navigate to `tax_rules` table in the editor
- You should see a row with `rule_version: "2025-v1"`

---

## Step 5: Test Local Connection

```bash
npm run dev
```

You should see:
```
Database initialized successfully
LevyMate API running on port 3001
```

Test the API:
```bash
curl http://localhost:3001/health
```

---

## Step 6: Add Keys to Vercel

Once everything works locally, deploy to Vercel with these environment variables:

### Go to Vercel Dashboard:

1. **Navigate to:** https://vercel.com/dashboard
2. **Select your project:** levymate (or the frontend project)
3. **Go to:** Settings → Environment Variables
4. **Add each variable:**

| Variable Name | Value | Environments |
|---|---|---|
| `DB_HOST` | `mipyakisywdofczqaxlb.supabase.co` | Production, Preview |
| `DB_PORT` | `5432` | Production, Preview |
| `DB_USERNAME` | `postgres` | Production, Preview |
| `DB_PASSWORD` | Your Supabase password | Production, Preview |
| `DB_NAME` | `postgres` | Production, Preview |
| `DB_SSL` | `require` | Production, Preview |
| `JWT_SECRET` | Your secure JWT secret (32+ chars) | Production, Preview |
| `WEBHOOK_SECRET` | Your secure webhook secret | Production, Preview |
| `SUPABASE_URL` | `https://mipyakisywdofczqaxlb.supabase.co` | Production, Preview |
| `SUPABASE_ANON_KEY` | Your anon key (from step 1) | Production, Preview |
| `SUPABASE_SERVICE_KEY` | Your service role key | Production, Preview |
| `NODE_ENV` | `production` | Production, Preview |
| `PORT` | `3001` | Production, Preview |

### After Adding Variables:

1. **Go to Deployments** tab
2. **Click "Redeploy"** on the latest deployment
3. **Wait for build to complete**
4. **Test your API:** 
   ```bash
   curl https://your-vercel-domain.vercel.app/health
   ```

---

## Step 7: Configure Vercel for Next.js Frontend

If you're deploying the Next.js frontend to Vercel as well:

1. **Frontend Environment Variables** (in Vercel):
   ```
   NEXT_PUBLIC_API_URL=https://your-api-domain.vercel.app
   NEXT_PUBLIC_SUPABASE_URL=https://mipyakisywdofczqaxlb.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```
   
   Note: These are `NEXT_PUBLIC_` because they're used in client-side code

---

## Step 8: Enable Row-Level Security (Optional but Recommended)

For enhanced security, enable RLS policies in Supabase:

1. Go to https://app.supabase.com/projects/mipyakisywdofczqaxlb/auth/policies
2. Enable RLS for each table
3. Add policies that match your application logic

---

## Troubleshooting

### Issue: "Connection refused to Supabase"
**Solution:** 
- Ensure `DB_SSL=require` is set
- Check your IP is not blocked by Supabase firewall
- Verify DB_PASSWORD is correct

### Issue: "Invalid JWT token"
**Solution:**
- Ensure JWT_SECRET is at least 32 characters
- Regenerate and update in all environments

### Issue: "Migration fails with permission error"
**Solution:**
- Use your SUPABASE_SERVICE_KEY for admin operations
- Ensure postgres user has correct permissions

### Issue: "Tables don't appear in dashboard"
**Solution:**
- Run `npm run migration:run` to create them
- Refresh the Supabase dashboard

---

## Security Checklist

Before going to production:

- [ ] Never commit `.env` to Git
- [ ] Use `DB_SSL=require` for all connections
- [ ] Generate strong random JWT_SECRET (32+ chars)
- [ ] Generate strong random WEBHOOK_SECRET
- [ ] Rotate database password after setup
- [ ] Enable 2FA on Supabase account
- [ ] Enable Row-Level Security policies
- [ ] Review Supabase security audit logs
- [ ] Set up monitoring/alerts for API errors

---

## Next Steps

1. ✅ Supabase Project Created
2. ⏳ **Complete Step 1-7 above**
3. ⏳ Deploy backend to Vercel
4. ⏳ Deploy frontend to Vercel
5. ⏳ Configure custom domain
6. ⏳ Set up monitoring & logging

---

## Support

For issues with:
- **Supabase:** https://supabase.com/docs
- **Vercel:** https://vercel.com/docs
- **TypeORM:** https://typeorm.io/
- **Express:** https://expressjs.com/

---

**Last Updated:** November 18, 2025
**Project:** LevyMate
**API Version:** 1.0.0
