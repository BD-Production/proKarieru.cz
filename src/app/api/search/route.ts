import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const query = searchParams.get('q')?.trim() || ''
  const limit = Math.min(parseInt(searchParams.get('limit') || '8'), 20)

  if (!query || query.length < 2) {
    return NextResponse.json({ results: [] })
  }

  try {
    const supabase = await createClient()

    // Vyhledávání firem podle názvu, sektorů, pozic a příležitostí
    const { data: companies, error } = await supabase
      .from('companies')
      .select('id, name, slug, logo_url, location, sectors, opportunities, positions')
      .eq('is_active', true)
      .or(`name.ilike.%${query}%,sectors.cs.{${query}},positions.cs.{${query}},opportunities.cs.{${query}}`)
      .order('name')
      .limit(limit)

    if (error) {
      console.error('Search error:', error)
      return NextResponse.json({ results: [] })
    }

    // Formátování výsledků
    const results = companies?.map((company) => ({
      id: company.id,
      name: company.name,
      slug: company.slug,
      logo_url: company.logo_url,
      subtitle: [
        ...(company.sectors?.slice(0, 2) || []),
        ...(company.location?.slice(0, 1) || []),
      ].join(' · ') || null,
      type: 'company' as const,
    })) || []

    return NextResponse.json({ results })
  } catch (err) {
    console.error('Search error:', err)
    return NextResponse.json({ results: [] })
  }
}
