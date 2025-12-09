'use client'

import { useState, useRef, useCallback } from 'react'
import ReactCrop, { Crop, PixelCrop } from 'react-image-crop'
import 'react-image-crop/dist/ReactCrop.css'
import { Button } from '@/components/ui/button'
import { Upload, X, Check } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface LogoUploadProps {
  companyId: string
  currentLogoUrl?: string | null
  onUploadComplete: (logoUrl: string) => void
}

export function LogoUpload({ companyId, currentLogoUrl, onUploadComplete }: LogoUploadProps) {
  const [dragActive, setDragActive] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [imageSrc, setImageSrc] = useState<string>('')
  const [crop, setCrop] = useState<Crop>({
    unit: '%',
    width: 100,
    height: 100,
    x: 0,
    y: 0,
  })
  const [completedCrop, setCompletedCrop] = useState<PixelCrop | null>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string>('')

  const imgRef = useRef<HTMLImageElement>(null)
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
    // Check file type
    if (!file.type.startsWith('image/')) {
      return 'Soubor musí být obrázek (PNG, JPG nebo WebP)'
    }

    // Check file size (max 2MB)
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

  const onImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const { width, height } = e.currentTarget

    // Auto-center crop for square
    const size = Math.min(width, height)
    const x = (width - size) / 2
    const y = (height - size) / 2

    setCrop({
      unit: 'px',
      width: size,
      height: size,
      x,
      y,
    })
  }

  const getCroppedImg = async (
    image: HTMLImageElement,
    crop: PixelCrop
  ): Promise<Blob> => {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')

    if (!ctx) {
      throw new Error('No 2d context')
    }

    // Set canvas size to 512x512
    const targetSize = 512
    canvas.width = targetSize
    canvas.height = targetSize

    ctx.drawImage(
      image,
      crop.x,
      crop.y,
      crop.width,
      crop.height,
      0,
      0,
      targetSize,
      targetSize
    )

    return new Promise((resolve, reject) => {
      canvas.toBlob((blob) => {
        if (!blob) {
          reject(new Error('Canvas is empty'))
          return
        }
        resolve(blob)
      }, 'image/webp', 0.9)
    })
  }

  const handleUpload = async () => {
    if (!completedCrop || !imgRef.current || !selectedFile) return

    setUploading(true)
    setError('')

    try {
      // Get cropped image blob
      const croppedBlob = await getCroppedImg(imgRef.current, completedCrop)

      // Create file path
      const fileExt = 'webp'
      const fileName = `${companyId}/logo.${fileExt}`

      // Upload to Supabase Storage
      const { error: uploadError, data } = await supabase.storage
        .from('company-logos')
        .upload(fileName, croppedBlob, {
          upsert: true,
          contentType: 'image/webp'
        })

      if (uploadError) {
        throw uploadError
      }

      if (data) {
        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from('company-logos')
          .getPublicUrl(fileName)

        // Update company logo_url in database
        const { error: updateError } = await supabase
          .from('companies')
          .update({ logo_url: publicUrl })
          .eq('id', companyId)

        if (updateError) {
          throw updateError
        }

        onUploadComplete(publicUrl)

        // Reset state
        setSelectedFile(null)
        setImageSrc('')
        setCrop({ unit: '%', width: 100, height: 100, x: 0, y: 0 })
        setCompletedCrop(null)
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
    setCrop({ unit: '%', width: 100, height: 100, x: 0, y: 0 })
    setCompletedCrop(null)
    setError('')
  }

  return (
    <div className="space-y-4">
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
                PNG, JPG nebo WebP • Max 2MB • Čtvercový formát 512×512 px
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
              Ořízněte logo na čtvercový formát:
            </p>
            <ReactCrop
              crop={crop}
              onChange={(c) => setCrop(c)}
              onComplete={(c) => setCompletedCrop(c)}
              aspect={1}
              className="max-w-full"
            >
              <img
                ref={imgRef}
                src={imageSrc}
                alt="Crop preview"
                onLoad={onImageLoad}
                className="max-w-full h-auto"
              />
            </ReactCrop>
          </div>

          <div className="flex gap-2">
            <Button
              type="button"
              onClick={handleUpload}
              disabled={!completedCrop || uploading}
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
