'use client'

import { ThemeProvider } from 'next-themes'
import { LanguageProvider } from '@/hooks/use-language'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
      <LanguageProvider>
        {children}
      </LanguageProvider>
    </ThemeProvider>
  )
}
