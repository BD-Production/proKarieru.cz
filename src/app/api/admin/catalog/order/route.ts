import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// CORS headers helper
function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  }
}

// OPTIONS handler pro CORS preflight
export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders() })
}

// GET /api/admin/catalog/order - Ziskat poradi firem v katalogu
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Overeni prihlaseni
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const editionId = searchParams.get('edition_id')

    if (!editionId) {
      return NextResponse.json(
        { error: 'edition_id je povinny parametr' },
        { status: 400 }
      )
    }

    // Ziskat edici pro portal_id
    const { data: edition } = await supabase
      .from('editions')
      .select('id, portal_id')
      .eq('id', editionId)
      .single()

    if (!edition) {
      return NextResponse.json({ error: 'Edice nenalezena' }, { status: 404 })
    }

    // Nacist existujici poradi
    const { data: existingOrder } = await supabase
      .from('catalog_company_order')
      .select(`
        id,
        company_id,
        order_position,
        is_visible
      `)
      .eq('edition_id', editionId)
      .order('order_position', { ascending: true })

    // Nacist vsechny firmy v teto edici (z company_editions)
    const { data: companyEditions } = await supabase
      .from('company_editions')
      .select(`
        company_id,
        company:companies!inner(id, name, slug, logo_url, is_active)
      `)
      .eq('edition_id', editionId)

    // Filtrovat aktivni firmy
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const activeCompanies = companyEditions?.filter((ce: any) => ce.company?.is_active) || []

    // Kombinovat data - pouzit existujici poradi nebo vytvorit nove abecedne
    const existingCompanyIds = new Set(existingOrder?.map(o => o.company_id) || [])

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const companiesWithOrder = activeCompanies.map((ce: any) => {
      const existing = existingOrder?.find(o => o.company_id === ce.company_id)
      return {
        company_id: ce.company_id,
        company: ce.company,
        order_position: existing?.order_position ?? 999999, // Pro firmy bez poradi
        is_visible: existing?.is_visible ?? true,
        has_custom_order: existingCompanyIds.has(ce.company_id)
      }
    })

    // Seradit: nejdriv podle custom poradi, pak abecedne
    companiesWithOrder.sort((a, b) => {
      if (a.has_custom_order && !b.has_custom_order) return -1
      if (!a.has_custom_order && b.has_custom_order) return 1
      if (a.has_custom_order && b.has_custom_order) {
        return a.order_position - b.order_position
      }
      return a.company.name.localeCompare(b.company.name, 'cs')
    })

    // Preradit indexy
    const finalOrder = companiesWithOrder.map((c, index) => ({
      ...c,
      order_position: index
    }))

    return NextResponse.json({
      companies: finalOrder,
      hasCustomOrder: existingOrder && existingOrder.length > 0
    })
  } catch (err) {
    console.error('Admin catalog order GET error:', err)
    return NextResponse.json(
      { error: 'Nastala chyba pri zpracovani' },
      { status: 500 }
    )
  }
}

// PUT /api/admin/catalog/order - Ulozit poradi firem
export async function PUT(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Overeni prihlaseni
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { edition_id, portal_id, companies } = body
    // companies: Array of { company_id, order_position, is_visible }

    if (!edition_id || !portal_id || !companies || !Array.isArray(companies)) {
      return NextResponse.json(
        { error: 'Neplatna data - ocekavan edition_id, portal_id a array companies' },
        { status: 400 }
      )
    }

    // Smazat existujici poradi pro tuto edici
    await supabase
      .from('catalog_company_order')
      .delete()
      .eq('edition_id', edition_id)

    // Vlozit nove poradi
    if (companies.length > 0) {
      const records = companies.map((c: { company_id: string; order_position: number; is_visible?: boolean }) => ({
        portal_id,
        edition_id,
        company_id: c.company_id,
        order_position: c.order_position,
        is_visible: c.is_visible !== false // default true
      }))

      const { error } = await supabase
        .from('catalog_company_order')
        .insert(records)

      if (error) {
        console.error('Error saving catalog order:', error)
        return NextResponse.json(
          { error: 'Nepodarilo se ulozit poradi' },
          { status: 500 }
        )
      }
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Admin catalog order PUT error:', err)
    return NextResponse.json(
      { error: 'Nastala chyba pri zpracovani' },
      { status: 500 }
    )
  }
}

// DELETE /api/admin/catalog/order - Resetovat poradi na abecedni
export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Overeni prihlaseni
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const editionId = searchParams.get('edition_id')

    if (!editionId) {
      return NextResponse.json(
        { error: 'edition_id je povinny parametr' },
        { status: 400 }
      )
    }

    // Smazat vsechna poradi pro tuto edici
    const { error } = await supabase
      .from('catalog_company_order')
      .delete()
      .eq('edition_id', editionId)

    if (error) {
      console.error('Error resetting catalog order:', error)
      return NextResponse.json(
        { error: 'Nepodarilo se resetovat poradi' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, message: 'Poradi bylo resetovano na abecedni' })
  } catch (err) {
    console.error('Admin catalog order DELETE error:', err)
    return NextResponse.json(
      { error: 'Nastala chyba pri zpracovani' },
      { status: 500 }
    )
  }
}
