'use client'

import Link from 'next/link'

interface PortalHeaderProps {
  portalName: string
  primaryColor: string
  hasArticles?: boolean
  currentPage?: 'firmy' | 'clanky' | 'profirmy' | null
}

export function PortalHeader({
  portalName,
  primaryColor,
  hasArticles = true,
  currentPage = null
}: PortalHeaderProps) {
  const linkClass = (page: string | null) =>
    page === currentPage
      ? 'text-sm font-medium'
      : 'text-gray-600 hover:text-gray-900 text-sm font-medium'

  return (
    <header className="border-b sticky top-0 bg-white/95 backdrop-blur-sm z-50">
      <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-xl font-bold" style={{ color: primaryColor }}>
            {portalName}
          </span>
        </Link>
        <nav className="hidden md:flex items-center gap-6">
          <Link
            href="/firmy"
            className={linkClass('firmy')}
            style={currentPage === 'firmy' ? { color: primaryColor } : undefined}
          >
            Firmy
          </Link>
          {hasArticles && (
            <Link
              href="/clanky"
              className={linkClass('clanky')}
              style={currentPage === 'clanky' ? { color: primaryColor } : undefined}
            >
              Články
            </Link>
          )}
          <Link
            href="/profirmy"
            className={linkClass('profirmy')}
            style={currentPage === 'profirmy' ? { color: primaryColor } : undefined}
          >
            Pro firmy
          </Link>
        </nav>
      </div>
    </header>
  )
}
