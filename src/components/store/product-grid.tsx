'use client'

import { useProductStore, type Product } from '@/store/product-store'
import { useLanguage } from '@/hooks/use-language'
import { ProductCard } from './product-card'
import { PackageOpen } from 'lucide-react'

interface ProductGridProps {
  onRecordSale: (product: Product) => void
}

export function ProductGrid({ onRecordSale }: ProductGridProps) {
  const { products } = useProductStore()
  const { t } = useLanguage()

  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
        <PackageOpen className="h-16 w-16 mb-4 opacity-50" />
        <p className="text-lg">{t('noProducts')}</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 p-4">
      {products.map((product, index) => (
        <ProductCard
          key={product.id}
          product={product}
          onRecordSale={onRecordSale}
          index={index}
        />
      ))}
    </div>
  )
}
