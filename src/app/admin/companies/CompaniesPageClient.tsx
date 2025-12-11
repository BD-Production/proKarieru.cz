'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Plus, Loader2 } from 'lucide-react'
import { CompaniesTable } from './CompaniesTable'
import { useAdminPortal } from '@/contexts/AdminPortalContext'

type Edition = {
  id: string
  name: string
}

type Company = {
  id: string
  name: string
  slug: string
  logo_url: string | null
  is_active: boolean
  featured: boolean
  editions: Edition[]
}

export function CompaniesPageClient() {
  const supabase = createClient()
  const { selectedPortalId, loading: portalLoading } = useAdminPortal()
  const [companies, setCompanies] = useState<Company[]>([])
  const [editions, setEditions] = useState<Edition[]>([])
  const [loading, setLoading] = useState(true)
  const timestamp = Date.now()

  useEffect(() => {
    const loadData = async () => {
      if (portalLoading) return

      setLoading(true)

      // Pokud není vybraný portál, načti všechny firmy
      if (!selectedPortalId) {
        const { data: allEditions } = await supabase
          .from('editions')
          .select('id, name')
          .order('display_order')

        const { data: allCompanies } = await supabase
          .from('companies')
          .select(`
            id,
            name,
            slug,
            logo_url,
            is_active,
            featured,
            company_editions(
              edition:editions(id, name, display_order)
            )
          `)
          .order('name', { ascending: true })

        const companiesWithEditions = allCompanies?.map((company) => ({
          id: company.id,
          name: company.name,
          slug: company.slug,
          logo_url: company.logo_url,
          is_active: company.is_active,
          featured: company.featured ?? false,
          editions: company.company_editions
            ?.map((ce: any) => ce.edition)
            .filter(Boolean)
            .sort((a: any, b: any) => (a.display_order || 0) - (b.display_order || 0)) || [],
        })) || []

        setEditions(allEditions || [])
        setCompanies(companiesWithEditions)
        setLoading(false)
        return
      }

      // Načti edice pro vybraný portál
      const { data: portalEditions } = await supabase
        .from('editions')
        .select('id, name')
        .eq('portal_id', selectedPortalId)
        .order('display_order')

      const editionIds = portalEditions?.map((e) => e.id) || []

      if (editionIds.length === 0) {
        setEditions([])
        setCompanies([])
        setLoading(false)
        return
      }

      // Načti company_editions pro tyto edice
      const { data: companyEditions } = await supabase
        .from('company_editions')
        .select('company_id')
        .in('edition_id', editionIds)

      const companyIds = [...new Set(companyEditions?.map((ce) => ce.company_id) || [])]

      if (companyIds.length === 0) {
        setEditions(portalEditions || [])
        setCompanies([])
        setLoading(false)
        return
      }

      // Načti firmy
      const { data: portalCompanies } = await supabase
        .from('companies')
        .select(`
          id,
          name,
          slug,
          logo_url,
          is_active,
          featured,
          company_editions(
            edition:editions(id, name, display_order)
          )
        `)
        .in('id', companyIds)
        .order('name', { ascending: true })

      const companiesWithEditions = portalCompanies?.map((company) => ({
        id: company.id,
        name: company.name,
        slug: company.slug,
        logo_url: company.logo_url,
        is_active: company.is_active,
        featured: company.featured ?? false,
        editions: company.company_editions
          ?.map((ce: any) => ce.edition)
          .filter(Boolean)
          .filter((e: any) => editionIds.includes(e.id))
          .sort((a: any, b: any) => (a.display_order || 0) - (b.display_order || 0)) || [],
      })) || []

      setEditions(portalEditions || [])
      setCompanies(companiesWithEditions)
      setLoading(false)
    }

    loadData()
  }, [selectedPortalId, portalLoading, supabase])

  if (loading || portalLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Firmy</h1>
          <p className="text-gray-500">
            {selectedPortalId
              ? `Firmy ve vybraném portálu`
              : 'Všechny firmy v systému'}
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/companies/new">
            <Plus className="mr-2 h-4 w-4" />
            Přidat firmu
          </Link>
        </Button>
      </div>

      <CompaniesTable
        companies={companies}
        editions={editions}
        timestamp={timestamp}
      />
    </div>
  )
}
