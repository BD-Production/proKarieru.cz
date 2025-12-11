'use client'

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
  Briefcase
} from 'lucide-react'
import { Button } from '@/components/ui/button'

const navigation = [
  { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { name: 'Portály', href: '/admin/portals', icon: Globe },
  { name: 'Edice', href: '/admin/editions', icon: BookOpen },
  { name: 'Firmy', href: '/admin/companies', icon: Building2 },
  { name: 'Zájemci', href: '/admin/leads', icon: Users },
  { name: 'Poptávky firem', href: '/admin/inquiries', icon: Briefcase },
  { name: 'Veletrhy', href: '/admin/fairs', icon: CalendarDays },
  { name: 'Soutěže', href: '/admin/contests', icon: Trophy },
]

export function AdminSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/admin/login')
    router.refresh()
  }

  return (
    <aside className="w-64 bg-white border-r min-h-screen flex flex-col">
      <div className="p-6 border-b">
        <h1 className="text-xl font-bold">proKarieru</h1>
        <p className="text-sm text-gray-500">Administrace</p>
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
