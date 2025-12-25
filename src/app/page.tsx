import { TemplateService } from '@/services/template.service'
import type { TemplateWithCategories } from '@/types/template.types'
import { HomePageClient } from '@/components/home/HomePageClient'

export default async function HomePage() {
  const templateService = new TemplateService()
  let popularTemplates: Array<TemplateWithCategories> = []
  
  try {
    popularTemplates = await templateService.getPublicTemplates({ limit: 6 })
  } catch (error) {
    // If templates table doesn't exist or there's an error, show empty state
    console.error('Error loading templates:', error)
  }

  return <HomePageClient templates={popularTemplates} />
}
