'use client'

import { useEffect, useState, useMemo } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Input } from '@/components/ui/input'
import { Building2, Search } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

type Portal = {
  id: string
  name: string
  primary_color: string
}

type Edition = {
  id: string
  name: string
  is_active: boolean
}

type Company = {
  id: string
  name: string
  slug: string
  logo_url: string | null
}

export default function CatalogPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [portal, setPortal] = useState<Portal | null>(null)
  const [editions, setEditions] = useState<Edition[]>([])
  const [companies, setCompanies] = useState<Company[]>([])
  const [filteredCompanies, setFilteredCompanies] = useState<Company[]>([])
  const [loading, setLoading] = useState(true)

  // Cache-busting timestamp (generated once per page load)
  const timestamp = useMemo(() => Date.now(), [])

  const searchQuery = searchParams.get('search') || ''
  const selectedEditionId = searchParams.get('edition')

  useEffect(() => {
    async function loadData() {
      const supabase = createClient()

      // Get portal from headers (set by middleware)
      const portalSlug = document.querySelector('meta[name="x-portal-slug"]')?.getAttribute('content')

      // Load portal
      const { data: portalData } = await supabase
        .from('portals')
        .select('id, name, primary_color')
        .eq('is_active', true)
        .limit(1)
        .single()

      if (!portalData) {
        setLoading(false)
        return
      }

      setPortal(portalData)

      // Load editions
      const { data: editionsData } = await supabase
        .from('editions')
        .select('id, name, is_active')
        .eq('portal_id', portalData.id)
        .order('is_active', { ascending: false })
        .order('display_order')

      setEditions(editionsData || [])

      // Determine active edition
      const activeEdition = selectedEditionId
        ? editionsData?.find((e) => e.id === selectedEditionId)
        : editionsData?.find((e) => e.is_active) || editionsData?.[0]

      if (!activeEdition) {
        setLoading(false)
        return
      }

      // Load companies for active edition
      const { data: companyEditions } = await supabase
        .from('company_editions')
        .select(`
          *,
          company:companies(id, name, slug, logo_url)
        `)
        .eq('edition_id', activeEdition.id)
        .order('display_order')

      const companiesData = companyEditions?.map((ce: any) => ce.company).filter(Boolean) || []
      setCompanies(companiesData)
      setFilteredCompanies(companiesData)
      setLoading(false)
    }

    loadData()
  }, [selectedEditionId])

  // Filter companies based on search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredCompanies(companies)
    } else {
      const query = searchQuery.toLowerCase()
      setFilteredCompanies(
        companies.filter((company) =>
          company.name.toLowerCase().includes(query)
        )
      )
    }
  }, [searchQuery, companies])

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    const params = new URLSearchParams(searchParams.toString())

    if (value) {
      params.set('search', value)
    } else {
      params.delete('search')
    }

    router.replace(`/catalog?${params.toString()}`, { scroll: false })
  }

  const handleEditionChange = (editionId: string) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('edition', editionId)
    router.replace(`/catalog?${params.toString()}`)
  }

  const activeEdition = selectedEditionId
    ? editions.find((e) => e.id === selectedEditionId)
    : editions.find((e) => e.is_active) || editions[0]

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-500">Načítání katalogu...</p>
        </div>
      </div>
    )
  }

  if (!portal) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Katalog nenalezen</h1>
          <p className="text-gray-500">Portál není dostupný.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b sticky top-0 bg-white z-10">
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
            <span className="text-sm text-gray-500">Katalog firem</span>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Edition tabs */}
        {editions.length > 1 && (
          <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
            {editions.map((edition) => (
              <button
                key={edition.id}
                onClick={() => handleEditionChange(edition.id)}
                className={`px-4 py-2 rounded-full text-sm whitespace-nowrap transition-colors ${
                  edition.id === activeEdition?.id
                    ? 'text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
                style={
                  edition.id === activeEdition?.id
                    ? { backgroundColor: portal.primary_color }
                    : {}
                }
              >
                {edition.name}
              </button>
            ))}
          </div>
        )}

        {/* Search */}
        <div className="relative mb-8">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <Input
            placeholder="Hledat firmu..."
            className="pl-10"
            value={searchQuery}
            onChange={handleSearchChange}
          />
        </div>

        {/* Companies grid */}
        {filteredCompanies.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredCompanies.map((company) => (
              <Link
                key={company.id}
                href={`/catalog/${company.slug}`}
                className="group"
              >
                <div className="aspect-square border rounded-lg overflow-hidden bg-white hover:shadow-lg transition-shadow flex items-center justify-center p-4">
                  {company.logo_url ? (
                    <img
                      src={`${company.logo_url.split('?')[0]}?v=${timestamp}`}
                      alt={company.name}
                      width={160}
                      height={160}
                      className="object-contain group-hover:scale-105 transition-transform max-w-full max-h-full"
                    />
                  ) : (
                    <div className="text-center">
                      <Building2 className="h-12 w-12 text-gray-300 mx-auto mb-2" />
                      <span className="text-sm text-gray-500">{company.name}</span>
                    </div>
                  )}
                </div>
                <p className="text-sm text-center mt-2 text-gray-600 group-hover:text-gray-900">
                  {company.name}
                </p>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 text-gray-500">
            <Building2 className="h-16 w-16 mx-auto mb-4 text-gray-300" />
            {searchQuery ? (
              <>
                <p>Žádné firmy nenalezeny pro &quot;{searchQuery}&quot;</p>
                <p className="text-sm mt-2">Zkuste jiné klíčové slovo.</p>
              </>
            ) : (
              <>
                <p>Žádné firmy v této edici.</p>
                <p className="text-sm mt-2">Přidejte firmy v administraci.</p>
              </>
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t py-6 px-4 mt-auto">
        <div className="max-w-6xl mx-auto flex items-center justify-between text-sm text-gray-500">
          <span>&copy; {new Date().getFullYear()} {portal.name}</span>
          <Link href="/portal" className="hover:underline">
            ← Zpět na portál
          </Link>
        </div>
      </footer>
    </div>
  )
}
