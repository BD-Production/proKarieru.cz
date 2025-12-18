import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// GET /api/admin/article-tags - Seznam tagů pro admin
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Ověření přihlášení
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const portalId = searchParams.get('portal_id')

    let query = supabase
      .from('article_tags')
      .select(`
        id,
        portal_id,
        name,
        slug,
        created_at,
        portal:portals(id, name, slug)
      `)
      .order('name', { ascending: true })

    if (portalId) {
      query = query.eq('portal_id', portalId)
    }

    const { data: tags, error } = await query

    if (error) {
      console.error('Error fetching tags:', error)
      return NextResponse.json(
        { error: 'Nepodařilo se načíst tagy' },
        { status: 500 }
      )
    }

    // Získat počet článků pro každý tag
    const tagsWithCount = await Promise.all(
      (tags || []).map(async (tag) => {
        const { count } = await supabase
          .from('article_tag_relations')
          .select('article_id', { count: 'exact', head: true })
          .eq('tag_id', tag.id)

        return {
          ...tag,
          article_count: count || 0
        }
      })
    )

    return NextResponse.json({ tags: tagsWithCount })
  } catch (err) {
    console.error('Admin article tags API error:', err)
    return NextResponse.json(
      { error: 'Nastala chyba při zpracování' },
      { status: 500 }
    )
  }
}

// POST /api/admin/article-tags - Vytvořit nový tag
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Ověření přihlášení
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { portal_id, name, slug } = body

    // Validace
    if (!portal_id || !name || !slug) {
      return NextResponse.json(
        { error: 'Portál, název a slug jsou povinné' },
        { status: 400 }
      )
    }

    // Kontrola unikátnosti slugu v rámci portálu
    const { data: existingTag } = await supabase
      .from('article_tags')
      .select('id')
      .eq('portal_id', portal_id)
      .eq('slug', slug)
      .single()

    if (existingTag) {
      return NextResponse.json(
        { error: 'Tag s tímto slugem již existuje' },
        { status: 400 }
      )
    }

    const { data: tag, error } = await supabase
      .from('article_tags')
      .insert({
        portal_id,
        name,
        slug
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating tag:', error)
      return NextResponse.json(
        { error: 'Nepodařilo se vytvořit tag' },
        { status: 500 }
      )
    }

    return NextResponse.json({ tag })
  } catch (err) {
    console.error('Create tag error:', err)
    return NextResponse.json(
      { error: 'Nastala chyba při zpracování' },
      { status: 500 }
    )
  }
}
