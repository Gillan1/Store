'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type Category =
  | 'phones'
  | 'chargers'
  | 'headphones'
  | 'accessories'
  | 'smartwatches'
  | 'tablets'
  | 'phone_cases'

export const categories: { id: Category; nameAr: string; nameEn: string; icon: string }[] = [
  { id: 'phones', nameAr: 'هواتف', nameEn: 'Phones', icon: '📱' },
  { id: 'chargers', nameAr: 'شواحن وكابلات', nameEn: 'Chargers & Cables', icon: '🔌' },
  { id: 'headphones', nameAr: 'سماعات', nameEn: 'Headphones', icon: '🎧' },
  { id: 'accessories', nameAr: 'إكسسوارات', nameEn: 'Accessories', icon: '⌨️' },
  { id: 'smartwatches', nameAr: 'ساعات ذكية', nameEn: 'Smartwatches', icon: '⌚' },
  { id: 'tablets', nameAr: 'أجهزة لوحية', nameEn: 'Tablets', icon: '💻' },
  { id: 'phone_cases', nameAr: 'جرابات الهاتف', nameEn: 'Phone Cases', icon: '🛡️' },
]

export interface Product {
  id: string
  nameAr: string
  nameEn: string
  price: number
  image: string
  category: Category
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
  // هواتف
  {
    id: '1',
    nameAr: 'هاتف سامسونج جالكسي A54',
    nameEn: 'Samsung Galaxy A54',
    price: 245000,
    image: '/phone.png',
    category: 'phones',
    descriptionAr: 'هاتف سامسونج جالكسي A54 بشاشة AMOLED وكاميرا 50 ميجابكسل',
    descriptionEn: 'Samsung Galaxy A54 with AMOLED display and 50MP camera',
  },
  {
    id: '2',
    nameAr: 'هاتف شاومي ريدمي نوت 13',
    nameEn: 'Xiaomi Redmi Note 13',
    price: 120000,
    image: '/phone2.png',
    category: 'phones',
    descriptionAr: 'هاتف شاومي ريدمي نوت 13 بأداء قوي وبطارية تدوم طويلاً',
    descriptionEn: 'Xiaomi Redmi Note 13 with powerful performance and long-lasting battery',
  },
  // شواحن وكابلات
  {
    id: '3',
    nameAr: 'شاحن سريع 33 واط مع كابل',
    nameEn: 'Fast Charger 33W with Cable',
    price: 15000,
    image: '/charger.png',
    category: 'chargers',
    descriptionAr: 'شاحن سريع بقوة 33 واط مع كابل USB-C',
    descriptionEn: '33W fast charger with USB-C cable',
  },
  // سماعات
  {
    id: '4',
    nameAr: 'سماعات لاسلكية بلوتوث',
    nameEn: 'Wireless Bluetooth Headphones',
    price: 45000,
    image: '/headphones.png',
    category: 'headphones',
    descriptionAr: 'سماعات لاسلكية عالية الجودة مع خاصية إلغاء الضوضاء',
    descriptionEn: 'High quality wireless headphones with noise cancellation',
  },
  {
    id: '5',
    nameAr: 'سماعات أذن لاسلكية',
    nameEn: 'Wireless Earbuds',
    price: 28000,
    image: '/earbuds.png',
    category: 'headphones',
    descriptionAr: 'سماعات أذن لاسلكية خفيفة مع علبة شحن',
    descriptionEn: 'Lightweight wireless earbuds with charging case',
  },
  // إكسسوارات
  {
    id: '6',
    nameAr: 'طقم إكسسوارات هاتف',
    nameEn: 'Phone Accessories Kit',
    price: 8500,
    image: '/accessories.png',
    category: 'accessories',
    descriptionAr: 'طقم إكسسوارات شامل يشمل حامل وكابل ومقبض',
    descriptionEn: 'Complete accessories kit including holder, cable, and grip',
  },
  // ساعات ذكية
  {
    id: '7',
    nameAr: 'ساعة ذكية برو',
    nameEn: 'Smartwatch Pro',
    price: 65000,
    image: '/smartwatch.png',
    category: 'smartwatches',
    descriptionAr: 'ساعة ذكية متطورة مع متتبع لياقة وشاشة AMOLED',
    descriptionEn: 'Advanced smartwatch with fitness tracker and AMOLED display',
  },
  // أجهزة لوحية
  {
    id: '8',
    nameAr: 'جهاز لوحي 10 بوصة',
    nameEn: '10-inch Tablet',
    price: 180000,
    image: '/tablet.png',
    category: 'tablets',
    descriptionAr: 'جهاز لوحي بشاشة 10 بوصات وذاكرة 128 جيجا',
    descriptionEn: '10-inch tablet with 128GB storage',
  },
  // جرابات الهاتف
  {
    id: '9',
    nameAr: 'جراب هاتف سيليكون فاخر',
    nameEn: 'Premium Silicone Phone Case',
    price: 5500,
    image: '/phone-case.png',
    category: 'phone_cases',
    descriptionAr: 'جراب سيليكون فاخر مقاوم للصدمات بتصميم أنيق',
    descriptionEn: 'Premium shockproof silicone case with elegant design',
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
