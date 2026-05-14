export interface Territory {
  market: string
  streams: number
  revenue: number
}

export interface Metrics {
  monthlyStreams: number
  royaltyForecast: number
  claimQueue: number
  payoutReadiness: number
}

export type DSP = 'Spotify' | 'Apple Music' | 'YouTube' | 'TikTok' | 'Amazon'
export type ReleaseStatus = 'Live' | 'Flagged' | 'Review'

export interface Release {
  id: string
  artist: string
  title: string
  dsp: DSP
  status: ReleaseStatus
  streams: number
  revenue: number
  risk: number
}

export interface OpsSnapshot {
  generatedAt: string
  metrics: Metrics
  territories: Territory[]
  releases: Release[]
  insights: string[]
}

export interface DspShareItem {
  name: string
  pct: number
}