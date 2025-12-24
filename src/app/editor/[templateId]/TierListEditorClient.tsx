'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { TierListEditor } from '@/components/editor/TierListEditor'
import { TierListService } from '@/services/tierList.service'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import type { TemplateWithItems } from '@/types/template.types'
import type { TierListTier } from '@/types/tierList.types'

interface TierListEditorClientProps {
  template: TemplateWithItems
}

export function TierListEditorClient({ template }: TierListEditorClientProps) {
  const [title, setTitle] = useState('My Tier List')
  const [saving, setSaving] = useState(false)
  const { user } = useAuth()
  const router = useRouter()
  const tierListService = new TierListService()

  const handleSave = async (data: {
    tiers: TierListTier[]
    items: Array<{ template_item_id: string; tier_name: string; order: number }>
  }) => {
    setSaving(true)

    try {
      const tierList = await tierListService.createTierList(
        {
          template_id: template.id,
          title,
          is_public: false,
          tiers: data.tiers.map((tier, index) => ({
            tier_name: tier.tier_name,
            tier_order: tier.tier_order,
            color: tier.color,
          })),
          items: data.items,
        },
        user?.id
      )

      router.push(`/tier-lists/${tierList.id}`)
    } catch (error) {
      console.error('Failed to save tier list:', error)
      alert('Failed to save tier list. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Tier List Title"
          className="max-w-md"
        />
      </div>
      <TierListEditor
        templateItems={template.items}
        onSave={handleSave}
      />
      {saving && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-background p-6 rounded-lg">
            <p>Saving tier list...</p>
          </div>
        </div>
      )}
    </div>
  )
}

