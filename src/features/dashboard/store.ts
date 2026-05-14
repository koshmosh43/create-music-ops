import { create } from 'zustand'
import type { DSP } from '../../types'

export type DspFilter = DSP | 'All'

interface DashboardState {
  dsp: DspFilter
  setDsp: (dsp: DspFilter) => void
  cmdkOpen: boolean
  openCmdk: () => void
  closeCmdk: () => void
}

export const useDashboardStore = create<DashboardState>((set) => ({
  dsp: 'All',
  setDsp: (dsp) => set({ dsp }),
  cmdkOpen: false,
  openCmdk: () => set({ cmdkOpen: true }),
  closeCmdk: () => set({ cmdkOpen: false }),
}))

export const dspOptions: DspFilter[] = ['All', 'Spotify', 'Apple Music', 'YouTube', 'TikTok', 'Amazon']
