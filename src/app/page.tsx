import { TemplateService } from '@/services/template.service'
import { CategoryService, type Category } from '@/services/category.service'
import type { TemplateWithCategories } from '@/types/template.types'
import { HomePageClient } from '@/components/home/HomePageClient'
import { createServiceRoleClient } from '@/lib/supabase/server'

export default async function HomePage() {
  const templateService = new TemplateService()
  // Use service role client to bypass RLS for counting tier lists
  // If service role key is not configured, fallback to regular client
  let categoryService: CategoryService
  try {
    const serviceRoleClient = createServiceRoleClient()
    categoryService = new CategoryService(serviceRoleClient)
  } catch (error) {
    console.warn('Service role key not configured, using regular client (RLS will apply):', error)
    categoryService = new CategoryService()
  }
  let popularTemplates: Array<TemplateWithCategories> = []
  let categoriesWithTierLists: Category[] = []
  
  try {
    popularTemplates = await templateService.getPublicTemplates({ limit: 6 })
  } catch (error) {
    // If templates table doesn't exist or there's an error, show empty state
    console.error('Error loading templates:', error)
  }

  try {
    categoriesWithTierLists = await categoryService.getCategoriesWithImageAndTierLists()
  } catch (error) {
    console.error('Error loading categories:', error)
  }

  return <HomePageClient templates={popularTemplates} categories={categoriesWithTierLists} />
}
