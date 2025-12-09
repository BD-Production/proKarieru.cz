'use client'

import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { FileText, ArrowLeft } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import dynamic from 'next/dynamic'

const PdfViewer = dynamic(() => import('@/components/PdfViewer').then(mod => mod.PdfViewer), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center min-h-[400px] bg-gray-50 rounded-lg">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
        <p className="text-gray-500">Načítání PDF prohlížeče...</p>
      </div>
    </div>
  ),
})

type Portal = {
  id: string
  name: string
  primary_color: string
}

type Edition = {
  id: string
  name: string
  is_active: boolean
  pdf_url: string | null
}

export default function CatalogPdfPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [portal, setPortal] = useState<Portal | null>(null)
  const [editions, setEditions] = useState<Edition[]>([])
  const [loading, setLoading] = useState(true)

  const selectedEditionId = searchParams.get('edition')

  useEffect(() => {
    async function loadData() {
      const supabase = createClient()

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

      // Load editions with pdf_url
      const { data: editionsData } = await supabase
        .from('editions')
        .select('id, name, is_active, pdf_url')
        .eq('portal_id', portalData.id)
        .order('is_active', { ascending: false })
        .order('display_order')

      setEditions(editionsData || [])
      setLoading(false)
    }

    loadData()
  }, [])

  const handleEditionChange = (editionId: string) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('edition', editionId)
    router.replace(`/catalog/pdf?${params.toString()}`)
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
    <div className="min-h-screen bg-white flex flex-col">
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
            <span className="text-sm text-gray-500">PDF Katalog</span>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8 flex-1">
        {/* Back link */}
        <Link
          href="/catalog"
          className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          Zpět na katalog firem
        </Link>

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

        {/* Title */}
        {activeEdition && (
          <h2 className="text-2xl font-bold mb-6">{activeEdition.name}</h2>
        )}

        {/* PDF Viewer */}
        {activeEdition?.pdf_url ? (
          <PdfViewer
            pdfUrl={activeEdition.pdf_url}
            title={activeEdition.name}
            primaryColor={portal.primary_color}
          />
        ) : (
          <div className="text-center py-20 text-gray-500 bg-gray-50 rounded-lg">
            <FileText className="h-16 w-16 mx-auto mb-4 text-gray-300" />
            <p className="text-lg font-medium mb-2">PDF katalog není k dispozici</p>
            <p className="text-sm">
              Pro tuto edici zatím nebyl nahrán PDF katalog.
            </p>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t py-6 px-4 mt-auto">
        <div className="max-w-6xl mx-auto flex items-center justify-between text-sm text-gray-500">
          <span>&copy; {new Date().getFullYear()} {portal.name}</span>
          <Link href="/catalog" className="hover:underline">
            ← Zpět na katalog
          </Link>
        </div>
      </footer>
    </div>
  )
}
