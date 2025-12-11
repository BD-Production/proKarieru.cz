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

// Fisher-Yates shuffle algoritmus
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

export default async function PortalPage() {
  const headersList = await headers()
  const portalSlug = headersList.get('x-portal-slug')

  const supabase = await createClient()

  // Načíst portál
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
          <h1 className="text-2xl font-bold mb-2">Portál nenalezen</h1>
          <p className="text-gray-500">Tento portál neexistuje nebo není aktivní.</p>
        </div>
      </div>
    )
  }

  // Načíst aktivní edice pro tento portál
  const { data: editions } = await supabase
    .from('editions')
    .select('id')
    .eq('portal_id', portal.id)
    .eq('is_active', true)

  const editionIds = editions?.map((e) => e.id) || []

  // Načíst firmy pro tyto edice (s novými poli)
  let companies: Company[] = []
  let topCompaniesForGrid: Company[] = []

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

      // Pro hero grid: kombinace featured firem a doplnění z ostatních
      const HERO_GRID_COUNT = 9

      // 1. Načíst VŠECHNY featured firmy (bez limitu)
      const { data: featuredCompanies } = await supabase
        .from('companies')
        .select('*')
        .in('id', companyIds)
        .eq('is_active', true)
        .eq('featured', true)
        .not('logo_url', 'is', null)

      const featured = (featuredCompanies || []) as Company[]
      let selectedCompanies: Company[] = []

      if (featured.length >= HERO_GRID_COUNT) {
        // Více než 9 featured → náhodně vybrat 9
        selectedCompanies = shuffleArray(featured).slice(0, HERO_GRID_COUNT)
      } else {
        // Méně než 9 featured → doplnit z ostatních firem s logem
        selectedCompanies = [...featured]
        const neededCount = HERO_GRID_COUNT - featured.length

        // Načíst ostatní firmy (ne-featured, s logem)
        const { data: otherCompanies } = await supabase
          .from('companies')
          .select('*')
          .in('id', companyIds)
          .eq('is_active', true)
          .not('logo_url', 'is', null)

        if (otherCompanies && otherCompanies.length > 0) {
          // Vyfiltrovat featured firmy a náhodně vybrat potřebný počet
          const featuredIds = new Set(featured.map(f => f.id))
          const nonFeatured = otherCompanies.filter(c => !featuredIds.has(c.id))
          const shuffledOthers = shuffleArray(nonFeatured)
          selectedCompanies.push(...shuffledOthers.slice(0, neededCount))
        }
      }

      // Finální shuffle pro náhodné pořadí v mřížce
      topCompaniesForGrid = shuffleArray(selectedCompanies) as Company[]
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
            {/* Levý sloupec - text */}
            <div className="space-y-6 order-1">
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight">
                <span style={{ color: portal.primary_color }}>{companyCount}</span>{' '}
                firem hledá stavaře jako jsi ty
              </h1>
              <p className="text-lg text-gray-600">
                Kariérní portál od studentů stavařiny pro studenty stavařiny.
                Najdi svou první práci, stáž nebo téma diplomky.
              </p>

              {/* Vyhledávání */}
              <SearchBox portalSlug={portalSlug || ''} />

              <Button asChild size="lg" className="w-full md:w-auto" style={{ backgroundColor: portal.primary_color }}>
                <Link href="/katalog">
                  Prohlížet všechny firmy
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>

            {/* Pravý sloupec - mřížka log firem */}
            <div className="order-2">
              <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-gray-50 p-2">
                {topCompaniesForGrid.length > 0 ? (
                  <div className="grid grid-cols-3 gap-2 h-full">
                    {topCompaniesForGrid.map((company) => (
                      <Link
                        key={company.id}
                        href={`/${company.slug}`}
                        className="relative bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow"
                      >
                        {company.logo_url ? (
                          <Image
                            src={company.logo_url}
                            alt={company.name}
                            fill
                            sizes="(max-width: 768px) 30vw, 15vw"
                            className="object-contain p-2"
                          />
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <Building2 className="w-8 h-8 text-gray-300" />
                          </div>
                        )}
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center text-gray-400">
                      <Building2 className="w-16 h-16 mx-auto mb-2" />
                      <p className="text-sm">Firmy v katalogu</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Proč proStavaře */}
      <section className="py-12 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-8">Proč {portal.name}?</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <Card className="text-center p-6">
              <CardContent className="pt-6">
                <div
                  className="w-12 h-12 rounded-full mx-auto mb-4 flex items-center justify-center"
                  style={{ backgroundColor: `${portal.primary_color}20` }}
                >
                  <Target className="h-6 w-6" style={{ color: portal.primary_color }} />
                </div>
                <h3 className="font-semibold mb-2">Jen stavebnictví</h3>
                <p className="text-gray-600 text-sm">
                  Žádné rušivé nabídky z jiných oborů. Vše je zaměřené na tvůj obor.
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
                <h3 className="font-semibold mb-2">Od studentů pro studenty</h3>
                <p className="text-gray-600 text-sm">
                  Víme, co hledáš. Vytvořili jsme to sami jako studenti.
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
                <h3 className="font-semibold mb-2">Ověřené firmy</h3>
                <p className="text-gray-600 text-sm">
                  Spolupracujeme s předními zaměstnavateli v oboru.
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
            <h2 className="text-2xl font-bold">Firmy, které hledají stavaře</h2>
            <Link
              href="/katalog"
              className="text-sm font-medium hidden md:flex items-center gap-1 hover:underline"
              style={{ color: portal.primary_color }}
            >
              Zobrazit všechny
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
                    Zobrazit všechny firmy
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <Building2 className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>Žádné firmy zatím nejsou v katalogu.</p>
            </div>
          )}
        </div>
      </section>

      {/* Pro firmy */}
      <section id="pro-firmy" className="py-12 px-4 bg-gray-50">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl font-bold mb-4">Jste firma a chcete být v katalogu?</h2>
          <p className="text-gray-600 mb-6">
            Vaše nabídka se dostane k tisícům studentů stavebních oborů.
          </p>
          <Button asChild size="lg" variant="outline">
            <Link href="/pro-firmy">
              Zjistit více o spolupráci
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
              &copy; {new Date().getFullYear()} proKariéru
            </p>
            <nav className="flex items-center gap-6 text-sm">
              <Link href="/katalog" className="text-gray-500 hover:text-gray-900">
                Katalog
              </Link>
              <Link href="/pro-firmy" className="text-gray-500 hover:text-gray-900">
                Pro firmy
              </Link>
              <Link
                href="https://www.instagram.com/prostavare.cz/"
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
