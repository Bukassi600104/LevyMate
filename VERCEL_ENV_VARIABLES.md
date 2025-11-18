# 🚀 Vercel Environment Variables - Ready to Add

## Generated on: November 18, 2025

Below are all the environment variables you need to add to Vercel for the LevyMate backend API.

---

## ✅ Complete List of Variables

### Copy each variable below and add to Vercel (Settings → Environment Variables)

```
DB_HOST=db.mipyakisywdofczqaxlb.supabase.co
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=$Arianna600104#
DB_NAME=postgres
DB_SSL=true
DATABASE_URL=postgresql://postgres:$Arianna600104#@db.mipyakisywdofczqaxlb.supabase.co:5432/postgres?sslmode=require
SUPABASE_URL=https://mipyakisywdofczqaxlb.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1pcHlha2lzeXdkb2ZjenFheGxiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMzOTIyMDgsImV4cCI6MjA3ODk2ODIwOH0.58008bNoWN5NWl_RyG2bpTxq0CFMrH-FBF20driila0
NEXT_PUBLIC_SUPABASE_URL=https://mipyakisywdofczqaxlb.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1pcHlha2lzeXdkb2ZjenFheGxiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMzOTIyMDgsImV4cCI6MjA3ODk2ODIwOH0.58008bNoWN5NWl_RyG2bpTxq0CFMrH-FBF20driila0
JWT_SECRET=YyJ4jArSdu1ERU/gV7fi9ZtvIx/SQXxhRoSnXzQlT58PEmX1q2IhC/aS415zKOBB
JWT_EXPIRATION=7d
WEBHOOK_SECRET=vEwvShd1PLbd9quEnAzIw/J2cy4kYCgjSR/WyAXD8+5yJZbrIJROIYCiiPA0iwvn
NODE_ENV=production
PORT=3001
API_BASE_URL=https://levymate-api.vercel.app
LOG_LEVEL=info
```

---

## 📋 Variables Breakdown

| Variable | Value | Type | Visibility |
|----------|-------|------|-----------|
| `DB_HOST` | db.mipyakisywdofczqaxlb.supabase.co | Required | Backend only |
| `DB_PORT` | 5432 | Required | Backend only |
| `DB_USER` | postgres | Required | Backend only |
| `DB_PASSWORD` | $Arianna600104# | Required | Backend only |
| `DB_NAME` | postgres | Required | Backend only |
| `DB_SSL` | true | Required | Backend only |
| `DATABASE_URL` | postgresql://... | Required | Backend only |
| `SUPABASE_URL` | https://mipyakisywdofczqaxlb.supabase.co | Required | Backend only |
| `SUPABASE_ANON_KEY` | eyJhbGci... | Required | Backend only |
| `NEXT_PUBLIC_SUPABASE_URL` | https://mipyakisywdofczqaxlb.supabase.co | Required | Public (frontend) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | eyJhbGci... | Required | Public (frontend) |
| `JWT_SECRET` | YyJ4jArSdu1... | Required | Backend only |
| `JWT_EXPIRATION` | 7d | Required | Backend only |
| `WEBHOOK_SECRET` | vEwvShd1... | Required | Backend only |
| `NODE_ENV` | production | Required | Backend only |
| `PORT` | 3001 | Required | Backend only |
| `API_BASE_URL` | https://levymate-api.vercel.app | Required | Backend only |
| `LOG_LEVEL` | info | Optional | Backend only |

---

## 🔐 Security Status

✅ **Credentials Generated**
- Database Password: Provided by user
- JWT Secret: Generated (random, cryptographically secure)
- Webhook Secret: Generated (random, cryptographically secure)

✅ **Files Created**
- `.env` file created locally at `api/.env` (git-ignored)
- Ready for Vercel deployment

✅ **Next Steps**
1. Log in to Vercel Dashboard
2. Go to your project settings
3. Navigate to Environment Variables
4. Add all variables from the list above
5. Redeploy your project

---

## ⚠️ Important Notes

1. **DB_PASSWORD contains special characters** (`$#`) - copy exactly as shown
2. **NEXT_PUBLIC_ variables are public** - they're meant to be exposed in frontend code
3. **Other variables are private** - they should NOT be exposed to the frontend
4. **JWT_SECRET and WEBHOOK_SECRET are unique** - they were generated just now
5. **Never commit `.env` to Git** - it's already in `.gitignore`

---

## 🎯 When Adding to Vercel

### Important Settings:
1. **Environments**: Select "Production" and "Preview"
2. **Sensitive**: Mark sensitive ones (passwords, keys) as sensitive
3. **Copy-paste exactly**: Don't add extra spaces or quotes
4. **Verify**: After adding all, trigger a redeploy

### Verify After Deployment:
```bash
# Test the health endpoint
curl https://levymate-api.vercel.app/health

# Should return something like:
# { "status": "ok", "database": "connected", "timestamp": "2025-11-18..." }
```

---

## 📞 Quick Reference

**Local .env file location**: `c:\Users\USER\Desktop\LEVYMATE\api\.env`

**Vercel Dashboard**: https://vercel.com/dashboard

**Project URL**: https://levymate-api.vercel.app (after deployment)

**Database**: PostgreSQL via Supabase (mipyakisywdofczqaxlb)

---

**Generated**: November 18, 2025  
**Status**: ✅ Ready for Vercel deployment  
**Last Updated**: Now
