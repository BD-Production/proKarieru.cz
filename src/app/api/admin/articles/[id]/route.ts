import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// GET /api/admin/articles/[id] - Získat detail článku pro editaci
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()

    // Ověření přihlášení
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: article, error } = await supabase
      .from('articles')
      .select(`
        *,
        portal:portals(id, name, slug),
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
      .eq('id', id)
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
    console.error('Get article error:', err)
    return NextResponse.json(
      { error: 'Nastala chyba při zpracování' },
      { status: 500 }
    )
  }
}

// PUT /api/admin/articles/[id] - Aktualizovat článek
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
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
      status,
      sort_order,
      og_title,
      og_description,
      og_image_url,
      tag_ids = []
    } = body

    // Validace povinných polí
    if (!portal_id || !title || !slug || !perex || !content || !featured_image_url || !author_name) {
      return NextResponse.json(
        { error: 'Všechna povinná pole musí být vyplněna' },
        { status: 400 }
      )
    }

    // Získat aktuální článek pro kontrolu změny statusu
    const { data: currentArticle } = await supabase
      .from('articles')
      .select('status, published_at')
      .eq('id', id)
      .single()

    if (!currentArticle) {
      return NextResponse.json(
        { error: 'Článek nenalezen' },
        { status: 404 }
      )
    }

    // Kontrola unikátnosti slugu (pokud se změnil)
    const { data: existingArticle } = await supabase
      .from('articles')
      .select('id')
      .eq('portal_id', portal_id)
      .eq('slug', slug)
      .neq('id', id)
      .single()

    if (existingArticle) {
      return NextResponse.json(
        { error: 'Článek s tímto slugem již existuje' },
        { status: 400 }
      )
    }

    // Nastavení published_at pokud se mění status na published
    let published_at = currentArticle.published_at
    if (status === 'published' && currentArticle.status !== 'published') {
      published_at = new Date().toISOString()
    }

    // Aktualizovat článek
    const { data: article, error } = await supabase
      .from('articles')
      .update({
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
        published_at,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating article:', error)
      return NextResponse.json(
        { error: 'Nepodařilo se aktualizovat článek' },
        { status: 500 }
      )
    }

    // Aktualizovat tagy - smazat staré a přidat nové
    await supabase
      .from('article_tag_relations')
      .delete()
      .eq('article_id', id)

    if (tag_ids.length > 0) {
      const tagRelations = tag_ids.map((tagId: string) => ({
        article_id: id,
        tag_id: tagId
      }))

      const { error: tagError } = await supabase
        .from('article_tag_relations')
        .insert(tagRelations)

      if (tagError) {
        console.error('Error updating tags:', tagError)
      }
    }

    return NextResponse.json({ article })
  } catch (err) {
    console.error('Update article error:', err)
    return NextResponse.json(
      { error: 'Nastala chyba při zpracování' },
      { status: 500 }
    )
  }
}

// DELETE /api/admin/articles/[id] - Smazat článek
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()

    // Ověření přihlášení
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Smazat článek (kaskádové smazání tagů a galerie)
    const { error } = await supabase
      .from('articles')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting article:', error)
      return NextResponse.json(
        { error: 'Nepodařilo se smazat článek' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Delete article error:', err)
    return NextResponse.json(
      { error: 'Nastala chyba při zpracování' },
      { status: 500 }
    )
  }
}
