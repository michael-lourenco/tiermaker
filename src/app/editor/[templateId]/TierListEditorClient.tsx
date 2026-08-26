'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { useUserPreferences } from '@/hooks/useUserPreferences'
import type { TierListDraft } from '@/hooks/useTierListDraft'
import { TierListEditor } from '@/components/editor/TierListEditor'
import { ClearDraftButton } from '@/components/editor/ClearDraftButton'
import { TierListService } from '@/services/tierList.service'
import { ImageService } from '@/services/image.service'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Edit2, Globe, Lock, Loader2, Info } from 'lucide-react'
import Link from 'next/link'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { useTranslation } from '@/hooks/useTranslation'
import type { TemplateWithItems } from '@/types/template.types'
import type { TemplateItem } from '@/types/template.types'
import type { TierListTier, TierListItem, TierListWithData } from '@/types/tierList.types'
import { isPendingTemplateItemId } from '@/lib/editor/pendingItems'
import {
  buildPendingTemplateItem,
  resolveRankingWithPendingImages,
} from '@/lib/editor/resolveRankingTemplate'

type EditorRankingState = {
  tiers: Array<{ id: string; tier_name: string; tier_order: number; color: string | null }>
  items: Array<{ template_item_id: string; tier_name: string; order: number }>
}

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
  remixSource?: TierListWithData | null
  editTierList?: TierListWithData | null
}

export function TierListEditorClient({
  template,
  remixSource = null,
  editTierList = null,
}: TierListEditorClientProps) {
  const { user } = useAuth()
  const router = useRouter()
  const tierListService = new TierListService()
  const { showItemNames, setShowItemNames } = useUserPreferences()
  const { t } = useTranslation()
  const imageServiceRef = useRef(new ImageService())
  
  // Chave do localStorage sem userId (local ao navegador)
  // IMPORTANTE: Armazenar valores do template em refs para usar no useEffect sem dependências
  // Isso garante que o useEffect execute apenas UMA VEZ no mount, nunca durante edição
  const templateIdRef = useRef(template.id)
  const templateTiersRef = useRef(template.tiers)
  const templateItemsRef = useRef(template.items)
  const templateNameRef = useRef(template.name)
  const storageKeyRef = useRef(`tier-list-draft-${template.id}`)
  const editorStateRef = useRef<EditorRankingState | null>(null)
  const pendingFilesRef = useRef<Map<string, File>>(new Map())
  const pendingObjectUrlsRef = useRef<string[]>([])
  
  // Estado de loading: inicia como true até verificar localStorage
  const [isLoadingDraft, setIsLoadingDraft] = useState(true)
  const [editorItems, setEditorItems] = useState<TemplateItem[]>(template.items || [])
  
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
  const [title, setTitle] = useState(
    editTierList?.title ||
      (remixSource ? `${remixSource.title}` : template.name || 'My Tier List')
  )
  const [isPublic, setIsPublic] = useState(editTierList?.is_public ?? false)
  const templateHasCover = Boolean(template.cover_image_url?.trim())
  const isEditMode = Boolean(editTierList)
  const isTemplateOwner = Boolean(user && template.user_id === user.id)

  const revokePendingObjectUrls = useCallback(() => {
    pendingObjectUrlsRef.current.forEach((url) => URL.revokeObjectURL(url))
    pendingObjectUrlsRef.current = []
  }, [])

  const clearPendingLocalImages = useCallback(() => {
    pendingFilesRef.current.clear()
    revokePendingObjectUrls()
  }, [revokePendingObjectUrls])

  const handleTogglePublic = () => {
    if (!isPublic && !templateHasCover) {
      alert(t('editor.coverRequiredForPublicTierList'))
      return
    }
    setIsPublic(!isPublic)
  }

  // Verificar localStorage APENAS UMA VEZ no mount (nunca durante edição)
  // IMPORTANTE: localStorage só é usado para valores INICIAIS, não durante edição
  // Os estados do React são a única fonte de verdade durante a edição
  useEffect(() => {
    // Usar refs para acessar valores do template sem adicionar dependências
    const templateId = templateIdRef.current
    const templateTiers = templateTiersRef.current
    const templateItems = templateItemsRef.current
    const templateName = templateNameRef.current
    const storageKey = storageKeyRef.current

    const applySource = (
      source: TierListWithData,
      opts?: { asDraft?: boolean; titleOverride?: string }
    ) => {
      if (source.tiers?.length) {
        setInitialTiers(
          source.tiers.map((tier) => ({
            id: tier.id.startsWith('tier-') ? tier.id : `tier-${tier.id}`,
            tier_list_id: '',
            tier_name: tier.tier_name,
            tier_order: tier.tier_order,
            color: tier.color,
            created_at: tier.created_at,
          }))
        )
      }
      if (source.items?.length && templateItems) {
        const sourceMap = new Map(
          source.items.map((item) => [item.template_item_id, item])
        )
        setInitialItems(
          templateItems.map((templateItem) => {
            const srcItem = sourceMap.get(templateItem.id)
            return {
              id: '',
              tier_list_id: '',
              template_item_id: templateItem.id,
              tier_name: srcItem?.tier_name || '',
              order: srcItem?.order ?? templateItems.indexOf(templateItem),
              created_at: '',
              template_item: templateItem,
            } as TierListItem & { template_item: TemplateItem }
          })
        )
      }
      if (opts?.titleOverride) setTitle(opts.titleOverride)
      else if (source.title) setTitle(source.title)
      if (source.is_public !== undefined && isEditMode) {
        setIsPublic(source.is_public)
      }
      if (opts?.asDraft) {
        setHasDraft(true)
      }
      setIsLoadingDraft(false)
    }

    // Edit mode: load existing tier list (skip local draft)
    if (editTierList) {
      applySource(editTierList)
      return
    }

    // Remix: seed from source tier list (skip local draft so ranking is visible)
    if (remixSource) {
      applySource(remixSource, {
        titleOverride: remixSource.title
          ? `${remixSource.title}`
          : templateName || 'My Tier List',
      })
      return
    }

    // PRIMEIRO: Verificar se existe no localStorage
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem(storageKey)
        if (stored) {
          const parsed = JSON.parse(stored) as TierListDraft
          if (parsed.templateId === templateId) {
            // Encontrou no localStorage: usar dados do localStorage APENAS para inicialização
            
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
              if (templateTiers && Array.isArray(templateTiers) && templateTiers.length > 0) {
                setInitialTiers(templateTiers.map((tier) => ({
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
            if (parsed.items && parsed.items.length > 0 && templateItems) {
              const draftItemsMap = new Map(
                parsed.items.map((item) => [item.template_item_id, item])
              )
              
              setInitialItems(templateItems.map((templateItem) => {
                const draftItem = draftItemsMap.get(templateItem.id)
                return {
                  id: '',
                  tier_list_id: '',
                  template_item_id: templateItem.id,
                  tier_name: draftItem?.tier_name || '',
                  order: draftItem?.order ?? templateItems.indexOf(templateItem),
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
        // Se falhar, continuar para usar dados do template
      }
    }
    
    // SEGUNDO: Se não encontrou no localStorage, usar dados do template (base de dados)
    if (templateTiers && Array.isArray(templateTiers) && templateTiers.length > 0) {
      setInitialTiers(templateTiers.map((tier) => ({
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
  }, []) // SEM DEPENDÊNCIAS: executa apenas UMA VEZ no mount, nunca durante edição
  
  const [saving, setSaving] = useState(false)
  
  // Key estável para TierListEditor: só muda quando queremos forçar remount (ao limpar draft)
  const [editorKey, setEditorKey] = useState(0)

  // Ref para timeout do debounce do salvamento
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Função para salvar draft no localStorage (sem userId)
  // IMPORTANTE: Esta função apenas SALVA no localStorage, NUNCA lê durante edição
  // Os estados do React são a única fonte de verdade durante a edição
  const saveDraft = useCallback((data: {
    title: string
    isPublic: boolean
    tiers: Array<{ id: string; tier_name: string; tier_order: number; color: string | null }>
    items: Array<{ template_item_id: string; tier_name: string; order: number }>
  }) => {
    try {
      const storageKey = storageKeyRef.current
      const templateId = templateIdRef.current
      
      const draftData = {
        templateId: templateId,
        title: data.title,
        isPublic: data.isPublic,
        tiers: data.tiers,
        // Imagens pendentes (blob) não sobrevivem ao reload — não persistir
        items: data.items.filter(
          (item) => !isPendingTemplateItemId(item.template_item_id)
        ),
        lastModified: Date.now(),
      }
      
      localStorage.setItem(storageKey, JSON.stringify(draftData))
      setHasDraft(true)
      setDraftLastModified(draftData.lastModified)
    } catch (error) {
      // Erro ao salvar draft - silencioso
    }
  }, [])

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
  // IMPORTANTE: Esta função apenas LIMPA o localStorage, não interfere nos estados do React
  const clearDraft = useCallback(() => {
    try {
      const storageKey = storageKeyRef.current
      localStorage.removeItem(storageKey)
      setHasDraft(false)
      setDraftLastModified(null)
    } catch (error) {
      // Erro ao limpar draft - silencioso
    }
  }, [])

  // Limpar timeout e object URLs ao desmontar
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current)
      }
      pendingObjectUrlsRef.current.forEach((url) => URL.revokeObjectURL(url))
      pendingObjectUrlsRef.current = []
    }
  }, [])

  // NOTA: O draft só é salvo quando handleEditorChange é chamado (após drop de items)
  // Não salvamos quando title/isPublic mudam - isso não afeta a posição dos items

  // Callback para quando o editor muda (após drag end, etc)
  // IMPORTANTE: Este callback recebe dados do estado do React (TierListEditor)
  // Apenas salva no localStorage, NUNCA lê ou interfere nos estados
  const handleEditorChange = useCallback((data: {
    tiers: Array<{ id: string; tier_name: string; tier_order: number; color: string | null }>
    items: Array<{ template_item_id: string; tier_name: string; order: number }>
  }) => {
    editorStateRef.current = data
    saveDraftDebounced({
      title,
      isPublic,
      tiers: data.tiers,
      items: data.items,
    })
  }, [title, isPublic, saveDraftDebounced])

  const getCurrentRanking = useCallback((): EditorRankingState => {
    if (editorStateRef.current) {
      return editorStateRef.current
    }

    const tiers =
      initialTiers?.map((tier) => ({
        id: tier.id,
        tier_name: tier.tier_name,
        tier_order: tier.tier_order,
        color: tier.color,
      })) ||
      (template.tiers || []).map((tier) => ({
        id: `tier-${tier.id}`,
        tier_name: tier.tier_name,
        tier_order: tier.tier_order,
        color: tier.color,
      }))

    const items =
      initialItems?.map((item) => ({
        template_item_id: item.template_item_id,
        tier_name: item.tier_name,
        order: item.order,
      })) ||
      editorItems.map((item, index) => ({
        template_item_id: item.id,
        tier_name: '',
        order: index,
      }))

    return { tiers, items }
  }, [initialTiers, initialItems, template.tiers, editorItems])

  const handleAddImages = useCallback(
    (files: FileList) => {
      if (!user) {
        alert(t('editor.forkLoginRequired'))
        router.push('/login')
        return
      }

      const fileArray = Array.from(files)
      if (fileArray.length === 0) return

      for (const file of fileArray) {
        const validation = imageServiceRef.current.validateImageFile(file)
        if (!validation.valid) {
          alert(validation.error || t('editor.forkFailed'))
          return
        }
      }

      const ranking = getCurrentRanking()
      const maxOrder = ranking.items.reduce((max, item) => Math.max(max, item.order), -1)

      const created = fileArray.map((file, index) =>
        buildPendingTemplateItem({
          file,
          templateId: template.id,
          order: maxOrder + 1 + index,
        })
      )

      created.forEach(({ item, file, objectUrl }) => {
        pendingFilesRef.current.set(item.id, file)
        pendingObjectUrlsRef.current.push(objectUrl)
      })

      const pendingTemplateItems = created.map((entry) => entry.item)
      const nextEditorItems = [...editorItems, ...pendingTemplateItems]
      const itemsById = new Map(nextEditorItems.map((item) => [item.id, item]))

      const nextRankingItems = [
        ...ranking.items,
        ...pendingTemplateItems.map((item, index) => ({
          template_item_id: item.id,
          tier_name: '',
          order: maxOrder + 1 + index,
        })),
      ]

      setEditorItems(nextEditorItems)
      setInitialTiers(
        ranking.tiers.map((tier) => ({
          id: tier.id.startsWith('tier-') ? tier.id : `tier-${tier.id}`,
          tier_list_id: '',
          tier_name: tier.tier_name,
          tier_order: tier.tier_order,
          color: tier.color,
          created_at: '',
        }))
      )
      setInitialItems(
        nextRankingItems.map((ranked) => ({
          id: '',
          tier_list_id: '',
          template_item_id: ranked.template_item_id,
          tier_name: ranked.tier_name,
          order: ranked.order,
          created_at: '',
          template_item: itemsById.get(ranked.template_item_id)!,
        }))
      )
      editorStateRef.current = {
        tiers: ranking.tiers,
        items: nextRankingItems,
      }
      setHasDraft(true)
      setEditorKey((prev) => prev + 1)
    },
    [user, t, router, getCurrentRanking, template.id, editorItems]
  )

  const handleSave = async (data: {
    tiers: Array<{ tier_name: string; tier_order: number; color: string | null }>
    items: Array<{ template_item_id: string; tier_name: string; order: number }>
  }): Promise<void> => {
    if (!user) {
      alert('You must be logged in to save a tier list. Please log in and try again.')
      router.push('/login')
      return
    }

    const hasPending = data.items.some((item) =>
      isPendingTemplateItemId(item.template_item_id)
    )

    if (hasPending && !isTemplateOwner && isEditMode) {
      const ok = window.confirm(t('editor.forkLeavesEditWarning'))
      if (!ok) return
    }

    setSaving(true)

    try {
      const resolved = await resolveRankingWithPendingImages({
        sourceTemplateId: template.id,
        sourceTemplateName: template.name,
        isOwner: isTemplateOwner,
        rankingItems: data.items || [],
        rankingTiers: data.tiers || [],
        pendingFiles: pendingFilesRef.current,
        uploadImage: (file) => imageServiceRef.current.uploadImage(file),
      })

      clearPendingLocalImages()

      if (isEditMode && editTierList && !resolved.createdNewTemplate) {
        await tierListService.updateTierList(
          editTierList.id,
          {
            title,
            is_public: isPublic,
            tiers: data.tiers || [],
            items: resolved.items,
          },
          user.id
        )
        clearDraft()
        router.push(`/tier-lists/${editTierList.id}`)
        return
      }

      // Fork (não-owner com imagens novas) ou create normal: sempre cria lista nova
      const tierList = await tierListService.createTierList(
        {
          template_id: resolved.templateId,
          title,
          is_public: isPublic,
          tiers: data.tiers || [],
          items: resolved.items,
        },
        user.id
      )

      clearDraft()
      router.push(`/tier-lists/${tierList.id}`)
    } catch (error) {
      alert(`Failed to save tier list: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setSaving(false)
    }
  }

  // Função para limpar rascunho e resetar estado para dados do template
  const handleClearDraft = useCallback(() => {
    clearDraft()
    clearPendingLocalImages()
    setEditorItems(template.items || [])
    setTitle(template.name || 'My Tier List')
    setIsPublic(false)
    
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
    
    setInitialItems(undefined)
    editorStateRef.current = null
    setEditorKey(prev => prev + 1)
  }, [clearDraft, clearPendingLocalImages, template.name, template.tiers, template.items])

  // Mostrar loading enquanto verifica localStorage
  if (isLoadingDraft) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">{t('common.loading')}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-2 sm:space-y-3 px-2 sm:px-4 md:px-6 lg:px-8">
      <TooltipProvider>
        {/* Barra compacta: template + título editável */}
        <div className="flex flex-col gap-1 sm:gap-1.5">
          <div className="flex items-center gap-2 min-w-0">
            <Link
              href={`/templates/${template.id}`}
              className="text-xs sm:text-sm text-muted-foreground hover:text-foreground truncate transition-colors"
              title={template.description || template.name}
            >
              {template.name}
            </Link>
            {template.description ? (
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    className="flex-shrink-0 text-muted-foreground hover:text-foreground touch-manipulation"
                    aria-label={t('editor.templateInfo')}
                  >
                    <Info className="h-3.5 w-3.5" />
                  </button>
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  <p className="text-xs sm:text-sm">{template.description}</p>
                </TooltipContent>
              </Tooltip>
            ) : null}
          </div>

          <div className="relative group">
            <Input
              id="tier-list-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={t('editor.tierListTitlePlaceholder')}
              aria-label={t('editor.tierListTitle')}
              title={t('editor.tierListTitleHint')}
              className="h-9 sm:h-10 w-full border-transparent bg-transparent px-0 pr-7 text-lg sm:text-xl md:text-2xl font-bold shadow-none focus-visible:ring-1 focus-visible:ring-primary focus-visible:border-input focus-visible:bg-background focus-visible:px-2 focus-visible:pr-7 rounded-md"
            />
            <Edit2 className="pointer-events-none absolute right-1 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground opacity-40 group-focus-within:opacity-0 sm:opacity-50" />
          </div>
        </div>

        <TierListEditor
          key={editorKey} // Key estável: só muda quando handleClearDraft é chamado (força remount)
          templateItems={editorItems}
          initialTiers={initialTiers}
          initialItems={initialItems}
          showItemNames={showItemNames}
          onShowItemNamesChange={(show) => {
            setShowItemNames(show)
          }}
          onChange={handleEditorChange}
          onSave={handleSave}
          onAddImages={handleAddImages}
          actionButtons={
            <>
              {/* Botão público/privado */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleTogglePublic}
                    className="touch-manipulation"
                  >
                    {isPublic ? (
                      <Globe className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary" />
                    ) : (
                      <Lock className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground" />
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>
                    {!templateHasCover
                      ? t('editor.coverRequiredForPublicTierList')
                      : isPublic
                        ? t('editor.tierListPublicDescription')
                        : t('editor.tierListPrivateDescription')}
                  </p>
                </TooltipContent>
              </Tooltip>

              {/* Botão de reiniciar (limpar rascunho) */}
              {hasDraft && (
                <ClearDraftButton 
                  onClear={handleClearDraft}
                  lastModified={draftLastModified || undefined}
                />
              )}
            </>
          }
        />
      </TooltipProvider>
      {saving && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-background p-4 sm:p-6 rounded-lg mx-4 flex flex-col items-center gap-3">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
            <p className="text-sm sm:text-base">{t('editor.savingTierList')}</p>
          </div>
        </div>
      )}

    </div>
  )
}

