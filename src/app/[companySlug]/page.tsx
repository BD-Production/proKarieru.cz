import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, ChevronLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { BrochureCarousel } from '@/components/BrochureCarousel'
import { GoogleAnalytics, GTMNoScript } from '@/components/GoogleAnalytics'

export default async function CompanyDetailPage({
  params,
}: {
  params: Promise<{ companySlug: string }>
}) {
  const { companySlug } = await params
  const supabase = await createClient()

  // Get company
  const { data: company } = await supabase
    .from('companies')
    .select('*')
    .eq('slug', companySlug)
    .eq('is_active', true)
    .single()

  if (!company) {
    notFound()
  }

  // Get portal (first active for now)
  const { data: portal } = await supabase
    .from('portals')
    .select('*')
    .eq('is_active', true)
    .limit(1)
    .single()

  // Get active edition
  const { data: edition } = await supabase
    .from('editions')
    .select('*')
    .eq('portal_id', portal?.id)
    .eq('is_active', true)
    .limit(1)
    .single()

  // Get company pages for this edition
  const { data: companyEdition } = await supabase
    .from('company_editions')
    .select(`
      *,
      pages:company_pages(*)
    `)
    .eq('company_id', company.id)
    .eq('edition_id', edition?.id)
    .single()

  const pages = companyEdition?.pages?.sort(
    (a: { page_number: number }, b: { page_number: number }) => a.page_number - b.page_number
  ) || []

  return (
    <>
      <GoogleAnalytics
        gaMeasurementId={portal?.ga_measurement_id}
        gtmContainerId={portal?.gtm_container_id}
      />
      <GTMNoScript gtmContainerId={portal?.gtm_container_id} />
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
      <header className="border-b bg-white sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button asChild variant="ghost" size="icon">
              <Link href="/">
                <ArrowLeft className="h-5 w-5" />
              </Link>
            </Button>
            <h1 className="font-semibold">{company.name}</h1>
            {edition && (
              <span className="text-sm text-gray-500 ml-auto">
                {edition.name}
              </span>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {pages.length > 0 ? (
          <BrochureCarousel
            pages={pages}
            companyName={company.name}
            primaryColor={portal?.primary_color}
          />
        ) : (
          <div className="text-center py-20 bg-white rounded-lg">
            <p className="text-gray-500">
              Pro tuto firmu nejsou v aktuální edici k dispozici žádné stránky.
            </p>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t bg-white py-6 px-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between text-sm text-gray-500">
          <Link href="/" className="hover:underline flex items-center gap-1">
            <ChevronLeft className="h-4 w-4" />
            Zpět do katalogu
          </Link>
          <span>{portal?.name}</span>
        </div>
      </footer>
      </div>
    </>
  )
}
