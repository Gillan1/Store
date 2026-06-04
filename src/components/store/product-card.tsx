'use client'

import { useLanguage } from '@/hooks/use-language'
import { useAuthStore } from '@/store/auth-store'
import { type Product } from '@/store/product-store'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ShoppingCart } from 'lucide-react'
import { motion } from 'framer-motion'

interface ProductCardProps {
  product: Product
  onRecordSale?: (product: Product) => void
  index: number
}

export function ProductCard({ product, onRecordSale, index }: ProductCardProps) {
  const { t, language } = useLanguage()
  const { isAdmin } = useAuthStore()

  const name = language === 'ar' ? product.nameAr : product.nameEn
  const description = language === 'ar' ? product.descriptionAr : product.descriptionEn

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
    >
      <Card className="group overflow-hidden border-0 shadow-md hover:shadow-xl transition-all duration-300 bg-card">
        <div className="relative aspect-square overflow-hidden bg-muted/30">
          <img
            src={product.image}
            alt={name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
          <Badge className="absolute top-3 end-3 bg-emerald-600 text-white hover:bg-emerald-700 shadow-lg">
            {product.price.toLocaleString()} {t('currency')}
          </Badge>
        </div>
        <CardContent className="p-4 space-y-2">
          <h3 className="font-bold text-base text-foreground truncate">
            {name}
          </h3>
          {description && (
            <p className="text-sm text-muted-foreground line-clamp-2">
              {description}
            </p>
          )}
          <div className="flex items-center justify-between pt-1">
            <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
              {product.price.toLocaleString()} {t('currency')}
            </span>
            {isAdmin && onRecordSale && (
              <Button
                size="sm"
                onClick={() => onRecordSale(product)}
                className="bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-700 dark:hover:bg-emerald-600 text-white"
              >
                <ShoppingCart className="h-4 w-4 me-1" />
                {t('recordSale')}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
