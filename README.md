# Yield Hunt

A full-stack TypeScript web application that scrapes YouTube channels, retrieves transcripts, and generates AI-driven summaries using OpenAI.

## Architecture

- **Frontend**: Next.js (App Router) + Tailwind CSS + Shadcn UI
- **Backend API**: tRPC server using Fastify
- **Database/Auth**: Supabase (PostgreSQL)
- **Deployment**: Frontend on Vercel, Backend on Railway

## Local Development

### Prerequisites

- Node.js (v18+)
- Docker Desktop
- pnpm (recommended) or npm

### 1. Clone and Install Dependencies

```bash
git clone <repository-url>
cd yield-hunt

# Install backend dependencies
cd backend
pnpm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 2. Start Supabase Local Development

```bash
# From the backend directory
cd backend
pnpx supabase start
```

This will start local Supabase services:
- **API**: http://127.0.0.1:54321
- **Studio**: http://127.0.0.1:54323 (Database management UI)
- **Inbucket**: http://127.0.0.1:54324 (Email testing)

### 3. Set Up Environment Variables

**Backend** (`/backend/.env`):
```bash
# Server Configuration
PORT=3001
NODE_ENV=development

# Database (Local Supabase)
SUPABASE_URL=http://127.0.0.1:54321
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU

# AI Services (Optional for development)
OPENAI_API_KEY=your_openai_api_key_here

# Notifications (Optional for development)
TELEGRAM_BOT_TOKEN=your_telegram_bot_token_here
```

**Frontend** (`/frontend/.env.local`):
```bash
# Supabase Configuration (Local Development)
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0

# API Configuration
NEXT_PUBLIC_API_BASE_URL=http://localhost:3001
```

### 4. Apply Database Migrations

```bash
# From the backend directory
cd backend
pnpx supabase migration up
```

### 5. Start Development Servers

**Terminal 1 - Backend (Fastify + tRPC):**
```bash
cd backend
pnpm run start
# or for development with auto-reload:
pnpx ts-node src/index.ts
```

**Terminal 2 - Frontend (Next.js):**
```bash
cd frontend
npm run dev
```

**Terminal 3 - Supabase (if not already running):**
```bash
cd backend
pnpx supabase start
```

### 6. Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **Supabase Studio**: http://127.0.0.1:54323
- **tRPC Panel** (if enabled): http://localhost:3001/panel

## Database Schema

The application uses a single `videos` table:

```sql
CREATE TABLE videos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  youtube_id VARCHAR(255) NOT NULL UNIQUE,
  title TEXT NOT NULL,
  published_at TIMESTAMPTZ NOT NULL,
  transcript TEXT,
  summary TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Creating New Migrations

```bash
cd backend
pnpx supabase migration new migration_name
# Edit the generated SQL file in supabase/migrations/
pnpx supabase migration up
```

## Deployment

### Frontend Deployment (Vercel)

1. **Connect Repository to Vercel:**
   - Visit [vercel.com](https://vercel.com)
   - Import your repository
   - Set build command: `npm run build`
   - Set output directory: `.next`
   - Set root directory: `frontend`

2. **Configure Environment Variables in Vercel:**
   ```bash
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_production_anon_key
   NEXT_PUBLIC_API_BASE_URL=https://your-backend.railway.app
   ```

3. **Deploy:**
   ```bash
   # Using Vercel CLI (optional)
   pnpx vercel --prod
   ```

### Backend Deployment (Railway)

1. **Connect Repository to Railway:**
   - Visit [railway.app](https://railway.app)
   - Create new project from GitHub repo
   - Set root directory: `backend`

2. **Configure Environment Variables in Railway:**
   ```bash
   PORT=3001
   NODE_ENV=production
   SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_SERVICE_ROLE_KEY=your_production_service_key
   OPENAI_API_KEY=your_openai_api_key
   TELEGRAM_BOT_TOKEN=your_telegram_bot_token
   ```

3. **Configure railway.toml** (already included):
   ```toml
   [build]
   builder = "nixpacks"
   
   [deploy]
   startCommand = "pnpm start"
   ```

### Production Supabase Setup

1. **Create Production Project:**
   - Visit [supabase.com](https://supabase.com)
   - Create new project
   - Note your project URL and keys

2. **Link Local Project to Production:**
   ```bash
   cd backend
   pnpx supabase login
   pnpx supabase link --project-ref your-project-id
   ```

3. **Deploy Schema to Production:**
   ```bash
   cd backend
   pnpx supabase db push
   ```

4. **Alternative: Generate and Apply Migrations:**
   ```bash
   # Generate SQL from your local schema
   pnpx supabase db diff --schema public --file new_migration
   
   # Apply to production
   pnpx supabase migration up
   ```

### Database Migration Strategies

**Option 1: Direct Schema Push (Development/Staging)**
```bash
cd backend
pnpx supabase db push
```

**Option 2: Migration-Based (Production)**
```bash
# Create migration from schema changes
pnpx supabase db diff --schema public --file migration_name

# Review the generated SQL file
# Apply to production
pnpx supabase migration up --db-url "postgresql://postgres:[password]@[host]:[port]/postgres"
```

**Option 3: Manual SQL in Supabase Dashboard**
- Copy SQL from migration files
- Run in Supabase SQL Editor
- Useful for quick fixes or complex migrations

## API Endpoints

### tRPC Routes

- `health` - Health check
- `videos.list` - Get all videos
- `videos.get` - Get single video by ID
- `videos.create` - Create new video entry
- `videos.update` - Update video (transcript/summary)
- `channels.list` - List monitored channels
- `channels.add` - Add new channel to monitor

### Example Usage

```typescript
// Frontend tRPC client usage
const videos = await trpc.videos.list.query()
const video = await trpc.videos.get.query({ id: 'video-id' })
```

## Authentication

The application uses Supabase Auth with magic link email authentication:

- **Login**: Magic link sent to email
- **Session Management**: Automatic via Supabase cookies
- **Protected Routes**: Middleware redirects unauthenticated users
- **Row Level Security**: Database policies enforce user access

## Troubleshooting

### Common Issues

1. **Docker not running:**
   ```bash
   # Start Docker Desktop, then:
   pnpx supabase start
   ```

2. **Port conflicts:**
   ```bash
   # Check what's using the port
   lsof -i :3001
   # Kill the process or change PORT in .env
   ```

3. **Database connection issues:**
   ```bash
   # Check Supabase status
   pnpx supabase status
   # Restart if needed
   pnpx supabase stop && pnpx supabase start
   ```

4. **Migration errors:**
   ```bash
   # Reset local database
   pnpx supabase db reset
   ```

### Development Scripts

**Backend:**
```bash
pnpm run build        # Compile TypeScript
pnpm run start        # Start production server
pnpx ts-node src/index.ts  # Start development server
```

**Frontend:**
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
```

## Contributing

1. Create feature branch
2. Make changes with tests
3. Run linting: `npm run lint` (frontend) or `pnpm run lint` (backend)
4. Test locally with all services running
5. Submit pull request

## License

[Your License Here]