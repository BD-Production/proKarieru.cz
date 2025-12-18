'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Loader2,
  Upload,
  Trash2,
  Eye,
  EyeOff,
  GripVertical,
  ArrowUp,
  ArrowDown,
  RotateCcw,
  ExternalLink
} from 'lucide-react'
import { toast } from 'sonner'
import { useAdminPortal } from '@/contexts/AdminPortalContext'
import type { Edition, CatalogPage, Company } from '@/types/database'

interface CompanyWithOrder {
  company_id: string
  company: Company
  order_position: number
  is_visible: boolean
  has_custom_order: boolean
}

export default function AdminCatalogPage() {
  const supabase = createClient()
  const { selectedPortalId, portals, loading: portalLoading } = useAdminPortal()
  const [editions, setEditions] = useState<Edition[]>([])
  const [selectedEdition, setSelectedEdition] = useState<Edition | null>(null)
  const [loading, setLoading] = useState(true)
  const [introPages, setIntroPages] = useState<CatalogPage[]>([])
  const [outroPages, setOutroPages] = useState<CatalogPage[]>([])
  const [companies, setCompanies] = useState<CompanyWithOrder[]>([])
  const [hasCustomOrder, setHasCustomOrder] = useState(false)
  const [uploading, setUploading] = useState<'intro' | 'outro' | null>(null)
  const [saving, setSaving] = useState(false)
  const introInputRef = useRef<HTMLInputElement>(null)
  const outroInputRef = useRef<HTMLInputElement>(null)

  const currentPortal = portals.find(p => p.id === selectedPortalId)

  // Načíst edice pro vybraný portál
  useEffect(() => {
    const loadEditions = async () => {
      if (portalLoading || !selectedPortalId) {
        setEditions([])
        setSelectedEdition(null)
        return
      }

      setLoading(true)
      const { data } = await supabase
        .from('editions')
        .select('*')
        .eq('portal_id', selectedPortalId)
        .order('display_order', { ascending: true })

      setEditions(data || [])

      // Automaticky vybrat aktivní edici nebo první
      const activeEdition = data?.find(e => e.is_active) || data?.[0]
      setSelectedEdition(activeEdition || null)

      setLoading(false)
    }

    loadEditions()
  }, [selectedPortalId, portalLoading, supabase])

  // Načíst data katalogu pro vybranou edici
  const loadCatalogData = useCallback(async () => {
    if (!selectedEdition) {
      setIntroPages([])
      setOutroPages([])
      setCompanies([])
      return
    }

    // Načíst stránky
    const pagesResponse = await fetch(`/api/admin/catalog/pages?edition_id=${selectedEdition.id}`)
    const pagesData = await pagesResponse.json()
    setIntroPages(pagesData.introPages || [])
    setOutroPages(pagesData.outroPages || [])

    // Načíst pořadí firem
    const orderResponse = await fetch(`/api/admin/catalog/order?edition_id=${selectedEdition.id}`)
    const orderData = await orderResponse.json()
    setCompanies(orderData.companies || [])
    setHasCustomOrder(orderData.hasCustomOrder || false)
  }, [selectedEdition])

  useEffect(() => {
    loadCatalogData()
  }, [loadCatalogData])

  // Resize image
  const resizeImage = async (file: File): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        const img = new Image()
        img.onload = () => {
          const canvas = document.createElement('canvas')
          const ctx = canvas.getContext('2d')
          if (!ctx) {
            reject(new Error('No 2d context'))
            return
          }

          const maxSize = 1920
          let width = img.width
          let height = img.height

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
            (blob) => {
              if (!blob) {
                reject(new Error('Canvas is empty'))
                return
              }
              resolve(blob)
            },
            'image/webp',
            0.9
          )
        }
        img.onerror = () => reject(new Error('Failed to load image'))
        img.src = e.target?.result as string
      }
      reader.readAsDataURL(file)
    })
  }

  // Upload pages
  const handleUpload = async (files: FileList, type: 'intro' | 'outro') => {
    if (!selectedEdition || !selectedPortalId) return

    setUploading(type)

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i]

        if (!file.type.startsWith('image/')) {
          toast.error(`${file.name}: Soubor musí být obrázek`)
          continue
        }

        if (file.size > 10 * 1024 * 1024) {
          toast.error(`${file.name}: Soubor je příliš velký (max 10MB)`)
          continue
        }

        const resizedBlob = await resizeImage(file)
        const timestamp = Date.now()
        const fileName = `${currentPortal?.slug || 'unknown'}/${selectedEdition.id}/${type}/${timestamp}-${i}.webp`

        const { error: uploadError } = await supabase.storage
          .from('catalog-pages')
          .upload(fileName, resizedBlob, {
            contentType: 'image/webp',
            upsert: true
          })

        if (uploadError) {
          console.error('Upload error:', uploadError)
          toast.error(`Chyba při nahrávání ${file.name}`)
          continue
        }

        const { data: { publicUrl } } = supabase.storage
          .from('catalog-pages')
          .getPublicUrl(fileName)

        // Přidat do databáze
        const response = await fetch('/api/admin/catalog/pages', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            portal_id: selectedPortalId,
            edition_id: selectedEdition.id,
            type,
            image_url: publicUrl
          })
        })

        if (!response.ok) {
          toast.error(`Chyba při ukládání ${file.name}`)
        }
      }

      toast.success(`Nahráno ${files.length} stránek`)
      loadCatalogData()
    } catch (error) {
      console.error('Upload error:', error)
      toast.error('Chyba při nahrávání')
    } finally {
      setUploading(null)
    }
  }

  // Smazat stránku
  const handleDeletePage = async (pageId: string, type: 'intro' | 'outro') => {
    if (!confirm('Opravdu chcete smazat tuto stránku?')) return

    try {
      const response = await fetch(`/api/admin/catalog/pages/${pageId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        if (type === 'intro') {
          setIntroPages(prev => prev.filter(p => p.id !== pageId))
        } else {
          setOutroPages(prev => prev.filter(p => p.id !== pageId))
        }
        toast.success('Stránka byla smazána')
      } else {
        toast.error('Nepodařilo se smazat stránku')
      }
    } catch (error) {
      console.error('Delete error:', error)
      toast.error('Chyba při mazání')
    }
  }

  // Přesunout stránku
  const handleMovePage = async (pages: CatalogPage[], setPages: React.Dispatch<React.SetStateAction<CatalogPage[]>>, fromIndex: number, direction: 'up' | 'down') => {
    const toIndex = direction === 'up' ? fromIndex - 1 : fromIndex + 1
    if (toIndex < 0 || toIndex >= pages.length) return

    const newPages = [...pages]
    const [movedPage] = newPages.splice(fromIndex, 1)
    newPages.splice(toIndex, 0, movedPage)

    // Aktualizovat page_order
    const updatedPages = newPages.map((p, idx) => ({ ...p, page_order: idx }))
    setPages(updatedPages)

    // Uložit na server
    try {
      await fetch('/api/admin/catalog/pages', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pages: updatedPages.map(p => ({ id: p.id, page_order: p.page_order }))
        })
      })
    } catch (error) {
      console.error('Reorder error:', error)
    }
  }

  // Přesunout firmu
  const handleMoveCompany = (fromIndex: number, direction: 'up' | 'down') => {
    const toIndex = direction === 'up' ? fromIndex - 1 : fromIndex + 1
    if (toIndex < 0 || toIndex >= companies.length) return

    const newCompanies = [...companies]
    const [movedCompany] = newCompanies.splice(fromIndex, 1)
    newCompanies.splice(toIndex, 0, movedCompany)

    // Aktualizovat order_position
    const updatedCompanies = newCompanies.map((c, idx) => ({
      ...c,
      order_position: idx,
      has_custom_order: true
    }))
    setCompanies(updatedCompanies)
    setHasCustomOrder(true)
  }

  // Přepnout viditelnost firmy
  const handleToggleVisibility = (companyId: string) => {
    setCompanies(prev => prev.map(c =>
      c.company_id === companyId
        ? { ...c, is_visible: !c.is_visible, has_custom_order: true }
        : c
    ))
    setHasCustomOrder(true)
  }

  // Uložit pořadí firem
  const handleSaveOrder = async () => {
    if (!selectedEdition || !selectedPortalId) return

    setSaving(true)
    try {
      const response = await fetch('/api/admin/catalog/order', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          edition_id: selectedEdition.id,
          portal_id: selectedPortalId,
          companies: companies.map(c => ({
            company_id: c.company_id,
            order_position: c.order_position,
            is_visible: c.is_visible
          }))
        })
      })

      if (response.ok) {
        toast.success('Pořadí bylo uloženo')
        setCompanies(prev => prev.map(c => ({ ...c, has_custom_order: true })))
      } else {
        toast.error('Nepodařilo se uložit pořadí')
      }
    } catch (error) {
      console.error('Save order error:', error)
      toast.error('Chyba při ukládání')
    } finally {
      setSaving(false)
    }
  }

  // Resetovat pořadí na abecední
  const handleResetOrder = async () => {
    if (!selectedEdition) return
    if (!confirm('Opravdu chcete resetovat pořadí na abecední?')) return

    setSaving(true)
    try {
      const response = await fetch(`/api/admin/catalog/order?edition_id=${selectedEdition.id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        toast.success('Pořadí bylo resetováno')
        loadCatalogData()
      } else {
        toast.error('Nepodařilo se resetovat pořadí')
      }
    } catch (error) {
      console.error('Reset order error:', error)
      toast.error('Chyba při resetování')
    } finally {
      setSaving(false)
    }
  }

  // Render upload area
  const renderUploadArea = (type: 'intro' | 'outro', inputRef: React.RefObject<HTMLInputElement | null>) => (
    <div
      className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:border-gray-400 transition-colors"
      onClick={() => inputRef.current?.click()}
    >
      {uploading === type ? (
        <Loader2 className="w-8 h-8 mx-auto animate-spin text-gray-400" />
      ) : (
        <Upload className="w-8 h-8 mx-auto text-gray-400" />
      )}
      <p className="text-sm font-medium mt-2">
        {uploading === type ? 'Nahrávání...' : 'Přetáhněte obrázky sem nebo klikněte'}
      </p>
      <p className="text-xs text-gray-500 mt-1">
        PNG, JPG nebo WebP • Max 10MB • Formát A5 (148×210 mm)
      </p>
      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        multiple
        onChange={(e) => e.target.files && handleUpload(e.target.files, type)}
        className="hidden"
      />
    </div>
  )

  // Render pages grid
  const renderPagesGrid = (
    pages: CatalogPage[],
    setPages: React.Dispatch<React.SetStateAction<CatalogPage[]>>,
    type: 'intro' | 'outro'
  ) => {
    if (pages.length === 0) {
      return <p className="text-sm text-gray-500 text-center py-4">Žádné stránky</p>
    }

    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {pages.sort((a, b) => a.page_order - b.page_order).map((page, index) => (
          <div key={page.id} className="relative group border rounded-lg overflow-hidden bg-gray-50">
            <div className="aspect-[148/210]"> {/* A5 format */}
              <img
                src={`${page.image_url}?v=${Date.now()}`}
                alt={`${type === 'intro' ? 'Intro' : 'Outro'} strana ${index + 1}`}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Overlay s kontrolami */}
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
              <div className="flex gap-2">
                {index > 0 && (
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => handleMovePage(pages, setPages, index, 'up')}
                  >
                    <ArrowUp className="h-4 w-4" />
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => handleDeletePage(page.id, type)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
                {index < pages.length - 1 && (
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => handleMovePage(pages, setPages, index, 'down')}
                  >
                    <ArrowDown className="h-4 w-4" />
                  </Button>
                )}
              </div>
              <span className="text-white text-xs">Strana {index + 1}</span>
            </div>

            {/* Číslo stránky */}
            <div className="absolute top-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
              {index + 1}
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (portalLoading || loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    )
  }

  if (!selectedPortalId) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Vyberte portál v postranním menu</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Katalog online</h1>
          <p className="text-gray-500">Správa intro/outro stránek a pořadí firem v online katalogu</p>
        </div>
        {selectedEdition && currentPortal && (
          <Button asChild variant="outline">
            <a
              href={`/katalog/online?portal=${currentPortal.slug}&edition=${selectedEdition.id}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <ExternalLink className="mr-2 h-4 w-4" />
              Náhled katalogu
            </a>
          </Button>
        )}
      </div>

      {/* Výběr edice */}
      {editions.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>Vyberte edici</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {editions.map(edition => (
                <Button
                  key={edition.id}
                  variant={selectedEdition?.id === edition.id ? 'default' : 'outline'}
                  onClick={() => setSelectedEdition(edition)}
                >
                  {edition.name}
                  {edition.is_active && (
                    <Badge variant="secondary" className="ml-2">Aktivní</Badge>
                  )}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-gray-500">Žádné edice. Nejdříve vytvořte edici v sekci Edice.</p>
          </CardContent>
        </Card>
      )}

      {selectedEdition && (
        <Tabs defaultValue="intro" className="space-y-6">
          <TabsList>
            <TabsTrigger value="intro">
              Intro stránky ({introPages.length})
            </TabsTrigger>
            <TabsTrigger value="companies">
              Pořadí firem ({companies.length})
            </TabsTrigger>
            <TabsTrigger value="outro">
              Outro stránky ({outroPages.length})
            </TabsTrigger>
          </TabsList>

          {/* Intro stránky */}
          <TabsContent value="intro">
            <Card>
              <CardHeader>
                <CardTitle>Intro stránky</CardTitle>
                <CardDescription>
                  Úvodní stránky katalogu zobrazené před firmami (např. titulní strana, obsah, úvod)
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {renderPagesGrid(introPages, setIntroPages, 'intro')}
                {renderUploadArea('intro', introInputRef)}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Pořadí firem */}
          <TabsContent value="companies">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Pořadí firem v katalogu</CardTitle>
                    <CardDescription>
                      Nastavte pořadí firem a jejich viditelnost v online katalogu.
                      Firmy skryté v katalogu zůstanou viditelné na hlavní stránce.
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    {hasCustomOrder && (
                      <Button
                        variant="outline"
                        onClick={handleResetOrder}
                        disabled={saving}
                      >
                        <RotateCcw className="mr-2 h-4 w-4" />
                        Resetovat na abecední
                      </Button>
                    )}
                    <Button onClick={handleSaveOrder} disabled={saving}>
                      {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Uložit pořadí
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {companies.length === 0 ? (
                  <p className="text-sm text-gray-500 text-center py-8">
                    Žádné firmy v této edici. Přiřaďte firmy k edici v sekci Firmy.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {companies.map((company, index) => (
                      <div
                        key={company.company_id}
                        className={`flex items-center gap-4 p-3 border rounded-lg ${
                          company.is_visible ? 'bg-white' : 'bg-gray-50 opacity-60'
                        }`}
                      >
                        <GripVertical className="h-5 w-5 text-gray-400" />

                        <span className="w-8 text-sm text-gray-500 font-mono">
                          {index + 1}.
                        </span>

                        {company.company?.logo_url && (
                          <img
                            src={`${company.company.logo_url}?v=${Date.now()}`}
                            alt={company.company.name}
                            className="w-10 h-10 object-contain bg-gray-100 rounded"
                          />
                        )}

                        <span className="flex-1 font-medium">
                          {company.company?.name || 'Neznámá firma'}
                        </span>

                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleToggleVisibility(company.company_id)}
                            title={company.is_visible ? 'Skrýt v katalogu' : 'Zobrazit v katalogu'}
                          >
                            {company.is_visible ? (
                              <Eye className="h-4 w-4" />
                            ) : (
                              <EyeOff className="h-4 w-4" />
                            )}
                          </Button>

                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleMoveCompany(index, 'up')}
                            disabled={index === 0}
                          >
                            <ArrowUp className="h-4 w-4" />
                          </Button>

                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleMoveCompany(index, 'down')}
                            disabled={index === companies.length - 1}
                          >
                            <ArrowDown className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Outro stránky */}
          <TabsContent value="outro">
            <Card>
              <CardHeader>
                <CardTitle>Outro stránky</CardTitle>
                <CardDescription>
                  Závěrečné stránky katalogu zobrazené za firmami (např. partneři, kontakty, tiráž)
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {renderPagesGrid(outroPages, setOutroPages, 'outro')}
                {renderUploadArea('outro', outroInputRef)}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  )
}
