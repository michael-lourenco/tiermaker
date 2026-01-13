'use client'

import { useState, useEffect } from 'react'
import { PageWithSidebar } from '@/components/layout/PageWithSidebar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { useTranslation } from '@/hooks/useTranslation'
import { useLanguage } from '@/hooks/useLanguage'

export function BetaPageClient() {
  const { t } = useTranslation()
  const { language } = useLanguage()
  const [lastUpdated, setLastUpdated] = useState<string>('')

  useEffect(() => {
    // Avoid hydration mismatch by setting date only on client
    const locale = language === 'pt' ? 'pt-BR' : 'en-US'
    setLastUpdated(new Date().toLocaleDateString(locale, {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    }))
  }, [language])

  return (
    <main className="min-h-screen p-4 sm:p-6 md:p-8">
      <PageWithSidebar showRightSidebar={true}>
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3 flex-wrap">
              <CardTitle className="text-2xl sm:text-3xl md:text-4xl font-bold">
                {t('beta.title')}
              </CardTitle>
              <Badge className="bg-[#F5F5DC] text-black border-[#E0E0C0] font-semibold text-lg px-3 py-1">
                BETA
              </Badge>
            </div>
            {lastUpdated && (
              <p className="text-sm text-muted-foreground mt-2">
                {t('beta.lastUpdated')}: {lastUpdated}
              </p>
            )}
          </CardHeader>
          <CardContent className="prose prose-slate dark:prose-invert max-w-none">
            <div className="space-y-6">
              <section>
                <h2 className="text-xl font-semibold mb-3">{t('beta.whatIsBetaTitle')}</h2>
                <p 
                  className="text-muted-foreground"
                  dangerouslySetInnerHTML={{ __html: t('beta.whatIsBetaDescription') }}
                />
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">{t('beta.whyBetaTitle')}</h2>
                <p className="text-muted-foreground mb-3">
                  {t('beta.whyBetaDescription')}
                </p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                  <li>{t('beta.whyBetaReasons.collectFeedback')}</li>
                  <li>{t('beta.whyBetaReasons.testRealConditions')}</li>
                  <li>{t('beta.whyBetaReasons.developFeatures')}</li>
                  <li>{t('beta.whyBetaReasons.ensureStability')}</li>
                  <li>{t('beta.whyBetaReasons.optimizeExperience')}</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">{t('beta.whatToExpectTitle')}</h2>
                <p className="text-muted-foreground mb-3">
                  {t('beta.whatToExpectDescription')}
                </p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                  <li>{t('beta.whatToExpectItems.completeFeatures')}</li>
                  <li>{t('beta.whatToExpectItems.continuousImprovements')}</li>
                  <li>{t('beta.whatToExpectItems.possibleInstabilities')}</li>
                  <li>{t('beta.whatToExpectItems.activeSupport')}</li>
                  <li>{t('beta.whatToExpectItems.newFeatures')}</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">{t('beta.howToHelpTitle')}</h2>
                <p className="text-muted-foreground mb-3">
                  {t('beta.howToHelpDescription')}
                </p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                  <li>{t('beta.howToHelpItems.usePlatform')}</li>
                  <li>{t('beta.howToHelpItems.reportProblems')}</li>
                  <li>{t('beta.howToHelpItems.shareFeedback')}</li>
                  <li>{t('beta.howToHelpItems.bePatient')}</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">{t('beta.whenFinalTitle')}</h2>
                <p className="text-muted-foreground">
                  {t('beta.whenFinalDescription')}
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">{t('beta.gratitudeTitle')}</h2>
                <p className="text-muted-foreground">
                  {t('beta.gratitudeDescription')}
                </p>
              </section>

              <section className="pt-4 border-t">
                <div className="flex gap-3 flex-wrap">
                  <Link href="/">
                    <Button variant="default">
                      {t('beta.backToHome')}
                    </Button>
                  </Link>
                  <Link href="/create-template">
                    <Button variant="outline">
                      {t('nav.createTemplate')}
                    </Button>
                  </Link>
                </div>
              </section>
            </div>
          </CardContent>
        </Card>
      </PageWithSidebar>
    </main>
  )
}
