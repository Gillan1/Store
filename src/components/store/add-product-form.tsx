'use client'

import { useState } from 'react'
import { useProductStore } from '@/store/product-store'
import { useLanguage } from '@/hooks/use-language'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { Plus, PackagePlus } from 'lucide-react'

export function AddProductForm() {
  const { addProduct } = useProductStore()
  const { t, language } = useLanguage()

  const [nameAr, setNameAr] = useState('')
  const [nameEn, setNameEn] = useState('')
  const [price, setPrice] = useState('')
  const [image, setImage] = useState('/phone.png')
  const [descriptionAr, setDescriptionAr] = useState('')
  const [descriptionEn, setDescriptionEn] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!nameAr.trim() || !nameEn.trim() || !price) return

    addProduct({
      id: crypto.randomUUID(),
      nameAr: nameAr.trim(),
      nameEn: nameEn.trim(),
      price: parseFloat(price),
      image: image || '/phone.png',
      descriptionAr: descriptionAr.trim() || undefined,
      descriptionEn: descriptionEn.trim() || undefined,
    })

    toast.success(t('productAdded'))
    setNameAr('')
    setNameEn('')
    setPrice('')
    setImage('/phone.png')
    setDescriptionAr('')
    setDescriptionEn('')
  }

  return (
    <Card className="border-0 shadow-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <PackagePlus className="h-5 w-5 text-emerald-600" />
          {t('addProduct')}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="nameAr">{t('productNameAr')}</Label>
              <Input
                id="nameAr"
                value={nameAr}
                onChange={(e) => setNameAr(e.target.value)}
                placeholder={t('productNameAr')}
                required
                dir="rtl"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="nameEn">{t('productNameEn')}</Label>
              <Input
                id="nameEn"
                value={nameEn}
                onChange={(e) => setNameEn(e.target.value)}
                placeholder={t('productNameEn')}
                required
                dir="ltr"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="price">{t('price')}</Label>
              <Input
                id="price"
                type="number"
                min="0"
                step="0.01"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder={t('price')}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="image">{t('imageUrl')}</Label>
              <Input
                id="image"
                value={image}
                onChange={(e) => setImage(e.target.value)}
                placeholder={t('imageUrl')}
                dir="ltr"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="descAr">{t('descriptionAr')}</Label>
              <Input
                id="descAr"
                value={descriptionAr}
                onChange={(e) => setDescriptionAr(e.target.value)}
                placeholder={t('descriptionAr')}
                dir="rtl"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="descEn">{t('descriptionEn')}</Label>
              <Input
                id="descEn"
                value={descriptionEn}
                onChange={(e) => setDescriptionEn(e.target.value)}
                placeholder={t('descriptionEn')}
                dir="ltr"
              />
            </div>
          </div>

          <Button
            type="submit"
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            <Plus className="h-4 w-4 me-2" />
            {t('addProduct')}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
