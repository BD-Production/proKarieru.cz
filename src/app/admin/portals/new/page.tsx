'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function NewPortalPage() {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    domain: '',
    tagline: '',
    primary_color: '#C34751',
    secondary_color: '#6D6F7E',
    ga_measurement_id: '',
    gtm_container_id: '',
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))

    // Auto-generate slug and domain from name
    if (name === 'name') {
      const slug = value
        .toLowerCase()
        .replace(/\s+/g, '')
        .replace(/[^a-z0-9]/g, '')
      setFormData((prev) => ({
        ...prev,
        slug,
        domain: slug ? `${slug}.cz` : '',
      }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { error } = await supabase.from('portals').insert({
      name: formData.name,
      slug: formData.slug,
      domain: formData.domain,
      tagline: formData.tagline || null,
      primary_color: formData.primary_color,
      secondary_color: formData.secondary_color || null,
      ga_measurement_id: formData.ga_measurement_id || null,
      gtm_container_id: formData.gtm_container_id || null,
      is_active: true,
    })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    router.push('/admin/portals')
    router.refresh()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button asChild variant="ghost" size="icon">
          <Link href="/admin/portals">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Nový portál</h1>
          <p className="text-gray-500">Vytvořte nový kariérní portál</p>
        </div>
      </div>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Základní informace</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Název portálu *</Label>
              <Input
                id="name"
                name="name"
                placeholder="proStavare"
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
                  placeholder="prostavare"
                  value={formData.slug}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="domain">Doména *</Label>
                <Input
                  id="domain"
                  name="domain"
                  placeholder="prostavare.cz"
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
                placeholder="Propojujeme stavební firmy s talenty"
                value={formData.tagline}
                onChange={handleChange}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="primary_color">Primární barva *</Label>
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
                    placeholder="#C34751"
                    className="flex-1"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="secondary_color">Sekundární barva</Label>
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
                    placeholder="#6D6F7E"
                    className="flex-1"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
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
              <div className="space-y-2">
                <Label htmlFor="gtm_container_id">GTM Container ID</Label>
                <Input
                  id="gtm_container_id"
                  name="gtm_container_id"
                  placeholder="GT-XXXXXXXX"
                  value={formData.gtm_container_id}
                  onChange={handleChange}
                />
              </div>
            </div>

            {error && (
              <p className="text-sm text-red-600">{error}</p>
            )}

            <div className="flex gap-4 pt-4">
              <Button type="submit" disabled={loading}>
                {loading ? 'Ukládám...' : 'Vytvořit portál'}
              </Button>
              <Button asChild variant="outline">
                <Link href="/admin/portals">Zrušit</Link>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
