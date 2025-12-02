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
import type { Company } from '@/types/database'

export default function EditCompanyPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [company, setCompany] = useState<Company | null>(null)

  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    logo_url: '',
    og_image_url: '',
    is_active: true,
  })

  useEffect(() => {
    async function loadCompany() {
      const { data } = await supabase
        .from('companies')
        .select('*')
        .eq('id', id)
        .single()

      if (data) {
        setCompany(data)
        setFormData({
          name: data.name,
          slug: data.slug,
          logo_url: data.logo_url || '',
          og_image_url: data.og_image_url || '',
          is_active: data.is_active,
        })
      }
    }
    loadCompany()
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
      .from('companies')
      .update({
        name: formData.name,
        slug: formData.slug,
        logo_url: formData.logo_url || null,
        og_image_url: formData.og_image_url || null,
        is_active: formData.is_active,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    router.push('/admin/companies')
    router.refresh()
  }

  const handleDelete = async () => {
    if (!confirm('Opravdu chcete smazat tuto firmu? Tato akce je nevratna.')) {
      return
    }

    setDeleting(true)
    const { error } = await supabase.from('companies').delete().eq('id', id)

    if (error) {
      setError(error.message)
      setDeleting(false)
      return
    }

    router.push('/admin/companies')
    router.refresh()
  }

  if (!company) {
    return <div className="p-8">Nacitam...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button asChild variant="ghost" size="icon">
            <Link href="/admin/companies">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Upravit firmu</h1>
            <p className="text-gray-500">{company.name}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline">
            <Link href={`/admin/companies/${id}/editions`}>Spravovat edice</Link>
          </Button>
          <Button variant="destructive" onClick={handleDelete} disabled={deleting}>
            <Trash2 className="mr-2 h-4 w-4" />
            {deleting ? 'Mazu...' : 'Smazat'}
          </Button>
        </div>
      </div>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Zakladni informace</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nazev firmy *</Label>
              <Input
                id="name"
                name="name"
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
                value={formData.slug}
                onChange={handleChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="logo_url">URL loga</Label>
              <Input
                id="logo_url"
                name="logo_url"
                value={formData.logo_url}
                onChange={handleChange}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="og_image_url">OG Image URL</Label>
              <Input
                id="og_image_url"
                name="og_image_url"
                placeholder="Pro sdileni na socialnich sitich"
                value={formData.og_image_url}
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
              <Label htmlFor="is_active">Firma je aktivni</Label>
            </div>

            {error && (
              <p className="text-sm text-red-600">{error}</p>
            )}

            <div className="flex gap-4 pt-4">
              <Button type="submit" disabled={loading}>
                {loading ? 'Ukladam...' : 'Ulozit zmeny'}
              </Button>
              <Button asChild variant="outline">
                <Link href="/admin/companies">Zrusit</Link>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
