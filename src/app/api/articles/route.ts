import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// GET /api/articles - Získat publikované články pro portál
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const portalId = searchParams.get('portal_id')
    const limit = searchParams.get('limit')
    const tagSlug = searchParams.get('tag_slug')
    const offset = searchParams.get('offset')

    if (!portalId) {
      return NextResponse.json(
        { error: 'portal_id je povinný' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Základní query
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
        article_tag_relations(
          tag:article_tags(id, name, slug)
        )
      `)
      .eq('portal_id', portalId)
      .eq('status', 'published')
      .order('sort_order', { ascending: true })

    // Filtrování podle tagu
    if (tagSlug) {
      // Nejprve najdeme tag ID
      const { data: tag } = await supabase
        .from('article_tags')
        .select('id')
        .eq('portal_id', portalId)
        .eq('slug', tagSlug)
        .single()

      if (tag) {
        // Získáme article IDs s tímto tagem
        const { data: relations } = await supabase
          .from('article_tag_relations')
          .select('article_id')
          .eq('tag_id', tag.id)

        if (relations && relations.length > 0) {
          const articleIds = relations.map(r => r.article_id)
          query = query.in('id', articleIds)
        } else {
          // Žádné články s tímto tagem
          return NextResponse.json({ articles: [], total: 0 })
        }
      } else {
        // Tag neexistuje
        return NextResponse.json({ articles: [], total: 0 })
      }
    }

    // Offset pro pagination
    if (offset) {
      query = query.range(parseInt(offset), parseInt(offset) + (limit ? parseInt(limit) - 1 : 999))
    }

    // Limit
    if (limit) {
      query = query.limit(parseInt(limit))
    }

    const { data: articles, error } = await query

    if (error) {
      console.error('Error fetching articles:', error)
      return NextResponse.json(
        { error: 'Nepodařilo se načíst články' },
        { status: 500 }
      )
    }

    // Transformace dat - rozprostřít tagy
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const transformedArticles = articles?.map((article: any) => ({
      ...article,
      tags: article.article_tag_relations?.map((r: { tag: { id: string; name: string; slug: string } }) => r.tag).filter(Boolean) || [],
      article_tag_relations: undefined
    })) || []

    // Celkový počet pro pagination
    const { count } = await supabase
      .from('articles')
      .select('id', { count: 'exact', head: true })
      .eq('portal_id', portalId)
      .eq('status', 'published')

    return NextResponse.json({
      articles: transformedArticles,
      total: count || 0
    })
  } catch (err) {
    console.error('Articles API error:', err)
    return NextResponse.json(
      { error: 'Nastala chyba při zpracování' },
      { status: 500 }
    )
  }
}
