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

  // Supabase session refresh - pouze pokud máme credentials
  if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    try {
      const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
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
    } catch (error) {
      console.error('Supabase auth error in middleware:', error)
    }
  }

  // Localhost a Vercel preview URL routing
  if (hostname.includes('localhost') || hostname.includes('127.0.0.1') || hostname.includes('.vercel.app')) {
    // Pro lokální vývoj a Vercel preview necháme vše projít
    return response
  }

  // Detekce prostředí na základě domény
  const isDev = hostname.includes('-dev.fun')
  const mainDomain = isDev ? 'prokarieru-dev.fun' : 'prokarieru.cz'

  // prokarieru.cz nebo prokarieru-dev.fun → landing page
  // Admin je dostupný na /admin path (prokarieru-dev.fun/admin)
  if (hostname === mainDomain || hostname === `www.${mainDomain}`) {
    // Pokud jde o admin cestu, nechej projít bez rewrite
    if (pathname.startsWith('/admin') || pathname.startsWith('/login')) {
      return response
    }
    // Jinak rewrite na landing page
    return NextResponse.rewrite(new URL('/landing', request.url), { headers: response.headers })
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

    // Přidej environment info do headers (jen pokud máme validní data)
    if (portalSlug) {
      response.headers.set('x-environment', isDev ? 'development' : 'production')
      response.headers.set('x-portal-slug', portalSlug)
      response.headers.set('x-subdomain', subdomain || '')

      // katalog.prostavare.cz nebo katalog.prostavare-dev.fun → redirect na /katalog
      if (subdomain === 'katalog') {
        // Construct the main portal domain
        const portalDomain = isDev ? `${portalSlug}-dev.fun` : `${portalSlug}.cz`
        const redirectUrl = `https://${portalDomain}/katalog${pathname === '/' ? '' : pathname}`
        return NextResponse.redirect(redirectUrl, 301)
      }

      // veletrh.prostavare.cz nebo veletrh.prostavare-dev.fun → /fair
      if (subdomain === 'veletrh') {
        return NextResponse.rewrite(
          new URL(`/fair${pathname}`, request.url),
          { headers: response.headers }
        )
      }

      // prostavare.cz nebo prostavare-dev.fun (hlavní portálová doména)
      if (!subdomain && portalSlug !== 'prokarieru') {
        // Admin a login routes - passthrough
        if (pathname.startsWith('/admin') || pathname.startsWith('/login')) {
          return response
        }

        // Root path → portal (nová homepage)
        if (pathname === '/') {
          return NextResponse.rewrite(
            new URL('/portal', request.url),
            { headers: response.headers }
          )
        }

        // /firmy a /katalog cesty projdou přímo
        if (pathname === '/firmy' || pathname.startsWith('/firmy/') ||
            pathname === '/katalog' || pathname.startsWith('/katalog/')) {
          return response
        }

        // Ostatní cesty (včetně /{company-slug}) projdou přímo
        return response
      }
    }
  }

  return response
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
