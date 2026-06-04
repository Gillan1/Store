'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface Product {
  id: string
  nameAr: string
  nameEn: string
  price: number
  image: string
  descriptionAr?: string
  descriptionEn?: string
}

interface ProductState {
  products: Product[]
  addProduct: (product: Product) => void
  deleteProduct: (id: string) => void
  updateProduct: (id: string, updates: Partial<Product>) => void
}

const initialProducts: Product[] = [
  {
    id: '1',
    nameAr: 'هاتف ذكي',
    nameEn: 'Smartphone',
    price: 2500,
    image: '/phone.png',
    descriptionAr: 'هاتف ذكي حديث بمواصفات عالية',
    descriptionEn: 'Modern smartphone with high specifications',
  },
  {
    id: '2',
    nameAr: 'شاحن',
    nameEn: 'Charger',
    price: 150,
    image: '/charger.png',
    descriptionAr: 'شاحن سريع مع كابل',
    descriptionEn: 'Fast charger with cable',
  },
  {
    id: '3',
    nameAr: 'سماعات',
    nameEn: 'Headphones',
    price: 800,
    image: '/headphones.png',
    descriptionAr: 'سماعات لاسلكية عالية الجودة',
    descriptionEn: 'High quality wireless headphones',
  },
  {
    id: '4',
    nameAr: 'استيكرات',
    nameEn: 'Stickers',
    price: 50,
    image: '/stickers.png',
    descriptionAr: 'مجموعة استيكرات ملونة',
    descriptionEn: 'Colorful stickers collection',
  },
]

export const useProductStore = create<ProductState>()(
  persist(
    (set) => ({
      products: initialProducts,
      addProduct: (product: Product) =>
        set((state) => ({ products: [...state.products, product] })),
      deleteProduct: (id: string) =>
        set((state) => ({ products: state.products.filter((p) => p.id !== id) })),
      updateProduct: (id: string, updates: Partial<Product>) =>
        set((state) => ({
          products: state.products.map((p) => (p.id === id ? { ...p, ...updates } : p)),
        })),
    }),
    {
      name: 'product-storage',
    }
  )
)
