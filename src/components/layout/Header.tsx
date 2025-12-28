'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import { ThemeToggle } from '@/components/theme/theme-toggle'
import { LanguageSelector } from '@/components/language/language-selector'
import { useTranslation } from '@/hooks/useTranslation'
import { useTheme } from 'next-themes'
import { Menu, X } from 'lucide-react'
import { useState, useEffect } from 'react'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { cn } from '@/lib/utils/cn'
import { isAdminEmail } from '@/lib/utils/admin'

export function Header() {
  const { user, loading, signOut } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const { t } = useTranslation()
  const { theme } = useTheme()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [mounted, setMounted] = useState(false)

  // Avoid hydration mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  const handleSignOut = async () => {
    await signOut()
    setMobileMenuOpen(false)
    router.push('/')
    router.refresh()
  }

  const isActive = (path: string) => {
    if (path === '/') {
      return pathname === '/'
    }
    // Exact match for specific routes
    if (path === '/my-templates' || path === '/my-tier-lists' || path === '/admin/categories') {
      return pathname === path
    }
    // Starts with for general routes like /categories, /templates
    return pathname.startsWith(path)
  }

  const navLinks = [
    { href: '/categories', label: t('nav.categories') },
    { href: '/templates', label: t('nav.templates') },
  ]

  const isAdmin = user && isAdminEmail(user.email || null)
  
  const userLinks = user
    ? [
        { href: '/create-template', label: t('nav.createTemplate'), variant: 'default' as const },
        { href: '/my-templates', label: t('nav.myTemplates') || 'My Templates', variant: 'ghost' as const },
        { href: '/my-tier-lists', label: t('nav.myTierLists'), variant: 'ghost' as const },
        ...(isAdmin ? [
          { href: '/admin/categories', label: 'Categorias', variant: 'ghost' as const },
          { href: '/admin/ads', label: 'Publicidades', variant: 'ghost' as const },
        ] : []),
      ]
    : [
        { href: '/login', label: t('nav.signIn'), variant: 'ghost' as const },
        { href: '/register', label: t('nav.signUp'), variant: 'default' as const },
      ]

  const NavLink = ({ href, label, className }: { href: string; label: string; className?: string }) => (
    <Link
      href={href}
      className={cn(
        'relative text-sm font-medium transition-all duration-200 rounded-md px-3 py-2',
        isActive(href)
          ? 'bg-primary/10 text-primary font-semibold'
          : 'text-muted-foreground hover:text-foreground hover:bg-accent',
        className
      )}
      onClick={() => setMobileMenuOpen(false)}
    >
      {label}
    </Link>
  )

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <Image
              src="/logo.png"
              alt="SuperTierMaker Logo"
              width={32}
              height={32}
              className="object-contain"
            />
            {mounted && (
              <Image
                src={theme === 'dark' ? '/logo_texto_white.png' : '/logo_texto_black.png'}
                alt="SuperTierMaker"
                width={180}
                height={32}
                className="hidden sm:block object-contain h-8 w-auto"
                priority
              />
            )}
            {!mounted && (
              <span className="hidden sm:inline text-2xl font-bold">{t('common.appName')}</span>
            )}
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <NavLink key={link.href} href={link.href} label={link.label} />
            ))}

            <div className="flex items-center gap-2 ml-2 pl-4 border-l">
              <LanguageSelector />
              <ThemeToggle />
            </div>

            {loading ? (
              <div className="w-20 h-8 bg-muted animate-pulse rounded" />
            ) : (
              <>
                {userLinks.map((link) => (
                  <Link key={link.href} href={link.href}>
                    <Button 
                      variant={isActive(link.href) ? 'secondary' : link.variant} 
                      size="sm"
                      className={cn(
                        isActive(link.href) && 'bg-primary/10 text-primary font-semibold hover:bg-primary/20'
                      )}
                    >
                      {link.label}
                    </Button>
                  </Link>
                ))}
                {user && (
                  <Button variant="ghost" size="sm" onClick={handleSignOut}>
                    {t('nav.signOut')}
                  </Button>
                )}
              </>
            )}
          </nav>

          {/* Mobile Menu */}
          <div className="flex items-center gap-2 md:hidden">
            <LanguageSelector />
            <ThemeToggle />
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm" className="md:hidden">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">{t('nav.openMenu') || 'Open menu'}</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                <SheetHeader>
                  <SheetTitle className="flex items-center gap-3">
                    <Image
                      src="/logo.png"
                      alt="SuperTierMaker Logo"
                      width={24}
                      height={24}
                      className="object-contain"
                    />
                    {mounted ? (
                      <Image
                        src={theme === 'dark' ? '/logo_texto_white.png' : '/logo_texto_black.png'}
                        alt="SuperTierMaker"
                        width={150}
                        height={24}
                        className="object-contain h-6 w-auto"
                        priority
                      />
                    ) : (
                      <span>{t('common.appName')}</span>
                    )}
                  </SheetTitle>
                  <SheetDescription>
                    {t('nav.menuDescription') || 'Navigation menu'}
                  </SheetDescription>
                </SheetHeader>
                <nav className="flex flex-col gap-4 mt-6">
                  {/* Main Navigation */}
                  <div className="space-y-2">
                    <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      {t('nav.browse') || 'Browse'}
                    </h3>
                    {navLinks.map((link) => (
                      <Link
                        key={link.href}
                        href={link.href}
                        className={cn(
                          'block px-3 py-2 rounded-md text-sm font-medium transition-all duration-200',
                          isActive(link.href)
                            ? 'bg-primary/10 text-primary font-semibold'
                            : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                        )}
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        {link.label}
                      </Link>
                    ))}
                  </div>

                  {/* User Section */}
                  {loading ? (
                    <div className="w-full h-8 bg-muted animate-pulse rounded" />
                  ) : user ? (
                    <div className="space-y-2 border-t pt-4">
                      <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        {t('nav.myAccount') || 'My Account'}
                      </h3>
                      {userLinks.map((link) => (
                        <Link
                          key={link.href}
                          href={link.href}
                          className={cn(
                            'block px-3 py-2 rounded-md text-sm font-medium transition-all duration-200',
                            isActive(link.href)
                              ? 'bg-primary/10 text-primary font-semibold'
                              : link.variant === 'default'
                              ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                              : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                          )}
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          {link.label}
                        </Link>
                      ))}
                      <Button
                        variant="ghost"
                        className="w-full justify-start px-3 py-2 h-auto text-sm font-medium"
                        onClick={handleSignOut}
                      >
                        {t('nav.signOut')}
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-2 border-t pt-4">
                      <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        {t('nav.account') || 'Account'}
                      </h3>
                      {userLinks.map((link) => (
                        <Link
                          key={link.href}
                          href={link.href}
                          className={cn(
                            'block px-3 py-2 rounded-md text-sm font-medium transition-colors',
                            link.variant === 'default'
                              ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                              : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                          )}
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          {link.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  )
}

