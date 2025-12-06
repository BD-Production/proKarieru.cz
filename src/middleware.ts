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

  // Detekce prostředí na základě domény
  const isDev = hostname.includes('-dev.fun')
  const baseDomain = isDev ? '-dev.fun' : '.cz'
  const mainDomain = isDev ? 'prokarieru-dev.fun' : 'prokarieru.cz'

  // prokarieru.cz nebo prokarieru-dev.fun → landing page
  if (hostname === mainDomain || hostname === `www.${mainDomain}`) {
    return NextResponse.rewrite(new URL('/landing', request.url), { headers: response.headers })
  }

  // admin.prokarieru.cz nebo admin.prokarieru-dev.fun → admin sekce
  if (hostname === `admin.${mainDomain}`) {
    return response
  }

  // Extrahuj portál a subdoménu
  // Formát: [subdomena.]portal.cz nebo [subdomena.]portal-dev.fun
  const parts = hostname.replace('www.', '').split('.')

  if (parts.length >= 2) {
    const tld = parts.pop() // 'cz' nebo 'fun'
    let portalSlug = parts.pop() // 'prostavare' nebo 'prostavare-dev'
    const subdomain = parts.pop() // 'katalog', 'veletrh', nebo undefined

    // Odstraň '-dev' suffix z portal slug pro jednotné zpracování
    if (isDev && portalSlug) {
      portalSlug = portalSlug.replace('-dev', '')
    }

    // Přidej environment info do headers
    response.headers.set('x-environment', isDev ? 'development' : 'production')
    response.headers.set('x-portal-slug', portalSlug || '')
    response.headers.set('x-subdomain', subdomain || '')

    // katalog.prostavare.cz nebo katalog.prostavare-dev.fun → /catalog
    if (subdomain === 'katalog') {
      return NextResponse.rewrite(
        new URL(`/catalog${pathname}`, request.url),
        { headers: response.headers }
      )
    }

    // veletrh.prostavare.cz nebo veletrh.prostavare-dev.fun → /fair
    if (subdomain === 'veletrh') {
      return NextResponse.rewrite(
        new URL(`/fair${pathname}`, request.url),
        { headers: response.headers }
      )
    }

    // prostavare.cz nebo prostavare-dev.fun → /portal (landing page s rozcestníkem)
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
