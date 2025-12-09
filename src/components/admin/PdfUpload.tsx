'use client'

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Upload, X, Check, FileText } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface PdfUploadProps {
  editionId: string
  currentPdfUrl?: string | null
  onUploadComplete: (pdfUrl: string) => void
}

export function PdfUpload({ editionId, currentPdfUrl, onUploadComplete }: PdfUploadProps) {
  const [dragActive, setDragActive] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
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
    if (file.type !== 'application/pdf') {
      return 'Soubor musí být ve formátu PDF'
    }

    // Max 50MB
    if (file.size > 50 * 1024 * 1024) {
      return 'Soubor je příliš velký (max 50MB)'
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

  const handleUpload = async () => {
    if (!selectedFile) return

    setUploading(true)
    setError('')

    try {
      const fileName = `${editionId}/catalog.pdf`

      const { error: uploadError, data } = await supabase.storage
        .from('edition-pdfs')
        .upload(fileName, selectedFile, {
          upsert: true,
          contentType: 'application/pdf'
        })

      if (uploadError) {
        throw uploadError
      }

      if (data) {
        const { data: { publicUrl } } = supabase.storage
          .from('edition-pdfs')
          .getPublicUrl(fileName)

        // Update edition pdf_url in database
        const { error: updateError } = await supabase
          .from('editions')
          .update({ pdf_url: publicUrl })
          .eq('id', editionId)

        if (updateError) {
          throw updateError
        }

        onUploadComplete(publicUrl)
        setSelectedFile(null)
      }
    } catch (err) {
      console.error('Upload error:', err)
      setError('Chyba při nahrávání PDF')
    } finally {
      setUploading(false)
    }
  }

  const handleCancel = () => {
    setSelectedFile(null)
    setError('')
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  return (
    <div className="space-y-4">
      {!selectedFile ? (
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
                Přetáhněte PDF sem nebo klikněte pro výběr
              </p>
              <p className="text-xs text-gray-500">
                Pouze PDF • Max 50MB
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
            accept="application/pdf"
            onChange={handleChange}
            className="hidden"
          />
        </div>
      ) : (
        <div className="space-y-4">
          <div className="border rounded-lg p-4 bg-gray-50">
            <div className="flex items-center gap-4">
              <FileText className="w-12 h-12 text-red-500" />
              <div className="flex-1">
                <p className="font-medium">{selectedFile.name}</p>
                <p className="text-sm text-gray-500">
                  {formatFileSize(selectedFile.size)}
                </p>
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              type="button"
              onClick={handleUpload}
              disabled={uploading}
            >
              <Check className="w-4 h-4 mr-2" />
              {uploading ? 'Nahrávám...' : 'Nahrát PDF'}
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

      {currentPdfUrl && !selectedFile && (
        <div className="border rounded-lg p-4 bg-green-50 border-green-200">
          <div className="flex items-center gap-4">
            <FileText className="w-8 h-8 text-green-600" />
            <div className="flex-1">
              <p className="text-sm font-medium text-green-800">PDF katalog nahrán</p>
              <a
                href={currentPdfUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-green-600 hover:underline"
              >
                Zobrazit PDF
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
