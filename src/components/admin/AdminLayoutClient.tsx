'use client'

import { AdminPortalProvider } from '@/contexts/AdminPortalContext'
import { AdminSidebar } from '@/components/admin/Sidebar'

export function AdminLayoutClient({ children }: { children: React.ReactNode }) {
  return (
    <AdminPortalProvider>
      <div className="flex min-h-screen">
        <AdminSidebar />
        <main className="flex-1 p-8 bg-gray-50">{children}</main>
      </div>
    </AdminPortalProvider>
  )
}
