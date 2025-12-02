import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowLeft, ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="border-b bg-white sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button asChild variant="ghost" size="icon">
              <Link href="/catalog">
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
          <div className="space-y-4">
            {/* Page viewer - simple version, TODO: add carousel */}
            {pages.map((page: { id: string; image_url: string; page_number: number }) => (
              <div
                key={page.id}
                className="bg-white rounded-lg shadow-sm overflow-hidden"
              >
                <div className="relative aspect-[3/4]">
                  <Image
                    src={page.image_url}
                    alt={`${company.name} - strana ${page.page_number}`}
                    fill
                    className="object-contain"
                    priority={page.page_number === 1}
                  />
                </div>
              </div>
            ))}

            {/* Page indicator */}
            <div className="flex justify-center gap-2 py-4">
              {pages.map((page: { id: string; page_number: number }, index: number) => (
                <div
                  key={page.id}
                  className="w-2 h-2 rounded-full"
                  style={{
                    backgroundColor:
                      index === 0
                        ? portal?.primary_color || '#C34751'
                        : '#E5E7EB',
                  }}
                />
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-lg">
            <p className="text-gray-500">
              Pro tuto firmu nejsou v aktualni edici k dispozici zadne stranky.
            </p>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t bg-white py-6 px-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between text-sm text-gray-500">
          <Link href="/catalog" className="hover:underline flex items-center gap-1">
            <ChevronLeft className="h-4 w-4" />
            Zpet do katalogu
          </Link>
          <span>{portal?.name}</span>
        </div>
      </footer>
    </div>
  )
}
