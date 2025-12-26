'use client'

import { EditTemplateForm } from '@/components/templates/EditTemplateForm'
import { useTranslation } from '@/hooks/useTranslation'
import type { TemplateWithItemsAndCategories } from '@/types/template.types'

interface EditTemplatePageClientProps {
  template: TemplateWithItemsAndCategories
}

export function EditTemplatePageClient({ template }: EditTemplatePageClientProps) {
  const { t } = useTranslation()

  return (
    <main className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">{t('templates.editTemplate') || 'Edit Template'}</h1>
          <p className="text-muted-foreground">
            {t('templates.editTemplateDescription') || 'Update your template information and items'}
          </p>
        </div>
        <EditTemplateForm template={template} />
      </div>
    </main>
  )
}

