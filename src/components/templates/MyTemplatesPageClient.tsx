'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { useTranslation } from '@/hooks/useTranslation'
import { Pencil, Trash2, Eye, Archive, ArchiveRestore } from 'lucide-react'
import type { Template, TemplateWithCategories } from '@/types/template.types'
import { useState } from 'react'
import { TemplateService } from '@/services/template.service'
import { useAuth } from '@/hooks/useAuth'
import { useRouter } from 'next/navigation'
import { PageWithSidebar } from '@/components/layout/PageWithSidebar'

interface MyTemplatesPageClientProps {
  templates: Array<Template & { categories: Array<{ id: string; name: string; slug: string }>, deleted_at?: string | null }>
}

export function MyTemplatesPageClient({ templates: initialTemplates }: MyTemplatesPageClientProps) {
  const { t } = useTranslation()
  const { user } = useAuth()
  const router = useRouter()
  const [templates, setTemplates] = useState(initialTemplates)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [restoring, setRestoring] = useState<string | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [templateToDelete, setTemplateToDelete] = useState<{ id: string; name: string } | null>(null)
  const [deleteError, setDeleteError] = useState<string | null>(null)
  const [restoreError, setRestoreError] = useState<string | null>(null)

  const handleDeleteClick = (templateId: string, templateName: string) => {
    setTemplateToDelete({ id: templateId, name: templateName })
    setDeleteDialogOpen(true)
    setDeleteError(null)
  }

  const handleDeleteConfirm = async () => {
    if (!user || !templateToDelete) return

    setDeleting(templateToDelete.id)
    setDeleteError(null)
    
    try {
      const templateService = new TemplateService()
      const result = await templateService.deleteTemplate(templateToDelete.id, user.id)
      
      // Update template in list - if soft deleted, mark as archived
      if (result.softDeleted) {
        // Soft deleted - mark as archived in the list
        setTemplates(templates.map(t => 
          t.id === templateToDelete.id 
            ? { ...t, deleted_at: new Date().toISOString() }
            : t
        ))
      } else {
        // Hard deleted - remove from list
        setTemplates(templates.filter(t => t.id !== templateToDelete.id))
      }
      
      setDeleteDialogOpen(false)
      setTemplateToDelete(null)
      router.refresh()
    } catch (error: any) {
      setDeleteError(error.message || t('templates.deleteError') || 'Error deleting template. Please try again.')
    } finally {
      setDeleting(null)
    }
  }

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false)
    setTemplateToDelete(null)
    setDeleteError(null)
  }

  const handleRestore = async (templateId: string) => {
    if (!user) return

    setRestoring(templateId)
    setRestoreError(null)

    try {
      const templateService = new TemplateService()
      await templateService.restoreTemplate(templateId, user.id)
      
      // Update template in list - remove deleted_at
      setTemplates(templates.map(t => 
        t.id === templateId 
          ? { ...t, deleted_at: null }
          : t
      ))
      
      router.refresh()
    } catch (error: any) {
      setRestoreError(error.message || t('templates.restoreError') || 'Error restoring template. Please try again.')
    } finally {
      setRestoring(null)
    }
  }

  // Separate templates into active and archived
  const activeTemplates = templates.filter(t => !t.deleted_at)
  const archivedTemplates = templates.filter(t => t.deleted_at)

  return (
    <TooltipProvider>
      <main className="min-h-screen p-4 sm:p-6 md:p-8">
        <PageWithSidebar showRightSidebar={true}>
          <div className="mb-6 md:mb-8">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2">{t('templates.myTemplates') || 'My Templates'}</h1>
            <p className="text-sm sm:text-base text-muted-foreground">
              {t('templates.manageTemplates') || 'Manage your created templates'}
            </p>
          </div>

          {templates.length === 0 ? (
            <div className="text-center py-8 md:py-12 px-4">
              <p className="text-muted-foreground mb-4">
                {t('templates.noTemplatesCreated') || "You haven't created any templates yet."}
              </p>
              <Link href="/create-template">
                <Button>{t('nav.createTemplate')}</Button>
              </Link>
            </div>
          ) : (
            <>
              {/* Active Templates */}
              {activeTemplates.length > 0 && (
                <div className="mb-6 md:mb-8">
                  <h2 className="text-xl sm:text-2xl font-semibold mb-4">{t('templates.activeTemplates') || 'Active Templates'}</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                    {activeTemplates.map((template) => (
                      <TemplateCard
                        key={template.id}
                        template={template}
                        onDelete={handleDeleteClick}
                        onRestore={null}
                        deleting={deleting === template.id}
                        restoring={false}
                        t={t}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Archived Templates */}
              {archivedTemplates.length > 0 && (
                <div className="mb-6 md:mb-8">
                  <h2 className="text-xl sm:text-2xl font-semibold mb-4">{t('templates.archivedTemplates') || 'Archived Templates'}</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                    {archivedTemplates.map((template) => (
                      <TemplateCard
                        key={template.id}
                        template={template}
                        onDelete={null}
                        onRestore={handleRestore}
                        deleting={false}
                        restoring={restoring === template.id}
                        t={t}
                      />
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </PageWithSidebar>

        {/* Restore Error Message */}
        {restoreError && (
          <div className="fixed bottom-4 right-4 p-4 bg-destructive text-destructive-foreground rounded-md shadow-lg z-50">
            <p className="text-sm">{restoreError}</p>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setRestoreError(null)}
              className="mt-2"
            >
              {t('common.close')}
            </Button>
          </div>
        )}

        {/* Delete Confirmation Dialog */}
        <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t('templates.confirmDeleteTitle') || 'Delete Template'}</DialogTitle>
              <DialogDescription>
                {templateToDelete && (
                  <>
                    {t('templates.confirmDeleteMessage', { templateName: templateToDelete.name }) || 
                     `Are you sure you want to delete "${templateToDelete.name}"? This action cannot be undone.`}
                    <br />
                    <br />
                    <span className="text-sm text-muted-foreground">
                      {t('templates.deleteWarning') || 'Note: If this template is being used by other users, it will be archived but their tier lists will continue working.'}
                    </span>
                  </>
                )}
              </DialogDescription>
            </DialogHeader>
            {deleteError && (
              <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-md">
                {deleteError}
              </div>
            )}
            <DialogFooter>
              <Button
                variant="outline"
                onClick={handleDeleteCancel}
                disabled={deleting !== null}
              >
                {t('common.cancel')}
              </Button>
              <Button
                variant="destructive"
                onClick={handleDeleteConfirm}
                disabled={deleting !== null}
              >
                {deleting !== null 
                  ? (t('templates.deleting') || 'Deleting...')
                  : (t('common.delete') || 'Delete')}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </main>
    </TooltipProvider>
  )
}

// Template Card Component
interface TemplateCardProps {
  template: Template & { categories: Array<{ id: string; name: string; slug: string }>, deleted_at?: string | null }
  onDelete: ((templateId: string, templateName: string) => void) | null
  onRestore: ((templateId: string) => void) | null
  deleting: boolean
  restoring: boolean
  t: (key: string, params?: any) => string
}

function TemplateCard({ template, onDelete, onRestore, deleting, restoring, t }: TemplateCardProps) {
  const isArchived = !!template.deleted_at

  return (
    <Card key={template.id} className={`relative group overflow-hidden rounded-lg shadow-md hover:shadow-xl transition-all duration-300 ease-in-out hover:scale-[1.02] hover:border-primary border-2 ${isArchived ? 'opacity-75 border-muted' : 'border-transparent'}`}>
      {/* Archived Badge */}
      {isArchived && (
        <div className="absolute top-2 left-2 z-20 px-2 py-1 bg-muted text-muted-foreground rounded-md text-xs font-semibold flex items-center gap-1">
          <Archive className="h-3 w-3" />
          {t('templates.archived') || 'Archived'}
        </div>
      )}

      {/* Cover Image */}
      {template.cover_image_url ? (
        <div className="relative aspect-video w-full overflow-hidden">
          <Image
            src={template.cover_image_url}
            alt={template.name}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover transition-transform duration-300 ease-in-out group-hover:scale-110"
          />
          {/* Overlay for text readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
          
          {/* Category (Top Left) */}
          {template.categories && template.categories.length > 0 && !isArchived && (
            <div className="absolute top-2 left-2 z-10">
              <span className="px-2 py-1 bg-black/60 text-white rounded-md text-xs font-semibold">
                {template.categories[0].name}
              </span>
            </div>
          )}

          {/* Views Count (Top Right) */}
          <div className="absolute top-2 right-2 z-10 flex items-center gap-1 px-2 py-1 bg-black/60 text-white rounded-md text-xs font-semibold">
            <Eye className="h-3 w-3" />
            <span>{template.views_count}</span>
          </div>

          {/* Title (Bottom) */}
          <div className="absolute bottom-0 left-0 right-0 p-4 z-10 bg-black/60 backdrop-blur-sm">
            <h3 className="text-lg font-bold text-white line-clamp-2">
              {template.name}
            </h3>
          </div>
        </div>
      ) : (
        <div className="relative aspect-video w-full bg-muted flex items-center justify-center">
          <div className="text-center p-4">
            <h3 className="text-lg font-bold mb-2 line-clamp-2">
              {template.name}
            </h3>
            {template.categories && template.categories.length > 0 && (
              <div className="flex gap-1 flex-wrap justify-center mb-2">
                {template.categories.map((cat) => (
                  <span key={cat.id} className="px-2 py-1 bg-secondary text-secondary-foreground rounded text-xs">
                    {cat.name}
                  </span>
                ))}
              </div>
            )}
            <div className="flex items-center gap-1 justify-center text-sm text-muted-foreground">
              <Eye className="h-4 w-4" />
              <span>{template.views_count}</span>
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <CardFooter className="flex gap-2 p-4 bg-background">
        {!isArchived ? (
          <>
            <Tooltip>
              <TooltipTrigger asChild>
                <Link href={`/templates/${template.id}`} className="flex-1">
                  <Button variant="outline" className="w-full" size="sm">
                    <Eye className="h-4 w-4 mr-2" />
                    {t('common.view') || 'View'}
                  </Button>
                </Link>
              </TooltipTrigger>
              <TooltipContent>
                <p>{t('templates.viewTemplateTooltip') || 'View this template'}</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Link href={`/edit-template/${template.id}`} className="flex-1">
                  <Button variant="outline" className="w-full" size="sm">
                    <Pencil className="h-4 w-4 mr-2" />
                    {t('common.edit') || 'Edit'}
                  </Button>
                </Link>
              </TooltipTrigger>
              <TooltipContent>
                <p>{t('templates.editTemplateTooltip') || 'Edit this template'}</p>
              </TooltipContent>
            </Tooltip>

            {onDelete && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => onDelete(template.id, template.name)}
                    disabled={deleting}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{t('templates.deleteTemplateTooltip') || 'Delete this template'}</p>
                </TooltipContent>
              </Tooltip>
            )}
          </>
        ) : (
          <>
            <Tooltip>
              <TooltipTrigger asChild>
                <Link href={`/templates/${template.id}`} className="flex-1">
                  <Button variant="outline" className="w-full" size="sm">
                    <Eye className="h-4 w-4 mr-2" />
                    {t('common.view') || 'View'}
                  </Button>
                </Link>
              </TooltipTrigger>
              <TooltipContent>
                <p>{t('templates.viewTemplateTooltip') || 'View this template'}</p>
              </TooltipContent>
            </Tooltip>

            {onRestore && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => onRestore(template.id)}
                    disabled={restoring}
                    className="flex-1"
                  >
                    <ArchiveRestore className="h-4 w-4 mr-2" />
                    {restoring ? (t('templates.restoring') || 'Restoring...') : (t('templates.restore') || 'Restore')}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{t('templates.restoreTemplateTooltip') || 'Restore this template'}</p>
                </TooltipContent>
              </Tooltip>
            )}
          </>
        )}
      </CardFooter>
    </Card>
  )
}

