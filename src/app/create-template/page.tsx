import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { CreateTemplateForm } from '@/components/templates/CreateTemplateForm'

export default async function CreateTemplatePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  return (
    <main className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Create Template</h1>
          <p className="text-muted-foreground">
            Create a new template by uploading images and organizing them
          </p>
        </div>
        <CreateTemplateForm />
      </div>
    </main>
  )
}

