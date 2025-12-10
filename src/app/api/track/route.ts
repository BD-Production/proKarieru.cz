import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const type = searchParams.get('type') // email, phone, website, profile_view
  const companyId = searchParams.get('company')
  const portalId = searchParams.get('portal')
  const redirect = searchParams.get('redirect')

  // Validace
  if (!type || !redirect) {
    return NextResponse.json(
      { error: 'Missing required parameters' },
      { status: 400 }
    )
  }

  // Ziskat session ID z cookies nebo vygenerovat
  const sessionId = request.cookies.get('session_id')?.value ||
    Math.random().toString(36).substring(2, 15)

  try {
    const supabase = await createClient()

    // Ulozit tracking do databaze
    await supabase.from('click_tracking').insert({
      company_id: companyId || null,
      portal_id: portalId || null,
      action_type: type,
      session_id: sessionId,
      user_agent: request.headers.get('user-agent'),
      referer: request.headers.get('referer'),
    })

    // Redirect na cilovou URL
    const response = NextResponse.redirect(redirect, { status: 302 })

    // Nastavit session cookie pokud neexistuje
    if (!request.cookies.get('session_id')) {
      response.cookies.set('session_id', sessionId, {
        httpOnly: true,
        maxAge: 60 * 60 * 24 * 30, // 30 dni
        sameSite: 'lax',
      })
    }

    return response
  } catch (err) {
    console.error('Tracking error:', err)
    // I pri chybe redirect na cilovou URL
    return NextResponse.redirect(redirect, { status: 302 })
  }
}

// POST pro JS tracking (bez redirectu)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { type, company_id, portal_id } = body

    if (!type) {
      return NextResponse.json(
        { error: 'Missing type parameter' },
        { status: 400 }
      )
    }

    const sessionId = request.cookies.get('session_id')?.value ||
      Math.random().toString(36).substring(2, 15)

    const supabase = await createClient()

    await supabase.from('click_tracking').insert({
      company_id: company_id || null,
      portal_id: portal_id || null,
      action_type: type,
      session_id: sessionId,
      user_agent: request.headers.get('user-agent'),
      referer: request.headers.get('referer'),
    })

    const response = NextResponse.json({ success: true })

    if (!request.cookies.get('session_id')) {
      response.cookies.set('session_id', sessionId, {
        httpOnly: true,
        maxAge: 60 * 60 * 24 * 30,
        sameSite: 'lax',
      })
    }

    return response
  } catch (err) {
    console.error('Tracking error:', err)
    return NextResponse.json(
      { error: 'Tracking failed' },
      { status: 500 }
    )
  }
}
