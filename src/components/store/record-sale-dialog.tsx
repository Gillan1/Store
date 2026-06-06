'use client'

import { useState } from 'react'
import { useProductStore, type Product } from '@/store/product-store'
import { useSalesStore, type SaleItem } from '@/store/sales-store'
import { useLanguage } from '@/hooks/use-language'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { toast } from 'sonner'
import { Plus, Trash2, ShoppingCart } from 'lucide-react'

interface RecordSaleDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  preselectedProduct?: Product | null
}

export function RecordSaleDialog({ open, onOpenChange, preselectedProduct }: RecordSaleDialogProps) {
  const { products } = useProductStore()
  const { addSale } = useSalesStore()
  const { t, language } = useLanguage()

  const [selectedProductId, setSelectedProductId] = useState<string>(preselectedProduct?.id || '')
  const [quantity, setQuantity] = useState<number>(1)
  const [items, setItems] = useState<SaleItem[]>([])

  // When dialog opens with preselected product, use it
  const effectiveSelectedId = open && preselectedProduct ? preselectedProduct.id : selectedProductId

  const selectedProduct = products.find((p) => p.id === effectiveSelectedId)
  const productName = (p: Product) => (language === 'ar' ? p.nameAr : p.nameEn)

  const handleAddToList = () => {
    if (!selectedProduct || quantity <= 0) return

    const existingIndex = items.findIndex((i) => i.productId === selectedProduct.id)
    if (existingIndex >= 0) {
      const updated = [...items]
      const existing = updated[existingIndex]
      const newQty = existing.quantity + quantity
      updated[existingIndex] = {
        ...existing,
        quantity: newQty,
        totalPrice: newQty * existing.unitPrice,
      }
      setItems(updated)
    } else {
      setItems([
        ...items,
        {
          productId: selectedProduct.id,
          productName: productName(selectedProduct),
          quantity,
          unitPrice: selectedProduct.price,
          totalPrice: quantity * selectedProduct.price,
        },
      ])
    }
    setQuantity(1)
  }

  const handleRemoveItem = (productId: string) => {
    setItems(items.filter((i) => i.productId !== productId))
  }

  const totalAmount = items.reduce((sum, i) => sum + i.totalPrice, 0)

  const handleConfirm = () => {
    if (items.length === 0) return

    const today = new Date().toISOString().split('T')[0]
    addSale({
      id: crypto.randomUUID(),
      date: today,
      items: [...items],
      totalAmount,
      createdAt: new Date().toISOString(),
    })

    toast.success(t('saleRecorded'))
    setItems([])
    setQuantity(1)
    setSelectedProductId('')
    onOpenChange(false)
  }

  const handleClose = (open: boolean) => {
    if (!open) {
      setItems([])
      setQuantity(1)
      setSelectedProductId(preselectedProduct?.id || '')
    }
    onOpenChange(open)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg" dir={language === 'ar' ? 'rtl' : 'ltr'}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5 text-emerald-600" />
            {t('recordSale')}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Product selector */}
          <div className="space-y-2">
            <select
              value={effectiveSelectedId}
              onChange={(e) => setSelectedProductId(e.target.value)}
              disabled={!!preselectedProduct}
              className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="">{t('selectProduct')}</option>
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {productName(p)} - {p.price.toLocaleString()} {t('currency')}
                </option>
              ))}
            </select>

            {selectedProduct && (
              <div className="flex items-center gap-2">
                <div className="flex-1">
                  <label className="text-xs text-muted-foreground">{t('quantity')}</label>
                  <Input
                    type="number"
                    min={1}
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                    className="h-10"
                  />
                </div>
                <div className="text-sm mt-4">
                  {(quantity * selectedProduct.price).toLocaleString()} {t('currency')}
                </div>
                <Button
                  size="sm"
                  onClick={handleAddToList}
                  className="mt-4 bg-emerald-600 hover:bg-emerald-700"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>

          <Separator />

          {/* Items list */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium">{t('saleItems')}</h4>
            {items.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">{t('emptyCart')}</p>
            ) : (
              <ScrollArea className="max-h-48">
                <div className="space-y-2">
                  {items.map((item) => (
                    <div
                      key={item.productId}
                      className="flex items-center justify-between p-2 rounded-lg bg-muted/50"
                    >
                      <div className="flex-1">
                        <p className="text-sm font-medium">{item.productName}</p>
                        <p className="text-xs text-muted-foreground">
                          {item.quantity} x {item.unitPrice.toLocaleString()} {t('currency')}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                          {item.totalPrice.toLocaleString()} {t('currency')}
                        </span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:text-destructive"
                          onClick={() => handleRemoveItem(item.productId)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}
          </div>

          {items.length > 0 && (
            <>
              <Separator />
              <div className="flex justify-between items-center">
                <span className="font-medium">{t('saleTotal')}</span>
                <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                  {totalAmount.toLocaleString()} {t('currency')}
                </span>
              </div>
            </>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => handleClose(false)}>
            {t('cancel')}
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={items.length === 0}
            className="bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            {t('confirm')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
