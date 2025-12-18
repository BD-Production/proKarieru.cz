import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// GET /api/catalog/[portalSlug]/[editionId] - Kompletni data pro prohlizec katalogu
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ portalSlug: string; editionId: string }> }
) {
  try {
    const { portalSlug, editionId } = await params
    const supabase = await createClient()

    // Najit portal podle slugu
    const { data: portal, error: portalError } = await supabase
      .from('portals')
      .select('id, name, slug, primary_color')
      .eq('slug', portalSlug)
      .eq('is_active', true)
      .single()

    if (portalError || !portal) {
      return NextResponse.json({ error: 'Portal nenalezen' }, { status: 404 })
    }

    // Overit ze edice patri k tomuto portalu
    const { data: edition, error: editionError } = await supabase
      .from('editions')
      .select('id, name, year, season, location')
      .eq('id', editionId)
      .eq('portal_id', portal.id)
      .single()

    if (editionError || !edition) {
      return NextResponse.json({ error: 'Edice nenalezena' }, { status: 404 })
    }

    // Nacist intro stranky
    const { data: introPages } = await supabase
      .from('catalog_pages')
      .select('*')
      .eq('edition_id', editionId)
      .eq('type', 'intro')
      .order('page_order', { ascending: true })

    // Nacist outro stranky
    const { data: outroPages } = await supabase
      .from('catalog_pages')
      .select('*')
      .eq('edition_id', editionId)
      .eq('type', 'outro')
      .order('page_order', { ascending: true })

    // Nacist firmy v poradi z catalog_company_order
    const { data: companyOrder } = await supabase
      .from('catalog_company_order')
      .select(`
        id,
        company_id,
        order_position,
        is_visible
      `)
      .eq('edition_id', editionId)
      .eq('is_visible', true)
      .order('order_position', { ascending: true })

    // Pokud neni nastaveno vlastni poradi, nacist firmy z company_editions
    let companies: Array<{
      id: string
      company_id: string
      order_position: number
      company: {
        id: string
        name: string
        slug: string
        logo_url: string | null
      }
      pages: Array<{
        id: string
        page_number: number
        image_url: string
      }>
    }> = []

    if (companyOrder && companyOrder.length > 0) {
      // Pouzit vlastni poradi
      const companyIds = companyOrder.map(c => c.company_id)

      // Nacist data firem
      const { data: companyData } = await supabase
        .from('companies')
        .select('id, name, slug, logo_url')
        .in('id', companyIds)
        .eq('is_active', true)

      // Nacist company_editions pro ziskani company_edition_id
      const { data: companyEditions } = await supabase
        .from('company_editions')
        .select('id, company_id')
        .eq('edition_id', editionId)
        .in('company_id', companyIds)

      // Nacist stranky firem
      const companyEditionIds = companyEditions?.map(ce => ce.id) || []
      const { data: allPages } = await supabase
        .from('company_pages')
        .select('id, company_edition_id, page_number, image_url')
        .in('company_edition_id', companyEditionIds)
        .order('page_number', { ascending: true })

      // Sestavit vysledek
      companies = companyOrder.map(co => {
        const company = companyData?.find(c => c.id === co.company_id)
        const companyEdition = companyEditions?.find(ce => ce.company_id === co.company_id)
        const pages = allPages?.filter(p => p.company_edition_id === companyEdition?.id) || []

        return {
          id: co.id,
          company_id: co.company_id,
          order_position: co.order_position,
          company: company || { id: co.company_id, name: '', slug: '', logo_url: null },
          pages
        }
      }).filter(c => c.company && c.pages.length > 0) // Pouze firmy s daty a strankami
    } else {
      // Fallback: pouzit company_editions s abecednim razenim
      const { data: companyEditions } = await supabase
        .from('company_editions')
        .select(`
          id,
          company_id,
          display_order,
          company:companies!inner(id, name, slug, logo_url, is_active)
        `)
        .eq('edition_id', editionId)

      // Filtrovat aktivni firmy a seradit abecedne
      const activeCompanyEditions = companyEditions
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ?.filter((ce: any) => ce.company?.is_active)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .sort((a: any, b: any) => a.company.name.localeCompare(b.company.name, 'cs')) || []

      // Nacist stranky
      const ceIds = activeCompanyEditions.map(ce => ce.id)
      const { data: allPages } = await supabase
        .from('company_pages')
        .select('id, company_edition_id, page_number, image_url')
        .in('company_edition_id', ceIds)
        .order('page_number', { ascending: true })

      companies = activeCompanyEditions.map((ce, index) => ({
        id: ce.id,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        company_id: (ce.company as any).id,
        order_position: index,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        company: ce.company as any,
        pages: allPages?.filter(p => p.company_edition_id === ce.id) || []
      })).filter(c => c.pages.length > 0)
    }

    // Spocitat celkovy pocet stranek
    const totalIntroPages = introPages?.length || 0
    const totalOutroPages = outroPages?.length || 0
    const totalCompanyPages = companies.reduce((sum, c) => sum + c.pages.length, 0)
    const totalPages = totalIntroPages + totalCompanyPages + totalOutroPages

    return NextResponse.json({
      portal,
      edition,
      catalog: {
        introPages: introPages || [],
        companies,
        outroPages: outroPages || [],
        totalPages,
        stats: {
          introPages: totalIntroPages,
          companyPages: totalCompanyPages,
          outroPages: totalOutroPages,
          companiesCount: companies.length
        }
      }
    })
  } catch (err) {
    console.error('Catalog API error:', err)
    return NextResponse.json(
      { error: 'Nastala chyba pri zpracovani' },
      { status: 500 }
    )
  }
}
