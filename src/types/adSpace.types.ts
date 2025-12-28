export type AdSpaceDeviceType = 'all' | 'desktop' | 'mobile'
export type AdSpaceType = 'manual' | 'google'

export interface AdSpace {
  id: string
  name: string
  position: string
  device_type: AdSpaceDeviceType
  ad_type: AdSpaceType
  
  // Para publicidades manuais
  manual_image_url: string | null
  manual_link_url: string | null
  manual_alt_text: string | null
  
  // Para publicidades do Google
  google_ad_client: string | null
  google_ad_slot: string | null
  google_ad_format: string | null
  
  is_active: boolean
  priority: number
  created_at: string
  updated_at: string
}

export interface CreateAdSpaceInput {
  name: string
  position: string
  device_type?: AdSpaceDeviceType
  ad_type: AdSpaceType
  
  // Para publicidades manuais
  manual_image_url?: string | null
  manual_link_url?: string | null
  manual_alt_text?: string | null
  
  // Para publicidades do Google
  google_ad_client?: string | null
  google_ad_slot?: string | null
  google_ad_format?: string | null
  
  is_active?: boolean
  priority?: number
}

export interface UpdateAdSpaceInput {
  name?: string
  position?: string
  device_type?: AdSpaceDeviceType
  ad_type?: AdSpaceType
  
  // Para publicidades manuais
  manual_image_url?: string | null
  manual_link_url?: string | null
  manual_alt_text?: string | null
  
  // Para publicidades do Google
  google_ad_client?: string | null
  google_ad_slot?: string | null
  google_ad_format?: string | null
  
  is_active?: boolean
  priority?: number
}

