import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { isAdmin } from '@/lib/utils/admin'
import { AdminCategoriesPageClient } from '@/components/admin/AdminCategoriesPageClient'
import { CategoryService } from '@/services/category.service'

export default async function AdminCategoriesPage() {
  const supabase = await createClient()
  
  // Check if user is authenticated
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  // Check if user is admin
  const admin = await isAdmin(supabase)
  if (!admin) {
    redirect('/')
  }

  // Load categories
  const categoryService = new CategoryService()
  const categories = await categoryService.getAllCategories()

  return <AdminCategoriesPageClient categories={categories} />
}

