import { initTRPC } from '@trpc/server'
import { z } from 'zod'

const t = initTRPC.create()

export const appRouter = t.router({
  // Health check procedure
  health: t.procedure.query(() => {
    return { status: 'ok', timestamp: new Date().toISOString() }
  }),

  // Video-related procedures
  videos: t.router({
    // List all videos
    list: t.procedure.query(() => {
      // TODO: Integrate with Supabase to fetch videos
      return { videos: [] }
    }),

    // Get single video by ID
    get: t.procedure
      .input(z.object({ id: z.string() }))
      .query(({ input }) => {
        // TODO: Fetch single video from Supabase
        return { video: null, id: input.id }
      }),

    // Create new video entry
    create: t.procedure
      .input(z.object({ 
        youtubeId: z.string(),
        title: z.string().optional(),
        channelId: z.string().optional()
      }))
      .mutation(({ input }) => {
        // TODO: Add video to processing queue
        return { success: true, youtubeId: input.youtubeId }
      }),

    // Update video (mainly for adding transcript/summary)
    update: t.procedure
      .input(z.object({
        id: z.string(),
        transcript: z.string().optional(),
        summary: z.string().optional()
      }))
      .mutation(({ input }) => {
        // TODO: Update video in Supabase
        return { success: true, id: input.id }
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