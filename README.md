# 💕 LoopWeb - Modern Dating App

A premium, mobile-first dating application built with Next.js, Supabase, and Tailwind CSS.

## ✨ Features

- 🔐 **Authentication** - Email/Password signup and login with Supabase Auth
- 💫 **Swipeable Cards** - Tinder-like card stack with smooth animations
- 💖 **Smart Matching** - Automatic match creation on mutual likes
- 💬 **Real-time Chat** - Live messaging with Supabase Realtime
- 📱 **Mobile-First** - Optimized for mobile devices with bottom navigation
- 🎨 **Premium Design** - Modern, dark-themed UI with glassmorphism effects

## 🚀 Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Styling:** Tailwind CSS 4
- **Database:** Supabase (PostgreSQL)
- **Auth:** Supabase Auth
- **Animations:** Framer Motion
- **Icons:** Lucide React
- **Deployment:** Vercel

## 📦 Installation

1. Clone the repository:
```bash
git clone https://github.com/gokhanyigit06/loopweb.git
cd loopweb
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env.local` file:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. Set up the database:
   - Go to your Supabase project dashboard
   - Navigate to SQL Editor
   - Run the migration file: `supabase/migrations/20240116_initial_schema.sql`
   - Run the seed file: `supabase/seed.sql` (for test users)

5. Run the development server:
```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000)

## 🗄️ Database Schema

### Tables:
- **profiles** - User profiles with bio, interests, location
- **likes** - One-way likes between users
- **matches** - Mutual likes (automatically created)
- **messages** - Chat messages between matched users

### Key Features:
- Automatic match creation on mutual likes (PostgreSQL trigger)
- Row Level Security (RLS) policies for data protection
- Real-time subscriptions for instant messaging

## 📱 App Structure

```
/                   - Landing page
/login              - Login page
/signup             - Signup page
/discover           - Swipeable profile cards
/matches            - View all matches
/chat               - Chat list
/chat/[id]          - Individual chat conversation
/profile            - User profile settings
```

## 🎯 Usage Flow

1. **Sign Up** - Create an account
2. **Complete Profile** - Add bio, interests, photos
3. **Discover** - Swipe right (like) or left (pass) on profiles
4. **Match** - When both users like each other, it's a match!
5. **Chat** - Start conversations with your matches

## 🧪 Test Users

The app comes with 10 pre-seeded test users. After running the seed file, you can:
- Create a new account
- Start swiping on test profiles
- Test the matching and chat features

## 🔒 Security

- All database operations protected by Row Level Security (RLS)
- Authentication handled by Supabase Auth
- Secure session management with middleware
- HTTPS-only in production

## 🚀 Deployment

Deploy to Vercel:

```bash
vercel
```

Make sure to add your environment variables in the Vercel dashboard.

## 📄 License

MIT

## 👨‍💻 Author

Gökhan Yiğit - [@gokhanyigit06](https://github.com/gokhanyigit06)

---

Made with ❤️ and Next.js
