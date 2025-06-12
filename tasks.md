# Yield Hunt MVP Task Plan

This document defines a granular, testable task plan for building the MVP of Yield Hunt. Each task is atomic, focused on one concern, and has clear input/output boundaries. Designed for step-by-step LLM-driven development and manual testing between steps.

---

## Phase 1: Base Setup

### ✅ 1. Create a new GitHub repository

- Create a public/private GitHub repo named `yield-hunt`
- Initialize with README, `.gitignore`, and MIT license

### ✅ 2. Scaffold the Next.js frontend with Tailwind and Shadcn UI

```bash
npx create-next-app@latest frontend
cd frontend
npx shadcn-ui@latest init
pnpm run dev
```

- Select App Router, TypeScript, Tailwind when prompted
- Confirm homepage loads at `http://localhost:3000`

### ✅ 3. Scaffold the Fastify + tRPC backend API

```bash
mkdir backend && cd backend
pnpm init -y
pnpm install fastify @trpc/server zod dotenv
pnpm install -D typescript ts-node @types/node
npx tsc --init
```

- Create `index.ts` with Fastify server and a test `hello` tRPC route
- Test locally: `npx ts-node index.ts`

### ✅ 4. Deploy frontend to Vercel

- Push `frontend/` to GitHub
- Connect repo to Vercel
- Set environment variables:

- Deploy and verify at live URL

### ✅ 5. Deploy backend to Railway

- Push `backend/` to GitHub
- Create Railway project and link repo
- Set environment variables in Railway dashboard:

  - `PORT=3000`
  - `SUPABASE_SERVICE_ROLE_KEY`
  - `OPENAI_API_KEY`
  - `TELEGRAM_BOT_TOKEN`

- Add `start` and `build` scripts to `package.json`

```json
"scripts": {
  "build": "tsc",
  "start": "node dist/index.js"
}
```

- Run build: `npx tsc`
- Deploy and test `/trpc/hello` endpoint

---

## Phase 2: Data Layer

### ✅ 6. Initialize Supabase project

- Go to [supabase.com](https://supabase.com)
- Create project named `yield-hunt`
- Get `project URL` and `anon` key from settings > API

### ✅ 7. Create `videos` table in Supabase

Use the SQL editor:

```sql
create table videos (
  id uuid primary key default gen_random_uuid(),
  youtube_id text not null,
  title text,
  published_at timestamp,
  transcript text,
  summary text,
  created_at timestamp default now()
);
```

- Enable Row-Level Security (RLS)
- Add policy to allow insert/update for service role

### ✅ 8. Connect Supabase to backend

```bash
pnpm install @supabase/supabase-js
```

- Create `lib/supabase.ts` with Supabase client using `SUPABASE_SERVICE_ROLE_KEY`
- Test DB insert from a test tRPC procedure

---

## Phase 3: YouTube Integration

### 9. Create `config/channels.ts`

```ts
export const CHANNELS = ["UC1234567890abcdef", "UCabcdef1234567890"];
```

### 10. Implement `lib/youtube.ts`

```bash
pnpm install googleapis
```

- Function: `getLatestVideosFromChannel(channelId)` using YouTube Data API

### 11. Add transcript fetcher

```bash
pnpm install youtube-transcript
```

- Function: `getTranscript(videoId)`

### 12. Add OpenAI summarizer

```bash
pnpm install openai
```

- Function: `summarizeTranscript(transcript)`
- Use `gpt-4` or `gpt-3.5-turbo` API with retries

### 13. Add Telegram notifier

```bash
pnpm install node-telegram-bot-api
```

- Function: `notifyTelegram(text)`

---

## Phase 4: Background Jobs

### 14. Implement cron job runner in `worker/index.ts`

- Loop through `CHANNELS`
- For each:

  - Fetch latest videos
  - Fetch transcript
  - Summarize
  - Insert to Supabase
  - Notify via Telegram

### 15. Deploy worker to Railway

- Create new Railway service for `worker/`
- Set env vars: same as `backend`
- Add `start` script:

```json
"scripts": {
  "start": "ts-node index.ts"
}
```

- Run manually or set schedule via Railway job tab

---

## Phase 5: Frontend Rendering

### 16. Add `getAllVideos` tRPC procedure

- Query all videos ordered by `published_at desc`
- Return: `id`, `title`, `summary`, `published_at`

### 17. Add `getVideoById` tRPC procedure

- Input: `videoId`
- Return full row: `title`, `transcript`, `summary`, etc.

### 18. Implement timeline UI in `app/page.tsx`

- Fetch `getAllVideos`
- Render with `Shadcn Card` showing title + short summary

### 19. Implement detail page in `app/[videoId]/page.tsx`

- Fetch `getVideoById`
- Embed video iframe + full summary
- Use `prose` for readable styling

### 20. Add loading + error states

- Add skeleton loader (Shadcn or Tailwind)
- Catch errors and display friendly fallback

---

## Phase 6: Polish & QA

### 21. Configure Tailwind Typography

```bash
pnpm install @tailwindcss/typography
```

- Add to `tailwind.config.ts`

```ts
plugins: [require('@tailwindcss/typography')],
```

- Use `className="prose"` in summary block

### 22. Add environment validation

```bash
pnpm install zod
```

- Create `lib/env.ts` and validate `process.env` with `zod`

### 23. Add logging and monitoring

```bash
pnpm install pino
```

- Use `pino` in backend + worker for logs
- Add Sentry SDKs if desired

### 24. Final smoke test + deployment audit

- Trigger job manually or with real new video
- Verify:

  - Entry added to DB
  - Summary appears in frontend
  - Telegram alert received

---

Let me know if you’d like this exported to GitHub issues or a full monorepo starter.
