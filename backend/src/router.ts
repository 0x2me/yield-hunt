import { initTRPC } from '@trpc/server'
import { z } from 'zod'
import { supabase } from './lib/supabase'

const t = initTRPC.create()

export const appRouter = t.router({
  // Health check procedure
  health: t.procedure.query(() => {
    return { status: 'ok', timestamp: new Date().toISOString() }
  }),

  // Video-related procedures
  videos: t.router({
    // List all videos
    list: t.procedure.query(async () => {
      const { data: videos, error } = await supabase
        .from('videos')
        .select('*')
        .order('created_at', { ascending: false })
      
      if (error) throw error
      return { videos: videos || [] }
    }),

    // Get single video by ID
    get: t.procedure
      .input(z.object({ id: z.string() }))
      .query(async ({ input }) => {
        const { data: video, error } = await supabase
          .from('videos')
          .select('*')
          .eq('id', input.id)
          .single()
        
        if (error) throw error
        return { video }
      }),

    // Create new video entry
    create: t.procedure
      .input(z.object({ 
        youtubeId: z.string(),
        title: z.string(),
        publishedAt: z.string(),
      }))
      .mutation(async ({ input }) => {
        const { data: video, error } = await supabase
          .from('videos')
          .insert({
            youtube_id: input.youtubeId,
            title: input.title,
            published_at: input.publishedAt,
          })
          .select()
          .single()
        
        if (error) throw error
        return { success: true, video }
      }),

    // Update video (mainly for adding transcript/summary)
    update: t.procedure
      .input(z.object({
        id: z.string(),
        transcript: z.string().optional(),
        summary: z.string().optional()
      }))
      .mutation(async ({ input }) => {
        const updateData: any = {}
        if (input.transcript) updateData.transcript = input.transcript
        if (input.summary) updateData.summary = input.summary
        
        const { data: video, error } = await supabase
          .from('videos')
          .update(updateData)
          .eq('id', input.id)
          .select()
          .single()
        
        if (error) throw error
        return { success: true, video }
      })
  }),

  // Channel-related procedures
  channels: t.router({
    // List monitored channels
    list: t.procedure.query(() => {
      // TODO: Return list from config/channels.ts
      return { channels: [] }
    }),

    // Add new channel to monitor
    add: t.procedure
      .input(z.object({ 
        channelId: z.string(),
        name: z.string().optional()
      }))
      .mutation(({ input }) => {
        // TODO: Add channel to monitoring list
        return { success: true, channelId: input.channelId }
      })
  })
})

export type AppRouter = typeof appRouter