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
import { Edit2 } from 'lucide-react'
import { useTranslation } from '@/hooks/useTranslation'
import { LimitReachedModal } from '@/components/subscription/LimitReachedModal'
import type { TemplateWithItems } from '@/types/template.types'
import type { TierListTier } from '@/types/tierList.types'

interface TierListEditorClientProps {
  template: TemplateWithItems
}

export function TierListEditorClient({ template }: TierListEditorClientProps) {
  const [title, setTitle] = useState('My Tier List')
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
          is_public: false,
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
      <TierListEditor
        templateItems={template.items}
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

