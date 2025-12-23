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

// DELETE /api/admin/article-gallery/[id] - Smazat obrázek z galerie
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

    // Získat informace o položce pro případné smazání ze storage
    const { data: item } = await supabase
      .from('article_gallery')
      .select('image_url, thumbnail_url, media_type')
      .eq('id', id)
      .single()

    if (!item) {
      return NextResponse.json(
        { error: 'Položka nenalezena' },
        { status: 404 }
      )
    }

    // Smazat z databáze
    const { error } = await supabase
      .from('article_gallery')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting gallery item:', error)
      return NextResponse.json(
        { error: 'Nepodařilo se smazat položku' },
        { status: 500 }
      )
    }

    // Pokusit se smazat ze storage pokud je to Supabase URL
    try {
      if (item.image_url.includes('supabase')) {
        const url = new URL(item.image_url)

        if (item.media_type === 'video') {
          // Smazat video z article-videos bucket
          const videoPathMatch = url.pathname.match(/\/storage\/v1\/object\/public\/article-videos\/(.+)/)
          if (videoPathMatch) {
            await supabase.storage
              .from('article-videos')
              .remove([videoPathMatch[1]])
          }
        } else {
          // Smazat obrázek z article-images bucket
          const imagePathMatch = url.pathname.match(/\/storage\/v1\/object\/public\/article-images\/(.+)/)
          if (imagePathMatch) {
            await supabase.storage
              .from('article-images')
              .remove([imagePathMatch[1]])
          }
        }

        // Smazat thumbnail pokud existuje
        if (item.thumbnail_url) {
          const thumbUrl = new URL(item.thumbnail_url)
          const thumbPathMatch = thumbUrl.pathname.match(/\/storage\/v1\/object\/public\/article-images\/(.+)/)
          if (thumbPathMatch) {
            await supabase.storage
              .from('article-images')
              .remove([thumbPathMatch[1]])
          }
        }
      }
    } catch (storageError) {
      // Loggujeme, ale neblokujeme - záznam v DB je smazán
      console.error('Failed to delete from storage:', storageError)
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Delete gallery image error:', err)
    return NextResponse.json(
      { error: 'Nastala chyba při zpracování' },
      { status: 500 }
    )
  }
}
