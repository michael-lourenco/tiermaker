'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { useUserPreferences } from '@/hooks/useUserPreferences'
import { useSubscriptionLimits } from '@/hooks/useSubscriptionLimits'
import { TierListEditor } from '@/components/editor/TierListEditor'
import { TierListService } from '@/services/tierList.service'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Edit2, Globe, Lock } from 'lucide-react'
import { useTranslation } from '@/hooks/useTranslation'
import { LimitReachedModal } from '@/components/subscription/LimitReachedModal'
import type { TemplateWithItems } from '@/types/template.types'
import type { TierListTier } from '@/types/tierList.types'

interface TierListEditorClientProps {
  template: TemplateWithItems & {
    tiers?: Array<{
      id: string
      template_id: string
      tier_name: string
      tier_order: number
      color: string | null
      created_at: string
    }>
  }
}

export function TierListEditorClient({ template }: TierListEditorClientProps) {
  const [title, setTitle] = useState(template.name || 'My Tier List')
  const [isPublic, setIsPublic] = useState(false)
  const [saving, setSaving] = useState(false)
  const [showLimitModal, setShowLimitModal] = useState(false)
  const { user } = useAuth()
  const router = useRouter()
  const tierListService = new TierListService()
  const { showItemNames, setShowItemNames, loading: preferencesLoading } = useUserPreferences()
  const { t } = useTranslation()
  const { canPerform, hasReached, limit, loading: limitsLoading } = useSubscriptionLimits('tier_lists_count')

  const handleSave = async (data: {
    tiers: Array<{ tier_name: string; tier_order: number; color: string | null }>
    items: Array<{ template_item_id: string; tier_name: string; order: number }>
  }): Promise<void> => {
    // Validate user is authenticated
    if (!user) {
      alert('You must be logged in to save a tier list. Please log in and try again.')
      router.push('/login')
      return
    }

    // Verificar limite antes de salvar
    if (!canPerform || hasReached) {
      setShowLimitModal(true)
      return
    }

    setSaving(true)

    try {
      // Debug: log what we're sending
      console.log('Saving tier list with:', {
        tiersCount: data.tiers.length,
        itemsCount: data.items.length,
        tiers: data.tiers,
        items: data.items,
      })

      const tierList = await tierListService.createTierList(
        {
          template_id: template.id,
          title,
          is_public: isPublic,
          tiers: data.tiers || [],
          items: data.items || [],
        },
        user.id // Now guaranteed to exist
      )

      router.push(`/tier-lists/${tierList.id}`)
    } catch (error) {
      console.error('Failed to save tier list:', error)
      alert(`Failed to save tier list: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-3 sm:space-y-4 md:space-y-6 px-2 sm:px-4 md:px-6 lg:px-8">
      {/* Informações do Template */}
      <div className="mb-4 sm:mb-6">
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold mb-2">{template.name}</h1>
        {template.description && (
          <p className="text-sm sm:text-base text-muted-foreground">{template.description}</p>
        )}
      </div>

      {/* Título da Tier List - Centralizado */}
      <div className="flex flex-col items-center gap-1.5 sm:gap-2 py-1 sm:py-2">
        <Label htmlFor="tier-list-title" className="text-sm sm:text-base md:text-lg font-semibold flex items-center gap-1.5 sm:gap-2">
          <Edit2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground" />
          {t('editor.tierListTitle')}
        </Label>
        <Input
          id="tier-list-title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder={t('editor.tierListTitlePlaceholder')}
          className="w-full sm:max-w-lg text-center text-sm sm:text-base md:text-lg font-medium focus:ring-2 focus:ring-primary"
          title={t('editor.tierListTitleHint')}
        />
      </div>

      {/* Opção de tornar pública */}
      <div className="flex items-center justify-center gap-2 sm:gap-3 py-2">
        <div className="flex items-center gap-2">
          {isPublic ? (
            <Globe className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
          ) : (
            <Lock className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" />
          )}
          <Label htmlFor="is-public" className="text-sm sm:text-base cursor-pointer">
            {isPublic ? 'Tornar privada' : 'Tornar pública'}
          </Label>
        </div>
        <Switch
          id="is-public"
          checked={isPublic}
          onCheckedChange={setIsPublic}
        />
        <span className="text-xs sm:text-sm text-muted-foreground">
          {isPublic 
            ? 'Sua tier list será visível para todos na página /tierlists'
            : 'Sua tier list será privada e só acessível pelo link'}
        </span>
      </div>
      <TierListEditor
        templateItems={template.items}
        initialTiers={
          template.tiers && Array.isArray(template.tiers) && template.tiers.length > 0
            ? template.tiers.map((tier) => ({
                id: `tier-${tier.id}`,
                tier_list_id: '',
                tier_name: tier.tier_name,
                tier_order: tier.tier_order,
                color: tier.color,
                created_at: tier.created_at,
              }))
            : undefined
        }
        showItemNames={showItemNames}
        onShowItemNamesChange={setShowItemNames}
        onSave={handleSave}
      />
      {saving && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-background p-4 sm:p-6 rounded-lg mx-4">
            <p className="text-sm sm:text-base">Saving tier list...</p>
          </div>
        </div>
      )}

      {limit && (
        <LimitReachedModal
          open={showLimitModal}
          onOpenChange={setShowLimitModal}
          limitType="tier_lists_count"
          currentCount={limit.current_count}
          maxCount={limit.max_count}
        />
      )}
    </div>
  )
}

