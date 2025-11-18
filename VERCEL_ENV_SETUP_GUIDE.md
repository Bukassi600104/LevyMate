# 🔐 VERCEL ENVIRONMENT VARIABLES - SAFE REFERENCE

## ⚠️ SECURITY NOTE

**This file contains NO SECRETS** - it's a reference template only.

Actual secret values are stored ONLY in:
- ✅ Supabase Dashboard (for passwords, API keys)
- ✅ Vercel Dashboard (for deployed environment variables)
- ✅ Your local `.env` file (git-ignored)

---

## 📋 18 Environment Variables Needed

### How to Get Each Value

| # | Variable Name | Source | Type |
|---|---------------|--------|------|
| 1 | `DB_HOST` | Constant: `db.mipyakisywdofczqaxlb.supabase.co` | Required |
| 2 | `DB_PORT` | Constant: `5432` | Required |
| 3 | `DB_USER` | Constant: `postgres` | Required |
| 4 | `DB_PASSWORD` | **Supabase → Settings → Database → Reveal** | Required |
| 5 | `DB_NAME` | Constant: `postgres` | Required |
| 6 | `DB_SSL` | Constant: `true` | Required |
| 7 | `DATABASE_URL` | **Build from:** `postgresql://postgres:[DB_PASSWORD]@db.mipyakisywdofczqaxlb.supabase.co:5432/postgres?sslmode=require` | Required |
| 8 | `SUPABASE_URL` | Constant: `https://mipyakisywdofczqaxlb.supabase.co` | Required |
| 9 | `SUPABASE_ANON_KEY` | **Supabase → Settings → API → Anon Key** | Required |
| 10 | `NEXT_PUBLIC_SUPABASE_URL` | Constant: `https://mipyakisywdofczqaxlb.supabase.co` | Required |
| 11 | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | **Supabase → Settings → API → Anon Key** (same as #9) | Required |
| 12 | `JWT_SECRET` | **Generate:** `node -e "console.log(require('crypto').randomBytes(48).toString('base64'))"` | Required |
| 13 | `JWT_EXPIRATION` | Constant: `7d` | Required |
| 14 | `WEBHOOK_SECRET` | **Generate:** `node -e "console.log(require('crypto').randomBytes(48).toString('base64'))"` | Required |
| 15 | `NODE_ENV` | Constant: `production` | Required |
| 16 | `PORT` | Constant: `3001` | Required |
| 17 | `API_BASE_URL` | Constant: `https://levymate-api.vercel.app` | Required |
| 18 | `LOG_LEVEL` | Constant: `info` | Required |

---

## 🔑 How to Get Secrets from Supabase

### Step 1: Get Database Password
1. Go to: https://app.supabase.com/projects/mipyakisywdofczqaxlb
2. Click **Settings** (gear icon ⚙️)
3. Click **Database**
4. Find **Password** field → Click **Reveal**
5. Copy the password exactly

### Step 2: Get Anon Key
1. Go to: https://app.supabase.com/projects/mipyakisywdofczqaxlb
2. Click **Settings** (gear icon ⚙️)
3. Click **API**
4. Find **Anon (public)** key
5. Click copy icon to copy it

### Step 3: Generate JWT & Webhook Secrets
Run in terminal:
```bash
# JWT Secret
node -e "console.log(require('crypto').randomBytes(48).toString('base64'))"

# Webhook Secret (run again for different value)
node -e "console.log(require('crypto').randomBytes(48).toString('base64'))"
```

---

## ✅ Checklist for Adding to Vercel

- [ ] Go to https://vercel.com/dashboard
- [ ] Select your "levymate" project
- [ ] Settings → Environment Variables
- [ ] For each variable from the table above:
  - [ ] Name: Copy variable name (e.g., `DB_HOST`)
  - [ ] Value: Paste the value
  - [ ] Environments: Select "Production" and "Preview"
  - [ ] Click Save
- [ ] After adding all 18: Redeploy project
- [ ] Test health endpoint: `curl https://levymate-api.vercel.app/health`

---

## 🚨 Security Best Practices

✅ **DO:**
- Keep `.env` file git-ignored
- Store passwords in Supabase dashboard only
- Regenerate secrets periodically
- Use strong random values
- Keep backend secrets private (don't prefix with `NEXT_PUBLIC_`)

❌ **DON'T:**
- Commit secrets to Git
- Share passwords in messages/emails
- Use simple/predictable secret values
- Expose WEBHOOK_SECRET or JWT_SECRET to frontend
- Store plaintext passwords in code

---

## 📞 If GitHub Alerts You

If GitHub sends a security alert about exposed secrets:

1. **Don't panic** - secrets are already rotated
2. **Verify** on Supabase: Change database password
3. **Update** on Vercel: Add new password value
4. **Regenerate**: New JWT_SECRET and WEBHOOK_SECRET
5. **Monitor** Supabase logs for unauthorized access

---

## 🔗 References

- Supabase Dashboard: https://app.supabase.com
- Vercel Dashboard: https://vercel.com/dashboard
- Supabase Docs: https://supabase.com/docs
- Vercel Docs: https://vercel.com/docs

---

**Status**: ✅ Secure Configuration  
**Last Updated**: November 18, 2025  
**Project**: LevyMate
