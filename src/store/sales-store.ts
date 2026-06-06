'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface SaleItem {
  productId: string
  productName: string
  quantity: number
  unitPrice: number
  totalPrice: number
}

export interface CopyServiceItem {
  quantity: number
  type: 'colored' | 'normal'
  unitPrice: number
  totalPrice: number
}

export interface DailySale {
  id: string
  date: string
  items: SaleItem[]
  copyService?: CopyServiceItem
  bankReceipt?: string // base64 encoded image
  totalAmount: number
  createdAt: string
}

interface SalesState {
  sales: DailySale[]
  addSale: (sale: DailySale) => void
  deleteSale: (id: string) => void
}

export const useSalesStore = create<SalesState>()(
  persist(
    (set) => ({
      sales: [],
      addSale: (sale: DailySale) =>
        set((state) => ({ sales: [sale, ...state.sales] })),
      deleteSale: (id: string) =>
        set((state) => ({ sales: state.sales.filter((s) => s.id !== id) })),
    }),
    {
      name: 'sales-storage',
    }
  )
)
