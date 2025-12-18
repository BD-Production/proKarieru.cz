import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

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

    // Získat URL obrázku pro případné smazání ze storage
    const { data: image } = await supabase
      .from('article_gallery')
      .select('image_url')
      .eq('id', id)
      .single()

    if (!image) {
      return NextResponse.json(
        { error: 'Obrázek nenalezen' },
        { status: 404 }
      )
    }

    // Smazat z databáze
    const { error } = await supabase
      .from('article_gallery')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting gallery image:', error)
      return NextResponse.json(
        { error: 'Nepodařilo se smazat obrázek' },
        { status: 500 }
      )
    }

    // Pokusit se smazat ze storage pokud je to Supabase URL
    try {
      if (image.image_url.includes('supabase')) {
        const url = new URL(image.image_url)
        const pathMatch = url.pathname.match(/\/storage\/v1\/object\/public\/article-images\/(.+)/)
        if (pathMatch) {
          await supabase.storage
            .from('article-images')
            .remove([pathMatch[1]])
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
