'use client'

import { useState, useCallback } from 'react'
import useEmblaCarousel from 'embla-carousel-react'
import Image from 'next/image'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

type Page = {
  id: string
  image_url: string
  page_number: number
}

type BrochureCarouselProps = {
  pages: Page[]
  companyName: string
  primaryColor?: string
}

export function BrochureCarousel({ pages, companyName, primaryColor = '#C34751' }: BrochureCarouselProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: false })
  const [currentIndex, setCurrentIndex] = useState(0)

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev()
  }, [emblaApi])

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext()
  }, [emblaApi])

  const scrollTo = useCallback((index: number) => {
    if (emblaApi) emblaApi.scrollTo(index)
  }, [emblaApi])

  const onSelect = useCallback(() => {
    if (!emblaApi) return
    setCurrentIndex(emblaApi.selectedScrollSnap())
  }, [emblaApi])

  // Set up event listener
  if (emblaApi) {
    emblaApi.off('select', onSelect).on('select', onSelect)
  }

  return (
    <div className="relative">
      {/* Carousel */}
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex">
          {pages.map((page) => (
            <div
              key={page.id}
              className="flex-[0_0_100%] min-w-0"
            >
              <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                <div className="relative aspect-[3/4]">
                  <Image
                    src={page.image_url}
                    alt={`${companyName} - strana ${page.page_number}`}
                    fill
                    className="object-contain"
                    priority={page.page_number === 1}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Navigation Buttons */}
      {pages.length > 1 && (
        <>
          <Button
            variant="outline"
            size="icon"
            className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 backdrop-blur-sm shadow-lg hover:bg-white disabled:opacity-50"
            onClick={scrollPrev}
            disabled={currentIndex === 0}
          >
            <ChevronLeft className="h-6 w-6" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 backdrop-blur-sm shadow-lg hover:bg-white disabled:opacity-50"
            onClick={scrollNext}
            disabled={currentIndex === pages.length - 1}
          >
            <ChevronRight className="h-6 w-6" />
          </Button>
        </>
      )}

      {/* Page Indicators */}
      {pages.length > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          {pages.map((page, index) => (
            <button
              key={page.id}
              onClick={() => scrollTo(index)}
              className="w-2 h-2 rounded-full transition-all hover:scale-125"
              style={{
                backgroundColor: index === currentIndex ? primaryColor : '#E5E7EB',
              }}
              aria-label={`Přejít na stranu ${page.page_number}`}
            />
          ))}
        </div>
      )}

      {/* Page Counter */}
      {pages.length > 1 && (
        <div className="text-center mt-4 text-sm text-gray-500">
          Strana {currentIndex + 1} z {pages.length}
        </div>
      )}
    </div>
  )
}
