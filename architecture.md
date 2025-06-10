# Yield Hunt Architecture and Design

## Overview

Yield Hunt is a full-stack TypeScript web app that scrapes YouTube channels, retrieves transcripts, and generates AI-driven summaries using OpenAI. It displays this content in a clean timeline UI with deep linking to full summaries. The stack includes:

- **Frontend**: Next.js (App Router), deployed on **Vercel**, styled with Shadcn UI
- **Backend API**: tRPC server using **Fastify**, deployed on **Railway**
- **Database/Auth**: Supabase (PostgreSQL)
- **Worker**: Always-on Node.js service on Railway (e.g., for blockchain event listeners)
- **Cron Tasks**: Supabase Edge Functions or Vercel Cron

This decoupled architecture separates concerns cleanly: Vercel hosts a fast, SEO-friendly frontend, while Railway handles API logic and persistent background processes. Supabase offers scalable auth, storage, and relational data out of the box.

## File & Folder Structure

```
.
├── app/                    # Next.js App Router
│   ├── layout.tsx         # Global layout
│   ├── page.tsx           # Homepage (video stream)
│   └── [videoId]/         # Dynamic route for full summary
│       └── page.tsx
├── components/            # Shadcn + custom components
│   ├── Timeline.tsx
│   ├── VideoCard.tsx
│   └── VideoSummary.tsx
├── config/
│   └── channels.ts        # List of YouTube channel IDs
├── lib/
│   ├── supabase.ts        # Supabase client init
│   ├── trpc.ts            # tRPC client
│   ├── youtube.ts         # Transcript fetchers
│   ├── summarizer.ts      # OpenAI summarization
│   └── telegram.ts        # Telegram bot utility
├── server/                # tRPC backend API (Fastify on Railway)
│   ├── index.ts           # Fastify entrypoint
│   ├── context.ts         # Request context for tRPC
│   ├── router.ts          # Root router
│   └── routers/
│       └── video.ts       # getAllVideos, getVideoById, etc.
├── worker/                # Always-on background listener (Railway)
│   └── index.ts           # Blockchain or YouTube indexing logic
├── docs/
│   └── architecture.md    # This doc
├── .env.local             # Secrets for local dev
└── styles/                # Tailwind config or global CSS
```

## Components and Data Flow

- **Frontend** (Vercel): Uses server components where possible to pre-fetch summaries and timelines. Communicates with tRPC backend via HTTP.
- **tRPC API** (Railway): Built using **Fastify** + `@trpc/server/adapters/fastify`. Handles all API logic for querying video summaries, calling OpenAI, and managing transcripts.
- **Supabase**: Stores video metadata, transcripts, and summaries. Also used for optional auth.
- **Worker** (Railway): Persistent listener (e.g. blockchain, YouTube polling). Can write directly to Supabase or invoke tRPC endpoints.

## Background Jobs & Cron

### Vercel Cron Jobs

- Lightweight jobs (e.g. refresh homepage, ping YouTube API)
- Defined in `vercel.json` as schedule-based handlers

### Always-On Worker (Railway)

- Node.js process, always running
- Ideal for:

  - Blockchain tx listeners
  - Long YouTube polling jobs
  - WebSocket or Graph node sync

- Can access Supabase via service role or call tRPC

## Deployment Instructions

### Frontend (Next.js on Vercel)

- Push code to GitHub
- Connect Vercel to repo
- Add environment variables via Vercel dashboard:

  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `NEXT_PUBLIC_API_BASE_URL` (points to Railway-hosted tRPC server)

- Vercel auto-deploys on every push to `main`

### Backend API (tRPC + Fastify on Railway)

- Create new Railway Node.js project
- Use `@trpc/server/adapters/fastify`
- Example `server/index.ts`:

```ts
import Fastify from "fastify";
import { fastifyTRPCPlugin } from "@trpc/server/adapters/fastify";
import { appRouter } from "./router";
import { createContext } from "./context";

const app = Fastify();
app.register(fastifyTRPCPlugin, {
  prefix: "/trpc",
  trpcOptions: { router: appRouter, createContext },
});

app.listen({ port: Number(process.env.PORT) || 3000, host: "0.0.0.0" });
```

- Add `.env` with:

  - `SUPABASE_SERVICE_ROLE_KEY`
  - `OPENAI_API_KEY`
  - `TELEGRAM_BOT_TOKEN`

- Add build/start scripts:

```json
"scripts": {
  "build": "tsc",
  "start": "node dist/index.js"
},
"engines": {
  "node": ">=18"
}
```

- Deploy via Railway GitHub connect or CLI

### Worker (Railway)

- Create another Railway service from `worker/index.ts`
- Add persistent job (e.g. using `setInterval` or a job queue)
- Add shared secrets as needed
- Optionally call your own tRPC endpoint via HTTP when an event is detected

## Service Communication

- **Vercel ⇄ Railway API**: Via `/trpc` endpoint (Fastify server)
- **Railway Worker ⇄ Supabase**: Use service key for DB writes
- **Railway Worker ⇄ tRPC**: Optional — HTTP POST to tRPC backend
- Secrets injected via Vercel/Railway dashboards or Supabase Vault

## UI Design

- **Stream Page**: List of video summaries, styled with Shadcn Cards
- **Detail Page**: Expandable/collapsible summary view, embedded YouTube player
- **Mobile Ready**: Tailwind responsive utilities
- **Typography**: Use `prose` class from Tailwind for clean readable output

## Error Handling & Monitoring

- **Frontend**:

  - App Router `error.tsx`
  - Toasts or fallback UI for failed data fetches

- **Backend/Worker**:

  - `try/catch` in all async functions
  - Logging via **Pino** or **Winston**
  - Track errors in **Sentry** (frontend + backend)

## Security Best Practices

- Use `.env` for local, and secure key management in Railway/Vercel
- Use Supabase Row Level Security (RLS) if supporting users
- Use `zod` on all tRPC inputs to prevent malformed data
- Keep services isolated via Railway private networking

## Tools Summary

- **Next.js** (Vercel) – UI + SSR
- **tRPC + Fastify** (Railway) – Logic + data access
- **Supabase** – Postgres + Auth + Storage
- **OpenAI API** – Text summarization
- **Telegram Bot API** – Notify when summaries are ready
- **Shadcn UI** – Clean Tailwind components
