import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CalendarDays, MapPin, Clock, Trophy, Map } from 'lucide-react'
import { PortalAnalytics } from '@/components/PortalAnalytics'

export default function FairPage() {
  // TODO: Get fair data from database based on portal
  const fair = {
    name: 'Veletrh prace pro stavare 2025',
    date: '15. brezna 2025',
    time_start: '9:00',
    time_end: '16:00',
    location_name: 'Vystaviste Praha',
    location_address: 'Hala 3, Praha 7',
    description: 'Nejvetsi karierni veletrh pro stavebni obor v Ceske republice.',
  }

  const portal = {
    name: 'proStavare',
    primary_color: '#C34751',
  }

  return (
    <>
      <PortalAnalytics />
      <div className="min-h-screen bg-white">
        {/* Header */}
      <header className="border-b">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/portal">
              <h1
                className="text-xl font-bold"
                style={{ color: portal.primary_color }}
              >
                {portal.name}
              </h1>
            </Link>
            <span className="text-sm text-gray-500">Veletrh</span>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-12">
        {/* Hero */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4">{fair.name}</h2>
          <p className="text-lg text-gray-600">{fair.description}</p>
        </div>

        {/* Info cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <Card>
            <CardContent className="pt-6">
              <CalendarDays
                className="h-8 w-8 mb-3"
                style={{ color: portal.primary_color }}
              />
              <h3 className="font-semibold mb-1">Datum</h3>
              <p className="text-gray-600">{fair.date}</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <Clock
                className="h-8 w-8 mb-3"
                style={{ color: portal.primary_color }}
              />
              <h3 className="font-semibold mb-1">Cas</h3>
              <p className="text-gray-600">
                {fair.time_start} - {fair.time_end}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <MapPin
                className="h-8 w-8 mb-3"
                style={{ color: portal.primary_color }}
              />
              <h3 className="font-semibold mb-1">Misto</h3>
              <p className="text-gray-600">{fair.location_name}</p>
              <p className="text-sm text-gray-500">{fair.location_address}</p>
            </CardContent>
          </Card>
        </div>

        {/* Action cards */}
        <div className="grid md:grid-cols-2 gap-6">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <Map
                className="h-10 w-10 mb-2"
                style={{ color: portal.primary_color }}
              />
              <CardTitle>Mapa arealu</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-500 mb-4">
                Interaktivni mapa arealu s pozicemi vystavovatelu.
              </p>
              <Button
                className="w-full"
                style={{ backgroundColor: portal.primary_color }}
              >
                Zobrazit mapu
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <Trophy
                className="h-10 w-10 mb-2"
                style={{ color: portal.primary_color }}
              />
              <CardTitle>Soutez</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-500 mb-4">
                Zapojte se do souteze a vyhrajte atraktivni ceny.
              </p>
              <Button
                variant="outline"
                className="w-full"
                style={{
                  borderColor: portal.primary_color,
                  color: portal.primary_color,
                }}
              >
                Prihlasit se do souteze
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t py-8 px-4 mt-12">
        <div className="max-w-6xl mx-auto flex items-center justify-between text-sm text-gray-500">
          <span>&copy; {new Date().getFullYear()} {portal.name}</span>
          <Link href="/portal" className="hover:underline">
            ← Zpet na portal
          </Link>
        </div>
      </footer>
      </div>
    </>
  )
}
