'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { useUserPreferences } from '@/hooks/useUserPreferences'
import { useSubscriptionLimits } from '@/hooks/useSubscriptionLimits'
import type { TierListDraft } from '@/hooks/useTierListDraft'
import { createClient } from '@/lib/supabase/client'
import { TierListEditor } from '@/components/editor/TierListEditor'
import { ClearDraftButton } from '@/components/editor/ClearDraftButton'
import { TierListService } from '@/services/tierList.service'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Edit2, Globe, Lock, Loader2 } from 'lucide-react'
import { useTranslation } from '@/hooks/useTranslation'
import { LimitReachedModal } from '@/components/subscription/LimitReachedModal'
import type { TemplateWithItems } from '@/types/template.types'
import type { TemplateItem } from '@/types/template.types'
import type { TierListTier, TierListItem } from '@/types/tierList.types'

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
  
  // Chave do localStorage sem userId (local ao navegador)
  const storageKey = `tier-list-draft-${template.id}`
  
  // Estado de loading: inicia como true até verificar localStorage
  const [isLoadingDraft, setIsLoadingDraft] = useState(true)
  
  // Estados para os dados iniciais: só serão definidos depois de verificar localStorage
  const [initialTiers, setInitialTiers] = useState<TierListTier[] | undefined>(undefined)
  const [initialItems, setInitialItems] = useState<Array<TierListItem & {
    template_item: TemplateItem
  }> | undefined>(undefined)
  
  // Estado para controlar se há draft
  const [hasDraft, setHasDraft] = useState(false)
  
  // Estado para armazenar lastModified do draft (para exibição)
  const [draftLastModified, setDraftLastModified] = useState<number | null>(null)
  
  // Estado inicial de title e isPublic: serão definidos no useEffect
  const [title, setTitle] = useState(template.name || 'My Tier List')
  const [isPublic, setIsPublic] = useState(false)

  // Verificar localStorage ANTES de renderizar qualquer coisa
  useEffect(() => {
    // PRIMEIRO: Verificar se existe no localStorage
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem(storageKey)
        if (stored) {
          const parsed = JSON.parse(stored) as TierListDraft
          if (parsed.templateId === template.id) {
            // Encontrou no localStorage: usar dados do localStorage
            
            // Configurar tiers do localStorage
            if (parsed.tiers && parsed.tiers.length > 0) {
              setInitialTiers(parsed.tiers.map((tier) => ({
                id: tier.id,
                tier_list_id: '',
                tier_name: tier.tier_name,
                tier_order: tier.tier_order,
                color: tier.color,
                created_at: '',
              })))
            } else {
              // Se não tem tiers no localStorage, usar do template
              if (template.tiers && Array.isArray(template.tiers) && template.tiers.length > 0) {
                setInitialTiers(template.tiers.map((tier) => ({
                  id: `tier-${tier.id}`,
                  tier_list_id: '',
                  tier_name: tier.tier_name,
                  tier_order: tier.tier_order,
                  color: tier.color,
                  created_at: tier.created_at,
                })))
              }
            }
            
            // Configurar items do localStorage
            if (parsed.items && parsed.items.length > 0) {
              const draftItemsMap = new Map(
                parsed.items.map((item) => [item.template_item_id, item])
              )
              
              setInitialItems(template.items.map((templateItem) => {
                const draftItem = draftItemsMap.get(templateItem.id)
                return {
                  id: '',
                  tier_list_id: '',
                  template_item_id: templateItem.id,
                  tier_name: draftItem?.tier_name || '',
                  order: draftItem?.order ?? template.items.indexOf(templateItem),
                  created_at: '',
                  template_item: templateItem,
                } as TierListItem & { template_item: TemplateItem }
              }))
            }
            
            // Configurar title e isPublic do localStorage
            if (parsed.title) {
              setTitle(parsed.title)
            }
            if (parsed.isPublic !== undefined) {
              setIsPublic(parsed.isPublic)
            }
            
            // Configurar hasDraft e lastModified
            setHasDraft(true)
            if (parsed.lastModified) {
              setDraftLastModified(parsed.lastModified)
            }
            
            setIsLoadingDraft(false)
            return
          }
        }
      } catch (error) {
        console.error('Erro ao ler localStorage:', error)
        // Se falhar, continuar para usar dados do template
      }
    }
    
    // SEGUNDO: Se não encontrou no localStorage, usar dados do template (base de dados)
    if (template.tiers && Array.isArray(template.tiers) && template.tiers.length > 0) {
      setInitialTiers(template.tiers.map((tier) => ({
        id: `tier-${tier.id}`,
        tier_list_id: '',
        tier_name: tier.tier_name,
        tier_order: tier.tier_order,
        color: tier.color,
        created_at: tier.created_at,
      })))
    }
    
    // Items: undefined = TierListEditor inicializa todos como "unassigned"
    setInitialItems(undefined)
    
    setHasDraft(false)
    setIsLoadingDraft(false)
  }, [storageKey, template.id, template.tiers, template.items])
  
  const [saving, setSaving] = useState(false)
  const [showLimitModal, setShowLimitModal] = useState(false)
  
  // Key estável para TierListEditor: só muda quando queremos forçar remount (ao limpar draft)
  const [editorKey, setEditorKey] = useState(0)

  // Ref para timeout do debounce do salvamento
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Função para salvar draft no localStorage (sem userId)
  const saveDraft = useCallback((data: {
    title: string
    isPublic: boolean
    tiers: Array<{ id: string; tier_name: string; tier_order: number; color: string | null }>
    items: Array<{ template_item_id: string; tier_name: string; order: number }>
  }) => {
    try {
      const draftData = {
        templateId: template.id,
        title: data.title,
        isPublic: data.isPublic,
        tiers: data.tiers,
        items: data.items,
        lastModified: Date.now(),
      }
      
      localStorage.setItem(storageKey, JSON.stringify(draftData))
      setHasDraft(true)
      setDraftLastModified(draftData.lastModified)
    } catch (error) {
      console.error('Erro ao salvar draft no localStorage:', error)
    }
  }, [storageKey, template.id])

  // Função para salvar draft com debounce
  const saveDraftDebounced = useCallback((data: {
    title: string
    isPublic: boolean
    tiers: Array<{ id: string; tier_name: string; tier_order: number; color: string | null }>
    items: Array<{ template_item_id: string; tier_name: string; order: number }>
  }, delay: number = 300) => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current)
    }
    
    saveTimeoutRef.current = setTimeout(() => {
      saveDraft(data)
    }, delay)
  }, [saveDraft])

  // Função para limpar draft do localStorage
  const clearDraft = useCallback(() => {
    try {
      localStorage.removeItem(storageKey)
      setHasDraft(false)
      setDraftLastModified(null)
    } catch (error) {
      console.error('Erro ao limpar draft do localStorage:', error)
    }
  }, [storageKey])

  // Limpar timeout ao desmontar
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current)
      }
    }
  }, [])

  // NOTA: O draft só é salvo quando handleEditorChange é chamado (após drop de items)
  // Não salvamos quando title/isPublic mudam - isso não afeta a posição dos items

  // Callback para quando o editor muda (após drag end, etc)
  const handleEditorChange = useCallback((data: {
    tiers: Array<{ id: string; tier_name: string; tier_order: number; color: string | null }>
    items: Array<{ template_item_id: string; tier_name: string; order: number }>
  }) => {
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
  }, [title, isPublic, saveDraftDebounced])

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

  // Função para limpar rascunho e resetar estado para dados do template
  const handleClearDraft = useCallback(() => {
    clearDraft()
    setTitle(template.name || 'My Tier List')
    setIsPublic(false)
    
    // Resetar tiers e items para dados do template (base de dados)
    if (template.tiers && Array.isArray(template.tiers) && template.tiers.length > 0) {
      setInitialTiers(template.tiers.map((tier) => ({
        id: `tier-${tier.id}`,
        tier_list_id: '',
        tier_name: tier.tier_name,
        tier_order: tier.tier_order,
        color: tier.color,
        created_at: tier.created_at,
      })))
    } else {
      setInitialTiers(undefined)
    }
    
    // Items: undefined = TierListEditor inicializa todos como "unassigned"
    setInitialItems(undefined)
    
    // Incrementar editorKey para forçar remount do TierListEditor com valores iniciais
    setEditorKey(prev => prev + 1)
  }, [clearDraft, template.name, template.tiers])

  // Mostrar loading enquanto verifica localStorage
  if (isLoadingDraft) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Carregando...</p>
        </div>
      </div>
    )
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

      {/* Botão de limpar rascunho */}
      {hasDraft && (
        <div className="flex justify-center py-2">
          <ClearDraftButton 
            onClear={handleClearDraft}
            lastModified={draftLastModified || undefined}
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

