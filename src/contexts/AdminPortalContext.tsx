'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Portal } from '@/types/database'

interface AdminPortalContextType {
  selectedPortalId: string | null
  setSelectedPortalId: (id: string | null) => void
  portals: Portal[]
  selectedPortal: Portal | null
  loading: boolean
}

const AdminPortalContext = createContext<AdminPortalContextType | null>(null)

export function AdminPortalProvider({ children }: { children: ReactNode }) {
  const [portals, setPortals] = useState<Portal[]>([])
  const [selectedPortalId, setSelectedPortalIdState] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    async function loadPortals() {
      const { data } = await supabase
        .from('portals')
        .select('*')
        .order('name')

      setPortals(data || [])

      // Nacist ulozeny vyber z localStorage
      const saved = localStorage.getItem('admin_selected_portal')
      if (saved && data?.some((p) => p.id === saved)) {
        setSelectedPortalIdState(saved)
      } else if (data && data.length > 0) {
        // Vychozi: prvni aktivni portal nebo prvni v seznamu
        const firstActive = data.find((p) => p.is_active)
        setSelectedPortalIdState(firstActive?.id || data[0].id)
      }

      setLoading(false)
    }
    loadPortals()
  }, [])

  const setSelectedPortalId = (id: string | null) => {
    setSelectedPortalIdState(id)
    if (id) {
      localStorage.setItem('admin_selected_portal', id)
    } else {
      localStorage.removeItem('admin_selected_portal')
    }
  }

  const selectedPortal = portals.find((p) => p.id === selectedPortalId) || null

  return (
    <AdminPortalContext.Provider
      value={{
        selectedPortalId,
        setSelectedPortalId,
        portals,
        selectedPortal,
        loading,
      }}
    >
      {children}
    </AdminPortalContext.Provider>
  )
}

export function useAdminPortal() {
  const context = useContext(AdminPortalContext)
  if (!context) {
    throw new Error('useAdminPortal must be used within AdminPortalProvider')
  }
  return context
}
