'use client'

import { CreateTemplateForm } from '@/components/templates/CreateTemplateForm'
import { useTranslation } from '@/hooks/useTranslation'
import { PageWithSidebar } from '@/components/layout/PageWithSidebar'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

interface CreateTemplatePageClientProps {
  cloneFromId?: string
}

export function CreateTemplatePageClient({ cloneFromId }: CreateTemplatePageClientProps) {
  const { t } = useTranslation()
  const pageTooltip = cloneFromId?.trim()
    ? t('createTemplate.clonePageSubtitle')
    : t('createTemplate.pageSubtitle')

  return (
    <main className="min-h-screen p-2 sm:p-3 md:p-4">
      <TooltipProvider delayDuration={200}>
        <PageWithSidebar showRightSidebar={true}>
          <div className="mb-3 md:mb-4">
            <Tooltip>
              <TooltipTrigger asChild>
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold w-fit cursor-help">
                  {t('nav.createTemplate')}
                </h1>
              </TooltipTrigger>
              <TooltipContent side="bottom" align="start" className="max-w-sm text-left">
                <p>{pageTooltip}</p>
              </TooltipContent>
            </Tooltip>
          </div>
          <CreateTemplateForm initialCloneFromId={cloneFromId} />
        </PageWithSidebar>
      </TooltipProvider>
    </main>
  )
}
