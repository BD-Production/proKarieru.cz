import { unstable_noStore as noStore } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { CompaniesTable } from './CompaniesTable'

export default async function CompaniesPage() {
  noStore() // Disable caching to ensure fresh data and logo timestamps
  const supabase = await createClient()
  const timestamp = Date.now()

  // Get active portal
  const { data: portal } = await supabase
    .from('portals')
    .select('id')
    .eq('is_active', true)
    .limit(1)
    .single()

  // Get all editions for the portal
  const { data: editions } = await supabase
    .from('editions')
    .select('id, name')
    .eq('portal_id', portal?.id)
    .order('display_order')

  // Get all companies with their editions
  const { data: companies } = await supabase
    .from('companies')
    .select(`
      id,
      name,
      slug,
      logo_url,
      is_active,
      company_editions(
        edition:editions(id, name, display_order)
      )
    `)
    .order('name', { ascending: true })

  // Transform data to include editions array (sorted by display_order)
  const companiesWithEditions = companies?.map((company) => ({
    id: company.id,
    name: company.name,
    slug: company.slug,
    logo_url: company.logo_url,
    is_active: company.is_active,
    editions: company.company_editions
      ?.map((ce: any) => ce.edition)
      .filter(Boolean)
      .sort((a: any, b: any) => (a.display_order || 0) - (b.display_order || 0)) || [],
  })) || []

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Firmy</h1>
          <p className="text-gray-500">Správa firem v systému</p>
        </div>
        <Button asChild>
          <Link href="/admin/companies/new">
            <Plus className="mr-2 h-4 w-4" />
            Přidat firmu
          </Link>
        </Button>
      </div>

      <CompaniesTable
        companies={companiesWithEditions}
        editions={editions || []}
        timestamp={timestamp}
      />
    </div>
  )
}
