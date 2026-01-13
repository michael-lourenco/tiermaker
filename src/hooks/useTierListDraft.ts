import { useState, useEffect, useCallback, useRef } from 'react'

export interface TierListDraft {
  templateId: string
  userId: string
  title: string
  isPublic: boolean
  tiers: Array<{
    id: string
    tier_name: string
    tier_order: number
    color: string | null
  }>
  items: Array<{
    template_item_id: string
    tier_name: string
    order: number
  }>
  lastModified: number
}

const STORAGE_PREFIX = 'tier-list-draft'

/**
 * Hook para gerenciar rascunhos de tier lists no localStorage
 */
export function useTierListDraft(templateId: string, userId: string | undefined) {
  const [draft, setDraft] = useState<TierListDraft | null>(null)
  const [hasDraft, setHasDraft] = useState(false)
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const getStorageKey = useCallback(() => {
    if (!userId) return null
    return `${STORAGE_PREFIX}-${templateId}-${userId}`
  }, [templateId, userId])

  /**
   * Carrega draft do localStorage
   */
  const loadDraft = useCallback((): TierListDraft | null => {
    if (!userId) return null

    try {
      const storageKey = getStorageKey()
      if (!storageKey) return null

      const stored = localStorage.getItem(storageKey)
      if (!stored) return null

      const parsed = JSON.parse(stored) as TierListDraft

      // Validar estrutura básica
      if (
        !parsed.templateId ||
        !parsed.userId ||
        !Array.isArray(parsed.tiers) ||
        !Array.isArray(parsed.items)
      ) {
        // Limpar draft corrompido diretamente
        try {
          const storageKey = getStorageKey()
          if (storageKey) {
            localStorage.removeItem(storageKey)
          }
        } catch (error) {
          // Erro ao limpar draft corrompido - silencioso
        }
        return null
      }

      // Validar que o draft corresponde ao templateId e userId atual
      if (parsed.templateId !== templateId || parsed.userId !== userId) {
        return null
      }

      return parsed
    } catch (error) {
      return null
    }
  }, [templateId, userId, getStorageKey])

  /**
   * Salva draft no localStorage
   */
  const saveDraft = useCallback(
    (data: Omit<TierListDraft, 'templateId' | 'userId' | 'lastModified'>) => {
      if (!userId) {
        return
      }

      try {
        const storageKey = getStorageKey()
        if (!storageKey) {
          return
        }

        const draftData: TierListDraft = {
          ...data,
          templateId,
          userId,
          lastModified: Date.now(),
        }

        localStorage.setItem(storageKey, JSON.stringify(draftData))
        setDraft(draftData)
        setHasDraft(true)
      } catch (error) {
        // Se erro de quota excedida, tentar limpar drafts antigos
        if (error instanceof DOMException && error.name === 'QuotaExceededError') {
          // Aqui poderia implementar limpeza de drafts antigos se necessário
        }
      }
    },
    [templateId, userId, getStorageKey]
  )

  /**
   * Salva draft com debounce (para evitar muitas escritas)
   */
  const saveDraftDebounced = useCallback(
    (data: Omit<TierListDraft, 'templateId' | 'userId' | 'lastModified'>, delay: number = 300) => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current)
      }

      saveTimeoutRef.current = setTimeout(() => {
        saveDraft(data)
      }, delay)
    },
    [saveDraft]
  )

  /**
   * Limpa draft do localStorage
   */
  const clearDraft = useCallback(() => {
    if (!userId) return

    try {
      const storageKey = getStorageKey()
      if (!storageKey) return

      localStorage.removeItem(storageKey)
      setDraft(null)
      setHasDraft(false)
    } catch (error) {
      // Erro ao limpar draft - silencioso
    }
  }, [userId, getStorageKey])

  /**
   * Carrega draft na inicialização
   */
  useEffect(() => {
    if (!userId) return

    const loadedDraft = loadDraft()
    if (loadedDraft) {
      setDraft(loadedDraft)
      setHasDraft(true)
    } else {
      setHasDraft(false)
    }
  }, [userId, loadDraft])

  /**
   * Verifica se existe draft ao montar
   */
  useEffect(() => {
    if (!userId) return

    const storageKey = getStorageKey()
    if (!storageKey) return

    const exists = localStorage.getItem(storageKey) !== null
    setHasDraft(exists)
  }, [userId, getStorageKey])

  /**
   * Limpa timeout ao desmontar
   */
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current)
      }
    }
  }, [])

  return {
    draft,
    hasDraft,
    loadDraft,
    saveDraft,
    saveDraftDebounced,
    clearDraft,
  }
}
