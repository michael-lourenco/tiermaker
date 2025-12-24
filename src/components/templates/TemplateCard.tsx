import Link from 'next/link'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import type { Template } from '@/types/template.types'
import { Eye, Heart } from 'lucide-react'

interface TemplateCardProps {
  template: Template
}

export function TemplateCard({ template }: TemplateCardProps) {
  return (
    <Card className="hover:shadow-lg transition-shadow">
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
          <div className="flex items-center gap-1">
            <Heart className="h-4 w-4" />
            <span>{template.likes_count}</span>
          </div>
          <span className="ml-auto">{template.category}</span>
        </div>
      </CardContent>
      <CardFooter>
        <Link href={`/templates/${template.id}`} className="w-full">
          <Button variant="outline" className="w-full">
            View Template
          </Button>
        </Link>
      </CardFooter>
    </Card>
  )
}

