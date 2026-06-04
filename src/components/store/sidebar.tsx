'use client'

import { useAuthStore } from '@/store/auth-store'
import { useLanguage } from '@/hooks/use-language'
import { cn } from '@/lib/utils'
import { Home, BarChart3, Settings, Shield } from 'lucide-react'

export type ViewType = 'home' | 'sales' | 'settings'

interface SidebarProps {
  activeView: ViewType
  onViewChange: (view: ViewType) => void
  isOpen: boolean
  onClose: () => void
}

export function Sidebar({ activeView, onViewChange, isOpen, onClose }: SidebarProps) {
  const { isAdmin } = useAuthStore()
  const { t, dir } = useLanguage()
  const isRtl = dir === 'rtl'

  const navItems: { id: ViewType; icon: React.ReactNode; label: string; adminOnly: boolean }[] = [
    { id: 'home', icon: <Home className="h-5 w-5" />, label: t('home'), adminOnly: false },
    { id: 'sales', icon: <BarChart3 className="h-5 w-5" />, label: t('sales'), adminOnly: true },
    { id: 'settings', icon: <Settings className="h-5 w-5" />, label: t('settings'), adminOnly: true },
  ]

  const filteredItems = navItems.filter((item) => !item.adminOnly || isAdmin)

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed top-14 z-40 h-[calc(100vh-3.5rem)] w-64 border-e bg-sidebar transition-transform duration-300 ease-in-out',
          isRtl ? 'end-0' : 'start-0',
          isOpen
            ? 'translate-x-0'
            : isRtl
              ? 'translate-x-full'
              : '-translate-x-full',
          'md:sticky md:translate-x-0'
        )}
      >
        <div className="flex h-full flex-col gap-2 p-4">
          {isAdmin && (
            <div className="flex items-center gap-2 px-3 py-2 mb-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/30">
              <Shield className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              <span className="text-xs font-medium text-emerald-700 dark:text-emerald-400">
                {t('adminSection')}
              </span>
            </div>
          )}

          <nav className="flex flex-col gap-1">
            {filteredItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  onViewChange(item.id)
                  onClose()
                }}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200',
                  activeView === item.id
                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300 shadow-sm'
                    : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                )}
              >
                {item.icon}
                {item.label}
              </button>
            ))}
          </nav>

          {/* Guest message */}
          {!isAdmin && (
            <div className="mt-auto p-3 rounded-lg bg-muted/50 text-center">
              <p className="text-xs text-muted-foreground">{t('guestMessage')}</p>
            </div>
          )}
        </div>
      </aside>
    </>
  )
}
