'use client'

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, Trash2, Plus, X } from 'lucide-react'
import Link from 'next/link'
import type { Company, HRContact } from '@/types/database'
import { LogoUpload } from '@/components/admin/LogoUpload'
import { Textarea } from '@/components/ui/textarea'

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
    featured: false,
    // Nova pole
    description: '',
    employee_count: '',
    years_on_market: '',
    location: [] as string[],
    sectors: [] as string[],
    opportunities: [] as string[],
    positions: [] as string[],
    benefits: [] as string[],
    hr_contact: { name: '', email: '', phone: '' } as HRContact,
  })

  // Stavy pro nove tagy
  const [newLocation, setNewLocation] = useState('')
  const [newSector, setNewSector] = useState('')
  const [newOpportunity, setNewOpportunity] = useState('')
  const [newPosition, setNewPosition] = useState('')
  const [newBenefit, setNewBenefit] = useState('')

  const loadCompany = async () => {
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
        featured: data.featured || false,
        // Nova pole
        description: data.description || '',
        employee_count: data.employee_count || '',
        years_on_market: data.years_on_market?.toString() || '',
        location: data.location || [],
        sectors: data.sectors || [],
        opportunities: data.opportunities || [],
        positions: data.positions || [],
        benefits: data.benefits || [],
        hr_contact: data.hr_contact || { name: '', email: '', phone: '' },
      })
    }
  }

  useEffect(() => {
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
        featured: formData.featured,
        // Nova pole
        description: formData.description || null,
        employee_count: formData.employee_count || null,
        years_on_market: formData.years_on_market ? parseInt(formData.years_on_market) : null,
        location: formData.location,
        sectors: formData.sectors,
        opportunities: formData.opportunities,
        positions: formData.positions,
        benefits: formData.benefits,
        hr_contact: formData.hr_contact,
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
    if (!confirm('Opravdu chcete smazat tuto firmu? Tato akce je nevratná.')) {
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

  const handleLogoUploadComplete = (logoUrl: string) => {
    setFormData((prev) => ({ ...prev, logo_url: logoUrl }))
    loadCompany() // Reload to show new logo
  }

  const handleLogoDelete = () => {
    setFormData((prev) => ({ ...prev, logo_url: '' }))
    loadCompany() // Reload to reflect deletion
  }

  // Helper pro pridani tagu do pole
  const addTag = (field: 'location' | 'sectors' | 'opportunities' | 'positions' | 'benefits', value: string) => {
    if (!value.trim()) return
    setFormData((prev) => ({
      ...prev,
      [field]: [...prev[field], value.trim()],
    }))
  }

  // Helper pro odebrani tagu z pole
  const removeTag = (field: 'location' | 'sectors' | 'opportunities' | 'positions' | 'benefits', index: number) => {
    setFormData((prev) => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index),
    }))
  }

  // Helper pro zmenu HR kontaktu
  const handleHRContactChange = (field: keyof HRContact, value: string) => {
    setFormData((prev) => ({
      ...prev,
      hr_contact: { ...prev.hr_contact, [field]: value },
    }))
  }

  // Komponenta pro zobrazeni tagu
  const TagList = ({
    tags,
    field,
    newValue,
    setNewValue,
    placeholder
  }: {
    tags: string[]
    field: 'location' | 'sectors' | 'opportunities' | 'positions' | 'benefits'
    newValue: string
    setNewValue: (v: string) => void
    placeholder: string
  }) => (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        {tags.map((tag, index) => (
          <span
            key={index}
            className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 rounded-md text-sm"
          >
            {tag}
            <button
              type="button"
              onClick={() => removeTag(field, index)}
              className="text-gray-500 hover:text-red-500"
            >
              <X className="h-3 w-3" />
            </button>
          </span>
        ))}
      </div>
      <div className="flex gap-2">
        <Input
          value={newValue}
          onChange={(e) => setNewValue(e.target.value)}
          placeholder={placeholder}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault()
              addTag(field, newValue)
              setNewValue('')
            }
          }}
        />
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={() => {
            addTag(field, newValue)
            setNewValue('')
          }}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )

  if (!company) {
    return <div className="p-8">Načítám...</div>
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
            {deleting ? 'Mažu...' : 'Smazat'}
          </Button>
        </div>
      </div>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Logo firmy</CardTitle>
        </CardHeader>
        <CardContent>
          <LogoUpload
            companyId={id}
            currentLogoUrl={formData.logo_url || null}
            onUploadComplete={handleLogoUploadComplete}
            onLogoDelete={handleLogoDelete}
          />
        </CardContent>
      </Card>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Základní informace</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Název firmy *</Label>
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
              <Label htmlFor="og_image_url">OG Image URL</Label>
              <Input
                id="og_image_url"
                name="og_image_url"
                placeholder="Pro sdílení na sociálních sítích"
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
              <Label htmlFor="is_active">Firma je aktivní</Label>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="featured"
                name="featured"
                checked={formData.featured}
                onChange={handleChange}
                className="rounded border-gray-300"
              />
              <Label htmlFor="featured">
                Zobrazit v Hero sekci
                <span className="text-gray-500 font-normal ml-1">(featured)</span>
              </Label>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Profil firmy</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="description">Popis firmy</Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
              placeholder="Krátký popis firmy pro studenty..."
              rows={4}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="employee_count">Počet zaměstnanců</Label>
              <Input
                id="employee_count"
                name="employee_count"
                value={formData.employee_count}
                onChange={handleChange}
                placeholder="např. 101-500"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="years_on_market">Roky na trhu</Label>
              <Input
                id="years_on_market"
                name="years_on_market"
                type="number"
                value={formData.years_on_market}
                onChange={handleChange}
                placeholder="např. 25"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Lokace</Label>
            <TagList
              tags={formData.location}
              field="location"
              newValue={newLocation}
              setNewValue={setNewLocation}
              placeholder="Přidej město (Enter)"
            />
          </div>

          <div className="space-y-2">
            <Label>Sektory / Obory</Label>
            <TagList
              tags={formData.sectors}
              field="sectors"
              newValue={newSector}
              setNewValue={setNewSector}
              placeholder="např. Pozemní stavby"
            />
          </div>

          <div className="space-y-2">
            <Label>Benefity</Label>
            <TagList
              tags={formData.benefits}
              field="benefits"
              newValue={newBenefit}
              setNewValue={setNewBenefit}
              placeholder="např. Home office"
            />
          </div>
        </CardContent>
      </Card>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Příležitosti a pozice</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Typy příležitostí</Label>
            <p className="text-xs text-gray-500">Co firma nabízí studentům</p>
            <TagList
              tags={formData.opportunities}
              field="opportunities"
              newValue={newOpportunity}
              setNewValue={setNewOpportunity}
              placeholder="např. Trainee program, Diplomka, Stáž"
            />
          </div>

          <div className="space-y-2">
            <Label>Hledané pozice</Label>
            <p className="text-xs text-gray-500">Jaké pozice firma obsazuje</p>
            <TagList
              tags={formData.positions}
              field="positions"
              newValue={newPosition}
              setNewValue={setNewPosition}
              placeholder="např. Projektant, Stavbyvedoucí"
            />
          </div>
        </CardContent>
      </Card>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>HR Kontakt</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="hr_name">Jméno kontaktní osoby</Label>
            <Input
              id="hr_name"
              value={formData.hr_contact.name || ''}
              onChange={(e) => handleHRContactChange('name', e.target.value)}
              placeholder="Jan Novák"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="hr_email">Email</Label>
            <Input
              id="hr_email"
              type="email"
              value={formData.hr_contact.email || ''}
              onChange={(e) => handleHRContactChange('email', e.target.value)}
              placeholder="hr@firma.cz"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="hr_phone">Telefon</Label>
            <Input
              id="hr_phone"
              value={formData.hr_contact.phone || ''}
              onChange={(e) => handleHRContactChange('phone', e.target.value)}
              placeholder="+420 123 456 789"
            />
          </div>
        </CardContent>
      </Card>

      {error && (
        <p className="text-sm text-red-600 max-w-2xl">{error}</p>
      )}

      <div className="flex gap-4 max-w-2xl">
        <Button onClick={handleSubmit} disabled={loading}>
          {loading ? 'Ukládám...' : 'Uložit změny'}
        </Button>
        <Button asChild variant="outline">
          <Link href="/admin/companies">Zrušit</Link>
        </Button>
      </div>
    </div>
  )
}
