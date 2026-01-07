'use client'

import Link from 'next/link'
import { useTranslation } from '@/hooks/useTranslation'
import { AdSpace } from '@/components/ads/AdSpace'

export function Footer() {
  const { t } = useTranslation()

  return (
    <footer className="border-t bg-background mt-auto">
      {/* Ad Space - Footer Top */}
      <AdSpace position="footer-top" wrapperClassName="py-4" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="font-semibold mb-4">{t('common.appName')}</h3>
            <p className="text-sm text-muted-foreground">
              {t('footer.description') || 'Create, rank, and share tier lists for any topic'}
            </p>
          </div>
          
          <div>
            <h3 className="font-semibold mb-4">{t('footer.links') || 'Links'}</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/templates" className="text-muted-foreground hover:text-foreground transition-colors">
                  {t('nav.templates')}
                </Link>
              </li>
              <li>
                <Link href="/categories" className="text-muted-foreground hover:text-foreground transition-colors">
                  {t('nav.categories')}
                </Link>
              </li>
              <li>
                <Link href="/tierlists" className="text-muted-foreground hover:text-foreground transition-colors">
                  {t('nav.tierLists') || 'Tier Lists'}
                </Link>
              </li>
              <li>
                <Link href="/create-template" className="text-muted-foreground hover:text-foreground transition-colors">
                  {t('nav.createTemplate')}
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">{t('footer.legal') || 'Legal'}</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/privacy" className="text-muted-foreground hover:text-foreground transition-colors">
                  {t('footer.privacy') || 'Privacy Policy'}
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-muted-foreground hover:text-foreground transition-colors">
                  {t('footer.terms') || 'Terms of Service'}
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} {t('common.appName')}. {t('footer.rights') || 'All rights reserved.'}</p>
        </div>
      </div>
    </footer>
  )
}

