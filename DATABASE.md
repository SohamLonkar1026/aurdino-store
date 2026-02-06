# ArduinoMart Database Guide

## 🗄️ Database Setup

ArduinoMart **automatically selects** the right database based on your environment:

- **Local Development**: Uses SQLite (file-based, no setup needed)
- **Production/Online**: Uses Supabase (cloud database, requires setup)

## 🔄 Auto-Selection Logic

The app automatically chooses:
- **SQLite** if no Supabase credentials are found (local development)
- **Supabase** if `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are set (production)

## 📁 Database Files (Local Development)

- **`database.sqlite`** - SQLite database file (created automatically for local dev)
- **`migrations/`** - Database migration files

## 🚀 Setup Instructions

### For Local Development (SQLite - Default)
No setup needed! Just run:
```bash
npm run dev
```
The SQLite database file will be created automatically.

### For Production/Online (Supabase - Required for Live Sites)

**Step 1: Create Supabase Account**
1. Go to [supabase.com](https://supabase.com)
2. Sign up for free
3. Create a new project

**Step 2: Get Your Credentials**
1. In Supabase dashboard, go to **Settings** → **API**
2. Copy your:
   - **Project URL** (e.g., `https://xxxxx.supabase.co`)
   - **anon/public key** (starts with `eyJ...`)

**Step 3: Create Tables in Supabase**
Run this SQL in Supabase SQL Editor:

```sql
-- Create orders table
CREATE TABLE orders (
  id SERIAL PRIMARY KEY,
  order_id TEXT NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  address TEXT NOT NULL,
  mobile TEXT NOT NULL,
  class_branch TEXT NOT NULL,
  items TEXT NOT NULL,
  total INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create contacts table
CREATE TABLE contacts (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Step 4: Set Environment Variables**

For **Vercel/Netlify** (in their dashboard):
```
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
```

For **Render/Railway** (in their dashboard):
```
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
```

For **Local Testing** (create `.env` file):
```
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
```

## 🛠️ Database Commands (Local Development)

```bash
# Generate new migration (when schema changes)
npm run db:generate

# Apply migrations
npm run db:migrate

# Open database studio (visual database browser for SQLite)
npm run db:studio
```

## 📊 What's Stored

### Orders Table
- Order ID, customer details, items, total amount
- Status tracking (pending/completed)
- Creation timestamps

### Contacts Table
- Contact form submissions
- Name, email, message
- Creation timestamps

## 🔄 Data Persistence

### Local Development (SQLite)
✅ **Orders persist** between server restarts  
✅ **Contacts persist** between server restarts  
✅ **Admin panel** shows all historical data  
✅ **No data loss** when server crashes or restarts

### Production (Supabase)
✅ **Orders stored in cloud** - accessible from anywhere  
✅ **Automatic backups** - Supabase handles backups  
✅ **Scalable** - handles thousands of orders  
✅ **Works on serverless** - Vercel, Netlify compatible  
✅ **Real-time updates** - can add real-time features later  

## 🛠️ Database Management

### View Database Contents

**Local (SQLite):**
```bash
npm run db:studio
```
This opens a web interface to browse and edit your SQLite database.

**Production (Supabase):**
- Go to Supabase Dashboard → **Table Editor**
- View and edit all orders and contacts online

### Backup Database

**Local (SQLite):**
Simply copy the `database.sqlite` file to backup your data.

**Production (Supabase):**
- Supabase automatically backs up your data
- You can also export data from Supabase Dashboard → **Database** → **Backups**

### Reset Database

**Local (SQLite):**
Delete `database.sqlite` and restart the server to start fresh.

**Production (Supabase):**
- Delete tables from Supabase Dashboard → **Table Editor**
- Or run `DROP TABLE` commands in SQL Editor

## 📈 Benefits

### Local Development (SQLite)
- ✅ **No external dependencies** - SQLite is file-based
- ✅ **Automatic setup** - Database creates itself on first run
- ✅ **Fast** - Perfect for local development
- ✅ **Easy backup** - Just copy the database file
- ✅ **Cross-platform** - Works on Windows, Mac, Linux

### Production (Supabase)
- ✅ **Cloud-hosted** - Accessible from anywhere
- ✅ **Free tier** - 500MB database, 2GB bandwidth (free forever)
- ✅ **Automatic backups** - No manual backup needed
- ✅ **Scalable** - Handles millions of orders
- ✅ **Serverless compatible** - Works on Vercel, Netlify
- ✅ **Real-time ready** - Can add live updates later

## ⚠️ Important for Live Sites

**If your website is deployed online (Vercel, Netlify, etc.), you MUST use Supabase!**

SQLite won't work on serverless platforms because:
- ❌ Files don't persist between deployments
- ❌ Multiple server instances can't share a file
- ❌ Files get wiped on each deploy

**Solution:** Set up Supabase (free) and add environment variables to your hosting platform.

Your ArduinoMart orders are now safely stored! 🎉 