import Link from 'next/link'
import Image from 'next/image'
import { headers } from 'next/headers'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Search, Target, GraduationCap, Building2, MapPin, ArrowRight, Instagram } from 'lucide-react'
import { CompanyCard } from '@/components/CompanyCard'
import { SearchBox } from '@/components/SearchBox'
import type { Company } from '@/types/database'

export default async function PortalPage() {
  const headersList = await headers()
  const portalSlug = headersList.get('x-portal-slug')

  const supabase = await createClient()

  // Nacist portal
  const { data: portal } = await supabase
    .from('portals')
    .select('*')
    .eq('slug', portalSlug)
    .eq('is_active', true)
    .single()

  if (!portal) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Portal nenalezen</h1>
          <p className="text-gray-500">Tento portal neexistuje nebo neni aktivni.</p>
        </div>
      </div>
    )
  }

  // Nacist aktivni edice pro tento portal
  const { data: editions } = await supabase
    .from('editions')
    .select('id')
    .eq('portal_id', portal.id)
    .eq('is_active', true)

  const editionIds = editions?.map((e) => e.id) || []

  // Nacist firmy pro tyto edice (s novymi poli)
  let companies: Company[] = []
  if (editionIds.length > 0) {
    const { data: companyEditions } = await supabase
      .from('company_editions')
      .select('company_id')
      .in('edition_id', editionIds)

    const companyIds = [...new Set(companyEditions?.map((ce) => ce.company_id) || [])]

    if (companyIds.length > 0) {
      const { data } = await supabase
        .from('companies')
        .select('*')
        .in('id', companyIds)
        .eq('is_active', true)
        .order('name')

      companies = (data || []) as Company[]
    }
  }

  const companyCount = companies.length

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header / Navbar */}
      <header className="border-b sticky top-0 bg-white/95 backdrop-blur-sm z-50">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-xl font-bold" style={{ color: portal.primary_color }}>
              {portal.name}
            </span>
          </Link>
          <nav className="hidden md:flex items-center gap-6">
            <Link href="/katalog" className="text-gray-600 hover:text-gray-900 text-sm font-medium">
              Katalog firem
            </Link>
            <Link href="#pro-firmy" className="text-gray-600 hover:text-gray-900 text-sm font-medium">
              Pro firmy
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero sekce */}
      <section className="py-12 md:py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            {/* Levy sloupec - text */}
            <div className="space-y-6 order-2 md:order-1">
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight">
                <span style={{ color: portal.primary_color }}>{companyCount}</span>{' '}
                firem hleda stavare jako jsi ty
              </h1>
              <p className="text-lg text-gray-600">
                Karierni portal od studentu stavariny pro studenty stavariny.
                Najdi svou prvni praci, staz nebo tema diplomky.
              </p>

              {/* Vyhledavani */}
              <SearchBox portalSlug={portalSlug || ''} />

              <Button asChild size="lg" className="w-full md:w-auto" style={{ backgroundColor: portal.primary_color }}>
                <Link href="/katalog">
                  Prohlilet vsechny firmy
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>

            {/* Pravy sloupec - obrazek */}
            <div className="order-1 md:order-2">
              <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-gray-100">
                {/* Placeholder pro autentickou fotku */}
                <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                  <div className="text-center text-gray-400">
                    <Building2 className="w-16 h-16 mx-auto mb-2" />
                    <p className="text-sm">Fotka mladych stavaru</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Proc proStavare */}
      <section className="py-12 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-8">Proc {portal.name}?</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <Card className="text-center p-6">
              <CardContent className="pt-6">
                <div
                  className="w-12 h-12 rounded-full mx-auto mb-4 flex items-center justify-center"
                  style={{ backgroundColor: `${portal.primary_color}20` }}
                >
                  <Target className="h-6 w-6" style={{ color: portal.primary_color }} />
                </div>
                <h3 className="font-semibold mb-2">Jen stavebnictvi</h3>
                <p className="text-gray-600 text-sm">
                  Zadne rusive nabidky z jinych oboru. Vse je zamerne na tvuj obor.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center p-6">
              <CardContent className="pt-6">
                <div
                  className="w-12 h-12 rounded-full mx-auto mb-4 flex items-center justify-center"
                  style={{ backgroundColor: `${portal.primary_color}20` }}
                >
                  <GraduationCap className="h-6 w-6" style={{ color: portal.primary_color }} />
                </div>
                <h3 className="font-semibold mb-2">Od studentu pro studenty</h3>
                <p className="text-gray-600 text-sm">
                  Vime, co hladas. Vytvorili jsme to sami jako studenti.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center p-6">
              <CardContent className="pt-6">
                <div
                  className="w-12 h-12 rounded-full mx-auto mb-4 flex items-center justify-center"
                  style={{ backgroundColor: `${portal.primary_color}20` }}
                >
                  <Building2 className="h-6 w-6" style={{ color: portal.primary_color }} />
                </div>
                <h3 className="font-semibold mb-2">Overene firmy</h3>
                <p className="text-gray-600 text-sm">
                  Spolupracujeme s prednimi zamestnavateli v oboru.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Firmy v katalogu */}
      <section className="py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold">Firmy, ktere hledaji stavare</h2>
            <Link
              href="/katalog"
              className="text-sm font-medium hidden md:flex items-center gap-1 hover:underline"
              style={{ color: portal.primary_color }}
            >
              Zobrazit vsechny
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {companies.length > 0 ? (
            <>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {companies.slice(0, 8).map((company) => (
                  <CompanyCard key={company.id} company={company} primaryColor={portal.primary_color} />
                ))}
              </div>

              <div className="mt-8 text-center md:hidden">
                <Button asChild variant="outline">
                  <Link href="/katalog">
                    Zobrazit vsechny firmy
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <Building2 className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>Zadne firmy zatim nejsou v katalogu.</p>
            </div>
          )}
        </div>
      </section>

      {/* Pro firmy */}
      <section id="pro-firmy" className="py-12 px-4 bg-gray-50">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl font-bold mb-4">Jste firma a chcete byt v katalogu?</h2>
          <p className="text-gray-600 mb-6">
            Vase nabidka se dostane k tisicum studentu stavebnich oboru.
          </p>
          <Button asChild size="lg" variant="outline">
            <Link href="mailto:info@prokarieru.cz">
              Zjistit vice o inzerci
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8 px-4 mt-auto">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-gray-500 text-sm">
              &copy; {new Date().getFullYear()} proKarieru
            </p>
            <nav className="flex items-center gap-6 text-sm">
              <Link href="/katalog" className="text-gray-500 hover:text-gray-900">
                Katalog
              </Link>
              <Link href="#pro-firmy" className="text-gray-500 hover:text-gray-900">
                Pro firmy
              </Link>
              <Link
                href="https://instagram.com/prostavare"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-500 hover:text-gray-900"
              >
                <Instagram className="h-5 w-5" />
              </Link>
            </nav>
          </div>
        </div>
      </footer>
    </div>
  )
}
