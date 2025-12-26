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
import { Pencil, Trash2, Eye } from 'lucide-react'
import type { Template, TemplateWithCategories } from '@/types/template.types'
import { useState } from 'react'
import { TemplateService } from '@/services/template.service'
import { useAuth } from '@/hooks/useAuth'
import { useRouter } from 'next/navigation'

interface MyTemplatesPageClientProps {
  templates: Array<Template & { categories: Array<{ id: string; name: string; slug: string }> }>
}

export function MyTemplatesPageClient({ templates: initialTemplates }: MyTemplatesPageClientProps) {
  const { t } = useTranslation()
  const { user } = useAuth()
  const router = useRouter()
  const [templates, setTemplates] = useState(initialTemplates)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [templateToDelete, setTemplateToDelete] = useState<{ id: string; name: string } | null>(null)
  const [deleteError, setDeleteError] = useState<string | null>(null)

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
      
      // Remove from list if hard deleted, keep if soft deleted (will be filtered by query)
      if (!result.softDeleted) {
        setTemplates(templates.filter(t => t.id !== templateToDelete.id))
      } else {
        // Soft deleted - remove from UI but show success message
        setTemplates(templates.filter(t => t.id !== templateToDelete.id))
      }
      
      setDeleteDialogOpen(false)
      setTemplateToDelete(null)
      router.refresh()
    } catch (error: any) {
      console.error('Error deleting template:', error)
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

  return (
    <TooltipProvider>
      <main className="min-h-screen p-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2">{t('templates.myTemplates') || 'My Templates'}</h1>
            <p className="text-muted-foreground">
              {t('templates.manageTemplates') || 'Manage your created templates'}
            </p>
          </div>

          {templates.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">
                {t('templates.noTemplatesCreated') || "You haven't created any templates yet."}
              </p>
              <Link href="/create-template">
                <Button>{t('nav.createTemplate')}</Button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {templates.map((template) => (
                <Card key={template.id} className="relative group overflow-hidden rounded-lg shadow-md hover:shadow-xl transition-all duration-300 ease-in-out hover:scale-[1.02] hover:border-primary border-2 border-transparent">
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
                      {template.categories && template.categories.length > 0 && (
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
                      <div className="absolute bottom-0 left-0 right-0 p-4 z-10">
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

                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeleteClick(template.id, template.name)}
                          disabled={deleting === template.id}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{t('templates.deleteTemplateTooltip') || 'Delete this template'}</p>
                      </TooltipContent>
                    </Tooltip>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </div>

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

