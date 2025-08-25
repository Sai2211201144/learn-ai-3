# 🚀 **Setup Instructions for LearnAI 2.0**

## 📋 **Prerequisites**
1. **Firebase Project** ✅ (Already configured)
2. **Supabase Project** ✅ (Already configured)
3. **Google GenAI API Key** (Optional - for AI features)

## 🔧 **Step 1: Environment Variables**
Create a `.env` file in your project root with:

```bash
# Firebase Configuration
VITE_FIREBASE_API_KEY=AIzaSyC8aK1_rY1bBGeHjbEChIjpi6Yv8VTeDL0
VITE_FIREBASE_AUTH_DOMAIN=learn-ai-a5638.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=learn-ai-a5638
VITE_FIREBASE_STORAGE_BUCKET=learn-ai-a5638.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=712188207825
VITE_FIREBASE_APP_ID=1:712188207825:web:102f1cb2cb49d73809dbf0

# Supabase Configuration
VITE_SUPABASE_URL=https://xhrdalmripnchheomaww.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhocmRhbG1yaXBuY2hoZW9tYXd3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYwMDg2MDEsImV4cCI6MjA3MTU4NDYwMX0.MFD0ZPy8NxLv-Np1NdK8XrUWerMmVzT0RmooXD6xtzw

# Google GenAI API Key (Optional)
VITE_GEMINI_API_KEY=AIzaSyC8aK1_rY1bBGeHjbEChIjpi6Yv8VTeDL0
```

## 🗄️ **Step 2: Database Setup**
Run the SQL commands from `database-schema.sql` in your Supabase SQL editor:

1. Go to your Supabase dashboard
2. Navigate to SQL Editor
3. Copy and paste the contents of `database-schema.sql`
4. Click "Run" to create all tables

## 🤖 **Step 3: Google GenAI (Required for Planner)**
The planner functionality requires a Google GenAI API key to work properly:

1. Go to [Google AI Studio](https://aistudio.google.com/)
2. Get an API key
3. Add it to your `.env` file as `VITE_GEMINI_API_KEY`

## 🚀 **Step 4: Start the App**
```bash
npm run dev
```

## ✅ **What's Fixed**
- ✅ **Personalized Dashboard** - New dashboard with user-specific content and stats
- ✅ **Missing Creation Buttons** - Added to EnhancedPlannerPage
- ✅ **Learning Goals** - Working with Firebase authentication
- ✅ **Content Library** - Shows all your courses, articles, and folders
- ✅ **Google Drive Errors** - Better error handling for missing Google APIs

## 🔍 **Troubleshooting**
- **Daily Quest Failing**: Make sure you have set `VITE_GEMINI_API_KEY` in your `.env` file
- **Google Drive Errors**: These are now handled gracefully - Drive features will be disabled
- **Supabase 404 (user_profiles)**: The `user_profiles` table doesn't exist. Follow Step 2 to create it
- **"Failed to load user data"**: This happens when the database tables are missing

## 🎯 **Features Available**
- **Personalized Dashboard** ✅ - User stats, goals, and learning insights
- **Create Learning Plans** ✅ (Requires Gemini API key)
- **Add Daily Goals** ✅ (Requires Gemini API key)
- **Create Articles** ✅ (Requires Gemini API key)
- **Create Folders** ✅
- **Content Management** ✅
- **Firebase Authentication** ✅
- **Learning Progress Tracking** ✅
- **AI-Powered Daily Quests** ✅ (Requires Gemini API key)

The app should now work without errors! 🎉
