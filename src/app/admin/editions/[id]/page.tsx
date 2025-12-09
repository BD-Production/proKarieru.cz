'use client'

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, Trash2 } from 'lucide-react'
import Link from 'next/link'
import type { Edition, Portal } from '@/types/database'
import { PdfUpload } from '@/components/admin/PdfUpload'

export default function EditEditionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [edition, setEdition] = useState<Edition | null>(null)
  const [portals, setPortals] = useState<Portal[]>([])

  const [formData, setFormData] = useState({
    portal_id: '',
    name: '',
    year: new Date().getFullYear(),
    season: '',
    location: '',
    display_order: 0,
    is_active: false,
  })
  const [pdfUrl, setPdfUrl] = useState<string | null>(null)

  useEffect(() => {
    async function loadData() {
      const [editionResult, portalsResult] = await Promise.all([
        supabase.from('editions').select('*').eq('id', id).single(),
        supabase.from('portals').select('*').order('name'),
      ])

      if (editionResult.data) {
        const e = editionResult.data
        setEdition(e)
        setFormData({
          portal_id: e.portal_id,
          name: e.name,
          year: e.year,
          season: e.season || '',
          location: e.location || '',
          display_order: e.display_order,
          is_active: e.is_active,
        })
        setPdfUrl(e.pdf_url || null)
      }
      if (portalsResult.data) setPortals(portalsResult.data)
    }
    loadData()
  }, [id, supabase])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    const checked = (e.target as HTMLInputElement).checked
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox'
        ? checked
        : name === 'year' || name === 'display_order'
          ? parseInt(value) || 0
          : value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { error } = await supabase
      .from('editions')
      .update({
        portal_id: formData.portal_id,
        name: formData.name,
        year: formData.year,
        season: formData.season || null,
        location: formData.location || null,
        display_order: formData.display_order,
        is_active: formData.is_active,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    router.push('/admin/editions')
    router.refresh()
  }

  const handleDelete = async () => {
    if (!confirm('Opravdu chcete smazat tuto edici? Tato akce je nevratná.')) {
      return
    }

    setDeleting(true)
    const { error } = await supabase.from('editions').delete().eq('id', id)

    if (error) {
      setError(error.message)
      setDeleting(false)
      return
    }

    router.push('/admin/editions')
    router.refresh()
  }

  if (!edition) {
    return <div className="p-8">Načítám...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button asChild variant="ghost" size="icon">
            <Link href="/admin/editions">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Upravit edici</h1>
            <p className="text-gray-500">{edition.name}</p>
          </div>
        </div>
        <Button variant="destructive" onClick={handleDelete} disabled={deleting}>
          <Trash2 className="mr-2 h-4 w-4" />
          {deleting ? 'Mažu...' : 'Smazat'}
        </Button>
      </div>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Základní informace</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="portal_id">Portál *</Label>
              <select
                id="portal_id"
                name="portal_id"
                value={formData.portal_id}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border rounded-md"
              >
                <option value="">Vyberte portál</option>
                {portals.map((portal) => (
                  <option key={portal.id} value={portal.id}>
                    {portal.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">Název edice *</Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="year">Rok *</Label>
                <Input
                  type="number"
                  id="year"
                  name="year"
                  value={formData.year}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="season">Sezóna</Label>
                <select
                  id="season"
                  name="season"
                  value={formData.season}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-md"
                >
                  <option value="">Bez sezóny</option>
                  <option value="spring">Jaro</option>
                  <option value="fall">Podzim</option>
                  <option value="winter">Zima</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="location">Lokace</Label>
                <Input
                  id="location"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="display_order">Pořadí zobrazení</Label>
                <Input
                  type="number"
                  id="display_order"
                  name="display_order"
                  value={formData.display_order}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="is_active"
                name="is_active"
                checked={formData.is_active}
                onChange={handleChange}
                className="rounded border-gray-300"
              />
              <Label htmlFor="is_active">Edice je aktivní (výchozí zobrazení)</Label>
            </div>

            {error && (
              <p className="text-sm text-red-600">{error}</p>
            )}

            <div className="flex gap-4 pt-4">
              <Button type="submit" disabled={loading}>
                {loading ? 'Ukládám...' : 'Uložit změny'}
              </Button>
              <Button asChild variant="outline">
                <Link href="/admin/editions">Zrušit</Link>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>PDF Katalog</CardTitle>
        </CardHeader>
        <CardContent>
          <PdfUpload
            editionId={id}
            currentPdfUrl={pdfUrl}
            onUploadComplete={(url) => setPdfUrl(url)}
          />
        </CardContent>
      </Card>
    </div>
  )
}
