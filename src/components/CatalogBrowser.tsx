'use client'

import { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import { X, ChevronLeft, ChevronRight, ExternalLink, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface CatalogPage {
  id: string
  type: 'intro' | 'outro' | 'company'
  image_url: string
  page_order: number
  companySlug?: string
  companyName?: string
}

interface CatalogBrowserProps {
  portalSlug: string
  editionId: string
  editionName: string
  primaryColor?: string
  onClose: () => void
}

export function CatalogBrowser({
  portalSlug,
  editionId,
  editionName,
  primaryColor = '#C34751',
  onClose
}: CatalogBrowserProps) {
  const [loading, setLoading] = useState(true)
  const [pages, setPages] = useState<CatalogPage[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [touchStart, setTouchStart] = useState<number | null>(null)
  const [touchEnd, setTouchEnd] = useState<number | null>(null)
  const [isAnimating, setIsAnimating] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  // Minimum swipe distance
  const minSwipeDistance = 50

  // Nacist data katalogu
  useEffect(() => {
    const loadCatalog = async () => {
      setLoading(true)
      try {
        const response = await fetch(`/api/catalog/${portalSlug}/${editionId}`)
        const data = await response.json()

        if (response.ok && data.catalog) {
          // Sestavit pole vsech stranek
          const allPages: CatalogPage[] = []

          // Intro stranky
          data.catalog.introPages.forEach((page: { id: string; image_url: string; page_order: number }) => {
            allPages.push({
              id: page.id,
              type: 'intro',
              image_url: page.image_url,
              page_order: allPages.length
            })
          })

          // Stranky firem
          data.catalog.companies.forEach((company: {
            company: { slug: string; name: string }
            pages: Array<{ id: string; image_url: string; page_number: number }>
          }) => {
            company.pages.forEach((page: { id: string; image_url: string; page_number: number }) => {
              allPages.push({
                id: page.id,
                type: 'company',
                image_url: page.image_url,
                page_order: allPages.length,
                companySlug: company.company.slug,
                companyName: company.company.name
              })
            })
          })

          // Outro stranky
          data.catalog.outroPages.forEach((page: { id: string; image_url: string; page_order: number }) => {
            allPages.push({
              id: page.id,
              type: 'outro',
              image_url: page.image_url,
              page_order: allPages.length
            })
          })

          setPages(allPages)
        }
      } catch (error) {
        console.error('Error loading catalog:', error)
      } finally {
        setLoading(false)
      }
    }

    loadCatalog()
  }, [portalSlug, editionId])

  // Navigace
  const goToPage = useCallback((index: number) => {
    if (index < 0 || index >= pages.length || isAnimating) return
    setIsAnimating(true)
    setCurrentIndex(index)
    setTimeout(() => setIsAnimating(false), 300)
  }, [pages.length, isAnimating])

  const goNext = useCallback(() => {
    if (currentIndex < pages.length - 1) {
      goToPage(currentIndex + 1)
    }
  }, [currentIndex, pages.length, goToPage])

  const goPrev = useCallback(() => {
    if (currentIndex > 0) {
      goToPage(currentIndex - 1)
    }
  }, [currentIndex, goToPage])

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === ' ') {
        e.preventDefault()
        goNext()
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault()
        goPrev()
      } else if (e.key === 'Escape') {
        e.preventDefault()
        onClose()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [goNext, goPrev, onClose])

  // Touch handlers for swipe
  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null)
    setTouchStart(e.targetTouches[0].clientX)
  }

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX)
  }

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return

    const distance = touchStart - touchEnd
    const isLeftSwipe = distance > minSwipeDistance
    const isRightSwipe = distance < -minSwipeDistance

    if (isLeftSwipe) {
      goNext()
    } else if (isRightSwipe) {
      goPrev()
    }

    setTouchStart(null)
    setTouchEnd(null)
  }

  // Preload sousednich stranek
  const preloadUrls = useMemo(() => {
    const urls: string[] = []
    if (currentIndex > 0) {
      urls.push(pages[currentIndex - 1]?.image_url)
    }
    if (currentIndex < pages.length - 1) {
      urls.push(pages[currentIndex + 1]?.image_url)
    }
    return urls.filter(Boolean)
  }, [currentIndex, pages])

  // Aktualni stranka
  const currentPage = pages[currentIndex]

  // Prevent body scroll when browser is open
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = ''
    }
  }, [])

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 bg-black flex items-center justify-center">
        <div className="text-center text-white">
          <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4" />
          <p>Načítám katalog...</p>
        </div>
      </div>
    )
  }

  if (pages.length === 0) {
    return (
      <div className="fixed inset-0 z-50 bg-black flex items-center justify-center">
        <div className="text-center text-white">
          <p className="mb-4">Katalog je prázdný</p>
          <Button onClick={onClose} variant="outline">
            Zavřít
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-50 bg-black flex flex-col"
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      {/* Preload images */}
      <div className="hidden">
        {preloadUrls.map(url => (
          <img key={url} src={url} alt="" />
        ))}
      </div>

      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-10 bg-gradient-to-b from-black/70 to-transparent p-4">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="text-white">
            <h2 className="font-semibold">{editionName}</h2>
            {currentPage?.type === 'company' && currentPage.companyName && (
              <p className="text-sm text-white/80">{currentPage.companyName}</p>
            )}
          </div>

          <div className="flex items-center gap-4">
            {/* Link na firmu */}
            {currentPage?.type === 'company' && currentPage.companySlug && (
              <a
                href={`/${currentPage.companySlug}?edition=${editionId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-white hover:text-white/80 flex items-center gap-2 text-sm"
              >
                <ExternalLink className="h-4 w-4" />
                <span className="hidden sm:inline">Detail firmy</span>
              </a>
            )}

            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="text-white hover:bg-white/20"
            >
              <X className="h-6 w-6" />
            </Button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex items-center justify-center p-4 pt-16 pb-20 overflow-hidden">
        <div className="relative max-h-full max-w-full">
          <img
            src={currentPage?.image_url}
            alt={`Strana ${currentIndex + 1}`}
            className={cn(
              "max-h-[calc(100vh-12rem)] w-auto object-contain rounded-sm shadow-2xl transition-opacity duration-300",
              isAnimating && "opacity-0"
            )}
          />

          {/* Click to open company detail */}
          {currentPage?.type === 'company' && currentPage.companySlug && (
            <a
              href={`/${currentPage.companySlug}?edition=${editionId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="absolute inset-0"
              title={`Otevřít detail ${currentPage.companyName}`}
            />
          )}
        </div>
      </div>

      {/* Navigation buttons - desktop */}
      <div className="hidden md:block">
        <Button
          variant="ghost"
          size="icon"
          onClick={goPrev}
          disabled={currentIndex === 0}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/20 disabled:opacity-30 w-14 h-14"
        >
          <ChevronLeft className="h-10 w-10" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={goNext}
          disabled={currentIndex === pages.length - 1}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/20 disabled:opacity-30 w-14 h-14"
        >
          <ChevronRight className="h-10 w-10" />
        </Button>
      </div>

      {/* Footer with progress */}
      <div className="absolute bottom-0 left-0 right-0 z-10 bg-gradient-to-t from-black/70 to-transparent p-4">
        <div className="max-w-7xl mx-auto">
          {/* Progress bar */}
          <div className="h-1 bg-white/30 rounded-full overflow-hidden mb-3">
            <div
              className="h-full transition-all duration-300 rounded-full"
              style={{
                width: `${((currentIndex + 1) / pages.length) * 100}%`,
                backgroundColor: primaryColor
              }}
            />
          </div>

          <div className="flex items-center justify-between text-white">
            <div className="text-sm text-white/80">
              {currentPage?.type === 'intro' && 'Úvod'}
              {currentPage?.type === 'outro' && 'Závěr'}
              {currentPage?.type === 'company' && currentPage.companyName}
            </div>

            <div className="text-sm">
              Strana <span className="font-semibold">{currentIndex + 1}</span> z <span className="font-semibold">{pages.length}</span>
            </div>

            {/* Mobile navigation buttons */}
            <div className="flex gap-2 md:hidden">
              <Button
                variant="ghost"
                size="icon"
                onClick={goPrev}
                disabled={currentIndex === 0}
                className="text-white hover:bg-white/20 disabled:opacity-30"
              >
                <ChevronLeft className="h-6 w-6" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={goNext}
                disabled={currentIndex === pages.length - 1}
                className="text-white hover:bg-white/20 disabled:opacity-30"
              >
                <ChevronRight className="h-6 w-6" />
              </Button>
            </div>
          </div>

          {/* Page type indicators */}
          <div className="flex gap-1 mt-3 justify-center overflow-x-auto pb-2">
            {pages.map((page, index) => (
              <button
                key={page.id}
                onClick={() => goToPage(index)}
                className={cn(
                  "w-2 h-2 rounded-full transition-all flex-shrink-0",
                  index === currentIndex
                    ? "w-4"
                    : "opacity-50 hover:opacity-75"
                )}
                style={{
                  backgroundColor: index === currentIndex ? primaryColor : '#fff'
                }}
                title={
                  page.type === 'intro' ? `Úvod ${index + 1}` :
                  page.type === 'outro' ? `Závěr` :
                  page.companyName || `Firma ${index + 1}`
                }
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
