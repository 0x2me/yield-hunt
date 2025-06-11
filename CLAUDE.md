# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Yield Hunt is a full-stack TypeScript web application that scrapes YouTube channels, retrieves transcripts, and generates AI-driven summaries using OpenAI. The decoupled architecture includes:

- **Frontend**: Next.js (App Router) + Tailwind CSS + Shadcn UI (deployed on Vercel)
- **Backend API**: tRPC server using Fastify (deployed on Railway)  
- **Database/Auth**: Supabase (PostgreSQL)
- **Worker**: Always-on Node.js service on Railway for background processing
- **Cron Tasks**: Supabase Edge Functions or Vercel Cron

## Development Commands

### Frontend (Next.js)
```bash
cd frontend
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
```

### Backend (when implemented)
```bash
cd backend
npm run build        # Compile TypeScript
npm run start        # Start production server
npx ts-node index.ts # Start development server
```

## Architecture Notes

### Service Communication
- Vercel Frontend ⇄ Railway API via `/trpc` endpoint (Fastify server)
- Railway Worker ⇄ Supabase via service key for DB writes
- Railway Worker ⇄ tRPC via HTTP POST (optional)

### Database Schema
The main `videos` table stores:
- `youtube_id`, `title`, `published_at` (from YouTube API)
- `transcript` (from youtube-transcript)
- `summary` (from OpenAI API)

### Key Libraries & Integrations
- **tRPC**: Type-safe API layer between frontend and backend
- **Fastify**: High-performance web framework for backend API
- **Supabase**: Database, auth, and Row Level Security (RLS)
- **OpenAI API**: Text summarization using GPT models
- **YouTube Data API**: Fetching video metadata
- **youtube-transcript**: Extracting transcripts
- **Telegram Bot API**: Notifications when summaries are ready

### File Structure Conventions
- `config/channels.ts` - List of YouTube channel IDs to monitor
- `lib/` - Shared utilities (supabase, trpc, youtube, summarizer, telegram)
- `server/` - tRPC backend API with Fastify
- `worker/` - Always-on background listener for processing jobs
- `app/` - Next.js App Router pages and layouts
- `components/` - Shadcn UI + custom React components

## Environment Variables

### Frontend (Vercel)
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`  
- `NEXT_PUBLIC_API_BASE_URL` (points to Railway tRPC server)

### Backend/Worker (Railway)
- `SUPABASE_SERVICE_ROLE_KEY`
- `OPENAI_API_KEY`
- `TELEGRAM_BOT_TOKEN`
- `PORT` (for Railway deployment)

## Key Design Patterns

- Use `zod` for all tRPC input validation to prevent malformed data
- Implement proper error handling with try/catch in async functions
- Use Supabase Row Level Security (RLS) for data access control
- Follow server-first rendering patterns with Next.js App Router
- Use Shadcn UI components with Tailwind's `prose` class for readable content
- Implement background jobs that can run independently from the main API