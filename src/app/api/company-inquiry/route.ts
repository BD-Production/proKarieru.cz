import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { sendCompanyInquiryNotification } from '@/lib/email'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const {
      company_name,
      ico,
      contact_name,
      email,
      phone,
      message,
      interest_type,
      gdpr_consent,
    } = body

    // Validace
    if (!company_name || !contact_name || !email) {
      return NextResponse.json(
        { error: 'Název firmy, kontaktní osoba a email jsou povinné' },
        { status: 400 }
      )
    }

    if (!gdpr_consent) {
      return NextResponse.json(
        { error: 'Musíte souhlasit se zpracováním osobních údajů' },
        { status: 400 }
      )
    }

    // Email validace
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Neplatný formát emailu' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Ulozit do databaze
    const { data, error } = await supabase
      .from('company_inquiries')
      .insert({
        company_name,
        ico: ico || null,
        contact_name,
        email,
        phone: phone || null,
        message: message || null,
        interest_type: interest_type || [],
        gdpr_consent,
        status: 'new',
      })
      .select()
      .single()

    if (error) {
      console.error('Error saving company inquiry:', error)
      return NextResponse.json(
        { error: 'Nepodařilo se uložit poptávku' },
        { status: 500 }
      )
    }

    // Odeslat email notifikaci adminovi
    try {
      await sendCompanyInquiryNotification({
        companyName: company_name,
        contactName: contact_name,
        email,
        phone,
        message,
      })
    } catch (emailError) {
      // Loggujeme, ale neblokujeme - data jsou ulozena
      console.error('Failed to send email notification:', emailError)
    }

    return NextResponse.json({ success: true, id: data.id })
  } catch (err) {
    console.error('Company inquiry error:', err)
    return NextResponse.json(
      { error: 'Nastala chyba při zpracování' },
      { status: 500 }
    )
  }
}
