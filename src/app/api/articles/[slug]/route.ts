import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// GET /api/articles/[slug] - Získat detail článku
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params
    const { searchParams } = new URL(request.url)
    const portalId = searchParams.get('portal_id')

    if (!portalId) {
      return NextResponse.json(
        { error: 'portal_id je povinný' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Získat článek s tagy a galerií
    const { data: article, error } = await supabase
      .from('articles')
      .select(`
        *,
        article_tag_relations(
          tag:article_tags(id, name, slug)
        ),
        article_gallery(
          id,
          image_url,
          caption,
          sort_order
        )
      `)
      .eq('portal_id', portalId)
      .eq('slug', slug)
      .eq('status', 'published')
      .single()

    if (error || !article) {
      return NextResponse.json(
        { error: 'Článek nenalezen' },
        { status: 404 }
      )
    }

    // Transformace dat
    const transformedArticle = {
      ...article,
      tags: article.article_tag_relations?.map((r: { tag: { id: string; name: string; slug: string } }) => r.tag).filter(Boolean) || [],
      gallery: article.article_gallery?.sort((a: { sort_order: number }, b: { sort_order: number }) => a.sort_order - b.sort_order) || [],
      article_tag_relations: undefined,
      article_gallery: undefined
    }

    return NextResponse.json({ article: transformedArticle })
  } catch (err) {
    console.error('Article detail API error:', err)
    return NextResponse.json(
      { error: 'Nastala chyba při zpracování' },
      { status: 500 }
    )
  }
}
