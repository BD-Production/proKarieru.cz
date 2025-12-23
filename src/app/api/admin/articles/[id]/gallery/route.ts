import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// OPTIONS handler pro CORS preflight
export async function OPTIONS() {
  return NextResponse.json({}, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    }
  })
}

// POST /api/admin/articles/[id]/gallery - Přidat obrázek do galerie
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: articleId } = await params
    const supabase = await createClient()

    // Ověření přihlášení
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const {
      image_url,
      thumbnail_url,
      caption,
      sort_order = 0,
      media_type = 'image',
      duration,
      file_size
    } = body

    if (!image_url) {
      return NextResponse.json(
        { error: 'URL média je povinná' },
        { status: 400 }
      )
    }

    // Validace media_type
    if (!['image', 'video'].includes(media_type)) {
      return NextResponse.json(
        { error: 'Neplatný typ média' },
        { status: 400 }
      )
    }

    // Ověřit, že článek existuje
    const { data: article } = await supabase
      .from('articles')
      .select('id')
      .eq('id', articleId)
      .single()

    if (!article) {
      return NextResponse.json(
        { error: 'Článek nenalezen' },
        { status: 404 }
      )
    }

    const { data: galleryImage, error } = await supabase
      .from('article_gallery')
      .insert({
        article_id: articleId,
        image_url,
        thumbnail_url: thumbnail_url || null,
        caption: caption || null,
        sort_order,
        media_type,
        duration: duration || null,
        file_size: file_size || null
      })
      .select()
      .single()

    if (error) {
      console.error('Error adding gallery image:', error)
      return NextResponse.json(
        { error: 'Nepodařilo se přidat médium' },
        { status: 500 }
      )
    }

    return NextResponse.json({ image: galleryImage })
  } catch (err) {
    console.error('Add gallery image error:', err)
    return NextResponse.json(
      { error: 'Nastala chyba při zpracování' },
      { status: 500 }
    )
  }
}

// PUT /api/admin/articles/[id]/gallery - Aktualizovat pořadí a captions galerie
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: articleId } = await params
    const supabase = await createClient()

    // Ověření přihlášení
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { images } = body // Array of { id, caption, sort_order }

    if (!images || !Array.isArray(images)) {
      return NextResponse.json(
        { error: 'Neplatná data' },
        { status: 400 }
      )
    }

    // Aktualizovat každý obrázek
    for (const image of images) {
      const { error } = await supabase
        .from('article_gallery')
        .update({
          caption: image.caption || null,
          sort_order: image.sort_order
        })
        .eq('id', image.id)
        .eq('article_id', articleId)

      if (error) {
        console.error('Error updating gallery image:', error)
      }
    }

    // Získat aktualizovanou galerii
    const { data: gallery } = await supabase
      .from('article_gallery')
      .select('*')
      .eq('article_id', articleId)
      .order('sort_order', { ascending: true })

    return NextResponse.json({ gallery: gallery || [] })
  } catch (err) {
    console.error('Update gallery error:', err)
    return NextResponse.json(
      { error: 'Nastala chyba při zpracování' },
      { status: 500 }
    )
  }
}
