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
import { Menu, X, ChevronDown } from 'lucide-react'
import { useState, useEffect } from 'react'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils/cn'
import { isAdminEmail } from '@/lib/utils/admin'
import { useSubscription } from '@/hooks/useSubscription'
import { Badge } from '@/components/ui/badge'
import { Crown } from 'lucide-react'

export function Header() {
  const { user, loading, signOut } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const { t } = useTranslation()
  const { theme } = useTheme()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const { isPremium } = useSubscription()

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
    if (path === '/my-templates' || path === '/my-tier-lists' || path === '/admin/categories' || path === '/admin/ads') {
      return pathname === path
    }
    // Starts with for general routes like /categories, /templates, /admin
    return pathname.startsWith(path)
  }

  const navLinks = [
    { href: '/categories', label: t('nav.categories') },
    { href: '/templates', label: t('nav.templates') },
  ]

  const isAdmin = user && isAdminEmail(user.email || null)

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
            ) : user ? (
              <>
                {/* Criar Template Button */}
                <Link href="/create-template">
                  <Button variant="default" size="sm">
                    {t('nav.createTemplate')}
                  </Button>
                </Link>

                {/* Meus Conteúdos Dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className={cn(
                        (isActive('/my-templates') || isActive('/my-tier-lists')) && 
                        'bg-primary/10 text-primary font-semibold hover:bg-primary/20'
                      )}
                    >
                      Meus Conteúdos
                      {isPremium && (
                        <Badge className="ml-2 bg-primary text-primary-foreground h-4 px-1.5 text-[10px]">
                          <Crown className="h-2.5 w-2.5 mr-0.5" />
                          Premium
                        </Badge>
                      )}
                      <ChevronDown className="ml-1 h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem asChild>
                      <Link 
                        href="/profile"
                        className={cn(
                          'w-full cursor-pointer',
                          isActive('/profile') && 'bg-primary/10 text-primary font-semibold'
                        )}
                      >
                        {t('profile.title') || 'Profile'}
                        {isPremium && (
                          <Badge className="ml-2 bg-primary text-primary-foreground h-4 px-1.5 text-[10px]">
                            <Crown className="h-2.5 w-2.5 mr-0.5" />
                            Premium
                          </Badge>
                        )}
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link 
                        href="/account/subscription"
                        className="w-full cursor-pointer"
                      >
                        Minha Assinatura
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link 
                        href="/my-templates"
                        className={cn(
                          'w-full cursor-pointer',
                          isActive('/my-templates') && 'bg-primary/10 text-primary font-semibold'
                        )}
                      >
                        {t('nav.myTemplates') || 'Meus Templates'}
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link 
                        href="/my-tier-lists"
                        className={cn(
                          'w-full cursor-pointer',
                          isActive('/my-tier-lists') && 'bg-primary/10 text-primary font-semibold'
                        )}
                      >
                        {t('nav.myTierLists')}
                      </Link>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* Admin Dropdown (only for admin) */}
                {isAdmin && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        className={cn(
                          (isActive('/admin/categories') || isActive('/admin/ads')) && 
                          'bg-primary/10 text-primary font-semibold hover:bg-primary/20'
                        )}
                      >
                        Admin
                        <ChevronDown className="ml-1 h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link 
                          href="/admin/categories"
                          className={cn(
                            'w-full cursor-pointer',
                            isActive('/admin/categories') && 'bg-primary/10 text-primary font-semibold'
                          )}
                        >
                          Categorias
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link 
                          href="/admin/ads"
                          className={cn(
                            'w-full cursor-pointer',
                            isActive('/admin/ads') && 'bg-primary/10 text-primary font-semibold'
                          )}
                        >
                          Publicidades
                        </Link>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}

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
                  <Button variant="default" size="sm">
                    {t('nav.signUp')}
                  </Button>
                </Link>
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
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                          {t('nav.myAccount') || 'My Account'}
                        </h3>
                        {isPremium && (
                          <Badge className="bg-primary text-primary-foreground h-5 px-2 text-xs">
                            <Crown className="h-3 w-3 mr-1" />
                            Premium
                          </Badge>
                        )}
                      </div>
                      
                      {/* Perfil */}
                      <Link
                        href="/profile"
                        className={cn(
                          'block px-3 py-2 rounded-md text-sm font-medium transition-all duration-200',
                          isActive('/profile')
                            ? 'bg-primary/10 text-primary font-semibold'
                            : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                        )}
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        {t('profile.title') || 'Profile'}
                      </Link>
                      
                      {/* Assinatura */}
                      <Link
                        href="/account/subscription"
                        className={cn(
                          'block px-3 py-2 rounded-md text-sm font-medium transition-all duration-200',
                          isActive('/account/subscription')
                            ? 'bg-primary/10 text-primary font-semibold'
                            : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                        )}
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        Minha Assinatura
                      </Link>
                      
                      {/* Criar Template */}
                      <Link
                        href="/create-template"
                        className={cn(
                          'block px-3 py-2 rounded-md text-sm font-medium transition-all duration-200',
                          'bg-primary text-primary-foreground hover:bg-primary/90'
                        )}
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        {t('nav.createTemplate')}
                      </Link>

                      {/* Meus Conteúdos */}
                      <div className="space-y-1 pl-3 border-l-2 border-muted">
                        <h4 className="text-xs font-medium text-muted-foreground px-2 py-1">
                          Meus Conteúdos
                        </h4>
                        <Link
                          href="/my-templates"
                          className={cn(
                            'block px-3 py-2 rounded-md text-sm font-medium transition-all duration-200',
                            isActive('/my-templates')
                              ? 'bg-primary/10 text-primary font-semibold'
                              : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                          )}
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          {t('nav.myTemplates') || 'Meus Templates'}
                        </Link>
                        <Link
                          href="/my-tier-lists"
                          className={cn(
                            'block px-3 py-2 rounded-md text-sm font-medium transition-all duration-200',
                            isActive('/my-tier-lists')
                              ? 'bg-primary/10 text-primary font-semibold'
                              : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                          )}
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          {t('nav.myTierLists')}
                        </Link>
                      </div>

                      {/* Admin (only for admin) */}
                      {isAdmin && (
                        <div className="space-y-1 pl-3 border-l-2 border-muted">
                          <h4 className="text-xs font-medium text-muted-foreground px-2 py-1">
                            Admin
                          </h4>
                          <Link
                            href="/admin/categories"
                            className={cn(
                              'block px-3 py-2 rounded-md text-sm font-medium transition-all duration-200',
                              isActive('/admin/categories')
                                ? 'bg-primary/10 text-primary font-semibold'
                                : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                            )}
                            onClick={() => setMobileMenuOpen(false)}
                          >
                            Categorias
                          </Link>
                          <Link
                            href="/admin/ads"
                            className={cn(
                              'block px-3 py-2 rounded-md text-sm font-medium transition-all duration-200',
                              isActive('/admin/ads')
                                ? 'bg-primary/10 text-primary font-semibold'
                                : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                            )}
                            onClick={() => setMobileMenuOpen(false)}
                          >
                            Publicidades
                          </Link>
                        </div>
                      )}

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
                      <Link
                        href="/login"
                        className="block px-3 py-2 rounded-md text-sm font-medium transition-colors text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        {t('nav.signIn')}
                      </Link>
                      <Link
                        href="/register"
                        className="block px-3 py-2 rounded-md text-sm font-medium transition-colors bg-primary text-primary-foreground hover:bg-primary/90"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        {t('nav.signUp')}
                      </Link>
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

