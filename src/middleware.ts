import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export async function middleware(request: NextRequest) {
  const hostname = request.headers.get('host') || ''
  const pathname = request.nextUrl.pathname

  // Ignoruj statické soubory a API
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.includes('.')
  ) {
    return NextResponse.next()
  }

  // Vytvoř response pro případné úpravy
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  // Supabase session refresh
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          response = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  await supabase.auth.getUser()

  // Localhost development routing
  if (hostname.includes('localhost') || hostname.includes('127.0.0.1')) {
    // Pro lokální vývoj necháme vše projít
    return response
  }

  // prokarieru.cz → landing page
  if (hostname === 'prokarieru.cz' || hostname === 'www.prokarieru.cz') {
    return NextResponse.rewrite(new URL('/landing', request.url), { headers: response.headers })
  }

  // admin.prokarieru.cz → admin sekce
  if (hostname === 'admin.prokarieru.cz') {
    return response
  }

  // Extrahuj portál a subdoménu
  // Formát: [subdomena.]portal.cz
  const parts = hostname.replace('www.', '').split('.')

  if (parts.length >= 2) {
    const tld = parts.pop() // 'cz'
    const portalSlug = parts.pop() // 'prostavare'
    const subdomain = parts.pop() // 'katalog', 'veletrh', nebo undefined

    // Ulož portal slug do headers pro další použití
    response.headers.set('x-portal-slug', portalSlug || '')
    response.headers.set('x-subdomain', subdomain || '')

    // katalog.prostavare.cz → /catalog
    if (subdomain === 'katalog') {
      return NextResponse.rewrite(
        new URL(`/catalog${pathname}`, request.url),
        { headers: response.headers }
      )
    }

    // veletrh.prostavare.cz → /fair
    if (subdomain === 'veletrh') {
      return NextResponse.rewrite(
        new URL(`/fair${pathname}`, request.url),
        { headers: response.headers }
      )
    }

    // prostavare.cz → /portal (landing page s rozcestníkem)
    if (!subdomain && portalSlug !== 'prokarieru') {
      return NextResponse.rewrite(
        new URL(`/portal${pathname}`, request.url),
        { headers: response.headers }
      )
    }
  }

  return response
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
