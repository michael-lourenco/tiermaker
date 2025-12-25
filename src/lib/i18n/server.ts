import { cookies } from 'next/headers'
import { getTranslations } from './index'
import type { Language } from './types'

const LANGUAGE_COOKIE_NAME = 'supertiermaker-language'
const DEFAULT_LANGUAGE: Language = 'en'

export async function getLanguage(): Promise<Language> {
  const cookieStore = await cookies()
  const languageCookie = cookieStore.get(LANGUAGE_COOKIE_NAME)
  
  if (languageCookie?.value && (languageCookie.value === 'en' || languageCookie.value === 'pt')) {
    return languageCookie.value as Language
  }
  
  return DEFAULT_LANGUAGE
}

export async function getServerTranslations() {
  const language = await getLanguage()
  return getTranslations(language)
}

