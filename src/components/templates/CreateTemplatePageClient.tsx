'use client'

import { CreateTemplateForm } from '@/components/templates/CreateTemplateForm'
import { useTranslation } from '@/hooks/useTranslation'
import { PageWithSidebar } from '@/components/layout/PageWithSidebar'

export function CreateTemplatePageClient() {
  const { t } = useTranslation()

  return (
    <main className="min-h-screen p-4 sm:p-6 md:p-8">
      <PageWithSidebar showRightSidebar={true}>
        <div className="mb-6 md:mb-8">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2">{t('nav.createTemplate')}</h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            {t('createTemplate.subtitle')}
          </p>
        </div>
        <CreateTemplateForm />
      </PageWithSidebar>
    </main>
  )
}

