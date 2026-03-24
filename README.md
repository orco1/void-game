# claude-infra — Starter Template

> Auth + database + hosting, pre-wired. Clone this, add your idea, ship it.

## Stack

| Layer | Tool | Cost |
|---|---|---|
| Frontend + API | Next.js (App Router, TypeScript) | Free |
| Database + Auth | Supabase (Postgres) | Free tier |
| UI components | Tailwind CSS + shadcn-style components | Free |
| Hosting | Vercel | Free tier |
| CI/CD | GitHub Actions | Free for public repos |

---

## Local setup (5 minutes)

### 1. Clone and install

```bash
git clone <this-repo>
cd <this-repo>
npm install
```

### 2. Create a Supabase project

1. Go to [supabase.com](https://supabase.com) → New project (free)
2. Copy **Project URL** and **anon/public key** from Settings → API

### 3. Configure environment

```bash
cp .env.example .env.local
# Fill in your Supabase URL and anon key
```

### 4. Run locally

```bash
npm run dev
# → http://localhost:3000
```

---

## Deploy to production (free)

### 1. Push to GitHub

```bash
git remote add origin https://github.com/your-username/your-repo
git push -u origin main
```

### 2. Deploy to Vercel

1. Go to [vercel.com](https://vercel.com) → Import your GitHub repo
2. Add environment variables (same as `.env.local`) in Vercel dashboard
3. Deploy — you get a public URL instantly

### 3. Set up auto-deploy (optional)

Add `VERCEL_TOKEN` and `VERCEL_ORG_ID` / `VERCEL_PROJECT_ID` to GitHub Secrets.
The `.github/workflows/deploy.yml` will then auto-deploy on every push to `main`.

---

## Project structure

```
src/
├── app/
│   ├── (auth)/
│   │   ├── login/page.tsx       ← Sign in page
│   │   └── signup/page.tsx      ← Sign up page
│   ├── (protected)/
│   │   └── dashboard/page.tsx   ← Your authenticated UI goes here
│   ├── auth/callback/route.ts   ← Supabase auth redirect handler
│   ├── layout.tsx
│   └── page.tsx                 ← Landing page
├── components/ui/               ← Button, Input, Card, Label
├── lib/
│   └── supabase/
│       ├── client.ts            ← Browser Supabase client
│       └── server.ts            ← Server Supabase client
└── middleware.ts                ← Route protection

supabase/migrations/             ← Add your DB schema here
.github/workflows/deploy.yml     ← CI/CD pipeline
.env.example                     ← Copy to .env.local
```

---

## Adding your idea

1. **Database**: Add tables to `supabase/migrations/` and run them in Supabase dashboard → SQL Editor
2. **UI**: Build in `src/app/(protected)/dashboard/page.tsx` (or add new routes)
3. **Public pages**: Add to `src/app/` outside the `(protected)` group
4. **Auth gates**: The middleware automatically protects all `/dashboard/*` routes

---

## MVP → Scale checklist

| Stage | What to do |
|---|---|
| POC | `npm run dev` locally, Supabase free tier |
| Share with friends | Deploy to Vercel (free), share the URL |
| Growing | Upgrade Supabase plan when you hit free tier limits (~500K rows) |
| Scale | Add caching (Redis), edge functions, CDN — only when needed |
