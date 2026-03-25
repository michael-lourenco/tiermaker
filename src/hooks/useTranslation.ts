'use client'

import { useLanguage } from './useLanguage'
import { getTranslations, t } from '@/lib/i18n'
import type { Translations } from '@/lib/i18n/types'
import { useCallback, useEffect, useState } from 'react'

export function useTranslation() {
  const { language } = useLanguage()
  const [translations, setTranslations] = useState<Translations>(getTranslations(language))

  useEffect(() => {
    setTranslations(getTranslations(language))
  }, [language])

  const translate = useCallback(
    (path: string, params?: Record<string, string | number>): string => {
      return t(translations, path, params)
    },
    [translations]
  )

  return {
    t: translate,
    language,
    translations,
  }
}

