'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { useUserPreferences } from '@/hooks/useUserPreferences'
import { useSubscriptionLimits } from '@/hooks/useSubscriptionLimits'
import { useTierListDraft, type TierListDraft } from '@/hooks/useTierListDraft'
import { createClient } from '@/lib/supabase/client'
import { TierListEditor } from '@/components/editor/TierListEditor'
import { ClearDraftButton } from '@/components/editor/ClearDraftButton'
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
  console.log('TierListEditorClient renderizado', { templateId: template.id })
  
  const { user } = useAuth()
  const router = useRouter()
  const tierListService = new TierListService()
  const { showItemNames, setShowItemNames, loading: preferencesLoading } = useUserPreferences()
  const { t } = useTranslation()
  const { canPerform, hasReached, limit, loading: limitsLoading } = useSubscriptionLimits('tier_lists_count')
  
  // Hook de draft
  const { draft, hasDraft, loadDraft, saveDraftDebounced, clearDraft } = useTierListDraft(
    template.id,
    user?.id
  )
  
  console.log('Draft hook:', { hasDraft, draft: draft ? { itemsCount: draft.items.length, tiersCount: draft.tiers.length } : null, userId: user?.id })

  // Flag para controlar se o draft foi carregado (evita re-hidratação)
  const didHydrateRef = useRef(false)
  
  // Estados iniciais: calculados uma única vez no mount usando useState lazy
  // IMPORTANTE: No primeiro render, user?.id pode não estar disponível
  // Se não estiver, inicializamos sem draft. O useEffect abaixo tentará carregar quando user?.id estiver disponível
  const [initialTiers, setInitialTiers] = useState<TierListTier[] | undefined>(() => {
    // No primeiro render, tentar carregar draft se user?.id estiver disponível
    if (typeof window !== 'undefined' && user?.id) {
      try {
        const storageKey = `tier-list-draft-${template.id}-${user.id}`
        const stored = localStorage.getItem(storageKey)
        if (stored) {
          const parsed = JSON.parse(stored) as TierListDraft
          if (parsed?.tiers && parsed.tiers.length > 0) {
            didHydrateRef.current = true
            return parsed.tiers.map((tier) => ({
              id: tier.id,
              tier_list_id: '',
              tier_name: tier.tier_name,
              tier_order: tier.tier_order,
              color: tier.color,
              created_at: '',
            }))
          }
        }
      } catch (error) {
        // Se falhar, continuar com valores padrão
      }
    }
    
    // Fallback para tiers do template
    if (template.tiers && Array.isArray(template.tiers) && template.tiers.length > 0) {
      return template.tiers.map((tier) => ({
        id: `tier-${tier.id}`,
        tier_list_id: '',
        tier_name: tier.tier_name,
        tier_order: tier.tier_order,
        color: tier.color,
        created_at: tier.created_at,
      }))
    }
    return undefined
  })

  const [initialItems, setInitialItems] = useState<Array<{
    template_item_id: string
    tier_name: string
    order: number
    template_item: any
  }> | undefined>(() => {
    // No primeiro render, tentar carregar draft se user?.id estiver disponível
    if (typeof window !== 'undefined' && user?.id) {
      try {
        const storageKey = `tier-list-draft-${template.id}-${user.id}`
        const stored = localStorage.getItem(storageKey)
        if (stored) {
          const parsed = JSON.parse(stored) as TierListDraft
          if (parsed?.items && parsed.items.length > 0) {
            didHydrateRef.current = true
            // IMPORTANTE: Sempre incluir TODOS os items do template, usando o draft para posições
            const draftItemsMap = new Map(
              parsed.items.map((item) => [item.template_item_id, item])
            )
            
            return template.items.map((templateItem) => {
              const draftItem = draftItemsMap.get(templateItem.id)
              return {
                template_item_id: templateItem.id,
                tier_name: draftItem?.tier_name || '',
                order: draftItem?.order ?? template.items.indexOf(templateItem),
                template_item: templateItem,
              }
            })
          }
        }
      } catch (error) {
        // Se falhar, continuar com undefined
      }
    }
    return undefined
  })

  // Estado inicial de title e isPublic: hidratado uma única vez no mount
  const [title, setTitle] = useState(() => {
    if (typeof window !== 'undefined' && user?.id) {
      try {
        const storageKey = `tier-list-draft-${template.id}-${user.id}`
        const stored = localStorage.getItem(storageKey)
        if (stored) {
          const parsed = JSON.parse(stored) as TierListDraft
          if (parsed?.title) {
            return parsed.title
          }
        }
      } catch (error) {
        // Se falhar, continuar com valor padrão
      }
    }
    return template.name || 'My Tier List'
  })
  const [isPublic, setIsPublic] = useState(() => {
    if (typeof window !== 'undefined' && user?.id) {
      try {
        const storageKey = `tier-list-draft-${template.id}-${user.id}`
        const stored = localStorage.getItem(storageKey)
        if (stored) {
          const parsed = JSON.parse(stored) as TierListDraft
          if (parsed?.isPublic !== undefined) {
            return parsed.isPublic
          }
        }
      } catch (error) {
        // Se falhar, continuar com false
      }
    }
    return false
  })

  // Hidratação única: carregar draft quando user?.id estiver disponível (apenas uma vez)
  useEffect(() => {
    if (!user?.id || didHydrateRef.current) return
    
    try {
      const storageKey = `tier-list-draft-${template.id}-${user.id}`
      const stored = localStorage.getItem(storageKey)
      if (!stored) {
        didHydrateRef.current = true
        return
      }
      
      const parsed = JSON.parse(stored) as TierListDraft
      
      // Validar estrutura básica
      if (
        !parsed.templateId ||
        !parsed.userId ||
        !Array.isArray(parsed.tiers) ||
        !Array.isArray(parsed.items) ||
        parsed.templateId !== template.id ||
        parsed.userId !== user.id
      ) {
        didHydrateRef.current = true
        return
      }
      
      // Aplicar draft: atualizar estados e forçar remount do TierListEditor
      setTitle(parsed.title || template.name || 'My Tier List')
      setIsPublic(parsed.isPublic || false)
      
      if (parsed.tiers && parsed.tiers.length > 0) {
        setInitialTiers(parsed.tiers.map((tier) => ({
          id: tier.id,
          tier_list_id: '',
          tier_name: tier.tier_name,
          tier_order: tier.tier_order,
          color: tier.color,
          created_at: '',
        })))
      }
      
      if (parsed.items && parsed.items.length > 0) {
        const draftItemsMap = new Map(
          parsed.items.map((item) => [item.template_item_id, item])
        )
        
        const mappedItems = template.items.map((templateItem) => {
          const draftItem = draftItemsMap.get(templateItem.id)
          return {
            template_item_id: templateItem.id,
            tier_name: draftItem?.tier_name || '',
            order: draftItem?.order ?? template.items.indexOf(templateItem),
            template_item: templateItem,
          }
        })
        setInitialItems(mappedItems)
      }
      
      // Forçar remount do TierListEditor com os dados do draft
      setEditorKey(prev => prev + 1)
      didHydrateRef.current = true
    } catch (error) {
      console.error('Erro ao carregar draft do localStorage:', error)
      didHydrateRef.current = true
    }
  }, [user?.id, template.id, template.name, template.items])
  
  const [saving, setSaving] = useState(false)
  const [showLimitModal, setShowLimitModal] = useState(false)
  
  // Key estável para TierListEditor: só muda quando queremos forçar remount (ao limpar draft)
  // NÃO usar draft?.lastModified pois isso muda a cada salvamento e causa remount indesejado
  const [editorKey, setEditorKey] = useState(0)

  // NOTA: O draft só é salvo quando handleEditorChange é chamado (após drop de items)
  // Não salvamos quando title/isPublic mudam - isso não afeta a posição dos items


  // Callback para quando o editor muda (após drag end, etc)
  const handleEditorChange = useCallback((data: {
    tiers: Array<{ id: string; tier_name: string; tier_order: number; color: string | null }>
    items: Array<{ template_item_id: string; tier_name: string; order: number }>
  }) => {
    if (!user?.id) {
      console.warn('handleEditorChange: user.id não disponível')
      return
    }

    console.log('handleEditorChange chamado:', {
      tiersCount: data.tiers.length,
      itemsCount: data.items.length,
      items: data.items,
    })

    // Salvar draft com debounce após alteração (APENAS quando items/tiers mudam)
    // Os tiers já vêm com IDs preservados do TierListEditor
    // NÃO incluir showItemNames (é preferência do usuário, não do tier list)
    saveDraftDebounced({
      title,
      isPublic,
      tiers: data.tiers,
      items: data.items,
    })
  }, [user?.id, title, isPublic, saveDraftDebounced])

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

      // Limpar draft após salvamento bem-sucedido
      clearDraft()

      router.push(`/tier-lists/${tierList.id}`)
    } catch (error) {
      console.error('Failed to save tier list:', error)
      alert(`Failed to save tier list: ${error instanceof Error ? error.message : 'Unknown error'}`)
      // Não limpar draft se salvamento falhar
    } finally {
      setSaving(false)
    }
  }

  // Função para limpar rascunho e resetar estado
  // NOTA: Não podemos alterar initialTiers/initialItems pois são valores imutáveis do useState lazy
  // O reset será feito através da key prop do TierListEditor que força remount
  const handleClearDraft = useCallback(() => {
    clearDraft()
    setTitle(template.name || 'My Tier List')
    setIsPublic(false)
    // Reset será feito pelo TierListEditor através de key prop (força remount com valores iniciais)
  }, [clearDraft, template.name])

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

      {/* Botão de limpar rascunho */}
      {hasDraft && (
        <div className="flex justify-center py-2">
          <ClearDraftButton 
            onClear={handleClearDraft}
            lastModified={draft?.lastModified}
          />
        </div>
      )}

      <TierListEditor
        key={editorKey} // Key estável: só muda quando handleClearDraft é chamado (força remount)
        templateItems={template.items}
        initialTiers={initialTiers}
        initialItems={initialItems}
        showItemNames={showItemNames}
        onShowItemNamesChange={(show) => {
          setShowItemNames(show)
        }}
        onChange={handleEditorChange}
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

