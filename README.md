<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1UotgUzevFWgwny5Gt6QGouGilkozsW-H

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

# Auth setup

1) Create a Firebase project and enable Google sign-in.
2) Create a Supabase project.
3) Copy `.env.example` to `.env` and fill values.
4) Run the SQL in `database-schema.sql` in Supabase SQL editor.
5) Dev: `npm run dev`

## Env

Create `.env` with:

```
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...

VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
```