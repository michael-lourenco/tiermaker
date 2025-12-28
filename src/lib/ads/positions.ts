/**
 * Configurações de posições de publicidade
 */

export type AdPosition =
  | 'header-top'
  | 'sidebar-left'
  | 'sidebar-right'
  | 'content-top'
  | 'content-middle'
  | 'content-bottom'
  | 'footer-top'
  | 'in-feed'
  | 'sticky-sidebar'

export interface AdPositionConfig {
  label: string
  description: string
  recommendedSizes: {
    desktop?: string[]
    mobile?: string[]
  }
  deviceType: 'all' | 'desktop' | 'mobile'
}

export const AD_POSITIONS: Record<AdPosition, AdPositionConfig> = {
  'header-top': {
    label: 'Topo do Header',
    description: 'Banner no topo da página, abaixo do header',
    recommendedSizes: {
      desktop: ['728x90', '970x250'],
      mobile: ['320x50', '320x100'],
    },
    deviceType: 'all',
  },
  'sidebar-left': {
    label: 'Sidebar Esquerda',
    description: 'Sidebar esquerda (apenas desktop)',
    recommendedSizes: {
      desktop: ['300x250', '300x600'],
    },
    deviceType: 'desktop',
  },
  'sidebar-right': {
    label: 'Sidebar Direita',
    description: 'Sidebar direita (apenas desktop)',
    recommendedSizes: {
      desktop: ['300x250', '300x600'],
    },
    deviceType: 'desktop',
  },
  'content-top': {
    label: 'Topo do Conteúdo',
    description: 'Antes do conteúdo principal',
    recommendedSizes: {
      desktop: ['728x90', '970x250'],
      mobile: ['320x50', '320x100'],
    },
    deviceType: 'all',
  },
  'content-middle': {
    label: 'Meio do Conteúdo',
    description: 'No meio do conteúdo principal',
    recommendedSizes: {
      desktop: ['728x90', '300x250'],
      mobile: ['320x50', '320x100'],
    },
    deviceType: 'all',
  },
  'content-bottom': {
    label: 'Final do Conteúdo',
    description: 'Após o conteúdo principal',
    recommendedSizes: {
      desktop: ['728x90', '970x250'],
      mobile: ['320x50', '320x100'],
    },
    deviceType: 'all',
  },
  'footer-top': {
    label: 'Acima do Footer',
    description: 'Antes do footer',
    recommendedSizes: {
      desktop: ['728x90', '970x250'],
      mobile: ['320x50', '320x100'],
    },
    deviceType: 'all',
  },
  'in-feed': {
    label: 'Entre Cards',
    description: 'Entre cards em listas (templates, tier lists)',
    recommendedSizes: {
      desktop: ['300x250', '728x90'],
      mobile: ['320x50', '320x100'],
    },
    deviceType: 'all',
  },
  'sticky-sidebar': {
    label: 'Sidebar Fixa',
    description: 'Sidebar fixa que acompanha o scroll (apenas desktop)',
    recommendedSizes: {
      desktop: ['300x250', '300x600'],
    },
    deviceType: 'desktop',
  },
}

/**
 * Get all position labels
 */
export function getAdPositionLabels(): Array<{ value: AdPosition; label: string }> {
  return Object.entries(AD_POSITIONS).map(([value, config]) => ({
    value: value as AdPosition,
    label: config.label,
  }))
}

/**
 * Get position config
 */
export function getAdPositionConfig(position: AdPosition): AdPositionConfig {
  return AD_POSITIONS[position]
}


