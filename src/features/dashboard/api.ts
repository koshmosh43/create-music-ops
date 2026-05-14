import { gql } from 'graphql-request'
import type { OpsSnapshot } from '../../types'
import { opsSnapshotSchema } from './schema'

export const OPS_SNAPSHOT_QUERY = gql`
  query OpsSnapshot($window: RoyaltyWindow!) {
    opsSnapshot(window: $window) {
      generatedAt
      metrics {
        monthlyStreams
        royaltyForecast
        claimQueue
        payoutReadiness
      }
      territories {
        market
        streams
        revenue
      }
      releases {
        id
        artist
        title
        dsp
        status
        streams
        revenue
        risk
      }
      insights
    }
  }
`

const snapshot: OpsSnapshot = {
  generatedAt: '2026-05-13T22:00:00.000Z',
  metrics: {
    monthlyStreams: 15_420_000_000,
    royaltyForecast: 18_760_000,
    claimQueue: 142,
    payoutReadiness: 92,
  },
  territories: [
    { market: 'US', streams: 6_300_000_000, revenue: 8_240_000 },
    { market: 'BR', streams: 2_100_000_000, revenue: 1_720_000 },
    { market: 'MX', streams: 1_760_000_000, revenue: 1_240_000 },
    { market: 'UK', streams: 1_410_000_000, revenue: 2_310_000 },
    { market: 'DE', streams: 980_000_000, revenue: 1_520_000 },
    { market: 'PH', streams: 870_000_000, revenue: 640_000 },
  ],
  releases: [
    { id: 'LE-2104', artist: 'Nova Vale', title: 'Midnight Split', dsp: 'Spotify', status: 'Live', streams: 482_400_000, revenue: 612_000, risk: 8 },
    { id: 'LE-2103', artist: 'Nova Vale', title: 'Broken Halo', dsp: 'Apple Music', status: 'Live', streams: 210_800_000, revenue: 348_000, risk: 5 },
    { id: 'LE-2098', artist: 'The Aster Kids', title: 'City Static', dsp: 'TikTok', status: 'Review', streams: 198_100_000, revenue: 134_000, risk: 42 },
    { id: 'LE-2097', artist: 'The Aster Kids', title: 'Neon Drift', dsp: 'Spotify', status: 'Live', streams: 174_600_000, revenue: 221_000, risk: 14 },
    { id: 'LE-2093', artist: 'Daya Reyes', title: 'Fuego Lento', dsp: 'Spotify', status: 'Live', streams: 156_200_000, revenue: 198_000, risk: 11 },
    { id: 'LE-2091', artist: 'Kaz Mori', title: 'Paper Crane', dsp: 'YouTube', status: 'Live', streams: 142_300_000, revenue: 118_000, risk: 22 },
    { id: 'LE-2087', artist: 'Mika Sol', title: 'Blue Signal', dsp: 'Apple Music', status: 'Live', streams: 116_700_000, revenue: 244_000, risk: 12 },
    { id: 'LE-2084', artist: 'Velvet Haze', title: 'Slow Burn', dsp: 'TikTok', status: 'Flagged', streams: 108_400_000, revenue: 72_000, risk: 65 },
    { id: 'LE-2079', artist: 'Kaz Mori', title: 'Glitch Garden', dsp: 'YouTube', status: 'Review', streams: 94_100_000, revenue: 81_000, risk: 38 },
    { id: 'LE-2071', artist: 'Yara North', title: 'Rightside', dsp: 'YouTube', status: 'Flagged', streams: 88_900_000, revenue: 76_000, risk: 78 },
    { id: 'LE-2068', artist: 'Low Orbit', title: 'Atlas Room', dsp: 'Amazon', status: 'Live', streams: 64_200_000, revenue: 102_000, risk: 18 },
    { id: 'LE-2065', artist: 'Daya Reyes', title: 'Coral Sky', dsp: 'Apple Music', status: 'Live', streams: 58_900_000, revenue: 96_000, risk: 9 },
    { id: 'LE-2061', artist: 'Velvet Haze', title: 'Daybreak', dsp: 'Amazon', status: 'Review', streams: 41_200_000, revenue: 54_000, risk: 31 },
    { id: 'LE-2058', artist: 'Low Orbit', title: 'Vapor Trail', dsp: 'TikTok', status: 'Live', streams: 36_800_000, revenue: 28_000, risk: 16 },
  ],
  insights: [
    'YouTube claims above 70 risk should be cleared before Friday payout export.',
    'Brazil is outperforming forecast by 18%; prioritize localized release notes.',
    'TikTok velocity suggests a playlisting opportunity for The Aster Kids within 48h.',
  ],
}

export async function fetchOpsSnapshot() {
  await new Promise((resolve) => window.setTimeout(resolve, 240))
  return opsSnapshotSchema.parse(snapshot)
}
