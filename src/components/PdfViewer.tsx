'use client'

import { useState, useCallback } from 'react'
import { Document, Page, pdfjs } from 'react-pdf'
import useEmblaCarousel from 'embla-carousel-react'
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import 'react-pdf/dist/Page/AnnotationLayer.css'
import 'react-pdf/dist/Page/TextLayer.css'

// Configure PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`

type PdfViewerProps = {
  pdfUrl: string
  title?: string
  primaryColor?: string
}

export function PdfViewer({ pdfUrl, title, primaryColor = '#C34751' }: PdfViewerProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: false })
  const [currentIndex, setCurrentIndex] = useState(0)
  const [numPages, setNumPages] = useState<number>(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [containerWidth, setContainerWidth] = useState<number>(0)

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages)
    setLoading(false)
  }

  const onDocumentLoadError = () => {
    setError('Nepodařilo se načíst PDF soubor')
    setLoading(false)
  }

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

  // Calculate container width for responsive PDF rendering
  const containerRef = useCallback((node: HTMLDivElement | null) => {
    if (node) {
      const resizeObserver = new ResizeObserver((entries) => {
        for (const entry of entries) {
          setContainerWidth(entry.contentRect.width)
        }
      })
      resizeObserver.observe(node)
      setContainerWidth(node.clientWidth)
    }
  }, [])

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px] bg-gray-50 rounded-lg">
        <p className="text-red-600">{error}</p>
      </div>
    )
  }

  return (
    <div className="relative" ref={containerRef}>
      {loading && (
        <div className="flex items-center justify-center min-h-[400px] bg-gray-50 rounded-lg">
          <div className="flex items-center gap-2 text-gray-500">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span>Načítám PDF...</span>
          </div>
        </div>
      )}

      <Document
        file={pdfUrl}
        onLoadSuccess={onDocumentLoadSuccess}
        onLoadError={onDocumentLoadError}
        loading={null}
        className={loading ? 'hidden' : ''}
      >
        {/* Carousel */}
        <div className="overflow-hidden" ref={emblaRef}>
          <div className="flex">
            {Array.from({ length: numPages }, (_, index) => (
              <div
                key={index}
                className="flex-[0_0_100%] min-w-0"
              >
                <div className="bg-white rounded-lg shadow-sm overflow-hidden flex justify-center">
                  <Page
                    pageNumber={index + 1}
                    width={containerWidth > 0 ? Math.min(containerWidth - 32, 800) : undefined}
                    renderTextLayer={false}
                    renderAnnotationLayer={false}
                    loading={
                      <div className="flex items-center justify-center min-h-[400px]">
                        <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
                      </div>
                    }
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Navigation Buttons */}
        {numPages > 1 && !loading && (
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
              disabled={currentIndex === numPages - 1}
            >
              <ChevronRight className="h-6 w-6" />
            </Button>
          </>
        )}
      </Document>

      {/* Page Indicators */}
      {numPages > 1 && !loading && (
        <div className="flex justify-center gap-2 mt-6 flex-wrap">
          {Array.from({ length: numPages }, (_, index) => (
            <button
              key={index}
              onClick={() => scrollTo(index)}
              className="w-2 h-2 rounded-full transition-all hover:scale-125"
              style={{
                backgroundColor: index === currentIndex ? primaryColor : '#E5E7EB',
              }}
              aria-label={`Přejít na stranu ${index + 1}`}
            />
          ))}
        </div>
      )}

      {/* Page Counter */}
      {numPages > 1 && !loading && (
        <div className="text-center mt-4 text-sm text-gray-500">
          Strana {currentIndex + 1} z {numPages}
        </div>
      )}
    </div>
  )
}
