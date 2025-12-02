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
import type { Portal } from '@/types/database'

export default function EditPortalPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [portal, setPortal] = useState<Portal | null>(null)

  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    domain: '',
    tagline: '',
    primary_color: '#C34751',
    secondary_color: '#6D6F7E',
    ga_measurement_id: '',
    is_active: true,
  })

  useEffect(() => {
    async function loadPortal() {
      const { data } = await supabase
        .from('portals')
        .select('*')
        .eq('id', id)
        .single()

      if (data) {
        setPortal(data)
        setFormData({
          name: data.name,
          slug: data.slug,
          domain: data.domain,
          tagline: data.tagline || '',
          primary_color: data.primary_color,
          secondary_color: data.secondary_color || '#6D6F7E',
          ga_measurement_id: data.ga_measurement_id || '',
          is_active: data.is_active,
        })
      }
    }
    loadPortal()
  }, [id, supabase])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { error } = await supabase
      .from('portals')
      .update({
        name: formData.name,
        slug: formData.slug,
        domain: formData.domain,
        tagline: formData.tagline || null,
        primary_color: formData.primary_color,
        secondary_color: formData.secondary_color || null,
        ga_measurement_id: formData.ga_measurement_id || null,
        is_active: formData.is_active,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    router.push('/admin/portals')
    router.refresh()
  }

  const handleDelete = async () => {
    if (!confirm('Opravdu chcete smazat tento portal? Tato akce je nevratna.')) {
      return
    }

    setDeleting(true)
    const { error } = await supabase.from('portals').delete().eq('id', id)

    if (error) {
      setError(error.message)
      setDeleting(false)
      return
    }

    router.push('/admin/portals')
    router.refresh()
  }

  if (!portal) {
    return <div className="p-8">Nacitam...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button asChild variant="ghost" size="icon">
            <Link href="/admin/portals">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Upravit portal</h1>
            <p className="text-gray-500">{portal.name}</p>
          </div>
        </div>
        <Button variant="destructive" onClick={handleDelete} disabled={deleting}>
          <Trash2 className="mr-2 h-4 w-4" />
          {deleting ? 'Mazu...' : 'Smazat'}
        </Button>
      </div>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Zakladni informace</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nazev portalu *</Label>
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
                <Label htmlFor="slug">Slug *</Label>
                <Input
                  id="slug"
                  name="slug"
                  value={formData.slug}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="domain">Domena *</Label>
                <Input
                  id="domain"
                  name="domain"
                  value={formData.domain}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="tagline">Tagline</Label>
              <Input
                id="tagline"
                name="tagline"
                value={formData.tagline}
                onChange={handleChange}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="primary_color">Primarni barva *</Label>
                <div className="flex gap-2">
                  <Input
                    type="color"
                    id="primary_color"
                    name="primary_color"
                    value={formData.primary_color}
                    onChange={handleChange}
                    className="w-12 h-10 p-1"
                  />
                  <Input
                    name="primary_color"
                    value={formData.primary_color}
                    onChange={handleChange}
                    className="flex-1"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="secondary_color">Sekundarni barva</Label>
                <div className="flex gap-2">
                  <Input
                    type="color"
                    id="secondary_color"
                    name="secondary_color"
                    value={formData.secondary_color}
                    onChange={handleChange}
                    className="w-12 h-10 p-1"
                  />
                  <Input
                    name="secondary_color"
                    value={formData.secondary_color}
                    onChange={handleChange}
                    className="flex-1"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="ga_measurement_id">GA4 Measurement ID</Label>
              <Input
                id="ga_measurement_id"
                name="ga_measurement_id"
                placeholder="G-XXXXXXXXXX"
                value={formData.ga_measurement_id}
                onChange={handleChange}
              />
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
              <Label htmlFor="is_active">Portal je aktivni</Label>
            </div>

            {error && (
              <p className="text-sm text-red-600">{error}</p>
            )}

            <div className="flex gap-4 pt-4">
              <Button type="submit" disabled={loading}>
                {loading ? 'Ukladam...' : 'Ulozit zmeny'}
              </Button>
              <Button asChild variant="outline">
                <Link href="/admin/portals">Zrusit</Link>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
