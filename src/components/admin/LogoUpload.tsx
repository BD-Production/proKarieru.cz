'use client'

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Upload, X, Check, Trash2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface LogoUploadProps {
  companyId: string
  currentLogoUrl?: string | null
  onUploadComplete: (logoUrl: string) => void
  onLogoDelete?: () => void
}

export function LogoUpload({ companyId, currentLogoUrl, onUploadComplete, onLogoDelete }: LogoUploadProps) {
  const [dragActive, setDragActive] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [imageSrc, setImageSrc] = useState<string>('')
  const [uploading, setUploading] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState<string>('')

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
      return 'Soubor musí být obrázek (PNG, JPG nebo WebP)'
    }

    if (file.size > 2 * 1024 * 1024) {
      return 'Soubor je příliš velký (max 2MB)'
    }

    return null
  }

  const onSelectFile = (file: File) => {
    const validationError = validateFile(file)
    if (validationError) {
      setError(validationError)
      return
    }

    setError('')
    setSelectedFile(file)

    const reader = new FileReader()
    reader.addEventListener('load', () => {
      setImageSrc(reader.result?.toString() || '')
    })
    reader.readAsDataURL(file)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      onSelectFile(e.dataTransfer.files[0])
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onSelectFile(e.target.files[0])
    }
  }

  const resizeImage = async (imageSrc: string): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const img = new Image()
      img.crossOrigin = 'anonymous'

      img.onload = () => {
        // Počkat na úplné dekódování obrázku
        if (img.decode) {
          img.decode().then(() => processImage()).catch(() => processImage())
        } else {
          processImage()
        }

        function processImage() {
          const canvas = document.createElement('canvas')
          const ctx = canvas.getContext('2d')

          if (!ctx) {
            reject(new Error('No 2d context'))
            return
          }

          const maxSize = 512
          let width = img.naturalWidth || img.width
          let height = img.naturalHeight || img.height

          // Scale down if larger than maxSize
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
      }
      img.onerror = () => reject(new Error('Failed to load image'))
      img.src = imageSrc
    })
  }

  const handleUpload = async () => {
    if (!imageSrc || !selectedFile) return

    setUploading(true)
    setError('')

    try {
      const resizedBlob = await resizeImage(imageSrc)

      const fileExt = 'webp'
      const fileName = `${companyId}/logo.${fileExt}`

      const { error: uploadError, data } = await supabase.storage
        .from('company-logos')
        .upload(fileName, resizedBlob, {
          upsert: true,
          contentType: 'image/webp'
        })

      if (uploadError) {
        throw uploadError
      }

      if (data) {
        const { data: { publicUrl } } = supabase.storage
          .from('company-logos')
          .getPublicUrl(fileName)

        // Store clean URL without cache-busting (add it when displaying)
        const { error: updateError } = await supabase
          .from('companies')
          .update({ logo_url: publicUrl })
          .eq('id', companyId)

        if (updateError) {
          throw updateError
        }

        // Return URL with cache-busting for immediate display
        onUploadComplete(`${publicUrl}?v=${Date.now()}`)

        setSelectedFile(null)
        setImageSrc('')
      }
    } catch (err) {
      console.error('Upload error:', err)
      setError('Chyba při nahrávání loga')
    } finally {
      setUploading(false)
    }
  }

  const handleCancel = () => {
    setSelectedFile(null)
    setImageSrc('')
    setError('')
  }

  const handleDelete = async () => {
    if (!confirm('Opravdu chcete smazat logo? Tato akce je nevratná.')) {
      return
    }

    setDeleting(true)
    setError('')

    try {
      // Delete file from storage
      const fileName = `${companyId}/logo.webp`
      await supabase.storage
        .from('company-logos')
        .remove([fileName])

      // Update database - set logo_url to null
      const { error: updateError } = await supabase
        .from('companies')
        .update({ logo_url: null })
        .eq('id', companyId)

      if (updateError) {
        throw updateError
      }

      onLogoDelete?.()
    } catch (err) {
      console.error('Delete error:', err)
      setError('Chyba při mazání loga')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="space-y-4">
      {/* Current logo display */}
      {currentLogoUrl && !imageSrc && (
        <div className="border rounded-lg p-4 bg-gray-50">
          <p className="text-sm font-medium mb-3">Aktuální logo:</p>
          <div className="flex items-start gap-4">
            <img
              src={`${currentLogoUrl}?v=${Date.now()}`}
              alt="Aktuální logo"
              className="w-24 h-24 object-contain border rounded bg-white"
            />
            <div className="flex-1">
              <p className="text-xs text-gray-500 mb-3">
                Formát: WebP
              </p>
              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={handleDelete}
                disabled={deleting}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                {deleting ? 'Mažu...' : 'Smazat logo'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Upload area */}
      {!imageSrc ? (
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            dragActive
              ? 'border-primary bg-primary/5'
              : 'border-gray-300 hover:border-gray-400'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <div className="flex flex-col items-center gap-4">
            <Upload className="w-12 h-12 text-gray-400" />
            <div>
              <p className="text-sm font-medium mb-1">
                Přetáhněte logo sem nebo klikněte pro výběr
              </p>
              <p className="text-xs text-gray-500">
                PNG, JPG nebo WebP • Max 2MB • Automaticky zmenšeno na max 512 px
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              onClick={() => inputRef.current?.click()}
            >
              Vybrat soubor
            </Button>
          </div>
          <input
            ref={inputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp"
            onChange={handleChange}
            className="hidden"
          />
        </div>
      ) : (
        <div className="space-y-4">
          <div className="border rounded-lg p-4 bg-gray-50">
            <p className="text-sm font-medium mb-2">
              Náhled loga:
            </p>
            <div className="flex justify-center">
              <img
                src={imageSrc}
                alt="Logo preview"
                className="max-w-full max-h-64 object-contain"
              />
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              type="button"
              onClick={handleUpload}
              disabled={uploading}
            >
              <Check className="w-4 h-4 mr-2" />
              {uploading ? 'Nahrávám...' : 'Nahrát logo'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={uploading}
            >
              <X className="w-4 h-4 mr-2" />
              Zrušit
            </Button>
          </div>
        </div>
      )}

      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
    </div>
  )
}
