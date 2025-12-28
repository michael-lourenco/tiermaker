import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { isAdmin } from '@/lib/utils/admin'
import { AdminAdSpacesPageClient } from '@/components/admin/AdminAdSpacesPageClient'
import { AdSpaceService } from '@/services/adSpace.service'

export default async function AdminAdsPage() {
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

  // Load ad spaces
  const adSpaceService = new AdSpaceService()
  const adSpaces = await adSpaceService.getAllAdSpaces()

  return <AdminAdSpacesPageClient adSpaces={adSpaces} />
}


