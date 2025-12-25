'use client'

import { CreateTemplateForm } from '@/components/templates/CreateTemplateForm'
import { useTranslation } from '@/hooks/useTranslation'

export function CreateTemplatePageClient() {
  const { t } = useTranslation()

  return (
    <main className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">{t('nav.createTemplate')}</h1>
          <p className="text-muted-foreground">
            {t('createTemplate.subtitle')}
          </p>
        </div>
        <CreateTemplateForm />
      </div>
    </main>
  )
}

