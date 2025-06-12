import { createClient } from '@supabase/supabase-js'
import 'dotenv/config'

const supabaseUrl = process.env.SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl) {
  throw new Error('SUPABASE_URL environment variable is required')
}
if (!supabaseServiceKey) {
  throw new Error('SUPABASE_SERVICE_ROLE_KEY environment variable is required')
}

export const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

export type Database = {
  public: {
    Tables: {
      videos: {
        Row: {
          id: string
          youtube_id: string
          title: string
          published_at: string
          transcript: string | null
          summary: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          youtube_id: string
          title: string
          published_at: string
          transcript?: string | null
          summary?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          youtube_id?: string
          title?: string
          published_at?: string
          transcript?: string | null
          summary?: string | null
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}