'use client'

import { useLanguageContext } from '@/contexts/LanguageContext'
import { useState, useEffect } from 'react'

export function useLanguage() {
  const { language, changeLanguage } = useLanguageContext()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return {
    language,
    changeLanguage,
    mounted,
  }
}

