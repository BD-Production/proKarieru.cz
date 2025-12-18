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

// GET /api/admin/catalog/pages - Seznam intro/outro stranek pro edici
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

    // Nacist intro stranky
    const { data: introPages, error: introError } = await supabase
      .from('catalog_pages')
      .select('*')
      .eq('edition_id', editionId)
      .eq('type', 'intro')
      .order('page_order', { ascending: true })

    if (introError) {
      console.error('Error fetching intro pages:', introError)
    }

    // Nacist outro stranky
    const { data: outroPages, error: outroError } = await supabase
      .from('catalog_pages')
      .select('*')
      .eq('edition_id', editionId)
      .eq('type', 'outro')
      .order('page_order', { ascending: true })

    if (outroError) {
      console.error('Error fetching outro pages:', outroError)
    }

    return NextResponse.json({
      introPages: introPages || [],
      outroPages: outroPages || []
    })
  } catch (err) {
    console.error('Admin catalog pages API error:', err)
    return NextResponse.json(
      { error: 'Nastala chyba pri zpracovani' },
      { status: 500 }
    )
  }
}

// POST /api/admin/catalog/pages - Pridat novou intro/outro stranku
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Overeni prihlaseni
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { portal_id, edition_id, type, image_url, page_order } = body

    // Validace
    if (!portal_id || !edition_id || !type || !image_url) {
      return NextResponse.json(
        { error: 'Chybi povinna pole: portal_id, edition_id, type, image_url' },
        { status: 400 }
      )
    }

    if (!['intro', 'outro'].includes(type)) {
      return NextResponse.json(
        { error: 'type musi byt "intro" nebo "outro"' },
        { status: 400 }
      )
    }

    // Pokud neni page_order, najit nejvyssi a pridat 1
    let finalPageOrder = page_order
    if (finalPageOrder === undefined || finalPageOrder === null) {
      const { data: existingPages } = await supabase
        .from('catalog_pages')
        .select('page_order')
        .eq('edition_id', edition_id)
        .eq('type', type)
        .order('page_order', { ascending: false })
        .limit(1)

      finalPageOrder = (existingPages?.[0]?.page_order ?? -1) + 1
    }

    // Vytvorit stranku
    const { data: page, error } = await supabase
      .from('catalog_pages')
      .insert({
        portal_id,
        edition_id,
        type,
        image_url,
        page_order: finalPageOrder
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating catalog page:', error)
      return NextResponse.json(
        { error: 'Nepodarilo se vytvorit stranku' },
        { status: 500 }
      )
    }

    return NextResponse.json({ page })
  } catch (err) {
    console.error('Create catalog page error:', err)
    return NextResponse.json(
      { error: 'Nastala chyba pri zpracovani' },
      { status: 500 }
    )
  }
}

// PUT /api/admin/catalog/pages - Aktualizovat poradi stranek
export async function PUT(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Overeni prihlaseni
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { pages } = body // Array of { id, page_order }

    if (!pages || !Array.isArray(pages)) {
      return NextResponse.json(
        { error: 'Neplatna data - ocekavan array pages' },
        { status: 400 }
      )
    }

    // Aktualizovat poradi kazde stranky
    for (const page of pages) {
      const { error } = await supabase
        .from('catalog_pages')
        .update({ page_order: page.page_order, updated_at: new Date().toISOString() })
        .eq('id', page.id)

      if (error) {
        console.error('Error updating page order:', error)
      }
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Update catalog pages error:', err)
    return NextResponse.json(
      { error: 'Nastala chyba pri zpracovani' },
      { status: 500 }
    )
  }
}
