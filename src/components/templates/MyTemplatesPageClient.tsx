'use client'

import Link from 'next/link'
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
      await templateService.deleteTemplate(templateToDelete.id, user.id)
      setTemplates(templates.filter(t => t.id !== templateToDelete.id))
      setDeleteDialogOpen(false)
      setTemplateToDelete(null)
      router.refresh()
    } catch (error) {
      console.error('Error deleting template:', error)
      setDeleteError(t('templates.deleteError') || 'Error deleting template. Please try again.')
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {templates.map((template) => (
                <Card key={template.id}>
                  <CardHeader>
                    <CardTitle className="line-clamp-2">{template.name}</CardTitle>
                    {template.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {template.description}
                      </p>
                    )}
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Eye className="h-4 w-4" />
                        <span>{template.views_count}</span>
                      </div>
                      {template.categories && template.categories.length > 0 && (
                        <div className="flex gap-1 flex-wrap">
                          {template.categories.map((cat) => (
                            <span key={cat.id} className="px-2 py-1 bg-secondary text-secondary-foreground rounded text-xs">
                              {cat.name}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </CardContent>
                  <CardFooter className="flex gap-2">
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

