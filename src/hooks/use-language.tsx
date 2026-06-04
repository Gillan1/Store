'use client'

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react'
import { type Language, t as translate, type TranslationKey } from '@/lib/i18n'

interface LanguageContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: (key: TranslationKey) => string
  dir: 'rtl' | 'ltr'
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

function getInitialLanguage(): Language {
  if (typeof window === 'undefined') return 'ar'
  const saved = localStorage.getItem('language')
  if (saved === 'ar' || saved === 'en') return saved
  return 'ar'
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(getInitialLanguage)

  useEffect(() => {
    localStorage.setItem('language', language)
    document.documentElement.lang = language
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr'
  }, [language])

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang)
  }, [])

  const t = useCallback(
    (key: TranslationKey) => translate(key, language),
    [language]
  )

  const dir: 'rtl' | 'ltr' = language === 'ar' ? 'rtl' : 'ltr'

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, dir }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider')
  }
  return context
}
