'use client'

import { useState } from 'react'
import { useProductStore, type Product, type Category, categories } from '@/store/product-store'
import { useLanguage } from '@/hooks/use-language'
import { ProductCard } from './product-card'
import { PackageOpen, AlertCircle } from 'lucide-react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface ProductGridProps {
  onRecordSale: (product: Product) => void
}

export function ProductGrid({ onRecordSale }: ProductGridProps) {
  const { products } = useProductStore()
  const { t, language } = useLanguage()
  const [activeCategory, setActiveCategory] = useState<Category | 'all'>('all')

  const filteredProducts =
    activeCategory === 'all'
      ? products
      : products.filter((p) => p.category === activeCategory)

  // Check which categories have no products at all
  const emptyCategories = categories.filter(
    (cat) => !products.some((p) => p.category === cat.id)
  )

  // If we're viewing a specific category that is empty, show the out-of-stock message
  const isViewingEmptyCategory =
    activeCategory !== 'all' && emptyCategories.some((c) => c.id === activeCategory)

  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
        <PackageOpen className="h-16 w-16 mb-4 opacity-50" />
        <p className="text-lg">{t('noProducts')}</p>
      </div>
    )
  }

  return (
    <div className="p-4">
      {/* Category filter buttons */}
      <div className="mb-6 overflow-x-auto pb-2">
        <div className="flex gap-2 min-w-max">
          <button
            onClick={() => setActiveCategory('all')}
            className={cn(
              'px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 whitespace-nowrap',
              activeCategory === 'all'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-200 dark:shadow-emerald-900/30'
                : 'bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground'
            )}
          >
            {t('allCategories')}
          </button>
          {categories.map((cat) => {
            const isActive = activeCategory === cat.id
            const productCount = products.filter((p) => p.category === cat.id).length
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={cn(
                  'px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 whitespace-nowrap flex items-center gap-1.5',
                  isActive
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-200 dark:shadow-emerald-900/30'
                    : productCount === 0
                      ? 'bg-muted/30 text-muted-foreground/50 cursor-not-allowed'
                      : 'bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground'
                )}
              >
                <span>{cat.icon}</span>
                <span>{language === 'ar' ? cat.nameAr : cat.nameEn}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Empty category message */}
      {isViewingEmptyCategory && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <div className="flex flex-col items-center justify-center py-16 px-4 rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 border border-amber-200/50 dark:border-amber-800/30">
            <div className="w-16 h-16 rounded-full bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center mb-4">
              <AlertCircle className="h-8 w-8 text-amber-600 dark:text-amber-400" />
            </div>
            <h3 className="text-lg font-bold text-amber-700 dark:text-amber-400 mb-2">
              {t('outOfStock')}
            </h3>
            <p className="text-sm text-amber-600/80 dark:text-amber-400/70 text-center max-w-sm leading-relaxed">
              {t('outOfStockMessage')}
            </p>
          </div>
        </motion.div>
      )}

      {/* Products grid */}
      {!isViewingEmptyCategory && filteredProducts.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredProducts.map((product, index) => (
            <ProductCard
              key={product.id}
              product={product}
              onRecordSale={onRecordSale}
              index={index}
            />
          ))}
        </div>
      )}

      {/* No products in this non-empty category (filtered but empty) */}
      {!isViewingEmptyCategory && filteredProducts.length === 0 && activeCategory !== 'all' && (
        <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
          <PackageOpen className="h-16 w-16 mb-4 opacity-50" />
          <p className="text-lg">{t('noProducts')}</p>
        </div>
      )}
    </div>
  )
}
