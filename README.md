# Hams

Anonymous campus Q&A for Jordanian university students. Next.js (App Router) + Supabase.

## Run it on your PC

```bash
npm install
cp .env.local.example .env.local   # then fill in your Supabase keys
npm run dev
```

Open http://localhost:3000 — you'll see the real splash → onboarding → discovery
grid flow from the prototype, now running as your own project.

## Set up your database

1. Create a free project at https://supabase.com
2. Open the SQL Editor in your project dashboard
3. Paste the contents of `supabase/schema.sql` and run it
4. Copy your Project URL and anon public key into `.env.local`

## Put it under your own name (GitHub)

```bash
git init
git add .
git commit -m "Initial commit: Hams v0"
```

Then create an empty repo on https://github.com/new (don't initialize it with a
README), and push:

```bash
git remote add origin https://github.com/YOUR_USERNAME/hams-app.git
git branch -M main
git push -u origin main
```

## Deploy it live (free) on Vercel

1. Go to https://vercel.com, sign in with your GitHub account
2. Click "Add New Project" and select your `hams-app` repo
3. In the project settings, add the same two environment variables from
   `.env.local` (Project URL and anon key)
4. Click Deploy — you'll get a live URL like `hams-app.vercel.app`
5. Later, add a custom domain (e.g. `hams.jo`) under Project Settings → Domains

From here on, every `git push` to `main` auto-deploys. This repo, this
database, and this domain are entirely yours — nothing routes through
Anthropic or this chat.

## What's real vs. what's next

- Real: splash timing, gender-based theme transition, onboarding flow, discovery
  grid layout, Supabase client/server/middleware wiring, full DB schema with RLS.
- Still mocked: the Discovery Grid reads from `MOCK_PROFILES` in `app/page.tsx`,
  not from Supabase yet. Signup doesn't call `supabase.auth.signUp()` yet.

Next step: wire the onboarding submit handler to Supabase Auth + insert into
`profiles`, then replace `MOCK_PROFILES` with a live query filtered by
`university`.
