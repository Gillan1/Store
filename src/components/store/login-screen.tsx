'use client'

import { useState } from 'react'
import { useAuthStore } from '@/store/auth-store'
import { useLanguage } from '@/hooks/use-language'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { motion } from 'framer-motion'
import { Store, LogIn } from 'lucide-react'

export function LoginScreen() {
  const [username, setUsername] = useState('')
  const login = useAuthStore((s) => s.login)
  const { t, language, setLanguage } = useLanguage()

  const handleLogin = () => {
    const trimmed = username.trim()
    if (trimmed) {
      login(trimmed)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleLogin()
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 dark:from-emerald-950 dark:via-teal-950 dark:to-cyan-950 p-4">
      {/* Language toggle in top corner */}
      <div className="fixed top-4 left-4 right-4 flex justify-end z-10">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setLanguage(language === 'ar' ? 'en' : 'ar')}
          className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm"
        >
          {language === 'ar' ? 'English' : 'العربية'}
        </Button>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="w-full max-w-md"
      >
        <Card className="shadow-2xl border-0 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm">
          <CardHeader className="text-center pb-2">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              className="mx-auto mb-4 w-24 h-24 rounded-2xl overflow-hidden shadow-lg"
            >
              <img
                src="/store-logo.png"
                alt="Store Logo"
                className="w-full h-full object-cover"
              />
            </motion.div>
            <motion.h1
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-3xl font-bold text-emerald-700 dark:text-emerald-400"
            >
              {t('storeName')}
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-muted-foreground mt-1"
            >
              {t('storeSlogan')}
            </motion.p>
          </CardHeader>
          <CardContent className="pt-4">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="space-y-4"
            >
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  {t('username')}
                </label>
                <div className="relative">
                  <Store className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={t('enterUsername')}
                    className="ps-10 h-12 text-base"
                  />
                </div>
              </div>
              <p className="text-xs text-muted-foreground text-center">
                {t('loginPrompt')}
              </p>
              <Button
                onClick={handleLogin}
                disabled={!username.trim()}
                className="w-full h-12 text-base bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-700 dark:hover:bg-emerald-600"
              >
                <LogIn className="me-2 h-5 w-5" />
                {t('login')}
              </Button>
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
