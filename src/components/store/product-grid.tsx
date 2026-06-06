'use client'

import { useState, useMemo } from 'react'
import { useProductStore, type Product, type Category, categories } from '@/store/product-store'
import { useLanguage } from '@/hooks/use-language'
import { ProductCard } from './product-card'
import { PackageOpen, AlertCircle, Search } from 'lucide-react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { Input } from '@/components/ui/input'

interface ProductGridProps {
  onRecordSale: (product: Product) => void
}

export function ProductGrid({ onRecordSale }: ProductGridProps) {
  const { products } = useProductStore()
  const { t, language } = useLanguage()
  const [activeCategory, setActiveCategory] = useState<Category | 'all'>('all')
  const [searchQuery, setSearchQuery] = useState('')

  // Filter products by search query
  const searchFiltered = useMemo(() => {
    if (!searchQuery.trim()) return products
    const query = searchQuery.trim().toLowerCase()
    return products.filter((p) => {
      const nameMatch = p.nameAr.toLowerCase().includes(query) || p.nameEn.toLowerCase().includes(query)
      const descMatch = (p.descriptionAr || '').toLowerCase().includes(query) || (p.descriptionEn || '').toLowerCase().includes(query)
      const catInfo = categories.find((c) => c.id === p.category)
      const catMatch = catInfo
        ? catInfo.nameAr.toLowerCase().includes(query) || catInfo.nameEn.toLowerCase().includes(query)
        : false
      const priceMatch = p.price.toString().includes(query)
      return nameMatch || descMatch || catMatch || priceMatch
    })
  }, [products, searchQuery])

  // Filter by category
  const filteredProducts =
    activeCategory === 'all'
      ? searchFiltered
      : searchFiltered.filter((p) => p.category === activeCategory)

  // Check which categories have no products at all
  const emptyCategories = categories.filter(
    (cat) => !products.some((p) => p.category === cat.id)
  )

  // If we're viewing a specific category that is empty, show the out-of-stock message
  const isViewingEmptyCategory =
    activeCategory !== 'all' && emptyCategories.some((c) => c.id === activeCategory)

  // Are we searching?
  const isSearching = searchQuery.trim().length > 0

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
      {/* Search bar */}
      <div className="mb-4 relative">
        <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={t('searchProducts')}
          className="ps-9 h-10 bg-muted/30 border-0 focus-visible:ring-1"
        />
      </div>

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
      {isViewingEmptyCategory && !isSearching && (
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

      {/* Search results with no matches */}
      {isSearching && filteredProducts.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
          <Search className="h-12 w-12 mb-3 opacity-40" />
          <p className="text-lg">{t('noSearchResults')}</p>
          <p className="text-sm mt-1">&quot;{searchQuery}&quot;</p>
        </div>
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
      {!isViewingEmptyCategory && !isSearching && filteredProducts.length === 0 && activeCategory !== 'all' && (
        <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
          <PackageOpen className="h-16 w-16 mb-4 opacity-50" />
          <p className="text-lg">{t('noProducts')}</p>
        </div>
      )}
    </div>
  )
}
