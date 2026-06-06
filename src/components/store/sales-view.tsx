'use client'

import { useState, useMemo } from 'react'
import { useSalesStore } from '@/store/sales-store'
import { useLanguage } from '@/hooks/use-language'
import { useAuthStore } from '@/store/auth-store'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { RecordSaleDialog } from './record-sale-dialog'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  BarChart3,
  TrendingUp,
  Calendar,
  ChevronDown,
  ChevronUp,
  Plus,
  Trash2,
  Receipt,
  Copy,
  FileText,
  Camera,
  BarChart,
  PieChart,
  Award,
  Printer,
} from 'lucide-react'

export function SalesView() {
  const { sales, deleteSale } = useSalesStore()
  const { t, language } = useLanguage()
  const { isAdmin } = useAuthStore()
  const [expandedDate, setExpandedDate] = useState<string | null>(null)
  const [saleDialogOpen, setSaleDialogOpen] = useState(false)
  const [receiptImage, setReceiptImage] = useState<string | null>(null)

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

  // === STATISTICS ===

  // Top selling products
  const topProducts = useMemo(() => {
    const productMap: Record<string, { name: string; quantity: number; revenue: number }> = {}
    sales.forEach((sale) => {
      sale.items.forEach((item) => {
        if (!productMap[item.productId]) {
          productMap[item.productId] = { name: item.productName, quantity: 0, revenue: 0 }
        }
        productMap[item.productId].quantity += item.quantity
        productMap[item.productId].revenue += item.totalPrice
      })
    })
    return Object.values(productMap).sort((a, b) => b.quantity - a.quantity).slice(0, 5)
  }, [sales])

  // Last 7 days sales data
  const last7Days = useMemo(() => {
    const days: { date: string; label: string; revenue: number; count: number }[] = []
    for (let i = 6; i >= 0; i--) {
      const d = new Date()
      d.setDate(d.getDate() - i)
      const dateStr = d.toISOString().split('T')[0]
      const dayLabel = d.toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US', { weekday: 'short', day: 'numeric' })
      const daySales = sales.filter((s) => s.date === dateStr)
      days.push({
        date: dateStr,
        label: dayLabel,
        revenue: daySales.reduce((sum, s) => sum + s.totalAmount, 0),
        count: daySales.length,
      })
    }
    return days
  }, [sales, language])

  const maxRevenue = Math.max(...last7Days.map((d) => d.revenue), 1)

  // Copy service statistics
  const copyStats = useMemo(() => {
    let coloredPages = 0
    let normalPages = 0
    let copyRevenue = 0
    sales.forEach((sale) => {
      if (sale.copyService) {
        if (sale.copyService.type === 'colored') {
          coloredPages += sale.copyService.quantity
        } else {
          normalPages += sale.copyService.quantity
        }
        copyRevenue += sale.copyService.totalPrice
      }
    })
    return { coloredPages, normalPages, totalCopies: coloredPages + normalPages, copyRevenue }
  }, [sales])

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

      {/* Tabs: Sales History | Statistics */}
      <Tabs defaultValue="history" dir={language === 'ar' ? 'rtl' : 'ltr'}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="history" className="flex items-center gap-1.5">
            <Receipt className="h-4 w-4" />
            {t('dailySales')}
          </TabsTrigger>
          <TabsTrigger value="statistics" className="flex items-center gap-1.5">
            <BarChart className="h-4 w-4" />
            {t('statistics')}
          </TabsTrigger>
        </TabsList>

        {/* Sales History Tab */}
        <TabsContent value="history" className="mt-4">
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

                                  {/* Product items */}
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

                                  {/* Copy service info */}
                                  {sale.copyService && (
                                    <div className="mt-2 p-2 rounded-md bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800">
                                      <div className="flex items-center justify-between text-xs">
                                        <span className="flex items-center gap-1 font-medium text-blue-700 dark:text-blue-400">
                                          <Copy className="h-3 w-3" />
                                          {t('copyServiceSummary')}
                                        </span>
                                        <span className="font-medium text-blue-700 dark:text-blue-400">
                                          {sale.copyService.totalPrice.toLocaleString()} {t('currency')}
                                        </span>
                                      </div>
                                      <p className="text-xs text-muted-foreground mt-1">
                                        {sale.copyService.type === 'colored' ? t('copyColored') : t('copyNormal')} - {sale.copyService.quantity} {language === 'ar' ? 'صفحة' : 'page(s)'} × {sale.copyService.unitPrice.toLocaleString()} {t('currency')}
                                      </p>
                                    </div>
                                  )}

                                  {/* Bank receipt info */}
                                  {sale.bankReceipt && (
                                    <div className="mt-2">
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation()
                                          setReceiptImage(sale.bankReceipt || null)
                                        }}
                                        className="flex items-center gap-1.5 text-xs font-medium text-amber-600 dark:text-amber-400 hover:underline"
                                      >
                                        <Camera className="h-3 w-3" />
                                        {t('viewBankReceipt')}
                                      </button>
                                    </div>
                                  )}
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
        </TabsContent>

        {/* Statistics Tab */}
        <TabsContent value="statistics" className="mt-4 space-y-4">
          {/* Sales chart - Last 7 days */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className="border-0 shadow-md">
              <CardContent className="p-4">
                <h3 className="font-bold text-sm mb-4 flex items-center gap-2">
                  <BarChart className="h-4 w-4 text-emerald-600" />
                  {t('last7Days')} - {t('revenueLabel')}
                </h3>
                <div className="space-y-2">
                  {last7Days.map((day) => (
                    <div key={day.date} className="flex items-center gap-3">
                      <span className="text-xs text-muted-foreground w-16 text-start flex-shrink-0 truncate">
                        {day.label}
                      </span>
                      <div className="flex-1 h-7 bg-muted/30 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${maxRevenue > 0 ? (day.revenue / maxRevenue) * 100 : 0}%` }}
                          transition={{ duration: 0.6, ease: 'easeOut' }}
                          className="h-full bg-gradient-to-l from-emerald-500 to-emerald-400 rounded-full min-w-[2px]"
                        />
                      </div>
                      <span className="text-xs font-medium w-28 text-end flex-shrink-0">
                        {day.revenue > 0 ? `${day.revenue.toLocaleString()} ${t('currency')}` : '-'}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Top selling products */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="border-0 shadow-md">
              <CardContent className="p-4">
                <h3 className="font-bold text-sm mb-4 flex items-center gap-2">
                  <Award className="h-4 w-4 text-amber-500" />
                  {t('topSellingProducts')}
                </h3>
                {topProducts.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">{t('noSalesYet')}</p>
                ) : (
                  <div className="space-y-3">
                    {topProducts.map((product, index) => {
                      const maxQty = topProducts[0]?.quantity || 1
                      return (
                        <div key={product.name} className="space-y-1">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className={`flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${
                                index === 0 ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400' :
                                index === 1 ? 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300' :
                                index === 2 ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-400' :
                                'bg-muted text-muted-foreground'
                              }`}>
                                {index + 1}
                              </span>
                              <span className="text-sm font-medium truncate max-w-[150px]">{product.name}</span>
                            </div>
                            <span className="text-xs text-muted-foreground">
                              {product.quantity} × {product.revenue.toLocaleString()} {t('currency')}
                            </span>
                          </div>
                          <div className="h-2 bg-muted/30 rounded-full overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${(product.quantity / maxQty) * 100}%` }}
                              transition={{ duration: 0.6, ease: 'easeOut', delay: index * 0.1 }}
                              className={`h-full rounded-full ${
                                index === 0 ? 'bg-amber-500' :
                                index === 1 ? 'bg-gray-400' :
                                index === 2 ? 'bg-orange-400' :
                                'bg-emerald-400'
                              }`}
                            />
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Copy service stats */}
          {copyStats.totalCopies > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="border-0 shadow-md">
                <CardContent className="p-4">
                  <h3 className="font-bold text-sm mb-4 flex items-center gap-2">
                    <Printer className="h-4 w-4 text-blue-600" />
                    {t('copyServiceStats')}
                  </h3>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-950/30 text-center">
                      <p className="text-2xl font-bold text-blue-700 dark:text-blue-400">{copyStats.coloredPages}</p>
                      <p className="text-xs text-muted-foreground mt-1">{t('coloredCopies')}</p>
                    </div>
                    <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-900/30 text-center">
                      <p className="text-2xl font-bold text-gray-700 dark:text-gray-400">{copyStats.normalPages}</p>
                      <p className="text-xs text-muted-foreground mt-1">{t('normalCopies')}</p>
                    </div>
                    <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 text-center">
                      <p className="text-2xl font-bold text-emerald-700 dark:text-emerald-400">{copyStats.totalCopies}</p>
                      <p className="text-xs text-muted-foreground mt-1">{t('totalCopies')}</p>
                    </div>
                  </div>
                  {/* Visual bar for colored vs normal */}
                  {copyStats.totalCopies > 0 && (
                    <div className="mt-3">
                      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden flex">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${(copyStats.coloredPages / copyStats.totalCopies) * 100}%` }}
                          transition={{ duration: 0.6 }}
                          className="h-full bg-blue-500"
                        />
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${(copyStats.normalPages / copyStats.totalCopies) * 100}%` }}
                          transition={{ duration: 0.6 }}
                          className="h-full bg-gray-400"
                        />
                      </div>
                      <div className="flex justify-between mt-1">
                        <span className="text-xs text-blue-600 dark:text-blue-400 flex items-center gap-1">
                          <span className="w-2 h-2 rounded-full bg-blue-500 inline-block" />
                          {t('copyColored')} {Math.round((copyStats.coloredPages / copyStats.totalCopies) * 100)}%
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                          <span className="w-2 h-2 rounded-full bg-gray-400 inline-block" />
                          {t('copyNormal')} {Math.round((copyStats.normalPages / copyStats.totalCopies) * 100)}%
                        </span>
                      </div>
                    </div>
                  )}
                  <div className="mt-3 pt-3 border-t flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">{t('revenueLabel')}</span>
                    <span className="font-bold text-blue-600 dark:text-blue-400">
                      {copyStats.copyRevenue.toLocaleString()} {t('currency')}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </TabsContent>
      </Tabs>

      <RecordSaleDialog open={saleDialogOpen} onOpenChange={setSaleDialogOpen} />

      {/* Bank Receipt Preview Dialog */}
      <Dialog open={!!receiptImage} onOpenChange={(open) => { if (!open) setReceiptImage(null) }}>
        <DialogContent className="sm:max-w-lg" dir={language === 'ar' ? 'rtl' : 'ltr'}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-amber-600" />
              {t('bankReceipt')}
            </DialogTitle>
          </DialogHeader>
          {receiptImage && (
            <div className="rounded-md overflow-hidden border">
              <img
                src={receiptImage}
                alt={t('bankReceipt')}
                className="w-full object-contain max-h-[70vh] bg-white"
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
