import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const { company_id, portal_id, name, email, phone, message, gdpr_consent } = body

    // Validace
    if (!name || !email) {
      return NextResponse.json(
        { error: 'Jmeno a email jsou povinne' },
        { status: 400 }
      )
    }

    if (!gdpr_consent) {
      return NextResponse.json(
        { error: 'Musite souhlasit se zpracovanim osobnich udaju' },
        { status: 400 }
      )
    }

    // Email validace
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Neplatny format emailu' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Ulozit do databaze
    const { data, error } = await supabase.from('contact_leads').insert({
      company_id: company_id || null,
      portal_id: portal_id || null,
      name,
      email,
      phone: phone || null,
      message: message || null,
      gdpr_consent,
      source: 'contact_form',
      status: 'new',
    }).select().single()

    if (error) {
      console.error('Error saving contact lead:', error)
      return NextResponse.json(
        { error: 'Nepodarilo se ulozit formular' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, id: data.id })
  } catch (err) {
    console.error('Contact form error:', err)
    return NextResponse.json(
      { error: 'Nastala chyba pri zpracovani' },
      { status: 500 }
    )
  }
}
