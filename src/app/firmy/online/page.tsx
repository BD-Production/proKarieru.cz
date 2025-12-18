'use client'

import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { CatalogBrowser } from '@/components/CatalogBrowser'
import { Loader } from '@/components/Loader'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

type Portal = {
  id: string
  name: string
  slug: string
  primary_color: string
}

type Edition = {
  id: string
  name: string
}

export default function CatalogOnlinePage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [portal, setPortal] = useState<Portal | null>(null)
  const [edition, setEdition] = useState<Edition | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const portalParam = searchParams.get('portal')
  const editionParam = searchParams.get('edition')

  useEffect(() => {
    async function loadData() {
      const supabase = createClient()

      // Pokud nemame parametry, zkusime nacist defaultni portal a aktivni edici
      let portalSlug = portalParam
      let editionId = editionParam

      if (!portalSlug) {
        // Ziskej prvni aktivni portal
        const { data: portalData } = await supabase
          .from('portals')
          .select('id, name, slug, primary_color')
          .eq('is_active', true)
          .limit(1)
          .single()

        if (!portalData) {
          setError('Portal nenalezen')
          setLoading(false)
          return
        }

        portalSlug = portalData.slug
        setPortal(portalData)

        // Ziskej aktivni edici
        if (!editionId) {
          const { data: editionData } = await supabase
            .from('editions')
            .select('id, name')
            .eq('portal_id', portalData.id)
            .eq('is_active', true)
            .limit(1)
            .single()

          if (editionData) {
            editionId = editionData.id
            setEdition(editionData)
          }
        }
      } else {
        // Nacti portal podle slugu
        const { data: portalData } = await supabase
          .from('portals')
          .select('id, name, slug, primary_color')
          .eq('slug', portalSlug)
          .eq('is_active', true)
          .single()

        if (!portalData) {
          setError('Portal nenalezen')
          setLoading(false)
          return
        }

        setPortal(portalData)

        // Nacti edici
        if (editionId) {
          const { data: editionData } = await supabase
            .from('editions')
            .select('id, name')
            .eq('id', editionId)
            .eq('portal_id', portalData.id)
            .single()

          if (editionData) {
            setEdition(editionData)
          } else {
            setError('Edice nenalezena')
            setLoading(false)
            return
          }
        } else {
          // Ziskej aktivni edici
          const { data: editionData } = await supabase
            .from('editions')
            .select('id, name')
            .eq('portal_id', portalData.id)
            .eq('is_active', true)
            .limit(1)
            .single()

          if (editionData) {
            setEdition(editionData)
          }
        }
      }

      if (!editionId && !edition) {
        setError('Zadna edice k zobrazeni')
      }

      setLoading(false)
    }

    loadData()
  }, [portalParam, editionParam])

  const handleClose = () => {
    router.push('/firmy')
  }

  if (loading) {
    return <Loader text="Nacitam katalog..." />
  }

  if (error || !portal || !edition) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">
            {error || 'Katalog neni k dispozici'}
          </h1>
          <Button asChild>
            <Link href="/firmy">Zpět na firmy</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <CatalogBrowser
      portalSlug={portal.slug}
      editionId={edition.id}
      editionName={edition.name}
      primaryColor={portal.primary_color}
      onClose={handleClose}
    />
  )
}
