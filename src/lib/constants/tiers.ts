export const DEFAULT_TIERS = ['S', 'A', 'B', 'C', 'D'] as const

export const TIER_COLORS: Record<string, string> = {
  S: '#FF0000', // RGB: 255-0-0 (vermelho)
  A: '#FFAF00', // RGB: 255-175-0 (laranja/amarelo)
  B: '#FFFF00', // RGB: 255-255-0 (amarelo)
  C: '#00FF00', // RGB: 0-255-0 (verde)
  D: '#00FFFF', // RGB: 0-255-255 (ciano)
}

export type TierName = typeof DEFAULT_TIERS[number]


