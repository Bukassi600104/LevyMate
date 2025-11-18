# 🔐 Complete Guide: Finding Supabase Credentials

## Project Reference
- **Project Name**: LevyMate
- **Project ID**: mipyakisywdofczqaxlb
- **Dashboard Link**: https://app.supabase.com/projects/mipyakisywdofczqaxlb

---

## 📍 Part 1: Get Database Password

### Step-by-Step Navigation:

1. **Open Supabase Dashboard**
   - Go to: https://app.supabase.com/projects/mipyakisywdofczqaxlb
   - You should see your project displayed

2. **Navigate to Database Settings**
   - Look at the LEFT SIDEBAR menu
   - Find: **Settings** (at the bottom of the menu, usually has a gear icon ⚙️)
   - Click on **Settings**

3. **Go to Database Section**
   - After clicking Settings, you'll see a submenu on the left
   - Look for: **Database** (or **Connections**)
   - Click on **Database**

4. **Find the Password Field**
   - You'll see connection details displayed
   - Look for a section labeled: **"Connection string"** or **"Database credentials"**
   - Find the field that says: **"Password"**
   - There should be a **"Reveal"** button (eye icon 👁️ or "Reveal" text)
   - Click **Reveal** to show the password

5. **Copy Your Password**
   - **⚠️ WARNING**: This password is sensitive - don't share it
   - Copy the password exactly as shown
   - Save it for later use

**Your Database Password Variable:**
```
DB_PASSWORD=[PASTE_REVEALED_PASSWORD_HERE]
```

---

## 📍 Part 2: Get Database Connection String

### Step-by-Step Navigation:

1. **Stay in Database Settings** (from Part 1)
   - You should already be at: Settings → Database
   - This page shows all connection details

2. **Find Connection String Section**
   - Look for: **"Connection string"** header
   - You should see multiple options (URI, PostgreSQL, etc.)

3. **Copy PostgreSQL Connection String**
   - Find the tab or section labeled: **"PostgreSQL"** or **"URI"**
   - The string starts with: `postgresql://`
   - It looks like: `postgresql://postgres:[PASSWORD]@db.mipyakisywdofczqaxlb.supabase.co:5432/postgres`

4. **Replace [PASSWORD] with Your Actual Password**
   - Copy the connection string
   - Replace `[PASSWORD]` with the password you revealed in Part 1
   - Example result:
     ```
     postgresql://postgres:MyActualPassword123@db.mipyakisywdofczqaxlb.supabase.co:5432/postgres?sslmode=require
     ```

**Your Database URL Variable:**
```
DATABASE_URL=postgresql://postgres:[YOUR_DB_PASSWORD]@db.mipyakisywdofczqaxlb.supabase.co:5432/postgres?sslmode=require
```

---

## 📍 Part 3: Get Supabase URL & API Keys

### Step-by-Step Navigation:

1. **Open Supabase Dashboard**
   - Go to: https://app.supabase.com/projects/mipyakisywdofczqaxlb
   - You're back at the main project view

2. **Navigate to API Settings**
   - Look at the LEFT SIDEBAR menu
   - Find: **Settings** (same as before, gear icon ⚙️)
   - Click on **Settings**

3. **Go to API Section**
   - After clicking Settings, look at the left submenu
   - Find: **API** (or **App Settings**)
   - Click on **API**
   - You might see it under **Configuration** → **API**

4. **Find Project URL**
   - On the API settings page, look for: **"Project URL"**
   - It should display: `https://mipyakisywdofczqaxlb.supabase.co`
   - This is your **SUPABASE_URL**
   - Click the copy icon (📋) next to it

5. **Find API Keys Section**
   - On the same API settings page, scroll down
   - Look for: **"Project API keys"** or **"Authentication"** section
   - You should see a table/list with two rows:
     - **"Anon (public)"** - safe to share
     - **"Service Role (secret)"** - keep secret!

6. **Copy Anon Key**
   - Find the row labeled: **"Anon (public)"** or **"anon public"**
   - It starts with: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
   - Click the copy icon (📋) to copy it
   - This is your **NEXT_PUBLIC_SUPABASE_ANON_KEY**

7. **Copy Service Role Key**
   - Find the row labeled: **"Service Role (secret)"** or **"service_role secret"**
   - It also starts with: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` (but different)
   - Click the copy icon (📋) to copy it
   - This is your **SUPABASE_SERVICE_ROLE_KEY**
   - ⚠️ **IMPORTANT**: Keep this secret - never share or commit to Git!

**Your Supabase URL & Keys Variables:**
```
NEXT_PUBLIC_SUPABASE_URL=https://mipyakisywdofczqaxlb.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[PASTE_ANON_KEY_HERE]
SUPABASE_SERVICE_ROLE_KEY=[PASTE_SERVICE_ROLE_KEY_HERE]
```

---

## 📍 Part 4: Generate JWT & Webhook Secrets

### These are NOT from Supabase - you generate them!

**Open Your Terminal** and run these commands to generate random secure strings:

#### Generate JWT Secret:
```bash
node -e "console.log(require('crypto').randomBytes(48).toString('base64'))"
```

**Copy the output** and use it for:
```
JWT_SECRET=[PASTE_OUTPUT_HERE]
```

#### Generate Webhook Secret:
```bash
node -e "console.log(require('crypto').randomBytes(48).toString('base64'))"
```

**Copy the output** (different from JWT) and use it for:
```
WEBHOOK_SECRET=[PASTE_OUTPUT_HERE]
```

---

## ✅ Summary: What You Now Have

| Variable | Where It Came From | Example |
|----------|-------------------|---------|
| `DB_PASSWORD` | Supabase → Settings → Database (Reveal button) | `ActualPassword123` |
| `DATABASE_URL` | Supabase → Settings → Database (Connection String) | `postgresql://postgres:PASSWORD@db.xxx.supabase.co:5432/postgres?sslmode=require` |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase → Settings → API (Project URL) | `https://mipyakisywdofczqaxlb.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase → Settings → API (Anon Key) | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase → Settings → API (Service Role) | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` |
| `JWT_SECRET` | Generated in Terminal | `k7jF2nL9pQ6wX8mK3vR5dY2zB4hG1sT9uJ6cL0...` |
| `WEBHOOK_SECRET` | Generated in Terminal | `a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9...` |

---

## 🎯 Final Format

Once you have ALL values, provide them in this exact format:

```
DB_PASSWORD=your_password_here
DATABASE_URL=postgresql://postgres:your_password_here@db.mipyakisywdofczqaxlb.supabase.co:5432/postgres?sslmode=require
NEXT_PUBLIC_SUPABASE_URL=https://mipyakisywdofczqaxlb.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1pcHlha2lzeXdkb2ZjenFheGxiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMzOTIyMDgsImV4cCI6MjA3ODk2ODIwOH0.58008bNoWN5NWl_RyG2bpTxq0CFMrH-FBF20driila0
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1pcHlha2lzeXdkb2ZjenFheGxiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MzM5MjIwOCwiZXhwIjoyMDc4OTY4MjA4fQ.your_service_key
JWT_SECRET=k7jF2nL9pQ6wX8mK3vR5dY2zB4hG1sT9uJ6cL0fD3eN5qW2rP8sA1bM4oX7yV
WEBHOOK_SECRET=a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6A7B8C9D
```

---

## 🚨 Security Reminders

1. **Never commit `.env` to Git** - it should be in `.gitignore`
2. **ANON KEY is public** - it's safe to expose (prefixed with `NEXT_PUBLIC_`)
3. **SERVICE ROLE KEY is SECRET** - keep it safe, never share
4. **DATABASE PASSWORD is SECRET** - keep it safe, never share
5. **Generated secrets are unique** - don't reuse them across projects

---

## 📞 Troubleshooting

### Can't find Settings?
- Click the gear icon ⚙️ at the bottom of the left sidebar
- Or look for **Organization Settings** if in organization view

### Can't find API section?
- Make sure you're in **Project Settings**, not **Organization Settings**
- Click on your project name first, then go to Settings

### Connection string looks different?
- Different formats are available (PostgreSQL, psycopg2, etc.)
- Use the **PostgreSQL** format for Node.js/Express

### Keys look the same?
- Anon and Service Role keys are different tokens
- Anon key is shorter or has different payload
- Copy each one carefully - don't mix them up

---

**Last Updated**: November 18, 2025
**Project**: LevyMate (mipyakisywdofczqaxlb)
