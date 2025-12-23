'use client'

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Upload, Trash2, Loader2, Copy, Check, Play } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import type { ArticleGalleryImage } from '@/types/database'

interface ArticleGalleryUploadProps {
  articleId: string
  gallery: ArticleGalleryImage[]
  onGalleryChange: (gallery: ArticleGalleryImage[]) => void
}

const MAX_IMAGE_SIZE = 5 * 1024 * 1024 // 5 MB
const MAX_VIDEO_SIZE = 100 * 1024 * 1024 // 100 MB
const ALLOWED_IMAGE_TYPES = ['image/png', 'image/jpeg', 'image/webp']
const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/webm']

function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export function ArticleGalleryUpload({
  articleId,
  gallery,
  onGalleryChange
}: ArticleGalleryUploadProps) {
  const [dragActive, setDragActive] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [editingCaption, setEditingCaption] = useState<string | null>(null)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const supabase = createClient()

  const validateFile = (file: File): { valid: boolean; error?: string; type: 'image' | 'video' } => {
    if (ALLOWED_IMAGE_TYPES.includes(file.type)) {
      if (file.size > MAX_IMAGE_SIZE) {
        return { valid: false, error: 'Obrázek je příliš velký (max 5MB)', type: 'image' }
      }
      return { valid: true, type: 'image' }
    }

    if (ALLOWED_VIDEO_TYPES.includes(file.type)) {
      if (file.size > MAX_VIDEO_SIZE) {
        return { valid: false, error: 'Video je příliš velké (max 100MB)', type: 'video' }
      }
      return { valid: true, type: 'video' }
    }

    return { valid: false, error: 'Nepodporovaný formát souboru', type: 'image' }
  }

  const resizeImage = async (file: File): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        const img = new Image()
        img.onload = () => {
          const canvas = document.createElement('canvas')
          const ctx = canvas.getContext('2d')
          if (!ctx) {
            reject(new Error('No 2d context'))
            return
          }

          const maxSize = 1920
          let width = img.width
          let height = img.height

          if (width > maxSize || height > maxSize) {
            if (width > height) {
              height = Math.round((height / width) * maxSize)
              width = maxSize
            } else {
              width = Math.round((width / height) * maxSize)
              height = maxSize
            }
          }

          canvas.width = width
          canvas.height = height
          ctx.drawImage(img, 0, 0, width, height)

          canvas.toBlob(
            (blob) => {
              if (!blob) {
                reject(new Error('Canvas is empty'))
                return
              }
              resolve(blob)
            },
            'image/webp',
            0.9
          )
        }
        img.onerror = () => reject(new Error('Failed to load image'))
        img.src = e.target?.result as string
      }
      reader.readAsDataURL(file)
    })
  }

  const generateVideoThumbnail = (file: File): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const video = document.createElement('video')
      video.preload = 'metadata'
      video.muted = true
      video.playsInline = true

      video.onloadeddata = () => {
        video.currentTime = 1 // Seek na 1 sekundu
      }

      video.onseeked = () => {
        const canvas = document.createElement('canvas')
        canvas.width = video.videoWidth
        canvas.height = video.videoHeight
        const ctx = canvas.getContext('2d')
        if (!ctx) {
          reject(new Error('Cannot get canvas context'))
          return
        }
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
        canvas.toBlob(
          (blob) => {
            if (blob) resolve(blob)
            else reject(new Error('Failed to create thumbnail'))
          },
          'image/webp',
          0.8
        )
        URL.revokeObjectURL(video.src)
      }

      video.onerror = () => reject(new Error('Failed to load video'))
      video.src = URL.createObjectURL(file)
    })
  }

  const getVideoDuration = (file: File): Promise<number> => {
    return new Promise((resolve, reject) => {
      const video = document.createElement('video')
      video.preload = 'metadata'
      video.onloadedmetadata = () => {
        resolve(Math.round(video.duration))
        URL.revokeObjectURL(video.src)
      }
      video.onerror = () => reject(new Error('Failed to load video metadata'))
      video.src = URL.createObjectURL(file)
    })
  }

  const copyMarkdown = async (media: ArticleGalleryImage) => {
    let markdown: string
    if (media.media_type === 'video') {
      markdown = `::video[${media.image_url}]`
    } else {
      markdown = `![${media.caption || 'Obrázek'}](${media.image_url})`
    }
    await navigator.clipboard.writeText(markdown)
    setCopiedId(media.id)
    toast.success('Markdown zkopírován do schránky')
    setTimeout(() => setCopiedId(null), 2000)
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const uploadFiles = async (files: FileList) => {
    setUploading(true)

    try {
      const newMedia: ArticleGalleryImage[] = []
      const maxSortOrder = gallery.length > 0
        ? Math.max(...gallery.map(img => img.sort_order))
        : -1

      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        const validation = validateFile(file)

        if (!validation.valid) {
          toast.error(`${file.name}: ${validation.error}`)
          continue
        }

        let mediaUrl: string
        let thumbnailUrl: string | null = null
        let duration: number | null = null
        const timestamp = Date.now()

        if (validation.type === 'image') {
          // Upload obrázku
          const resizedBlob = await resizeImage(file)
          const fileName = `${articleId}/gallery-${timestamp}-${i}.webp`

          const { error: uploadError } = await supabase.storage
            .from('article-images')
            .upload(fileName, resizedBlob, {
              contentType: 'image/webp'
            })

          if (uploadError) {
            toast.error(`Chyba při nahrávání ${file.name}`)
            continue
          }

          const { data: { publicUrl } } = supabase.storage
            .from('article-images')
            .getPublicUrl(fileName)

          mediaUrl = publicUrl
        } else {
          // Upload videa
          const extension = file.type === 'video/mp4' ? 'mp4' : 'webm'
          const videoFileName = `${articleId}/video-${timestamp}-${i}.${extension}`

          const { error: uploadError } = await supabase.storage
            .from('article-videos')
            .upload(videoFileName, file, {
              contentType: file.type
            })

          if (uploadError) {
            toast.error(`Chyba při nahrávání ${file.name}`)
            continue
          }

          const { data: { publicUrl: videoPublicUrl } } = supabase.storage
            .from('article-videos')
            .getPublicUrl(videoFileName)

          mediaUrl = videoPublicUrl

          // Generovat a nahrát thumbnail
          try {
            const thumbnailBlob = await generateVideoThumbnail(file)
            const thumbnailFileName = `${articleId}/thumb-${timestamp}-${i}.webp`

            await supabase.storage
              .from('article-images')
              .upload(thumbnailFileName, thumbnailBlob, {
                contentType: 'image/webp'
              })

            const { data: { publicUrl: thumbUrl } } = supabase.storage
              .from('article-images')
              .getPublicUrl(thumbnailFileName)

            thumbnailUrl = thumbUrl
          } catch (thumbError) {
            console.warn('Failed to generate thumbnail:', thumbError)
          }

          // Získat délku videa
          try {
            duration = await getVideoDuration(file)
          } catch (durationError) {
            console.warn('Failed to get video duration:', durationError)
          }
        }

        // Přidat do galerie v databázi
        const response = await fetch(`/api/admin/articles/${articleId}/gallery`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            image_url: mediaUrl,
            thumbnail_url: thumbnailUrl,
            media_type: validation.type,
            duration: duration,
            file_size: file.size,
            sort_order: maxSortOrder + 1 + i
          })
        })

        const data = await response.json()

        if (response.ok && data.image) {
          newMedia.push(data.image)
        }
      }

      if (newMedia.length > 0) {
        onGalleryChange([...gallery, ...newMedia])
        const imageCount = newMedia.filter(m => m.media_type === 'image').length
        const videoCount = newMedia.filter(m => m.media_type === 'video').length
        const parts = []
        if (imageCount > 0) parts.push(`${imageCount} obrázků`)
        if (videoCount > 0) parts.push(`${videoCount} videí`)
        toast.success(`Nahráno ${parts.join(' a ')}`)
      }
    } catch (error) {
      console.error('Upload error:', error)
      toast.error('Chyba při nahrávání')
    } finally {
      setUploading(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      uploadFiles(e.dataTransfer.files)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      uploadFiles(e.target.files)
    }
  }

  const handleDeleteMedia = async (mediaId: string) => {
    try {
      const response = await fetch(`/api/admin/article-gallery/${mediaId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        onGalleryChange(gallery.filter(m => m.id !== mediaId))
        toast.success('Položka byla smazána')
      } else {
        toast.error('Nepodařilo se smazat položku')
      }
    } catch (error) {
      console.error('Delete error:', error)
      toast.error('Nepodařilo se smazat položku')
    }
  }

  const handleCaptionChange = async (mediaId: string, caption: string) => {
    const updatedGallery = gallery.map(m =>
      m.id === mediaId ? { ...m, caption } : m
    )
    onGalleryChange(updatedGallery)
  }

  const handleCaptionBlur = async () => {
    if (!editingCaption) return

    try {
      await fetch(`/api/admin/articles/${articleId}/gallery`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          images: gallery.map(m => ({
            id: m.id,
            caption: m.caption,
            sort_order: m.sort_order
          }))
        })
      })
    } catch (error) {
      console.error('Save caption error:', error)
    }

    setEditingCaption(null)
  }

  const moveMedia = async (fromIndex: number, toIndex: number) => {
    const sortedGallery = [...gallery].sort((a, b) => a.sort_order - b.sort_order)
    const [movedItem] = sortedGallery.splice(fromIndex, 1)
    sortedGallery.splice(toIndex, 0, movedItem)

    // Update sort_order
    const updatedGallery = sortedGallery.map((m, index) => ({
      ...m,
      sort_order: index
    }))

    onGalleryChange(updatedGallery)

    // Save to backend
    try {
      await fetch(`/api/admin/articles/${articleId}/gallery`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          images: updatedGallery.map(m => ({
            id: m.id,
            caption: m.caption,
            sort_order: m.sort_order
          }))
        })
      })
    } catch (error) {
      console.error('Reorder error:', error)
    }
  }

  const sortedGallery = [...gallery].sort((a, b) => a.sort_order - b.sort_order)

  return (
    <div className="space-y-4">
      {/* Existing gallery */}
      {sortedGallery.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {sortedGallery.map((media, index) => (
            <div
              key={media.id}
              className="relative group border rounded-lg overflow-hidden bg-gray-50"
            >
              <div className="aspect-square relative">
                {media.media_type === 'video' ? (
                  <>
                    <img
                      src={media.thumbnail_url || '/video-placeholder.png'}
                      alt={media.caption || `Video ${index + 1}`}
                      className="w-full h-full object-cover"
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
                  />
                )}
              </div>

              {/* Controls overlay */}
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
                <div className="flex gap-2">
                  {index > 0 && (
                    <Button
                      type="button"
                      size="sm"
                      variant="secondary"
                      onClick={() => moveMedia(index, index - 1)}
                    >
                      ←
                    </Button>
                  )}
                  <Button
                    type="button"
                    size="sm"
                    variant="secondary"
                    onClick={() => copyMarkdown(media)}
                    title="Kopírovat Markdown pro vložení do textu"
                  >
                    {copiedId === media.id ? (
                      <Check className="h-4 w-4 text-green-500" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="destructive"
                    onClick={() => handleDeleteMedia(media.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                  {index < sortedGallery.length - 1 && (
                    <Button
                      type="button"
                      size="sm"
                      variant="secondary"
                      onClick={() => moveMedia(index, index + 1)}
                    >
                      →
                    </Button>
                  )}
                </div>
                <p className="text-xs text-white/80">
                  {media.media_type === 'video' ? 'Video' : 'Obrázek'}
                  {media.file_size && ` • ${formatFileSize(media.file_size)}`}
                </p>
              </div>

              {/* Caption input */}
              <div className="p-2">
                <Input
                  type="text"
                  placeholder="Popisek..."
                  value={media.caption || ''}
                  onChange={(e) => handleCaptionChange(media.id, e.target.value)}
                  onFocus={() => setEditingCaption(media.id)}
                  onBlur={handleCaptionBlur}
                  className="text-xs"
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload area */}
      <div
        className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
          dragActive
            ? 'border-primary bg-primary/5'
            : 'border-gray-300 hover:border-gray-400'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <div className="flex flex-col items-center gap-3">
          {uploading ? (
            <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
          ) : (
            <Upload className="w-8 h-8 text-gray-400" />
          )}
          <div>
            <p className="text-sm font-medium">
              {uploading ? 'Nahrávám...' : 'Přetáhněte obrázky nebo videa sem'}
            </p>
            <p className="text-xs text-gray-500">
              Obrázky: PNG, JPG, WebP (max 5MB) • Videa: MP4, WebM (max 100MB)
            </p>
            <p className="text-xs text-gray-400 mt-1">
              Obrázky budou automaticky optimalizovány
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
          >
            Vybrat soubory
          </Button>
        </div>
        <input
          ref={inputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp,video/mp4,video/webm"
          multiple
          onChange={handleChange}
          className="hidden"
        />
      </div>

      {gallery.length === 0 && (
        <p className="text-sm text-gray-500 text-center">
          Zatím žádná média v galerii
        </p>
      )}
    </div>
  )
}
