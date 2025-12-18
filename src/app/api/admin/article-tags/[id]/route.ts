import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// PUT /api/admin/article-tags/[id] - Aktualizovat tag
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
    const { portal_id, name, slug } = body

    // Validace
    if (!portal_id || !name || !slug) {
      return NextResponse.json(
        { error: 'Portál, název a slug jsou povinné' },
        { status: 400 }
      )
    }

    // Kontrola unikátnosti slugu (pokud se změnil)
    const { data: existingTag } = await supabase
      .from('article_tags')
      .select('id')
      .eq('portal_id', portal_id)
      .eq('slug', slug)
      .neq('id', id)
      .single()

    if (existingTag) {
      return NextResponse.json(
        { error: 'Tag s tímto slugem již existuje' },
        { status: 400 }
      )
    }

    const { data: tag, error } = await supabase
      .from('article_tags')
      .update({
        portal_id,
        name,
        slug
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating tag:', error)
      return NextResponse.json(
        { error: 'Nepodařilo se aktualizovat tag' },
        { status: 500 }
      )
    }

    return NextResponse.json({ tag })
  } catch (err) {
    console.error('Update tag error:', err)
    return NextResponse.json(
      { error: 'Nastala chyba při zpracování' },
      { status: 500 }
    )
  }
}

// DELETE /api/admin/article-tags/[id] - Smazat tag
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

    // Smazat tag (kaskádové smazání relací)
    const { error } = await supabase
      .from('article_tags')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting tag:', error)
      return NextResponse.json(
        { error: 'Nepodařilo se smazat tag' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Delete tag error:', err)
    return NextResponse.json(
      { error: 'Nastala chyba při zpracování' },
      { status: 500 }
    )
  }
}
