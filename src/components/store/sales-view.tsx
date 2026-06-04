'use client'

import { useState } from 'react'
import { useSalesStore } from '@/store/sales-store'
import { useLanguage } from '@/hooks/use-language'
import { useAuthStore } from '@/store/auth-store'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { RecordSaleDialog } from './record-sale-dialog'
import { motion, AnimatePresence } from 'framer-motion'
import {
  BarChart3,
  TrendingUp,
  Calendar,
  ChevronDown,
  ChevronUp,
  Plus,
  Trash2,
  Receipt,
} from 'lucide-react'

export function SalesView() {
  const { sales, deleteSale } = useSalesStore()
  const { t, language } = useLanguage()
  const { isAdmin } = useAuthStore()
  const [expandedDate, setExpandedDate] = useState<string | null>(null)
  const [saleDialogOpen, setSaleDialogOpen] = useState(false)

  if (!isAdmin) return null

  // Group sales by date
  const salesByDate = sales.reduce(
    (acc, sale) => {
      if (!acc[sale.date]) acc[sale.date] = []
      acc[sale.date].push(sale)
      return acc
    },
    {} as Record<string, typeof sales>
  )

  const sortedDates = Object.keys(salesByDate).sort((a, b) => b.localeCompare(a))
  const totalRevenue = sales.reduce((sum, s) => sum + s.totalAmount, 0)

  const today = new Date().toISOString().split('T')[0]
  const todaySales = sales.filter((s) => s.date === today)
  const todayRevenue = todaySales.reduce((sum, s) => sum + s.totalAmount, 0)

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr + 'T00:00:00')
    return date.toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  return (
    <div className="space-y-4 p-4">
      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0 }}
        >
          <Card className="border-0 shadow-md bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-900/40">
                  <TrendingUp className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">{t('totalRevenue')}</p>
                  <p className="text-xl font-bold text-emerald-700 dark:text-emerald-400">
                    {totalRevenue.toLocaleString()} {t('currency')}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="border-0 shadow-md bg-gradient-to-br from-cyan-50 to-sky-50 dark:from-cyan-950/30 dark:to-sky-950/30">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-cyan-100 dark:bg-cyan-900/40">
                  <Calendar className="h-5 w-5 text-cyan-600 dark:text-cyan-400" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">{t('todaySales')}</p>
                  <p className="text-xl font-bold text-cyan-700 dark:text-cyan-400">
                    {todayRevenue.toLocaleString()} {t('currency')}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="border-0 shadow-md bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-900/40">
                  <BarChart3 className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">{t('totalSales')}</p>
                  <p className="text-xl font-bold text-amber-700 dark:text-amber-400">
                    {sales.length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Record sale button */}
      <div className="flex justify-end">
        <Button
          onClick={() => setSaleDialogOpen(true)}
          className="bg-emerald-600 hover:bg-emerald-700 text-white"
        >
          <Plus className="h-4 w-4 me-2" />
          {t('recordSale')}
        </Button>
      </div>

      {/* Sales by date */}
      {sortedDates.length === 0 ? (
        <Card className="border-0 shadow-md">
          <CardContent className="flex flex-col items-center justify-center py-16 text-muted-foreground">
            <Receipt className="h-16 w-16 mb-4 opacity-50" />
            <p className="text-lg">{t('noSalesYet')}</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {sortedDates.map((date) => {
            const dateSales = salesByDate[date]
            const dateTotal = dateSales.reduce((sum, s) => sum + s.totalAmount, 0)
            const dateItems = dateSales.reduce((sum, s) => sum + s.items.length, 0)
            const isExpanded = expandedDate === date

            return (
              <motion.div
                key={date}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Card className="border-0 shadow-md overflow-hidden">
                  <button
                    className="w-full"
                    onClick={() => setExpandedDate(isExpanded ? null : date)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-900/40">
                            <Calendar className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                          </div>
                          <div className="text-start">
                            <p className="font-medium text-foreground">
                              {formatDate(date)}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {dateItems} {t('items')}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="font-bold text-emerald-600 dark:text-emerald-400">
                            {dateTotal.toLocaleString()} {t('currency')}
                          </span>
                          {isExpanded ? (
                            <ChevronUp className="h-4 w-4 text-muted-foreground" />
                          ) : (
                            <ChevronDown className="h-4 w-4 text-muted-foreground" />
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </button>

                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <div className="border-t">
                          {dateSales.map((sale) => (
                            <div key={sale.id} className="p-3 border-b last:border-b-0">
                              <div className="flex items-center justify-between mb-2">
                                <Badge variant="outline" className="text-xs">
                                  {new Date(sale.createdAt).toLocaleTimeString(
                                    language === 'ar' ? 'ar-SA' : 'en-US',
                                    { hour: '2-digit', minute: '2-digit' }
                                  )}
                                </Badge>
                                <div className="flex items-center gap-2">
                                  <span className="text-sm font-medium">
                                    {sale.totalAmount.toLocaleString()} {t('currency')}
                                  </span>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7 text-destructive hover:text-destructive"
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      deleteSale(sale.id)
                                    }}
                                  >
                                    <Trash2 className="h-3.5 w-3.5" />
                                  </Button>
                                </div>
                              </div>
                              <div className="space-y-1">
                                {sale.items.map((item, i) => (
                                  <div
                                    key={i}
                                    className="flex items-center justify-between text-xs text-muted-foreground"
                                  >
                                    <span>
                                      {item.productName} × {item.quantity}
                                    </span>
                                    <span>
                                      {item.totalPrice.toLocaleString()} {t('currency')}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </Card>
              </motion.div>
            )
          })}
        </div>
      )}

      <RecordSaleDialog open={saleDialogOpen} onOpenChange={setSaleDialogOpen} />
    </div>
  )
}
