/**
 * Admin utilities
 */

const ADMIN_EMAIL = 'kontempler@gmail.com'

/**
 * Check if a user email is an admin
 */
export function isAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false
  return email.toLowerCase() === ADMIN_EMAIL.toLowerCase()
}

/**
 * Check if current user is admin (server-side)
 */
export async function isAdmin(supabase: any): Promise<boolean> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || !user.email) return false
  return isAdminEmail(user.email)
}


