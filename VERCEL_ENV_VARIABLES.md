# 🚀 Vercel Environment Variables - Ready to Add

## Generated on: November 18, 2025

Below are all the environment variables you need to add to Vercel for the LevyMate backend API.

---

## ✅ Complete List of Variables

### Copy each variable below and add to Vercel (Settings → Environment Variables)

```
DB_HOST=<YOUR_DB_HOST>
DB_PORT=<YOUR_DB_PORT>
DB_USER=<YOUR_DB_USER>
DB_PASSWORD=<YOUR_DB_PASSWORD>
DB_NAME=<YOUR_DB_NAME>
DB_SSL=true
DATABASE_URL=postgresql://<YOUR_DB_USER>:<URL_ENCODED_DB_PASSWORD>@<YOUR_DB_HOST>:<YOUR_DB_PORT>/<YOUR_DB_NAME>?sslmode=require
SUPABASE_URL=https://<YOUR_SUPABASE_PROJECT_ID>.supabase.co
SUPABASE_ANON_KEY=<YOUR_SUPABASE_ANON_KEY>
NEXT_PUBLIC_SUPABASE_URL=https://<YOUR_SUPABASE_PROJECT_ID>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<YOUR_SUPABASE_ANON_KEY>
JWT_SECRET=<GENERATED_JWT_SECRET>
JWT_EXPIRATION=7d
WEBHOOK_SECRET=<GENERATED_WEBHOOK_SECRET>
NODE_ENV=production
PORT=3001
API_BASE_URL=<YOUR_API_BASE_URL>
LOG_LEVEL=info
```

---

## 📋 Variables Breakdown

| Variable | Value | Type | Visibility |
|----------|-------|------|-----------|
| `DB_HOST` | `<YOUR_DB_HOST>` | Required | Backend only |
| `DB_PORT` | `<YOUR_DB_PORT>` | Required | Backend only |
| `DB_USER` | `<YOUR_DB_USER>` | Required | Backend only |
| `DB_PASSWORD` | `<YOUR_DB_PASSWORD>` | Required | Backend only |
| `DB_NAME` | `<YOUR_DB_NAME>` | Required | Backend only |
| `DB_SSL` | `true` | Required | Backend only |
| `DATABASE_URL` | `postgresql://<YOUR_DB_USER>:<URL_ENCODED_DB_PASSWORD>@<YOUR_DB_HOST>:<YOUR_DB_PORT>/<YOUR_DB_NAME>?sslmode=require` | Required | Backend only |
| `SUPABASE_URL` | `https://<YOUR_SUPABASE_PROJECT_ID>.supabase.co` | Required | Backend only |
| `SUPABASE_ANON_KEY` | `<YOUR_SUPABASE_ANON_KEY>` | Required | Backend only |
| `NEXT_PUBLIC_SUPABASE_URL` | `https://<YOUR_SUPABASE_PROJECT_ID>.supabase.co` | Required | Public (frontend) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `<YOUR_SUPABASE_ANON_KEY>` | Required | Public (frontend) |
| `JWT_SECRET` | `<GENERATED_JWT_SECRET>` | Required | Backend only |
| `JWT_EXPIRATION` | `7d` | Required | Backend only |
| `WEBHOOK_SECRET` | `<GENERATED_WEBHOOK_SECRET>` | Required | Backend only |
| `NODE_ENV` | `production` | Required | Backend only |
| `PORT` | `3001` | Required | Backend only |
| `API_BASE_URL` | `<YOUR_API_BASE_URL>` | Required | Backend only |
| `LOG_LEVEL` | `info` | Optional | Backend only |

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

1. **DB_PASSWORD must be copied exactly** – include any special characters from your Supabase password
2. **NEXT_PUBLIC_ variables are public** – they're meant to be exposed in frontend code
3. **Other variables are private** – they should NOT be exposed to the frontend
4. **JWT_SECRET and WEBHOOK_SECRET should be unique** – generate new random values for each environment
5. **Never commit `.env` to Git** – it's already in `.gitignore`

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

**Database**: PostgreSQL via Supabase (<YOUR_SUPABASE_PROJECT_ID>)

---

**Generated**: November 18, 2025  
**Status**: ✅ Ready for Vercel deployment  
**Last Updated**: Now
