# Supabase Setup Guide (Free Tier)

This app uses Supabase (PostgreSQL) for real-time database synchronization across devices. Supabase offers a generous **free tier** with:
- 500 MB database storage
- 1 GB file storage  
- 2 million monthly requests
- Real-time subscriptions
- Unlimited API requests

## Step 1: Create a Supabase Account

1. Go to [Supabase](https://supabase.com/)
2. Click **"Start your project"** or **"Sign up"**
3. Sign up with GitHub, Google, or email (it's free!)

## Step 2: Create a New Project

1. Click **"New Project"**
2. Fill in:
   - **Name**: Bridge App (or any name you like)
   - **Database Password**: Create a strong password (save it somewhere safe)
   - **Region**: Choose the closest region to you
3. Click **"Create new project"**
4. Wait 2-3 minutes for the project to be set up

## Step 3: Get Your API Keys

1. In your project dashboard, go to **Settings** (gear icon) > **API**
2. You'll see:
   - **Project URL**: Copy this (looks like `https://xxxxx.supabase.co`)
   - **anon public key**: Copy this (starts with `eyJ...`)

## Step 4: Create the Database Table

1. In Supabase dashboard, go to **SQL Editor** (left sidebar)
2. Click **"New query"**
3. Paste this SQL code:

```sql
-- Create the bridges table
CREATE TABLE IF NOT EXISTS bridges (
  id TEXT PRIMARY KEY,
  events JSONB DEFAULT '[]'::jsonb,
  highlights JSONB DEFAULT '{}'::jsonb,
  feelings JSONB DEFAULT '[]'::jsonb,
  names JSONB DEFAULT '{"me": "태준", "partner": "유주"}'::jsonb,
  "lastUpdated" TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE bridges ENABLE ROW LEVEL SECURITY;

-- Create a policy that allows all operations (for development)
-- In production, you should restrict this based on authentication
CREATE POLICY "Allow all operations on bridges" ON bridges
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Enable real-time for this table
ALTER PUBLICATION supabase_realtime ADD TABLE bridges;
```

4. Click **"Run"** (or press Cmd/Ctrl + Enter)
5. You should see "Success. No rows returned"

## Step 5: Enable Realtime

1. Go to **Database** > **Replication** (in left sidebar)
2. Find the `bridges` table
3. Toggle the switch to enable replication
4. Make sure it's enabled (should be green/checked)

## Step 6: Update Your App Configuration

1. Open `services/supabaseConfig.ts`
2. Replace the placeholder values:

```typescript
const supabaseUrl = 'https://xxxxx.supabase.co'; // Your Project URL
const supabaseAnonKey = 'eyJhbGc...'; // Your anon public key
```

## Step 7: Test Your Setup

1. Run `npm run dev`
2. Open the app in your browser
3. Add an event or update data
4. Open the app on another device/browser
5. Changes should appear in real-time! 🎉

## Troubleshooting

### "relation 'bridges' does not exist"
- Make sure you ran the SQL script in Step 4
- Check that the table was created in **Database** > **Tables**

### "new row violates row-level security policy"
- Make sure you created the RLS policy in Step 4
- Check **Authentication** > **Policies** to verify the policy exists

### No real-time updates
- Make sure Realtime is enabled in **Database** > **Replication**
- Check that the `supabase_realtime` publication includes the `bridges` table

### "Invalid API key"
- Double-check your `supabaseUrl` and `supabaseAnonKey` in `supabaseConfig.ts`
- Make sure you copied the **anon public** key, not the service_role key

## Free Tier Limits

The free tier is very generous for personal use:
- **500 MB** database storage (plenty for events, highlights, feelings)
- **2 million** API requests per month
- **Real-time** subscriptions included
- **Unlimited** projects

You'll likely never hit these limits for a personal timetable app!

## Production Security (Optional)

For production, you should:
1. Implement Supabase Authentication
2. Update RLS policies to only allow authenticated users
3. Use environment variables for API keys

Example secure policy:
```sql
-- Remove the open policy
DROP POLICY "Allow all operations on bridges" ON bridges;

-- Create authenticated-only policy
CREATE POLICY "Authenticated users only" ON bridges
  FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');
```

But for now, the open policy is fine for personal use!

