import Link from 'next/link'
import { headers } from 'next/headers'
import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { BookOpen, CalendarDays } from 'lucide-react'

export default async function PortalPage() {
  const headersList = await headers()
  const portalSlug = headersList.get('x-portal-slug')

  const supabase = await createClient()
  const { data: portal } = await supabase
    .from('portals')
    .select('*')
    .eq('slug', portalSlug)
    .eq('is_active', true)
    .single()

  // Fallback if portal not found
  if (!portal) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Portál nenalezen</h1>
          <p className="text-gray-500">Tento portál neexistuje nebo není aktivní.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <h1 className="text-2xl font-bold" style={{ color: portal.primary_color }}>
            {portal.name}
          </h1>
        </div>
      </header>

      {/* Hero */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <h2 className="text-4xl font-bold tracking-tight">
            {portal.tagline}
          </h2>
          <p className="text-lg text-gray-600">
            Prohlédnete si katalog firem nebo informace o veletrhu
          </p>
        </div>
      </section>

      {/* Cards */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-8">
          <Link href={`/katalog`}>
            <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer group">
              <CardHeader className="text-center">
                <div
                  className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center group-hover:scale-110 transition-transform"
                  style={{ backgroundColor: portal.primary_color }}
                >
                  <BookOpen className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-2xl">Katalog firem</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-gray-500 mb-4">
                  Prohlednete si firmy z nasi brozury
                </p>
                <span
                  className="font-medium"
                  style={{ color: portal.primary_color }}
                >
                  Otevrit katalog →
                </span>
              </CardContent>
            </Card>
          </Link>

          <Link href={`/fair`}>
            <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer group">
              <CardHeader className="text-center">
                <div
                  className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center group-hover:scale-110 transition-transform"
                  style={{ backgroundColor: portal.primary_color }}
                >
                  <CalendarDays className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-2xl">Veletrh 2025</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-gray-500 mb-4">
                  Informace o veletrhu prace
                </p>
                <span
                  className="font-medium"
                  style={{ color: portal.primary_color }}
                >
                  Vice informaci →
                </span>
              </CardContent>
            </Card>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8 px-4 mt-auto">
        <div className="max-w-6xl mx-auto text-center text-gray-500 text-sm">
          &copy; {new Date().getFullYear()} {portal.name} |{' '}
          <Link href="https://prokarieru.cz" className="hover:underline">
            proKarieru
          </Link>
        </div>
      </footer>
    </div>
  )
}
