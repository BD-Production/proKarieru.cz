import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Globe, Building2, CalendarDays, BookOpen } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default async function AdminDashboard() {
  const supabase = await createClient()

  // Fetch counts
  const [portalsResult, companiesResult, fairsResult, editionsResult] = await Promise.all([
    supabase.from('portals').select('id', { count: 'exact', head: true }),
    supabase.from('companies').select('id', { count: 'exact', head: true }),
    supabase.from('fairs').select('id', { count: 'exact', head: true }),
    supabase.from('editions').select('id', { count: 'exact', head: true }),
  ])

  const stats = [
    {
      name: 'Portaly',
      value: portalsResult.count || 0,
      icon: Globe,
      href: '/admin/portals'
    },
    {
      name: 'Firmy',
      value: companiesResult.count || 0,
      icon: Building2,
      href: '/admin/companies'
    },
    {
      name: 'Edice',
      value: editionsResult.count || 0,
      icon: BookOpen,
      href: '/admin/editions'
    },
    {
      name: 'Veletrhy',
      value: fairsResult.count || 0,
      icon: CalendarDays,
      href: '/admin/fairs'
    },
  ]

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-gray-500">Prehled systemu proKarieru</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Link key={stat.name} href={stat.href}>
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-500">
                  {stat.name}
                </CardTitle>
                <stat.icon className="h-5 w-5 text-gray-400" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stat.value}</div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Rychle akce</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button asChild className="w-full justify-start">
              <Link href="/admin/companies/new">+ Pridat firmu</Link>
            </Button>
            <Button asChild variant="outline" className="w-full justify-start">
              <Link href="/admin/editions/new">+ Nova edice</Link>
            </Button>
            <Button asChild variant="outline" className="w-full justify-start">
              <Link href="/admin/portals/new">+ Novy portal</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Napoveda</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-gray-500 space-y-2">
            <p><strong>Portal</strong> = prostavare.cz, prostrojare.cz...</p>
            <p><strong>Edice</strong> = Brozura (Jaro 2025 Praha)</p>
            <p><strong>Firma</strong> = Globalni entita, muze byt ve vice edicich</p>
            <p><strong>Veletrh</strong> = Akce s mapou a soutezi</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
