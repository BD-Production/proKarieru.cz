'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, Upload, X } from 'lucide-react'
import Link from 'next/link'

type Edition = {
  id: string
  name: string
}

export default function NewCompanyPage() {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [editions, setEditions] = useState<Edition[]>([])
  const [selectedEditions, setSelectedEditions] = useState<string[]>([])

  // Logo state
  const [dragActive, setDragActive] = useState(false)
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [logoPreview, setLogoPreview] = useState<string>('')
  const inputRef = useRef<HTMLInputElement>(null)

  const [formData, setFormData] = useState({
    name: '',
    slug: '',
  })

  useEffect(() => {
    async function loadEditions() {
      const { data: portal } = await supabase
        .from('portals')
        .select('id')
        .eq('is_active', true)
        .limit(1)
        .single()

      if (portal) {
        const { data } = await supabase
          .from('editions')
          .select('id, name')
          .eq('portal_id', portal.id)
          .order('display_order')
        setEditions(data || [])
      }
    }
    loadEditions()
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))

    // Auto-generate slug from name
    if (name === 'name') {
      const slug = value
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9-]/g, '')
      setFormData((prev) => ({ ...prev, slug }))
    }
  }

  const handleEditionToggle = (editionId: string) => {
    setSelectedEditions((prev) =>
      prev.includes(editionId)
        ? prev.filter((id) => id !== editionId)
        : [...prev, editionId]
    )
  }

  // Logo handlers
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleLogoSelect(e.dataTransfer.files[0])
    }
  }

  const handleLogoSelect = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('Soubor musí být obrázek')
      return
    }
    if (file.size > 2 * 1024 * 1024) {
      setError('Soubor je příliš velký (max 2MB)')
      return
    }

    setLogoFile(file)
    const reader = new FileReader()
    reader.onload = () => setLogoPreview(reader.result as string)
    reader.readAsDataURL(file)
  }

  const handleLogoRemove = () => {
    setLogoFile(null)
    setLogoPreview('')
  }

  const resizeImage = async (imageSrc: string): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')
        if (!ctx) { reject(new Error('No 2d context')); return }

        const maxSize = 512
        let { width, height } = img
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
          (blob) => blob ? resolve(blob) : reject(new Error('Canvas is empty')),
          'image/webp',
          0.9
        )
      }
      img.onerror = () => reject(new Error('Failed to load image'))
      img.src = imageSrc
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      // 1. Create company
      const { data: company, error: companyError } = await supabase
        .from('companies')
        .insert({
          name: formData.name,
          slug: formData.slug,
          is_active: true,
        })
        .select()
        .single()

      if (companyError) throw companyError

      // 2. Upload logo if selected
      if (logoFile && logoPreview && company) {
        const resizedBlob = await resizeImage(logoPreview)
        const fileName = `${company.id}/logo.webp`

        const { error: uploadError } = await supabase.storage
          .from('company-logos')
          .upload(fileName, resizedBlob, { upsert: true, contentType: 'image/webp' })

        if (uploadError) throw uploadError

        const { data: { publicUrl } } = supabase.storage
          .from('company-logos')
          .getPublicUrl(fileName)

        await supabase
          .from('companies')
          .update({ logo_url: publicUrl })
          .eq('id', company.id)
      }

      // 3. Add to selected editions
      if (selectedEditions.length > 0 && company) {
        const editionInserts = selectedEditions.map((editionId) => ({
          company_id: company.id,
          edition_id: editionId,
        }))

        const { error: editionError } = await supabase
          .from('company_editions')
          .insert(editionInserts)

        if (editionError) throw editionError
      }

      router.push('/admin/companies')
      router.refresh()
    } catch (err: any) {
      setError(err.message || 'Chyba při vytváření firmy')
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button asChild variant="ghost" size="icon">
          <Link href="/admin/companies">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Nová firma</h1>
          <p className="text-gray-500">Přidejte novou firmu do systému</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>Logo firmy</CardTitle>
          </CardHeader>
          <CardContent>
            {!logoPreview ? (
              <div
                className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer ${
                  dragActive ? 'border-primary bg-primary/5' : 'border-gray-300 hover:border-gray-400'
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={() => inputRef.current?.click()}
              >
                <Upload className="w-10 h-10 text-gray-400 mx-auto mb-3" />
                <p className="text-sm font-medium">Přetáhněte logo nebo klikněte</p>
                <p className="text-xs text-gray-500 mt-1">PNG, JPG nebo WebP • Max 2MB</p>
                <input
                  ref={inputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  onChange={(e) => e.target.files?.[0] && handleLogoSelect(e.target.files[0])}
                  className="hidden"
                />
              </div>
            ) : (
              <div className="flex items-center gap-4">
                <img src={logoPreview} alt="Logo náhled" className="w-20 h-20 object-contain border rounded" />
                <div>
                  <p className="text-sm font-medium">{logoFile?.name}</p>
                  <Button type="button" variant="ghost" size="sm" onClick={handleLogoRemove}>
                    <X className="w-4 h-4 mr-1" /> Odstranit
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Základní informace</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Název firmy *</Label>
              <Input
                id="name"
                name="name"
                placeholder="Metrostav"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="slug">Slug (URL) *</Label>
              <Input
                id="slug"
                name="slug"
                placeholder="metrostav"
                value={formData.slug}
                onChange={handleChange}
                required
              />
              <p className="text-xs text-gray-500">
                URL: prostavare.cz/{formData.slug || 'slug'}
              </p>
            </div>
          </CardContent>
        </Card>

        {editions.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Edice</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-500 mb-3">Vyberte edice, do kterých firma patří:</p>
              <div className="flex flex-wrap gap-2">
                {editions.map((edition) => (
                  <Button
                    key={edition.id}
                    type="button"
                    variant={selectedEditions.includes(edition.id) ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handleEditionToggle(edition.id)}
                  >
                    {edition.name}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {error && (
          <p className="text-sm text-red-600">{error}</p>
        )}

        <div className="flex gap-4">
          <Button type="submit" disabled={loading}>
            {loading ? 'Vytvářím...' : 'Vytvořit firmu'}
          </Button>
          <Button asChild variant="outline">
            <Link href="/admin/companies">Zrušit</Link>
          </Button>
        </div>
      </form>
    </div>
  )
}
