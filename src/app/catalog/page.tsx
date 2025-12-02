import { createClient } from '@/lib/supabase/server'
import Image from 'next/image'
import Link from 'next/link'
import { Input } from '@/components/ui/input'
import { Building2, Search } from 'lucide-react'

export default async function CatalogPage() {
  const supabase = await createClient()

  // TODO: Get portal from middleware headers
  // For now, get first active portal and its editions
  const { data: portal } = await supabase
    .from('portals')
    .select('*')
    .eq('is_active', true)
    .limit(1)
    .single()

  const { data: editions } = await supabase
    .from('editions')
    .select('*')
    .eq('portal_id', portal?.id)
    .order('is_active', { ascending: false })
    .order('display_order')

  const activeEdition = editions?.find((e) => e.is_active) || editions?.[0]

  // Get companies for active edition
  const { data: companyEditions } = await supabase
    .from('company_editions')
    .select(`
      *,
      company:companies(*)
    `)
    .eq('edition_id', activeEdition?.id)
    .order('display_order')

  const companies = companyEditions?.map((ce) => ce.company).filter(Boolean) || []

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b sticky top-0 bg-white z-10">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/portal">
              <h1
                className="text-xl font-bold"
                style={{ color: portal?.primary_color || '#C34751' }}
              >
                {portal?.name || 'proStavare'}
              </h1>
            </Link>
            <span className="text-sm text-gray-500">Katalog firem</span>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Edition tabs */}
        {editions && editions.length > 1 && (
          <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
            {editions.map((edition) => (
              <button
                key={edition.id}
                className={`px-4 py-2 rounded-full text-sm whitespace-nowrap transition-colors ${
                  edition.id === activeEdition?.id
                    ? 'text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
                style={
                  edition.id === activeEdition?.id
                    ? { backgroundColor: portal?.primary_color || '#C34751' }
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
          />
        </div>

        {/* Companies grid */}
        {companies.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {companies.map((company) => (
              <Link
                key={company.id}
                href={`/catalog/${company.slug}`}
                className="group"
              >
                <div className="aspect-square border rounded-lg overflow-hidden bg-white hover:shadow-lg transition-shadow flex items-center justify-center p-4">
                  {company.logo_url ? (
                    <Image
                      src={company.logo_url}
                      alt={company.name}
                      width={160}
                      height={160}
                      className="object-contain group-hover:scale-105 transition-transform"
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
            <p>Zadne firmy v teto edici.</p>
            <p className="text-sm mt-2">Pridejte firmy v administraci.</p>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t py-6 px-4 mt-auto">
        <div className="max-w-6xl mx-auto flex items-center justify-between text-sm text-gray-500">
          <span>&copy; {new Date().getFullYear()} {portal?.name}</span>
          <Link href="/portal" className="hover:underline">
            ← Zpet na portal
          </Link>
        </div>
      </footer>
    </div>
  )
}
