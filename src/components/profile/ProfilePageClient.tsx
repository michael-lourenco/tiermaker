'use client'

import { useUserPreferences } from '@/hooks/useUserPreferences'
import { useTranslation } from '@/hooks/useTranslation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { PageWithSidebar } from '@/components/layout/PageWithSidebar'

export function ProfilePageClient() {
  const { t } = useTranslation()
  const { showItemNames, setShowItemNames, loading, updating } = useUserPreferences()

  return (
    <main className="min-h-screen p-4 sm:p-6 md:p-8">
      <PageWithSidebar showRightSidebar={true}>
        <div className="max-w-3xl mx-auto">
          <div className="mb-6 md:mb-8">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2">
              {t('profile.title')}
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground">
              {t('profile.description')}
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>{t('profile.preferences')}</CardTitle>
              <CardDescription>{t('profile.preferencesDescription')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="show-item-names-profile" className="text-base">
                    {t('editor.showItemNames')}
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    {t('profile.showItemNamesDescription')}
                  </p>
                </div>
                <Switch
                  id="show-item-names-profile"
                  checked={showItemNames}
                  onCheckedChange={setShowItemNames}
                  disabled={loading || updating}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </PageWithSidebar>
    </main>
  )
}
