export const DEFAULT_TIERS = ['S', 'A', 'B', 'C', 'D', 'F'] as const

export const TIER_COLORS: Record<string, string> = {
  S: '#FF6B6B',
  A: '#4ECDC4',
  B: '#45B7D1',
  C: '#FFA07A',
  D: '#98D8C8',
  F: '#F7DC6F',
}

export type TierName = typeof DEFAULT_TIERS[number]


