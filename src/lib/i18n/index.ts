import enTranslations from './translations/en.json'
import ptTranslations from './translations/pt.json'
import type { Translations, Language } from './types'

const translations: Record<Language, Translations> = {
  en: enTranslations as Translations,
  pt: ptTranslations as Translations,
}

export function getTranslations(language: Language): Translations {
  return translations[language] || translations.en
}

export function t(
  translations: Translations,
  path: string,
  params?: Record<string, string | number>
): string {
  const keys = path.split('.')
  let value: any = translations

  for (const key of keys) {
    if (value && typeof value === 'object' && key in value) {
      value = value[key as keyof typeof value]
    } else {
      return path // Return path if translation not found
    }
  }

  if (typeof value !== 'string') {
    return path
  }

  // Replace placeholders like {tierName} or {count}
  if (params) {
    return value.replace(/\{(\w+)\}/g, (match, key) => {
      return params[key]?.toString() || match
    })
  }

  return value
}

export { type Language, type Translations }

