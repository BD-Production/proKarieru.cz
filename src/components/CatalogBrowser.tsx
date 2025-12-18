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

interface Spread {
  leftPage: CatalogPage | null
  rightPage: CatalogPage | null
  leftIndex: number | null
  rightIndex: number | null
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
  const [currentSpreadIndex, setCurrentSpreadIndex] = useState(0)
  const [currentMobileIndex, setCurrentMobileIndex] = useState(0)
  const [touchStart, setTouchStart] = useState<number | null>(null)
  const [touchEnd, setTouchEnd] = useState<number | null>(null)
  const [isAnimating, setIsAnimating] = useState(false)
  const [isDesktop, setIsDesktop] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const minSwipeDistance = 50

  // Detekce desktop/mobile
  useEffect(() => {
    const checkDesktop = () => {
      setIsDesktop(window.innerWidth >= 1024)
    }

    checkDesktop()
    window.addEventListener('resize', checkDesktop)
    return () => window.removeEventListener('resize', checkDesktop)
  }, [])

  // Vytvoření spreadů pro desktop zobrazení
  // Obálka (první strana) = sama vpravo
  // Zadní obálka (poslední strana) = sama vlevo
  // Ostatní strany = dvojstránky
  const spreads = useMemo((): Spread[] => {
    if (pages.length === 0) return []
    if (pages.length === 1) {
      return [{ leftPage: null, rightPage: pages[0], leftIndex: null, rightIndex: 0 }]
    }

    const result: Spread[] = []

    // První spread: obálka (strana 0) sama vpravo
    result.push({
      leftPage: null,
      rightPage: pages[0],
      leftIndex: null,
      rightIndex: 0
    })

    // Prostřední strany v párech
    // Strany 1 až n-2 (bez obálky a zadní obálky)
    const middleStart = 1
    const middleEnd = pages.length - 2

    for (let i = middleStart; i <= middleEnd; i += 2) {
      const leftPage = pages[i]
      const rightPage = i + 1 <= middleEnd ? pages[i + 1] : null

      result.push({
        leftPage,
        rightPage,
        leftIndex: i,
        rightIndex: rightPage ? i + 1 : null
      })
    }

    // Poslední spread: zadní obálka sama vlevo
    const lastIndex = pages.length - 1
    // Zkontrolovat, jestli zadní obálka už není v posledním páru
    const lastSpread = result[result.length - 1]
    if (lastSpread.rightIndex !== lastIndex && lastSpread.leftIndex !== lastIndex) {
      result.push({
        leftPage: pages[lastIndex],
        rightPage: null,
        leftIndex: lastIndex,
        rightIndex: null
      })
    }

    return result
  }, [pages])

  // Načíst data katalogu
  useEffect(() => {
    const loadCatalog = async () => {
      setLoading(true)
      try {
        const response = await fetch(`/api/catalog/${portalSlug}/${editionId}`)
        const data = await response.json()

        if (response.ok && data.catalog) {
          const allPages: CatalogPage[] = []

          // Intro stránky
          data.catalog.introPages.forEach((page: { id: string; image_url: string; page_order: number }) => {
            allPages.push({
              id: page.id,
              type: 'intro',
              image_url: page.image_url,
              page_order: allPages.length
            })
          })

          // Stránky firem
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

          // Outro stránky
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

  // Navigace - desktop (spreads)
  const goToSpread = useCallback((index: number) => {
    if (index < 0 || index >= spreads.length || isAnimating) return
    setIsAnimating(true)
    setCurrentSpreadIndex(index)
    setTimeout(() => setIsAnimating(false), 300)
  }, [spreads.length, isAnimating])

  const goNextSpread = useCallback(() => {
    if (currentSpreadIndex < spreads.length - 1) {
      goToSpread(currentSpreadIndex + 1)
    }
  }, [currentSpreadIndex, spreads.length, goToSpread])

  const goPrevSpread = useCallback(() => {
    if (currentSpreadIndex > 0) {
      goToSpread(currentSpreadIndex - 1)
    }
  }, [currentSpreadIndex, goToSpread])

  // Navigace - mobile (single pages)
  const goToMobilePage = useCallback((index: number) => {
    if (index < 0 || index >= pages.length || isAnimating) return
    setIsAnimating(true)
    setCurrentMobileIndex(index)
    setTimeout(() => setIsAnimating(false), 300)
  }, [pages.length, isAnimating])

  const goNextMobile = useCallback(() => {
    if (currentMobileIndex < pages.length - 1) {
      goToMobilePage(currentMobileIndex + 1)
    }
  }, [currentMobileIndex, pages.length, goToMobilePage])

  const goPrevMobile = useCallback(() => {
    if (currentMobileIndex > 0) {
      goToMobilePage(currentMobileIndex - 1)
    }
  }, [currentMobileIndex, goToMobilePage])

  // Unified navigation functions
  const goNext = isDesktop ? goNextSpread : goNextMobile
  const goPrev = isDesktop ? goPrevSpread : goPrevMobile
  const canGoNext = isDesktop
    ? currentSpreadIndex < spreads.length - 1
    : currentMobileIndex < pages.length - 1
  const canGoPrev = isDesktop
    ? currentSpreadIndex > 0
    : currentMobileIndex > 0

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

  // Preload sousedních stránek
  const preloadUrls = useMemo(() => {
    const urls: string[] = []
    if (isDesktop) {
      // Preload spreads
      const prevSpread = spreads[currentSpreadIndex - 1]
      const nextSpread = spreads[currentSpreadIndex + 1]
      if (prevSpread?.leftPage) urls.push(prevSpread.leftPage.image_url)
      if (prevSpread?.rightPage) urls.push(prevSpread.rightPage.image_url)
      if (nextSpread?.leftPage) urls.push(nextSpread.leftPage.image_url)
      if (nextSpread?.rightPage) urls.push(nextSpread.rightPage.image_url)
    } else {
      if (currentMobileIndex > 0) {
        urls.push(pages[currentMobileIndex - 1]?.image_url)
      }
      if (currentMobileIndex < pages.length - 1) {
        urls.push(pages[currentMobileIndex + 1]?.image_url)
      }
    }
    return urls.filter(Boolean)
  }, [isDesktop, currentSpreadIndex, currentMobileIndex, spreads, pages])

  // Aktuální spread / stránka
  const currentSpread = spreads[currentSpreadIndex]
  const currentMobilePage = pages[currentMobileIndex]

  // Info o aktuální stránce pro header
  const currentPageInfo = useMemo(() => {
    if (isDesktop && currentSpread) {
      // Pro desktop - zobrazit info o obou stránkách
      const leftPage = currentSpread.leftPage
      const rightPage = currentSpread.rightPage

      if (leftPage?.type === 'company' && rightPage?.type === 'company') {
        if (leftPage.companyName === rightPage.companyName) {
          return { type: 'company', companyName: leftPage.companyName, companySlug: leftPage.companySlug }
        }
        return { type: 'mixed', companyName: `${leftPage.companyName} / ${rightPage.companyName}` }
      }
      if (leftPage?.type === 'company') {
        return { type: 'company', companyName: leftPage.companyName, companySlug: leftPage.companySlug }
      }
      if (rightPage?.type === 'company') {
        return { type: 'company', companyName: rightPage.companyName, companySlug: rightPage.companySlug }
      }
      if (leftPage?.type === 'intro' || rightPage?.type === 'intro') {
        return { type: 'intro' }
      }
      if (leftPage?.type === 'outro' || rightPage?.type === 'outro') {
        return { type: 'outro' }
      }
    } else if (currentMobilePage) {
      return {
        type: currentMobilePage.type,
        companyName: currentMobilePage.companyName,
        companySlug: currentMobilePage.companySlug
      }
    }
    return { type: 'unknown' }
  }, [isDesktop, currentSpread, currentMobilePage])

  // Progress info
  const progressInfo = useMemo(() => {
    if (isDesktop) {
      const indices = [currentSpread?.leftIndex, currentSpread?.rightIndex].filter((i): i is number => i !== null)
      const minPage = Math.min(...indices) + 1
      const maxPage = Math.max(...indices) + 1
      return {
        current: minPage === maxPage ? `${minPage}` : `${minPage}–${maxPage}`,
        total: pages.length
      }
    }
    return {
      current: `${currentMobileIndex + 1}`,
      total: pages.length
    }
  }, [isDesktop, currentSpread, currentMobileIndex, pages.length])

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

  // Render single page (pro mobile nebo single stránky v spreadu)
  const renderPage = (page: CatalogPage | null, position: 'left' | 'right' | 'single') => {
    if (!page) return null

    return (
      <div
        className={cn(
          "relative",
          position === 'single' && "max-h-full max-w-full",
          position !== 'single' && "h-full"
        )}
      >
        <img
          src={page.image_url}
          alt={`Strana ${page.page_order + 1}`}
          className={cn(
            "h-full w-auto object-contain shadow-2xl transition-opacity duration-300",
            position === 'left' && "rounded-l-sm",
            position === 'right' && "rounded-r-sm",
            position === 'single' && "rounded-sm max-h-[calc(100vh-12rem)]",
            isAnimating && "opacity-0"
          )}
        />

        {/* Click to open company detail */}
        {page.type === 'company' && page.companySlug && (
          <a
            href={`/${page.companySlug}?edition=${editionId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="absolute inset-0"
            title={`Otevřít detail ${page.companyName}`}
          />
        )}
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
            {currentPageInfo.type === 'company' && currentPageInfo.companyName && (
              <p className="text-sm text-white/80">{currentPageInfo.companyName}</p>
            )}
          </div>

          <div className="flex items-center gap-4">
            {/* Link na firmu */}
            {currentPageInfo.type === 'company' && currentPageInfo.companySlug && (
              <a
                href={`/${currentPageInfo.companySlug}?edition=${editionId}`}
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
        {isDesktop && currentSpread ? (
          // Desktop: Facing pages
          <div
            className={cn(
              "flex items-center justify-center h-full max-h-[calc(100vh-12rem)]",
              isAnimating && "opacity-0",
              "transition-opacity duration-300"
            )}
          >
            {/* Obálka (první strana) - sama vpravo */}
            {currentSpread.leftPage === null && currentSpread.rightPage !== null && (
              <div className="flex h-full">
                <div className="w-[calc((100vh-12rem)*0.7)] bg-gray-900/50" /> {/* Placeholder pro levou stranu */}
                {renderPage(currentSpread.rightPage, 'right')}
              </div>
            )}

            {/* Zadní obálka (poslední strana) - sama vlevo */}
            {currentSpread.leftPage !== null && currentSpread.rightPage === null && (
              <div className="flex h-full">
                {renderPage(currentSpread.leftPage, 'left')}
                <div className="w-[calc((100vh-12rem)*0.7)] bg-gray-900/50" /> {/* Placeholder pro pravou stranu */}
              </div>
            )}

            {/* Normální dvojstránka */}
            {currentSpread.leftPage !== null && currentSpread.rightPage !== null && (
              <div className="flex h-full">
                {renderPage(currentSpread.leftPage, 'left')}
                {renderPage(currentSpread.rightPage, 'right')}
              </div>
            )}
          </div>
        ) : (
          // Mobile: Single page
          <div className="relative max-h-full max-w-full">
            {renderPage(currentMobilePage, 'single')}
          </div>
        )}
      </div>

      {/* Navigation buttons - desktop */}
      <div className="hidden lg:block">
        <Button
          variant="ghost"
          size="icon"
          onClick={goPrev}
          disabled={!canGoPrev}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/20 disabled:opacity-30 w-14 h-14"
        >
          <ChevronLeft className="h-10 w-10" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={goNext}
          disabled={!canGoNext}
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
                width: isDesktop
                  ? `${((currentSpreadIndex + 1) / spreads.length) * 100}%`
                  : `${((currentMobileIndex + 1) / pages.length) * 100}%`,
                backgroundColor: primaryColor
              }}
            />
          </div>

          <div className="flex items-center justify-between text-white">
            <div className="text-sm text-white/80">
              {currentPageInfo.type === 'intro' && 'Úvod'}
              {currentPageInfo.type === 'outro' && 'Závěr'}
              {currentPageInfo.type === 'company' && currentPageInfo.companyName}
            </div>

            <div className="text-sm">
              {isDesktop ? (
                <>Strana <span className="font-semibold">{progressInfo.current}</span> z <span className="font-semibold">{progressInfo.total}</span></>
              ) : (
                <>Strana <span className="font-semibold">{currentMobileIndex + 1}</span> z <span className="font-semibold">{pages.length}</span></>
              )}
            </div>

            {/* Mobile navigation buttons */}
            <div className="flex gap-2 lg:hidden">
              <Button
                variant="ghost"
                size="icon"
                onClick={goPrev}
                disabled={!canGoPrev}
                className="text-white hover:bg-white/20 disabled:opacity-30"
              >
                <ChevronLeft className="h-6 w-6" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={goNext}
                disabled={!canGoNext}
                className="text-white hover:bg-white/20 disabled:opacity-30"
              >
                <ChevronRight className="h-6 w-6" />
              </Button>
            </div>
          </div>

          {/* Page type indicators */}
          <div className="flex gap-1 mt-3 justify-center overflow-x-auto pb-2">
            {isDesktop ? (
              // Desktop: indicators pro spreads
              spreads.map((spread, index) => (
                <button
                  key={index}
                  onClick={() => goToSpread(index)}
                  className={cn(
                    "w-2 h-2 rounded-full transition-all flex-shrink-0",
                    index === currentSpreadIndex
                      ? "w-4"
                      : "opacity-50 hover:opacity-75"
                  )}
                  style={{
                    backgroundColor: index === currentSpreadIndex ? primaryColor : '#fff'
                  }}
                  title={
                    spread.leftPage?.type === 'company' ? spread.leftPage.companyName :
                    spread.rightPage?.type === 'company' ? spread.rightPage.companyName :
                    spread.leftPage?.type === 'intro' || spread.rightPage?.type === 'intro' ? 'Úvod' :
                    spread.leftPage?.type === 'outro' || spread.rightPage?.type === 'outro' ? 'Závěr' :
                    `Strana ${index + 1}`
                  }
                />
              ))
            ) : (
              // Mobile: indicators pro jednotlivé stránky
              pages.map((page, index) => (
                <button
                  key={page.id}
                  onClick={() => goToMobilePage(index)}
                  className={cn(
                    "w-2 h-2 rounded-full transition-all flex-shrink-0",
                    index === currentMobileIndex
                      ? "w-4"
                      : "opacity-50 hover:opacity-75"
                  )}
                  style={{
                    backgroundColor: index === currentMobileIndex ? primaryColor : '#fff'
                  }}
                  title={
                    page.type === 'intro' ? `Úvod ${index + 1}` :
                    page.type === 'outro' ? `Závěr` :
                    page.companyName || `Firma ${index + 1}`
                  }
                />
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
