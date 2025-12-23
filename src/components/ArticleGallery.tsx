'use client'

import { useState, useEffect, useCallback } from 'react'
import { X, ChevronLeft, ChevronRight, Play } from 'lucide-react'
import { VideoPlayer } from './VideoPlayer'
import type { ArticleGalleryImage } from '@/types/database'

interface ArticleGalleryProps {
  images: ArticleGalleryImage[]
}

function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

export function ArticleGallery({ images }: ArticleGalleryProps) {
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [currentIndex, setCurrentIndex] = useState(0)

  const sortedMedia = [...images].sort((a, b) => a.sort_order - b.sort_order)
  const currentItem = sortedMedia[currentIndex]

  const openLightbox = (index: number) => {
    setCurrentIndex(index)
    setLightboxOpen(true)
  }

  const closeLightbox = () => {
    setLightboxOpen(false)
  }

  const goToPrevious = useCallback(() => {
    setCurrentIndex((prev) => (prev === 0 ? sortedMedia.length - 1 : prev - 1))
  }, [sortedMedia.length])

  const goToNext = useCallback(() => {
    setCurrentIndex((prev) => (prev === sortedMedia.length - 1 ? 0 : prev + 1))
  }, [sortedMedia.length])

  // Keyboard navigation
  useEffect(() => {
    if (!lightboxOpen) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeLightbox()
      } else if (e.key === 'ArrowLeft') {
        goToPrevious()
      } else if (e.key === 'ArrowRight') {
        goToNext()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    // Prevent body scroll when lightbox is open
    document.body.style.overflow = 'hidden'

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = ''
    }
  }, [lightboxOpen, goToPrevious, goToNext])

  // Touch swipe handling
  const [touchStart, setTouchStart] = useState<number | null>(null)

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.touches[0].clientX)
  }

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStart === null) return

    const touchEnd = e.changedTouches[0].clientX
    const diff = touchStart - touchEnd

    if (Math.abs(diff) > 50) {
      if (diff > 0) {
        goToNext()
      } else {
        goToPrevious()
      }
    }

    setTouchStart(null)
  }

  if (sortedMedia.length === 0) return null

  return (
    <>
      {/* Gallery Grid */}
      <div className="mt-10">
        <h2 className="text-2xl font-bold mb-4">Galerie</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {sortedMedia.map((media, index) => (
            <button
              key={media.id}
              onClick={() => openLightbox(index)}
              className="aspect-square rounded-lg overflow-hidden bg-gray-100 hover:opacity-90 transition-opacity focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 relative"
            >
              {media.media_type === 'video' ? (
                <>
                  <img
                    src={media.thumbnail_url || '/video-placeholder.png'}
                    alt={media.caption || `Video ${index + 1}`}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                  {/* Video indicator */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="w-12 h-12 rounded-full bg-black/60 flex items-center justify-center">
                      <Play className="w-6 h-6 text-white ml-1" />
                    </div>
                  </div>
                  {/* Duration badge */}
                  {media.duration && (
                    <span className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                      {formatDuration(media.duration)}
                    </span>
                  )}
                </>
              ) : (
                <img
                  src={media.image_url}
                  alt={media.caption || `Obrázek ${index + 1}`}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Lightbox */}
      {lightboxOpen && currentItem && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center"
          onClick={closeLightbox}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          {/* Close button */}
          <button
            onClick={closeLightbox}
            className="absolute top-4 right-4 text-white hover:text-gray-300 z-10"
            aria-label="Zavřít"
          >
            <X className="w-8 h-8" />
          </button>

          {/* Navigation - Previous */}
          {sortedMedia.length > 1 && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                goToPrevious()
              }}
              className="absolute left-4 text-white hover:text-gray-300 z-10 p-2"
              aria-label="Předchozí"
            >
              <ChevronLeft className="w-10 h-10" />
            </button>
          )}

          {/* Media content */}
          <div
            className="max-w-[90vw] max-h-[90vh] flex flex-col items-center"
            onClick={(e) => e.stopPropagation()}
          >
            {currentItem.media_type === 'video' ? (
              <div className="w-full max-w-4xl">
                <VideoPlayer
                  src={currentItem.image_url}
                  poster={currentItem.thumbnail_url || undefined}
                />
              </div>
            ) : (
              <img
                src={currentItem.image_url}
                alt={currentItem.caption || `Obrázek ${currentIndex + 1}`}
                className="max-w-full max-h-[80vh] object-contain"
              />
            )}
            {currentItem.caption && (
              <p className="text-white text-center mt-4 px-4">
                {currentItem.caption}
              </p>
            )}
            <p className="text-gray-400 text-sm mt-2">
              {currentIndex + 1} / {sortedMedia.length}
            </p>
          </div>

          {/* Navigation - Next */}
          {sortedMedia.length > 1 && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                goToNext()
              }}
              className="absolute right-4 text-white hover:text-gray-300 z-10 p-2"
              aria-label="Další"
            >
              <ChevronRight className="w-10 h-10" />
            </button>
          )}
        </div>
      )}
    </>
  )
}
