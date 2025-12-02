'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import type { Portal } from '@/types/database'

export default function NewEditionPage() {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [portals, setPortals] = useState<Portal[]>([])

  const [formData, setFormData] = useState({
    portal_id: '',
    name: '',
    year: new Date().getFullYear(),
    season: '',
    location: '',
    display_order: 0,
  })

  useEffect(() => {
    async function loadPortals() {
      const { data } = await supabase
        .from('portals')
        .select('*')
        .eq('is_active', true)
        .order('name')
      if (data) setPortals(data)
    }
    loadPortals()
  }, [supabase])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'year' || name === 'display_order' ? parseInt(value) || 0 : value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { error } = await supabase.from('editions').insert({
      portal_id: formData.portal_id,
      name: formData.name,
      year: formData.year,
      season: formData.season || null,
      location: formData.location || null,
      display_order: formData.display_order,
      is_active: false,
    })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    router.push('/admin/editions')
    router.refresh()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button asChild variant="ghost" size="icon">
          <Link href="/admin/editions">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Nova edice</h1>
          <p className="text-gray-500">Vytvorte novou edici brozury</p>
        </div>
      </div>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Zakladni informace</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="portal_id">Portal *</Label>
              <select
                id="portal_id"
                name="portal_id"
                value={formData.portal_id}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border rounded-md"
              >
                <option value="">Vyberte portal</option>
                {portals.map((portal) => (
                  <option key={portal.id} value={portal.id}>
                    {portal.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">Nazev edice *</Label>
              <Input
                id="name"
                name="name"
                placeholder="Jaro 2025 Praha"
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
                <Label htmlFor="season">Sezona</Label>
                <select
                  id="season"
                  name="season"
                  value={formData.season}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-md"
                >
                  <option value="">Bez sezony</option>
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
                  placeholder="Praha, Brno + Ostrava"
                  value={formData.location}
                  onChange={handleChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="display_order">Poradi zobrazeni</Label>
                <Input
                  type="number"
                  id="display_order"
                  name="display_order"
                  value={formData.display_order}
                  onChange={handleChange}
                />
              </div>
            </div>

            {error && (
              <p className="text-sm text-red-600">{error}</p>
            )}

            <div className="flex gap-4 pt-4">
              <Button type="submit" disabled={loading}>
                {loading ? 'Ukladam...' : 'Vytvorit edici'}
              </Button>
              <Button asChild variant="outline">
                <Link href="/admin/editions">Zrusit</Link>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
