import Link from 'next/link'
import { Instagram } from 'lucide-react'

interface PortalFooterProps {
  hasArticles?: boolean
}

export function PortalFooter({ hasArticles = true }: PortalFooterProps) {
  return (
    <footer className="border-t py-8 px-4 mt-auto">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-gray-500 text-sm">
            &copy; {new Date().getFullYear()} Sparkline Group s.r.o.
          </p>
          <nav className="flex items-center gap-6 text-sm">
            <Link href="/firmy" className="text-gray-500 hover:text-gray-900">
              Firmy
            </Link>
            {hasArticles && (
              <Link href="/clanky" className="text-gray-500 hover:text-gray-900">
                Články
              </Link>
            )}
            <Link href="/profirmy" className="text-gray-500 hover:text-gray-900">
              Pro firmy
            </Link>
            <Link
              href="https://www.instagram.com/prostavare.cz/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-500 hover:text-gray-900"
            >
              <Instagram className="h-5 w-5" />
            </Link>
          </nav>
        </div>
      </div>
    </footer>
  )
}
