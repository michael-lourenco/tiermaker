'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import type { Language } from '@/lib/i18n/types'

interface LanguageContextType {
  language: Language
  changeLanguage: (lang: Language) => Promise<void>
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>('en')

  useEffect(() => {
    const stored = localStorage.getItem('supertiermaker-language') as Language | null
    if (stored && (stored === 'en' || stored === 'pt')) {
      setLanguage(stored)
    }
  }, [])

  const changeLanguage = async (newLanguage: Language) => {
    setLanguage(newLanguage)
    localStorage.setItem('supertiermaker-language', newLanguage)
    
    try {
      await fetch('/api/language', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ language: newLanguage }),
      })
      // Force page refresh to update server components
      window.location.reload()
    } catch (error) {
      console.error('Failed to update language:', error)
    }
  }

  return (
    <LanguageContext.Provider value={{ language, changeLanguage }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguageContext() {
  const context = useContext(LanguageContext)
  if (!context) {
    throw new Error('useLanguageContext must be used within LanguageProvider')
  }
  return context
}

