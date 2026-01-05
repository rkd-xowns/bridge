<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1cP9xwx9-bDfYweb35mB1DY9dNcxQOqMf

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set up Supabase (Free Database):
   - Follow the detailed instructions in [SUPABASE_SETUP.md](SUPABASE_SETUP.md)
   - Create a free Supabase account at [supabase.com](https://supabase.com)
   - Create a new project
   - Run the SQL script to create the database table
   - Copy your Project URL and anon key
   - Update `services/supabaseConfig.ts` with your credentials:
     ```typescript
     const supabaseUrl = 'https://xxxxx.supabase.co';
     const supabaseAnonKey = 'eyJhbGc...';
     ```
3. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key (if using Gemini features)
4. Run the app:
   `npm run dev`

## Features

- **Real-time synchronization**: Changes are instantly synced across all devices using Supabase (PostgreSQL)
- **Multi-device support**: Access your timetable from any device
- **Live updates**: No polling needed - updates happen in real-time via Supabase Realtime
- **Persistent storage**: All data is stored in the cloud database (Supabase free tier)
- **Free forever**: Uses Supabase's generous free tier (500 MB storage, 2M requests/month)
