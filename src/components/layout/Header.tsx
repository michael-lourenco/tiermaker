'use client'

import Link from 'next/link'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import { ThemeToggle } from '@/components/theme/theme-toggle'
import { LanguageSelector } from '@/components/language/language-selector'
import { useTranslation } from '@/hooks/useTranslation'

export function Header() {
  const { user, loading, signOut } = useAuth()
  const router = useRouter()
  const { t } = useTranslation()

  const handleSignOut = async () => {
    await signOut()
    router.push('/')
    router.refresh()
  }

  return (
    <header className="border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="text-2xl font-bold">
            {t('common.appName')}
          </Link>

          <nav className="flex items-center gap-4">
            <Link href="/categories" className="text-sm font-medium hover:text-primary">
              {t('nav.categories')}
            </Link>
            <Link href="/templates" className="text-sm font-medium hover:text-primary">
              {t('nav.templates')}
            </Link>

            <LanguageSelector />
            <ThemeToggle />

            {loading ? (
              <div className="w-20 h-8 bg-muted animate-pulse rounded" />
            ) : user ? (
              <>
                <Link href="/create-template">
                  <Button size="sm">{t('nav.createTemplate')}</Button>
                </Link>
                <Link href="/my-tier-lists">
                  <Button variant="ghost" size="sm">
                    {t('nav.myTierLists')}
                  </Button>
                </Link>
                <Button variant="ghost" size="sm" onClick={handleSignOut}>
                  {t('nav.signOut')}
                </Button>
              </>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="ghost" size="sm">
                    {t('nav.signIn')}
                  </Button>
                </Link>
                <Link href="/register">
                  <Button size="sm">{t('nav.signUp')}</Button>
                </Link>
              </>
            )}
          </nav>
        </div>
      </div>
    </header>
  )
}

