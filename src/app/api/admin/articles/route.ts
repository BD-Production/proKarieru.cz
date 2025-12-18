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

// GET /api/admin/articles - Seznam článků pro admin
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
    const status = searchParams.get('status')

    let query = supabase
      .from('articles')
      .select(`
        id,
        portal_id,
        title,
        slug,
        perex,
        featured_image_url,
        author_name,
        status,
        sort_order,
        published_at,
        created_at,
        updated_at,
        portal:portals(id, name, slug),
        article_tag_relations(
          tag:article_tags(id, name, slug)
        )
      `)
      .order('sort_order', { ascending: true })

    if (portalId) {
      query = query.eq('portal_id', portalId)
    }

    if (status) {
      query = query.eq('status', status)
    }

    const { data: articles, error } = await query

    if (error) {
      console.error('Error fetching articles:', error)
      return NextResponse.json(
        { error: 'Nepodařilo se načíst články' },
        { status: 500 }
      )
    }

    // Transformace dat
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const transformedArticles = articles?.map((article: any) => ({
      ...article,
      tags: article.article_tag_relations?.map((r: { tag: { id: string; name: string; slug: string } }) => r.tag).filter(Boolean) || [],
      article_tag_relations: undefined
    })) || []

    return NextResponse.json({ articles: transformedArticles })
  } catch (err) {
    console.error('Admin articles API error:', err)
    return NextResponse.json(
      { error: 'Nastala chyba při zpracování' },
      { status: 500 }
    )
  }
}

// POST /api/admin/articles - Vytvořit nový článek
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Ověření přihlášení
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const {
      portal_id,
      title,
      slug,
      perex,
      content,
      featured_image_url,
      author_name,
      status = 'draft',
      sort_order = 0,
      og_title,
      og_description,
      og_image_url,
      tag_ids = []
    } = body

    // Validace povinných polí
    const missingFields = []
    if (!portal_id) missingFields.push('portal_id')
    if (!title) missingFields.push('title')
    if (!slug) missingFields.push('slug')
    if (!perex) missingFields.push('perex')
    if (!content) missingFields.push('content')
    if (!featured_image_url) missingFields.push('featured_image_url')
    if (!author_name) missingFields.push('author_name')

    if (missingFields.length > 0) {
      console.error('Missing fields:', missingFields, 'Body:', body)
      return NextResponse.json(
        { error: `Chybí povinná pole: ${missingFields.join(', ')}` },
        { status: 400 }
      )
    }

    // Kontrola unikátnosti slugu v rámci portálu
    const { data: existingArticle } = await supabase
      .from('articles')
      .select('id')
      .eq('portal_id', portal_id)
      .eq('slug', slug)
      .single()

    if (existingArticle) {
      return NextResponse.json(
        { error: 'Článek s tímto slugem již existuje' },
        { status: 400 }
      )
    }

    // Nastavení published_at pokud je status published
    const published_at = status === 'published' ? new Date().toISOString() : null

    // Vytvořit článek
    const { data: article, error } = await supabase
      .from('articles')
      .insert({
        portal_id,
        title,
        slug,
        perex,
        content,
        featured_image_url,
        author_name,
        status,
        sort_order,
        og_title: og_title || null,
        og_description: og_description || null,
        og_image_url: og_image_url || null,
        published_at
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating article:', error)
      return NextResponse.json(
        { error: 'Nepodařilo se vytvořit článek' },
        { status: 500 }
      )
    }

    // Přidat tagy
    if (tag_ids.length > 0) {
      const tagRelations = tag_ids.map((tagId: string) => ({
        article_id: article.id,
        tag_id: tagId
      }))

      const { error: tagError } = await supabase
        .from('article_tag_relations')
        .insert(tagRelations)

      if (tagError) {
        console.error('Error adding tags:', tagError)
      }
    }

    return NextResponse.json({ article })
  } catch (err) {
    console.error('Create article error:', err)
    return NextResponse.json(
      { error: 'Nastala chyba při zpracování' },
      { status: 500 }
    )
  }
}
