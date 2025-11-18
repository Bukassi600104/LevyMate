# 📋 Vercel Environment Variables Checklist

## Instructions
1. Go to your Supabase Dashboard: https://app.supabase.com/projects/<YOUR_SUPABASE_PROJECT_ID>
2. Gather each variable below
3. Provide them to me in the format shown
4. I'll add them all to Vercel automatically

---

## 🔴 REQUIRED Variables (Must Have)

### 1. Database Password
**Where to get it:**
- Supabase Dashboard → Settings → Database
- Click "Reveal" next to "Password" field
- Copy the password exactly as shown

**Variable Name:** `DB_PASSWORD`
**Your Value:** `[PASTE HERE]`

---

### 2. Database URL (Alternative to individual DB vars)
**Where to get it:**
- Supabase Dashboard → Settings → Database
- Look for "Connection string" → PostgreSQL
- Use the one that starts with `postgresql://`

**Variable Name:** `DATABASE_URL`
**Format:** `postgresql://postgres:YOUR_PASSWORD@<YOUR_DB_HOST>:5432/postgres?sslmode=require`
**Your Value:** `[PASTE HERE]`

---

### 3. Supabase URL
**Where to get it:**
- Supabase Dashboard → Settings → API
- Copy "Project URL"

**Variable Name:** `NEXT_PUBLIC_SUPABASE_URL`
**Your Value:** `https://<YOUR_SUPABASE_PROJECT_ID>.supabase.co`
(Usually already correct - confirm it matches your project)

---

### 4. Supabase Anon Key (Public)
**Where to get it:**
- Supabase Dashboard → Settings → API
- Under "Project API keys" section
- Copy "Anon (public)" key

**Variable Name:** `NEXT_PUBLIC_SUPABASE_ANON_KEY`
**Your Value:** `[PASTE HERE]`

---

### 5. Supabase Service Role Key (Secret)
**Where to get it:**
- Supabase Dashboard → Settings → API
- Under "Project API keys" section
- Copy "Service Role (secret)" key
- ⚠️ KEEP THIS SECRET - only for backend

**Variable Name:** `SUPABASE_SERVICE_ROLE_KEY`
**Your Value:** `[PASTE HERE]`

---

## 🟡 GENERATED Variables (Create These)

### 6. JWT Secret (Random 64-character string)
**How to generate:**
Run this in your terminal:
```bash
node -e "console.log(require('crypto').randomBytes(48).toString('base64'))"
```
Or use:
```bash
openssl rand -base64 48
```

**Variable Name:** `JWT_SECRET`
**Your Value:** `[GENERATE & PASTE HERE]`

---

### 7. Webhook Secret (Random 64-character string)
**How to generate:**
Run this in your terminal (different from JWT_SECRET):
```bash
node -e "console.log(require('crypto').randomBytes(48).toString('base64'))"
```

**Variable Name:** `WEBHOOK_SECRET`
**Your Value:** `[GENERATE & PASTE HERE]`

---

## 🟢 OPTIONAL Variables (Nice to Have)

### 8. Paystack Secret Key (If using Paystack payments)
**Where to get it:**
- Paystack Dashboard → Settings → API Keys & Webhooks
- Copy "Secret Key"

**Variable Name:** `PAYSTACK_SECRET_KEY`
**Your Value:** `[PASTE HERE OR SKIP IF NOT USING]`

---

### 9. OpenAI API Key (If using AI Assistant)
**Where to get it:**
- OpenAI API Dashboard → API Keys
- Create new key and copy it

**Variable Name:** `OPENAI_API_KEY`
**Your Value:** `[PASTE HERE OR SKIP IF NOT USING]`

---

## 📋 Summary Format

Once you have all the values, provide them like this:

```
DB_PASSWORD=your_actual_password_here
DATABASE_URL=postgresql://postgres:your_password@<YOUR_DB_HOST>:5432/postgres?sslmode=require
NEXT_PUBLIC_SUPABASE_URL=https://<YOUR_SUPABASE_PROJECT_ID>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<YOUR_SUPABASE_ANON_KEY>
SUPABASE_SERVICE_ROLE_KEY=<YOUR_SUPABASE_SERVICE_ROLE_KEY>
JWT_SECRET=<GENERATED_JWT_SECRET>
WEBHOOK_SECRET=<GENERATED_WEBHOOK_SECRET>
PAYSTACK_SECRET_KEY=[OPTIONAL]
OPENAI_API_KEY=[OPTIONAL]
```

---

## ⚠️ Important Notes

1. **Never share these values publicly** - they give access to your database and API keys
2. **DB_PASSWORD must be exact** - copy character for character
3. **Do NOT include quotes** when pasting values
4. **Anon Key is safe to expose** - it's meant to be public (prefixed with NEXT_PUBLIC_)
5. **Service Role Key is SECRET** - keep it private, only for backend
6. **Generated secrets must be random** - use the commands above, don't make them up

---

## ✅ Ready?

Once you have all values gathered, paste them in the format above and I'll add them all to Vercel automatically using the CLI!
