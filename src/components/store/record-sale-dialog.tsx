'use client'

import { useState, useRef } from 'react'
import { useProductStore, type Product } from '@/store/product-store'
import { useSalesStore, type SaleItem, type CopyServiceItem } from '@/store/sales-store'
import { useLanguage } from '@/hooks/use-language'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { Plus, Trash2, ShoppingCart, Camera, Copy, FileText, X, Image as ImageIcon } from 'lucide-react'

interface RecordSaleDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  preselectedProduct?: Product | null
}

export function RecordSaleDialog({ open, onOpenChange, preselectedProduct }: RecordSaleDialogProps) {
  const { products } = useProductStore()
  const { addSale } = useSalesStore()
  const { t, language } = useLanguage()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [selectedProductId, setSelectedProductId] = useState<string>(preselectedProduct?.id || '')
  const [quantity, setQuantity] = useState<number>(1)
  const [items, setItems] = useState<SaleItem[]>([])

  // Copy service state
  const [copyEnabled, setCopyEnabled] = useState(false)
  const [copyType, setCopyType] = useState<'colored' | 'normal'>('normal')
  const [copyQuantity, setCopyQuantity] = useState<number>(1)
  const [copyPricePerPage, setCopyPricePerPage] = useState<number>(0)

  // Bank receipt state
  const [bankReceipt, setBankReceipt] = useState<string | null>(null)

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

  // Calculate total
  const productsTotal = items.reduce((sum, i) => sum + i.totalPrice, 0)
  const copyTotal = copyEnabled ? copyQuantity * copyPricePerPage : 0
  const totalAmount = productsTotal + copyTotal

  // Bank receipt upload handler
  const handleBankReceiptUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error(language === 'ar' ? 'يرجى اختيار ملف صورة فقط' : 'Please select an image file only')
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error(language === 'ar' ? 'حجم الصورة كبير جداً (الحد الأقصى 5 ميجا)' : 'Image too large (max 5MB)')
      return
    }

    const reader = new FileReader()
    reader.onloadend = () => {
      const base64 = reader.result as string
      setBankReceipt(base64)
    }
    reader.readAsDataURL(file)
  }

  const handleCameraCapture = () => {
    fileInputRef.current?.click()
  }

  const handleRemoveBankReceipt = () => {
    setBankReceipt(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleConfirm = () => {
    if (items.length === 0 && !copyEnabled) return

    const today = new Date().toISOString().split('T')[0]
    const copyService: CopyServiceItem | undefined = copyEnabled
      ? { quantity: copyQuantity, type: copyType, unitPrice: copyPricePerPage, totalPrice: copyTotal }
      : undefined

    addSale({
      id: crypto.randomUUID(),
      date: today,
      items: [...items],
      copyService,
      bankReceipt: bankReceipt || undefined,
      totalAmount,
      createdAt: new Date().toISOString(),
    })

    toast.success(t('saleRecorded'))
    setItems([])
    setQuantity(1)
    setSelectedProductId('')
    setCopyEnabled(false)
    setCopyType('normal')
    setCopyQuantity(1)
    setCopyPricePerPage(0)
    setBankReceipt(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
    onOpenChange(false)
  }

  const handleClose = (open: boolean) => {
    if (!open) {
      setItems([])
      setQuantity(1)
      setSelectedProductId(preselectedProduct?.id || '')
      setCopyEnabled(false)
      setCopyType('normal')
      setCopyQuantity(1)
      setCopyPricePerPage(0)
      setBankReceipt(null)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
    onOpenChange(open)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto" dir={language === 'ar' ? 'rtl' : 'ltr'}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5 text-emerald-600" />
            {t('recordSale')}
          </DialogTitle>
          <DialogDescription className="sr-only">
            {t('recordSale')}
          </DialogDescription>
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
            {items.length === 0 && !copyEnabled ? (
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
                          {item.quantity} × {item.unitPrice.toLocaleString()} {t('currency')}
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

                  {/* Copy service in items list */}
                  {copyEnabled && (
                    <div className="flex items-center justify-between p-2 rounded-lg bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800">
                      <div className="flex-1">
                        <p className="text-sm font-medium flex items-center gap-1">
                          <Copy className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                          {t('copyServiceSummary')}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {copyType === 'colored' ? t('copyColored') : t('copyNormal')} - {copyQuantity} {language === 'ar' ? 'صفحة' : 'page(s)'} × {copyPricePerPage.toLocaleString()} {t('currency')}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-blue-600 dark:text-blue-400">
                          {copyTotal.toLocaleString()} {t('currency')}
                        </span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:text-destructive"
                          onClick={() => {
                            setCopyEnabled(false)
                            setCopyQuantity(1)
                            setCopyPricePerPage(0)
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </ScrollArea>
            )}
          </div>

          <Separator />

          {/* Copy Service Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium flex items-center gap-2">
                <Copy className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                {t('copyService')}
              </h4>
              {!copyEnabled && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCopyEnabled(true)}
                  className="text-blue-600 border-blue-300 hover:bg-blue-50 dark:text-blue-400 dark:border-blue-700 dark:hover:bg-blue-950/30"
                >
                  <Plus className="h-3.5 w-3.5 me-1" />
                  {t('addCopyService')}
                </Button>
              )}
            </div>

            {copyEnabled && (
              <div className="p-3 rounded-lg border border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-950/20 space-y-3">
                {/* Copy type selection */}
                <div className="space-y-2">
                  <label className="text-xs font-medium text-muted-foreground">{t('copyType')}</label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setCopyType('normal')}
                      className={`flex-1 px-3 py-2 rounded-md text-sm font-medium transition-all border ${
                        copyType === 'normal'
                          ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                          : 'bg-background border-input hover:bg-accent text-foreground'
                      }`}
                    >
                      {t('copyNormal')}
                    </button>
                    <button
                      type="button"
                      onClick={() => setCopyType('colored')}
                      className={`flex-1 px-3 py-2 rounded-md text-sm font-medium transition-all border ${
                        copyType === 'colored'
                          ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                          : 'bg-background border-input hover:bg-accent text-foreground'
                      }`}
                    >
                      {t('copyColored')}
                    </button>
                  </div>
                </div>

                {/* Copy quantity */}
                <div>
                  <label className="text-xs font-medium text-muted-foreground">{t('copyQuantity')}</label>
                  <Input
                    type="number"
                    min={1}
                    value={copyQuantity}
                    onChange={(e) => setCopyQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                    className="h-10 mt-1"
                  />
                </div>

                {/* Price per page */}
                <div>
                  <label className="text-xs font-medium text-muted-foreground">{t('copyPricePerPage')}</label>
                  <Input
                    type="number"
                    min={0}
                    value={copyPricePerPage}
                    onChange={(e) => setCopyPricePerPage(Math.max(0, parseInt(e.target.value) || 0))}
                    className="h-10 mt-1"
                    placeholder={language === 'ar' ? 'أدخل السعر لكل صفحة' : 'Enter price per page'}
                  />
                </div>

                {/* Copy service total */}
                {copyTotal > 0 && (
                  <div className="flex justify-between items-center pt-1">
                    <span className="text-xs text-muted-foreground">{t('total')}</span>
                    <span className="text-sm font-bold text-blue-600 dark:text-blue-400">
                      {copyTotal.toLocaleString()} {t('currency')}
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>

          <Separator />

          {/* Bank Receipt Section */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium flex items-center gap-2">
              <FileText className="h-4 w-4 text-amber-600 dark:text-amber-400" />
              {t('bankReceipt')}
            </h4>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleBankReceiptUpload}
              className="hidden"
            />

            {bankReceipt ? (
              <div className="p-3 rounded-lg border border-amber-200 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-950/20 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ImageIcon className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                    <span className="text-sm font-medium text-amber-700 dark:text-amber-400">
                      {t('bankReceiptUploaded')}
                    </span>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleCameraCapture}
                      className="h-7 text-xs border-amber-300 hover:bg-amber-100 dark:border-amber-700 dark:hover:bg-amber-950/30"
                    >
                      {t('changePhoto')}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleRemoveBankReceipt}
                      className="h-7 text-xs text-destructive hover:text-destructive"
                    >
                      <X className="h-3.5 w-3.5 me-1" />
                      {t('removeBankReceipt')}
                    </Button>
                  </div>
                </div>
                {/* Receipt preview */}
                <div className="rounded-md overflow-hidden border border-amber-200 dark:border-amber-800">
                  <img
                    src={bankReceipt}
                    alt={t('bankReceipt')}
                    className="w-full max-h-40 object-contain bg-white"
                  />
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-lg border border-dashed border-amber-300 dark:border-amber-700 bg-amber-50/30 dark:bg-amber-950/10">
                <div className="flex flex-col items-center gap-2 text-center">
                  <Camera className="h-8 w-8 text-amber-400 dark:text-amber-500" />
                  <p className="text-xs text-muted-foreground">
                    {language === 'ar'
                      ? 'التقط صورة لإشعار البنك من كاميرا الهاتف'
                      : 'Capture a photo of the bank receipt from your phone camera'}
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCameraCapture}
                    className="mt-1 text-amber-600 border-amber-300 hover:bg-amber-100 dark:text-amber-400 dark:border-amber-700 dark:hover:bg-amber-950/30"
                  >
                    <Camera className="h-3.5 w-3.5 me-1" />
                    {t('takePhoto')}
                  </Button>
                </div>
              </div>
            )}
          </div>

          {totalAmount > 0 && (
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
            disabled={items.length === 0 && !copyEnabled}
            className="bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            {t('confirm')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
