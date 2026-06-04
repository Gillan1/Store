'use client'

import { useLanguage } from '@/hooks/use-language'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Info } from 'lucide-react'

export function GuestMessage() {
  const { t } = useLanguage()

  return (
    <div className="p-4">
      <Alert className="border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/30">
        <Info className="h-4 w-4 text-amber-600 dark:text-amber-400" />
        <AlertDescription className="text-amber-800 dark:text-amber-300 text-sm">
          {t('guestMessage')}
        </AlertDescription>
      </Alert>
    </div>
  )
}
