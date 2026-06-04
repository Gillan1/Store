'use client'

import { useState } from 'react'
import { useAuthStore } from '@/store/auth-store'
import { useProductStore, type Product } from '@/store/product-store'
import { useLanguage } from '@/hooks/use-language'
import { Header } from './header'
import { Sidebar, type ViewType } from './sidebar'
import { ProductGrid } from './product-grid'
import { SalesView } from './sales-view'
import { SettingsView } from './settings-view'
import { RecordSaleDialog } from './record-sale-dialog'
import { GuestMessage } from './guest-message'

export function AppShell() {
  const { isAdmin } = useAuthStore()
  const [activeView, setActiveView] = useState<ViewType>('home')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [saleDialogOpen, setSaleDialogOpen] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)

  const handleRecordSale = (product: Product) => {
    setSelectedProduct(product)
    setSaleDialogOpen(true)
  }

  const renderContent = () => {
    switch (activeView) {
      case 'home':
        return <ProductGrid onRecordSale={handleRecordSale} />
      case 'sales':
        return isAdmin ? <SalesView /> : null
      case 'settings':
        return isAdmin ? <SettingsView /> : null
      default:
        return <ProductGrid onRecordSale={handleRecordSale} />
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
      <div className="flex flex-1">
        <Sidebar
          activeView={activeView}
          onViewChange={setActiveView}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />
        <main className="flex-1 overflow-auto">
          {!isAdmin && activeView === 'home' && <GuestMessage />}
          {renderContent()}
        </main>
      </div>

      <RecordSaleDialog
        open={saleDialogOpen}
        onOpenChange={setSaleDialogOpen}
        preselectedProduct={selectedProduct}
      />
    </div>
  )
}
