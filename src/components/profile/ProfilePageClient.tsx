'use client'

import { useUserPreferences } from '@/hooks/useUserPreferences'
import { useTranslation } from '@/hooks/useTranslation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { PageWithSidebar } from '@/components/layout/PageWithSidebar'
import { EnhancedSubscriptionStatus } from '@/components/subscription/EnhancedSubscriptionStatus'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { User, Mail, Calendar } from 'lucide-react'

export function ProfilePageClient() {
  const { t } = useTranslation()
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const { showItemNames, setShowItemNames, loading, updating } = useUserPreferences()

  return (
    <main className="min-h-screen p-4 sm:p-6 md:p-8">
      <PageWithSidebar showRightSidebar={true}>
        <div className="max-w-3xl mx-auto space-y-6">
          <div className="mb-6 md:mb-8">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2">
              {t('profile.title')}
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground">
              {t('profile.description')}
            </p>
          </div>

          {/* Informações da Conta */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Informações da Conta
              </CardTitle>
              <CardDescription>
                Confirme que esta é a sua conta
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {authLoading ? (
                <div className="space-y-3">
                  <div className="h-4 bg-muted animate-pulse rounded w-3/4" />
                  <div className="h-4 bg-muted animate-pulse rounded w-1/2" />
                </div>
              ) : user ? (
                <>
                  <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                    <Mail className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <Label className="text-xs text-muted-foreground uppercase tracking-wider">
                        Email
                      </Label>
                      <p className="text-sm font-medium mt-1 break-all">
                        {user.email}
                      </p>
                    </div>
                  </div>

                  {user.created_at && (
                    <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                      <Calendar className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <Label className="text-xs text-muted-foreground uppercase tracking-wider">
                          Conta criada em
                        </Label>
                        <p className="text-sm font-medium mt-1">
                          {new Date(user.created_at).toLocaleDateString('pt-BR', {
                            day: '2-digit',
                            month: 'long',
                            year: 'numeric'
                          })}
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="pt-2 border-t">
                    <p className="text-xs text-muted-foreground">
                      ID da conta: <span className="font-mono text-[10px]">{user.id}</span>
                    </p>
                  </div>
                </>
              ) : (
                <p className="text-sm text-muted-foreground">Não foi possível carregar as informações da conta.</p>
              )}
            </CardContent>
          </Card>

          {/* Assinatura */}
          <EnhancedSubscriptionStatus showUpgradeButton={true} />

          {/* Preferências */}
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
