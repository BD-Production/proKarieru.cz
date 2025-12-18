'use client'

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Upload, X, Trash2, GripVertical, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import type { ArticleGalleryImage } from '@/types/database'

interface ArticleGalleryUploadProps {
  articleId: string
  gallery: ArticleGalleryImage[]
  onGalleryChange: (gallery: ArticleGalleryImage[]) => void
}

export function ArticleGalleryUpload({
  articleId,
  gallery,
  onGalleryChange
}: ArticleGalleryUploadProps) {
  const [dragActive, setDragActive] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [editingCaption, setEditingCaption] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const supabase = createClient()

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const validateFile = (file: File): string | null => {
    if (!file.type.startsWith('image/')) {
      return 'Soubor musí být obrázek'
    }
    if (file.size > 5 * 1024 * 1024) {
      return 'Soubor je příliš velký (max 5MB)'
    }
    return null
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

  const uploadFiles = async (files: FileList) => {
    setUploading(true)

    try {
      const newImages: ArticleGalleryImage[] = []
      const maxSortOrder = gallery.length > 0
        ? Math.max(...gallery.map(img => img.sort_order))
        : -1

      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        const error = validateFile(file)
        if (error) {
          toast.error(`${file.name}: ${error}`)
          continue
        }

        const resizedBlob = await resizeImage(file)
        const timestamp = Date.now()
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

        // Add to gallery in database
        const response = await fetch(`/api/admin/articles/${articleId}/gallery`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            image_url: publicUrl,
            sort_order: maxSortOrder + 1 + i
          })
        })

        const data = await response.json()

        if (response.ok && data.image) {
          newImages.push(data.image)
        }
      }

      if (newImages.length > 0) {
        onGalleryChange([...gallery, ...newImages])
        toast.success(`Nahráno ${newImages.length} obrázků`)
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

  const handleDeleteImage = async (imageId: string) => {
    try {
      const response = await fetch(`/api/admin/article-gallery/${imageId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        onGalleryChange(gallery.filter(img => img.id !== imageId))
        toast.success('Obrázek byl smazán')
      } else {
        toast.error('Nepodařilo se smazat obrázek')
      }
    } catch (error) {
      console.error('Delete error:', error)
      toast.error('Nepodařilo se smazat obrázek')
    }
  }

  const handleCaptionChange = async (imageId: string, caption: string) => {
    const updatedGallery = gallery.map(img =>
      img.id === imageId ? { ...img, caption } : img
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
          images: gallery.map(img => ({
            id: img.id,
            caption: img.caption,
            sort_order: img.sort_order
          }))
        })
      })
    } catch (error) {
      console.error('Save caption error:', error)
    }

    setEditingCaption(null)
  }

  const moveImage = async (fromIndex: number, toIndex: number) => {
    const newGallery = [...gallery]
    const [movedImage] = newGallery.splice(fromIndex, 1)
    newGallery.splice(toIndex, 0, movedImage)

    // Update sort_order
    const updatedGallery = newGallery.map((img, index) => ({
      ...img,
      sort_order: index
    }))

    onGalleryChange(updatedGallery)

    // Save to backend
    try {
      await fetch(`/api/admin/articles/${articleId}/gallery`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          images: updatedGallery.map(img => ({
            id: img.id,
            caption: img.caption,
            sort_order: img.sort_order
          }))
        })
      })
    } catch (error) {
      console.error('Reorder error:', error)
    }
  }

  return (
    <div className="space-y-4">
      {/* Existing gallery */}
      {gallery.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {gallery.sort((a, b) => a.sort_order - b.sort_order).map((image, index) => (
            <div
              key={image.id}
              className="relative group border rounded-lg overflow-hidden bg-gray-50"
            >
              <div className="aspect-square">
                <img
                  src={image.image_url}
                  alt={image.caption || `Obrázek ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Controls overlay */}
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                {index > 0 && (
                  <Button
                    type="button"
                    size="sm"
                    variant="secondary"
                    onClick={() => moveImage(index, index - 1)}
                  >
                    ←
                  </Button>
                )}
                <Button
                  type="button"
                  size="sm"
                  variant="destructive"
                  onClick={() => handleDeleteImage(image.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
                {index < gallery.length - 1 && (
                  <Button
                    type="button"
                    size="sm"
                    variant="secondary"
                    onClick={() => moveImage(index, index + 1)}
                  >
                    →
                  </Button>
                )}
              </div>

              {/* Caption input */}
              <div className="p-2">
                <Input
                  type="text"
                  placeholder="Popisek..."
                  value={image.caption || ''}
                  onChange={(e) => handleCaptionChange(image.id, e.target.value)}
                  onFocus={() => setEditingCaption(image.id)}
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
              {uploading ? 'Nahrávám...' : 'Přetáhněte obrázky sem'}
            </p>
            <p className="text-xs text-gray-500">
              PNG, JPG nebo WebP • Max 5MB
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
          accept="image/png,image/jpeg,image/webp"
          multiple
          onChange={handleChange}
          className="hidden"
        />
      </div>

      {gallery.length === 0 && (
        <p className="text-sm text-gray-500 text-center">
          Zatím žádné obrázky v galerii
        </p>
      )}
    </div>
  )
}
