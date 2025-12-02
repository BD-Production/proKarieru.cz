import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default async function LandingPage() {
  const supabase = await createClient()
  const { data: portals } = await supabase
    .from('portals')
    .select('*')
    .eq('is_active', true)
    .order('name')

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <h1 className="text-2xl font-bold">proKarieru</h1>
        </div>
      </header>

      {/* Hero */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <h2 className="text-5xl font-bold tracking-tight">
            Propojujeme firmy s talenty
          </h2>
          <p className="text-xl text-gray-600">
            Karierni portaly pro prumyslove obory
          </p>
        </div>
      </section>

      {/* Portals grid */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <h3 className="text-2xl font-bold mb-8 text-center">Nase portaly</h3>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {portals && portals.length > 0 ? (
              portals.map((portal) => (
                <Link
                  key={portal.id}
                  href={`https://${portal.domain}`}
                  target="_blank"
                >
                  <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer">
                    <CardHeader>
                      <div
                        className="w-12 h-12 rounded-lg mb-4 flex items-center justify-center text-white font-bold text-xl"
                        style={{ backgroundColor: portal.primary_color }}
                      >
                        {portal.name.charAt(0)}
                      </div>
                      <CardTitle>{portal.name}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-500">{portal.tagline || portal.domain}</p>
                    </CardContent>
                  </Card>
                </Link>
              ))
            ) : (
              <Card className="col-span-full">
                <CardContent className="py-12 text-center text-gray-500">
                  Portaly se pripravuji...
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8 px-4">
        <div className="max-w-6xl mx-auto text-center text-gray-500 text-sm">
          &copy; {new Date().getFullYear()} proKarieru. Vsechna prava vyhrazena.
        </div>
      </footer>
    </div>
  )
}
