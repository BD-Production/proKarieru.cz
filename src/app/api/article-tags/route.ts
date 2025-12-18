import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// GET /api/article-tags - Získat tagy pro portál
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const portalId = searchParams.get('portal_id')

    if (!portalId) {
      return NextResponse.json(
        { error: 'portal_id je povinný' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    const { data: tags, error } = await supabase
      .from('article_tags')
      .select('id, name, slug')
      .eq('portal_id', portalId)
      .order('name', { ascending: true })

    if (error) {
      console.error('Error fetching article tags:', error)
      return NextResponse.json(
        { error: 'Nepodařilo se načíst tagy' },
        { status: 500 }
      )
    }

    return NextResponse.json({ tags: tags || [] })
  } catch (err) {
    console.error('Article tags API error:', err)
    return NextResponse.json(
      { error: 'Nastala chyba při zpracování' },
      { status: 500 }
    )
  }
}
