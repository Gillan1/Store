'use client'

import { useState } from 'react'
import { useProductStore, type Product } from '@/store/product-store'
import { useAuthStore } from '@/store/auth-store'
import { useLanguage } from '@/hooks/use-language'
import { useTheme } from 'next-themes'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { AddProductForm } from './add-product-form'
import { toast } from 'sonner'
import { motion } from 'framer-motion'
import {
  Settings,
  Trash2,
  Package,
  Sun,
  Moon,
  Globe,
  Palette,
} from 'lucide-react'

export function SettingsView() {
  const { products, deleteProduct } = useProductStore()
  const { isAdmin } = useAuthStore()
  const { t, language, setLanguage } = useLanguage()
  const { theme, setTheme } = useTheme()
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null)

  if (!isAdmin) return null

  const handleDelete = () => {
    if (deleteTarget) {
      deleteProduct(deleteTarget.id)
      toast.success(t('productDeleted'))
      setDeleteTarget(null)
    }
  }

  const productName = (p: Product) => (language === 'ar' ? p.nameAr : p.nameEn)

  return (
    <div className="space-y-6 p-4">
      {/* Product Management */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0 }}
      >
        <div className="flex items-center gap-2 mb-4">
          <Package className="h-5 w-5 text-emerald-600" />
          <h2 className="text-lg font-bold">{t('productManagement')}</h2>
        </div>

        <AddProductForm />

        <div className="mt-6 space-y-3">
          <h3 className="text-sm font-medium text-muted-foreground">{t('currentProducts')}</h3>
          {products.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">{t('noProducts')}</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {products.map((product, index) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card className="border-0 shadow-md overflow-hidden">
                    <CardContent className="p-3">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-lg overflow-hidden bg-muted/30 flex-shrink-0">
                          <img
                            src={product.image}
                            alt={productName(product)}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">
                            {productName(product)}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {product.price.toLocaleString()} {t('currency')}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:text-destructive flex-shrink-0"
                          onClick={() => setDeleteTarget(product)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </motion.div>

      <Separator />

      {/* Appearance */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <div className="flex items-center gap-2 mb-4">
          <Palette className="h-5 w-5 text-emerald-600" />
          <h2 className="text-lg font-bold">{t('appearance')}</h2>
        </div>

        <Card className="border-0 shadow-md">
          <CardContent className="p-4 space-y-4">
            {/* Dark mode toggle */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {theme === 'dark' ? (
                  <Moon className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <Sun className="h-4 w-4 text-muted-foreground" />
                )}
                <Label htmlFor="dark-mode">{t('darkMode')}</Label>
              </div>
              <Switch
                id="dark-mode"
                checked={theme === 'dark'}
                onCheckedChange={(checked) => setTheme(checked ? 'dark' : 'light')}
              />
            </div>

            <Separator />

            {/* Language toggle */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Globe className="h-4 w-4 text-muted-foreground" />
                <Label>{t('language')}</Label>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant={language === 'ar' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setLanguage('ar')}
                  className={language === 'ar' ? 'bg-emerald-600 hover:bg-emerald-700' : ''}
                >
                  {t('arabic')}
                </Button>
                <Button
                  variant={language === 'en' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setLanguage('en')}
                  className={language === 'en' ? 'bg-emerald-600 hover:bg-emerald-700' : ''}
                >
                  {t('english')}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Delete confirmation dialog */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent dir={language === 'ar' ? 'rtl' : 'ltr'}>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('confirmDelete')}</AlertDialogTitle>
            <AlertDialogDescription>
              {deleteTarget && `${productName(deleteTarget)} - ${deleteTarget.price.toLocaleString()} ${t('currency')}`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('cancel')}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {t('confirm')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
