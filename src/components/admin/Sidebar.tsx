'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  Globe,
  BookOpen,
  Building2,
  CalendarDays,
  Trophy,
  LogOut,
  Users,
  Briefcase,
  FileText
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { PortalSelector } from './PortalSelector'

const navigation = [
  { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { name: 'Portály', href: '/admin/portals', icon: Globe },
  { name: 'Edice', href: '/admin/editions', icon: BookOpen },
  { name: 'Firmy', href: '/admin/companies', icon: Building2 },
  { name: 'Články', href: '/admin/articles', icon: FileText },
  { name: 'Zájemci', href: '/admin/leads', icon: Users },
  { name: 'Poptávky firem', href: '/admin/inquiries', icon: Briefcase },
  { name: 'Veletrhy', href: '/admin/fairs', icon: CalendarDays },
  { name: 'Soutěže', href: '/admin/contests', icon: Trophy },
]

export function AdminSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()
  const [newLeadsCount, setNewLeadsCount] = useState(0)
  const [newInquiriesCount, setNewInquiriesCount] = useState(0)

  useEffect(() => {
    const loadCounts = async () => {
      const [leadsResult, inquiriesResult] = await Promise.all([
        supabase
          .from('contact_leads')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'new'),
        supabase
          .from('company_inquiries')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'new'),
      ])
      setNewLeadsCount(leadsResult.count || 0)
      setNewInquiriesCount(inquiriesResult.count || 0)
    }
    loadCounts()
  }, [supabase])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/admin/login')
    router.refresh()
  }

  return (
    <aside className="w-64 bg-white border-r min-h-screen flex flex-col">
      <div className="p-6 border-b space-y-4">
        <div>
          <h1 className="text-xl font-bold">proKarieru</h1>
          <p className="text-sm text-gray-500">Administrace</p>
        </div>
        <PortalSelector />
      </div>

      <nav className="flex-1 p-4">
        <ul className="space-y-1">
          {navigation.map((item) => {
            const isActive = pathname === item.href ||
              (item.href !== '/admin' && pathname.startsWith(item.href))

            return (
              <li key={item.name}>
                <Link
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-gray-100 text-gray-900'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  {item.name}
                  {item.name === 'Zájemci' && newLeadsCount > 0 && (
                    <Badge variant="destructive" className="ml-auto text-xs">
                      {newLeadsCount}
                    </Badge>
                  )}
                  {item.name === 'Poptávky firem' && newInquiriesCount > 0 && (
                    <Badge variant="destructive" className="ml-auto text-xs">
                      {newInquiriesCount}
                    </Badge>
                  )}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      <div className="p-4 border-t">
        <Button
          variant="ghost"
          className="w-full justify-start gap-3 text-gray-600"
          onClick={handleLogout}
        >
          <LogOut className="h-5 w-5" />
          Odhlásit se
        </Button>
      </div>
    </aside>
  )
}
