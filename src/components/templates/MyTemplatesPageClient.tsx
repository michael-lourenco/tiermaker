'use client'

import Link from 'next/link'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
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

  const handleDelete = async (templateId: string) => {
    if (!user) return
    
    const confirmMessage = t('templates.confirmDelete') || 'Are you sure you want to delete this template?'
    if (!confirm(confirmMessage)) {
      return
    }

    setDeleting(templateId)
    try {
      const templateService = new TemplateService()
      await templateService.deleteTemplate(templateId, user.id)
      setTemplates(templates.filter(t => t.id !== templateId))
      router.refresh()
    } catch (error) {
      console.error('Error deleting template:', error)
      alert(t('common.error') || 'Error deleting template')
    } finally {
      setDeleting(null)
    }
  }

  return (
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
                  <Link href={`/templates/${template.id}`} className="flex-1">
                    <Button variant="outline" className="w-full" size="sm">
                      <Eye className="h-4 w-4 mr-2" />
                      {t('common.view') || 'View'}
                    </Button>
                  </Link>
                  <Link href={`/edit-template/${template.id}`} className="flex-1">
                    <Button variant="outline" className="w-full" size="sm">
                      <Pencil className="h-4 w-4 mr-2" />
                      {t('common.edit') || 'Edit'}
                    </Button>
                  </Link>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDelete(template.id)}
                    disabled={deleting === template.id}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}

