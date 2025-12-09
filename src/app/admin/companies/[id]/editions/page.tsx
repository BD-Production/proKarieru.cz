'use client'

import { useState, useEffect, use } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, Plus, Trash2, Upload, X } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import type { Company, Edition, CompanyEdition, CompanyPage } from '@/types/database'

interface CompanyEditionWithPages extends CompanyEdition {
  edition: Edition & { portal: { name: string } }
  pages: CompanyPage[]
}

export default function CompanyEditionsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const supabase = createClient()
  const [company, setCompany] = useState<Company | null>(null)
  const [companyEditions, setCompanyEditions] = useState<CompanyEditionWithPages[]>([])
  const [availableEditions, setAvailableEditions] = useState<(Edition & { portal: { name: string } })[]>([])
  const [selectedEdition, setSelectedEdition] = useState('')
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState<string | null>(null)

  const loadData = async () => {
    const [companyResult, editionsResult, availableResult] = await Promise.all([
      supabase.from('companies').select('*').eq('id', id).single(),
      supabase
        .from('company_editions')
        .select(`
          *,
          edition:editions(*, portal:portals(name)),
          pages:company_pages(*)
        `)
        .eq('company_id', id)
        .order('created_at', { ascending: false }),
      supabase
        .from('editions')
        .select('*, portal:portals(name)')
        .order('year', { ascending: false }),
    ])

    if (companyResult.data) setCompany(companyResult.data)
    if (editionsResult.data) {
      setCompanyEditions(editionsResult.data as CompanyEditionWithPages[])
    }
    if (availableResult.data && editionsResult.data) {
      const assignedIds = editionsResult.data.map((ce) => ce.edition_id)
      const available = availableResult.data.filter((e) => !assignedIds.includes(e.id))
      setAvailableEditions(available as (Edition & { portal: { name: string } })[])
    }
  }

  useEffect(() => {
    loadData()
  }, [id])

  const handleAddEdition = async () => {
    if (!selectedEdition) return
    setLoading(true)

    const { error } = await supabase.from('company_editions').insert({
      company_id: id,
      edition_id: selectedEdition,
      display_order: 0,
    })

    if (!error) {
      setSelectedEdition('')
      await loadData()
    }
    setLoading(false)
  }

  const handleRemoveEdition = async (companyEditionId: string) => {
    if (!confirm('Opravdu chcete odebrat firmu z této edice? Všechny stránky budou smazány.')) {
      return
    }

    await supabase.from('company_editions').delete().eq('id', companyEditionId)
    await loadData()
  }

  const handleUploadPages = async (companyEditionId: string, files: FileList) => {
    setUploading(companyEditionId)

    // Get existing pages count
    const { data: existingPages } = await supabase
      .from('company_pages')
      .select('page_number')
      .eq('company_edition_id', companyEditionId)
      .order('page_number', { ascending: false })
      .limit(1)

    let nextPageNumber = (existingPages?.[0]?.page_number || 0) + 1

    for (const file of Array.from(files)) {
      const fileExt = file.name.split('.').pop()
      const fileName = `${id}/${companyEditionId}/${nextPageNumber}.${fileExt}`

      const { error: uploadError, data } = await supabase.storage
        .from('company-pages')
        .upload(fileName, file, { upsert: true })

      if (!uploadError && data) {
        const { data: { publicUrl } } = supabase.storage
          .from('company-pages')
          .getPublicUrl(fileName)

        await supabase.from('company_pages').insert({
          company_edition_id: companyEditionId,
          page_number: nextPageNumber,
          image_url: publicUrl,
        })

        nextPageNumber++
      }
    }

    await loadData()
    setUploading(null)
  }

  const handleDeletePage = async (pageId: string) => {
    if (!confirm('Opravdu chcete smazat tuto stránku?')) return

    await supabase.from('company_pages').delete().eq('id', pageId)
    await loadData()
  }

  if (!company) {
    return <div className="p-8">Načítám...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button asChild variant="ghost" size="icon">
          <Link href={`/admin/companies/${id}`}>
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Edice firmy</h1>
          <p className="text-gray-500">{company.name}</p>
        </div>
      </div>

      {/* Add to edition */}
      <Card>
        <CardHeader>
          <CardTitle>Přidat do edice</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <select
              value={selectedEdition}
              onChange={(e) => setSelectedEdition(e.target.value)}
              className="flex-1 px-3 py-2 border rounded-md"
            >
              <option value="">Vyberte edici</option>
              {availableEditions.map((edition) => (
                <option key={edition.id} value={edition.id}>
                  {edition.portal.name} - {edition.name}
                </option>
              ))}
            </select>
            <Button onClick={handleAddEdition} disabled={!selectedEdition || loading}>
              <Plus className="mr-2 h-4 w-4" />
              Přidat
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Existing editions */}
      {companyEditions.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-gray-500">
            Firma není přiřazena k žádné edici.
          </CardContent>
        </Card>
      ) : (
        companyEditions.map((ce) => (
          <Card key={ce.id}>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>{ce.edition.portal.name} - {ce.edition.name}</CardTitle>
                <p className="text-sm text-gray-500">
                  {ce.edition.year} {ce.edition.location && `| ${ce.edition.location}`}
                </p>
              </div>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => handleRemoveEdition(ce.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent>
              {/* Pages grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                {ce.pages
                  .sort((a, b) => a.page_number - b.page_number)
                  .map((page) => (
                    <div key={page.id} className="relative group">
                      <div className="aspect-[3/4] relative border rounded-lg overflow-hidden bg-gray-100">
                        <Image
                          src={page.image_url}
                          alt={`Stranka ${page.page_number}`}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="absolute top-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                        {page.page_number}
                      </div>
                      <button
                        onClick={() => handleDeletePage(page.id)}
                        className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}

                {/* Upload button */}
                <label className="aspect-[3/4] border-2 border-dashed rounded-lg flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors">
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => e.target.files && handleUploadPages(ce.id, e.target.files)}
                    disabled={uploading === ce.id}
                  />
                  {uploading === ce.id ? (
                    <span className="text-gray-500">Nahrávám...</span>
                  ) : (
                    <>
                      <Upload className="h-8 w-8 text-gray-400 mb-2" />
                      <span className="text-sm text-gray-500">Nahrát stránky</span>
                    </>
                  )}
                </label>
              </div>

              <p className="text-xs text-gray-500">
                Počet stránek: {ce.pages.length} | Nahrajte obrázky stránek brožury (webp, jpg, png)
              </p>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  )
}
