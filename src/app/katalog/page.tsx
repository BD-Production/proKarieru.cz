'use client'

import { useEffect, useState, useMemo } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Loader } from '@/components/Loader'
import { CatalogBrowser } from '@/components/CatalogBrowser'
import { createClient } from '@/lib/supabase/client'
import { PortalHeader } from '@/components/PortalHeader'
import { PortalFooter } from '@/components/PortalFooter'

type Portal = {
  id: string
  name: string
  slug: string
  primary_color: string
}

type Edition = {
  id: string
  name: string
  year: number
  season: 'spring' | 'winter' | 'fall' | null
  location: string | null
  is_active: boolean
  display_order: number
}

type CatalogPage = {
  id: string
  edition_id: string
  type: 'intro' | 'outro'
  page_order: number
  image_url: string
}

export default function KatalogPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [portal, setPortal] = useState<Portal | null>(null)
  const [editions, setEditions] = useState<Edition[]>([])
  const [coversByEdition, setCoversByEdition] = useState<Map<string, string>>(new Map())
  const [loading, setLoading] = useState(true)

  const selectedEditionId = searchParams.get('edition')
  const selectedEdition = editions.find(e => e.id === selectedEditionId)

  // Cache-busting timestamp
  const timestamp = useMemo(() => Date.now(), [])

  useEffect(() => {
    async function loadData() {
      const supabase = createClient()

      // Načíst portál z headeru
      const portalSlug = document.querySelector('meta[name="x-portal-slug"]')?.getAttribute('content')
        || window.location.hostname.split('.')[0].replace('-dev', '')

      // Fallback - zkusit získat portál podle domény
      let portalQuery = supabase
        .from('portals')
        .select('*')
        .eq('is_active', true)

      if (portalSlug && portalSlug !== 'localhost' && portalSlug !== 'prokarieru') {
        portalQuery = portalQuery.eq('slug', portalSlug)
      }

      const { data: portalData } = await portalQuery.single()

      if (!portalData) {
        // Zkusit první aktivní portál jako fallback
        const { data: fallbackPortal } = await supabase
          .from('portals')
          .select('*')
          .eq('is_active', true)
          .neq('slug', 'prokarieru')
          .limit(1)
          .single()

        if (fallbackPortal) {
          setPortal(fallbackPortal)
        } else {
          setLoading(false)
          return
        }
      } else {
        setPortal(portalData)
      }

      const currentPortal = portalData || portal
      if (!currentPortal) {
        setLoading(false)
        return
      }

      // Načíst edice
      const { data: editionsData } = await supabase
        .from('editions')
        .select('*')
        .eq('portal_id', currentPortal.id)
        .eq('is_active', true)
        .order('display_order', { ascending: true })

      setEditions(editionsData || [])

      // Načíst obálky (první intro stránka každé edice)
      if (editionsData && editionsData.length > 0) {
        const editionIds = editionsData.map(e => e.id)

        const { data: introPages } = await supabase
          .from('catalog_pages')
          .select('*')
          .in('edition_id', editionIds)
          .eq('type', 'intro')
          .order('page_order', { ascending: true })

        // Mapovat první intro stránku jako obálku pro každou edici
        const covers = new Map<string, string>()
        introPages?.forEach((page: CatalogPage) => {
          if (!covers.has(page.edition_id)) {
            covers.set(page.edition_id, page.image_url)
          }
        })
        setCoversByEdition(covers)
      }

      setLoading(false)
    }

    loadData()
  }, [])

  const handleClose = () => {
    router.push('/katalog')
  }

  const getSeasonLabel = (season: string | null) => {
    switch (season) {
      case 'spring': return 'Jaro'
      case 'fall': return 'Podzim'
      case 'winter': return 'Zima'
      default: return ''
    }
  }

  if (loading) {
    return <Loader text="Načítám katalog..." />
  }

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

  // Pokud je vybraná edice, zobrazit CatalogBrowser
  if (selectedEditionId && selectedEdition) {
    return (
      <CatalogBrowser
        portalSlug={portal.slug}
        editionId={selectedEditionId}
        editionName={selectedEdition.name}
        primaryColor={portal.primary_color}
        onClose={handleClose}
      />
    )
  }

  // Jinak zobrazit knihovničku
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <PortalHeader
        portalName={portal.name}
        primaryColor={portal.primary_color}
      />

      {/* Main content */}
      <main className="flex-1 max-w-6xl mx-auto px-4 py-12 w-full">
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">Katalog</h1>
          <p className="text-gray-600 text-lg">
            Prolistujte katalogy a najděte svého budoucího zaměstnavatele
          </p>
        </div>

        {editions.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
            {editions.map((edition) => {
              const coverUrl = coversByEdition.get(edition.id)

              return (
                <Link
                  key={edition.id}
                  href={`/katalog?edition=${edition.id}`}
                  className="group"
                >
                  <div className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 group-hover:-translate-y-1">
                    {/* Obálka */}
                    <div className="aspect-[148/210] bg-gray-100 relative overflow-hidden">
                      {coverUrl ? (
                        <img
                          src={`${coverUrl}?v=${timestamp}`}
                          alt={edition.name}
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                      ) : (
                        <div
                          className="w-full h-full flex items-center justify-center"
                          style={{ backgroundColor: portal.primary_color + '20' }}
                        >
                          <div className="text-center p-2">
                            <span
                              className="text-xl md:text-2xl font-bold"
                              style={{ color: portal.primary_color }}
                            >
                              {edition.name}
                            </span>
                          </div>
                        </div>
                      )}

                      {/* Overlay při hoveru */}
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center">
                        <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-white text-gray-900 px-3 py-1.5 rounded-full text-sm font-medium shadow-lg">
                          Číst online
                        </span>
                      </div>
                    </div>

                    {/* Info */}
                    <div className="p-2 md:p-3">
                      <h3 className="font-semibold text-sm md:text-base mb-0.5 line-clamp-1">{edition.name}</h3>
                      <p className="text-xs md:text-sm text-gray-500 line-clamp-1">
                        {edition.year}
                        {edition.season && ` • ${getSeasonLabel(edition.season)}`}
                        {edition.location && ` • ${edition.location}`}
                      </p>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        ) : (
          <div className="text-center py-16">
            <div
              className="w-24 h-24 mx-auto mb-6 rounded-full flex items-center justify-center"
              style={{ backgroundColor: portal.primary_color + '20' }}
            >
              <svg
                className="w-12 h-12"
                fill="none"
                stroke={portal.primary_color}
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                />
              </svg>
            </div>
            <h2 className="text-xl font-semibold mb-2">Zatím žádné katalogy</h2>
            <p className="text-gray-500">
              Katalogy budou brzy k dispozici.
            </p>
          </div>
        )}
      </main>

      {/* Footer */}
      <PortalFooter />
    </div>
  )
}
