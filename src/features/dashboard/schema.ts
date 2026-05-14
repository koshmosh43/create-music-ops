import { z } from 'zod'
import type { DSP, OpsSnapshot, Release, ReleaseStatus } from '../../types'

const territorySchema = z.object({
  market: z.string(),
  streams: z.number(),
  revenue: z.number(),
})

const releaseSchema = z.object({
  id: z.string(),
  artist: z.string(),
  title: z.string(),
  dsp: z.enum(['Spotify', 'Apple Music', 'YouTube', 'TikTok', 'Amazon'] satisfies DSP[]),
  status: z.enum(['Live', 'Flagged', 'Review'] satisfies ReleaseStatus[]),
  streams: z.number(),
  revenue: z.number(),
  risk: z.number().min(0).max(100),
})

export const opsSnapshotSchema = z.object({
  generatedAt: z.string(),
  metrics: z.object({
    monthlyStreams: z.number(),
    royaltyForecast: z.number(),
    claimQueue: z.number(),
    payoutReadiness: z.number(),
  }),
  territories: z.array(territorySchema),
  releases: z.array(releaseSchema),
  insights: z.array(z.string()),
}) satisfies z.ZodType<OpsSnapshot>

export type { Release, OpsSnapshot }
