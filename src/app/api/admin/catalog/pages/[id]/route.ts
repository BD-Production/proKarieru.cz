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

// DELETE /api/admin/catalog/pages/[id] - Smazat intro/outro stranku
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()

    // Overeni prihlaseni
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Ziskat URL obrazku pro pripadne smazani ze storage
    const { data: page } = await supabase
      .from('catalog_pages')
      .select('image_url')
      .eq('id', id)
      .single()

    if (!page) {
      return NextResponse.json(
        { error: 'Stranka nenalezena' },
        { status: 404 }
      )
    }

    // Smazat z databaze
    const { error } = await supabase
      .from('catalog_pages')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting catalog page:', error)
      return NextResponse.json(
        { error: 'Nepodarilo se smazat stranku' },
        { status: 500 }
      )
    }

    // Pokusit se smazat ze storage pokud je to Supabase URL
    try {
      if (page.image_url.includes('supabase')) {
        const url = new URL(page.image_url)
        const pathMatch = url.pathname.match(/\/storage\/v1\/object\/public\/catalog-pages\/(.+)/)
        if (pathMatch) {
          await supabase.storage
            .from('catalog-pages')
            .remove([pathMatch[1]])
        }
      }
    } catch (storageError) {
      // Loggujeme, ale neblokujeme - zaznam v DB je smazan
      console.error('Failed to delete from storage:', storageError)
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Delete catalog page error:', err)
    return NextResponse.json(
      { error: 'Nastala chyba pri zpracovani' },
      { status: 500 }
    )
  }
}
