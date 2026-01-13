'use client'

import { useState, useEffect, useRef } from 'react'
import { useAuth } from './useAuth'
import { UserPreferencesService } from '@/services/userPreferences.service'
import type { UserPreferences } from '@/types/userPreferences.types'

const STORAGE_KEY = 'supertiermaker_user_preferences'
const STORAGE_VERSION = '1'

interface StoredPreferences {
  version: string
  user_id: string
  show_item_names: boolean
  updated_at: string
}

export function useUserPreferences() {
  const { user, loading: authLoading } = useAuth()
  const [preferences, setPreferences] = useState<UserPreferences | null>(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const hasLoadedFromDB = useRef(false)
  const service = new UserPreferencesService()

  // Load preferences from localStorage or database
  useEffect(() => {
    if (authLoading) return

    // Reset flag when user changes
    hasLoadedFromDB.current = false

    if (!user) {
      // User not logged in: use default preferences (show names = true)
      setPreferences({
        user_id: '',
        show_item_names: true, // Default: show names when not logged in
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      setLoading(false)
      return
    }

    const loadPreferences = async () => {
      try {
        // First, try to load from localStorage
        const stored = localStorage.getItem(STORAGE_KEY)
        
        if (stored) {
          try {
            const parsed: StoredPreferences = JSON.parse(stored)
            
            // Check if it's for the current user and version matches
            if (parsed.user_id === user.id && parsed.version === STORAGE_VERSION) {
              // Use preferences from localStorage
              setPreferences({
                user_id: parsed.user_id,
                show_item_names: parsed.show_item_names,
                created_at: parsed.updated_at, // Use updated_at as fallback
                updated_at: parsed.updated_at,
              })
              setLoading(false)
              hasLoadedFromDB.current = true // Mark as loaded to avoid DB access
              return
            } else {
              // Different user or version, clear old data
              localStorage.removeItem(STORAGE_KEY)
              hasLoadedFromDB.current = false // Reset flag to allow DB access for new user
            }
          } catch (e) {
            // Invalid JSON, clear it
            localStorage.removeItem(STORAGE_KEY)
            hasLoadedFromDB.current = false // Reset flag to allow DB access
          }
        }

        // If not in localStorage or invalid, load from database (only once per user)
        if (!hasLoadedFromDB.current) {
          hasLoadedFromDB.current = true
          
          const prefs = await service.getUserPreferences(user.id)
          setPreferences(prefs)
          
          // Save to localStorage
          const toStore: StoredPreferences = {
            version: STORAGE_VERSION,
            user_id: prefs.user_id,
            show_item_names: prefs.show_item_names,
            updated_at: prefs.updated_at,
          }
          localStorage.setItem(STORAGE_KEY, JSON.stringify(toStore))
        }
      } catch (error) {
        // Set default preferences on error
        const defaultPrefs: UserPreferences = {
          user_id: user.id,
          show_item_names: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }
        setPreferences(defaultPrefs)
        
        // Save default to localStorage
        const toStore: StoredPreferences = {
          version: STORAGE_VERSION,
          user_id: defaultPrefs.user_id,
          show_item_names: defaultPrefs.show_item_names,
          updated_at: defaultPrefs.updated_at,
        }
        localStorage.setItem(STORAGE_KEY, JSON.stringify(toStore))
      } finally {
        setLoading(false)
      }
    }

    loadPreferences()
  }, [user?.id, authLoading]) // Use user?.id to detect user changes

  const updatePreferences = async (input: { show_item_names?: boolean }) => {
    if (!user) {
      // If not logged in, just update local state (won't persist)
      const newPrefs: UserPreferences = {
        user_id: '',
        show_item_names: input.show_item_names ?? true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
      setPreferences(newPrefs)
      return newPrefs
    }

    setUpdating(true)
    try {
      // Update in database
      const updated = await service.updateUserPreferences(user.id, input)
      setPreferences(updated)
      
      // Also update localStorage
      const toStore: StoredPreferences = {
        version: STORAGE_VERSION,
        user_id: updated.user_id,
        show_item_names: updated.show_item_names,
        updated_at: updated.updated_at,
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(toStore))
      
      return updated
    } catch (error) {
      throw error
    } finally {
      setUpdating(false)
    }
  }

  const setShowItemNames = async (show: boolean) => {
    return updatePreferences({ show_item_names: show })
  }

  // Return showItemNames: true by default if not logged in (to show names), false if logged in and not set
  const showItemNames = user 
    ? (preferences?.show_item_names ?? false)
    : true // Default: show names when not logged in

  return {
    preferences,
    loading: loading || authLoading,
    updating,
    showItemNames,
    setShowItemNames,
    updatePreferences,
  }
}
