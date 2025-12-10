'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Search, Building2, Loader2 } from 'lucide-react'

interface SearchResult {
  id: string
  name: string
  slug: string
  logo_url: string | null
  subtitle: string | null
  type: 'company'
}

interface SearchBoxProps {
  portalSlug: string
  placeholder?: string
}

export function SearchBox({
  portalSlug,
  placeholder = 'Hledej firmu, pozici nebo obor…',
}: SearchBoxProps) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const router = useRouter()
  const wrapperRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Debounced search
  useEffect(() => {
    if (query.length < 2) {
      setResults([])
      setIsOpen(false)
      return
    }

    const timer = setTimeout(async () => {
      setIsLoading(true)
      try {
        const response = await fetch(`/api/search?q=${encodeURIComponent(query)}&limit=6`)
        const data = await response.json()
        setResults(data.results || [])
        setIsOpen(true)
        setSelectedIndex(-1)
      } catch (err) {
        console.error('Search error:', err)
        setResults([])
      } finally {
        setIsLoading(false)
      }
    }, 300)

    return () => clearTimeout(timer)
  }, [query])

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setIsOpen(false)
    if (query.trim()) {
      router.push(`/katalog?search=${encodeURIComponent(query.trim())}`)
    } else {
      router.push('/katalog')
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen || results.length === 0) return

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setSelectedIndex((prev) => (prev < results.length - 1 ? prev + 1 : prev))
        break
      case 'ArrowUp':
        e.preventDefault()
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1))
        break
      case 'Enter':
        if (selectedIndex >= 0 && results[selectedIndex]) {
          e.preventDefault()
          router.push(`/${results[selectedIndex].slug}`)
          setIsOpen(false)
          setQuery('')
        }
        break
      case 'Escape':
        setIsOpen(false)
        break
    }
  }

  const handleResultClick = (slug: string) => {
    setIsOpen(false)
    setQuery('')
    router.push(`/${slug}`)
  }

  return (
    <div ref={wrapperRef} className="relative">
      <form onSubmit={handleSearch}>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => query.length >= 2 && results.length > 0 && setIsOpen(true)}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              className="pl-10 h-12"
              autoComplete="off"
            />
            {isLoading && (
              <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 animate-spin" />
            )}
          </div>
          <Button type="submit" size="lg" className="h-12 px-6">
            Hledat
          </Button>
        </div>
      </form>

      {/* Dropdown s výsledky */}
      {isOpen && results.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border rounded-lg shadow-lg z-50 overflow-hidden">
          <ul className="py-1">
            {results.map((result, index) => (
              <li key={result.id}>
                <button
                  type="button"
                  onClick={() => handleResultClick(result.slug)}
                  className={`w-full px-4 py-3 flex items-center gap-3 text-left hover:bg-gray-50 transition-colors ${
                    index === selectedIndex ? 'bg-gray-50' : ''
                  }`}
                >
                  <div className="w-10 h-10 rounded-lg bg-gray-100 flex-shrink-0 flex items-center justify-center overflow-hidden">
                    {result.logo_url ? (
                      <Image
                        src={result.logo_url}
                        alt={result.name}
                        width={40}
                        height={40}
                        className="object-contain"
                      />
                    ) : (
                      <Building2 className="w-5 h-5 text-gray-400" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-sm truncate">{result.name}</p>
                    {result.subtitle && (
                      <p className="text-xs text-gray-500 truncate">{result.subtitle}</p>
                    )}
                  </div>
                </button>
              </li>
            ))}
          </ul>
          <div className="border-t px-4 py-2">
            <button
              type="button"
              onClick={() => handleSearch({ preventDefault: () => {} } as React.FormEvent)}
              className="text-sm text-gray-500 hover:text-gray-900 flex items-center gap-1"
            >
              <Search className="w-3 h-3" />
              Zobrazit všechny výsledky pro &quot;{query}&quot;
            </button>
          </div>
        </div>
      )}

      {/* Prázdné výsledky */}
      {isOpen && query.length >= 2 && results.length === 0 && !isLoading && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border rounded-lg shadow-lg z-50 p-4 text-center text-sm text-gray-500">
          Žádné výsledky pro &quot;{query}&quot;
        </div>
      )}
    </div>
  )
}
