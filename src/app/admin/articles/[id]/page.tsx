'use client'

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Loader2, X, ChevronDown, ChevronUp, Trash2, Eye, GripVertical } from 'lucide-react'
import Link from 'next/link'
import type { Portal, ArticleTag, ArticleGalleryImage } from '@/types/database'
import { ArticleImageUpload } from '@/components/admin/ArticleImageUpload'
import { ArticleGalleryUpload } from '@/components/admin/ArticleGalleryUpload'
import { useAdminPortal } from '@/contexts/AdminPortalContext'
import { toast } from 'sonner'

function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export default function EditArticlePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const supabase = createClient()
  const { portals } = useAdminPortal()
  const [loading, setLoading] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [tags, setTags] = useState<ArticleTag[]>([])
  const [gallery, setGallery] = useState<ArticleGalleryImage[]>([])
  const [ogOpen, setOgOpen] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)

  const [formData, setFormData] = useState({
    portal_id: '',
    title: '',
    slug: '',
    perex: '',
    content: '',
    featured_image_url: '',
    author_name: '',
    status: 'draft' as 'draft' | 'published' | 'archived',
    sort_order: 0,
    og_title: '',
    og_description: '',
    og_image_url: '',
    tag_ids: [] as string[]
  })

  const [articlePortal, setArticlePortal] = useState<{ domain: string; slug: string } | null>(null)

  useEffect(() => {
    const loadArticle = async () => {
      try {
        const response = await fetch(`/api/admin/articles/${id}`)
        const data = await response.json()

        if (response.ok && data.article) {
          const article = data.article
          setFormData({
            portal_id: article.portal_id,
            title: article.title,
            slug: article.slug,
            perex: article.perex,
            content: article.content,
            featured_image_url: article.featured_image_url,
            author_name: article.author_name,
            status: article.status,
            sort_order: article.sort_order,
            og_title: article.og_title || '',
            og_description: article.og_description || '',
            og_image_url: article.og_image_url || '',
            tag_ids: article.tags?.map((t: ArticleTag) => t.id) || []
          })
          setGallery(article.gallery || [])
          if (article.portal) {
            setArticlePortal({ domain: article.portal.domain, slug: article.portal.slug })
          }
        } else {
          toast.error('Článek nenalezen')
          router.push('/admin/articles')
        }
      } catch (error) {
        console.error('Error loading article:', error)
        toast.error('Nepodařilo se načíst článek')
      } finally {
        setInitialLoading(false)
      }
    }

    loadArticle()
  }, [id, router])

  useEffect(() => {
    const loadTags = async () => {
      if (!formData.portal_id) return

      const { data } = await supabase
        .from('article_tags')
        .select('*')
        .eq('portal_id', formData.portal_id)
        .order('name')

      setTags(data || [])
    }

    loadTags()
  }, [formData.portal_id, supabase])

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target
    const newValue = type === 'number' ? parseInt(value) || 0 : value

    setFormData((prev) => ({
      ...prev,
      [name]: newValue
    }))
  }

  const handleTagToggle = (tagId: string) => {
    setFormData(prev => ({
      ...prev,
      tag_ids: prev.tag_ids.includes(tagId)
        ? prev.tag_ids.filter(id => id !== tagId)
        : [...prev.tag_ids, tagId]
    }))
  }

  const handleSubmit = async (e: React.FormEvent, publish: boolean = false) => {
    e.preventDefault()
    console.log('handleSubmit called', { publish, formData })

    if (!formData.portal_id) {
      console.log('Missing portal_id')
      toast.error('Vyberte portál')
      return
    }

    if (!formData.featured_image_url) {
      console.log('Missing featured_image_url')
      toast.error('Nahrajte hlavní obrázek')
      return
    }

    console.log('Starting fetch...')
    setLoading(true)

    try {
      const submitData = {
        ...formData,
        status: publish ? 'published' : formData.status
      }

      const response = await fetch(`/api/admin/articles/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submitData)
      })

      const data = await response.json()

      if (response.ok) {
        toast.success(publish ? 'Článek byl publikován' : 'Článek byl uložen')
        router.push('/admin/articles')
        router.refresh()
      } else {
        toast.error(data.error || 'Nepodařilo se uložit článek')
      }
    } catch (error) {
      console.error('Error saving article:', error)
      toast.error('Nepodařilo se uložit článek')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Opravdu chcete smazat tento článek? Tato akce je nevratná.')) {
      return
    }

    setDeleting(true)

    try {
      const response = await fetch(`/api/admin/articles/${id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        toast.success('Článek byl smazán')
        router.push('/admin/articles')
        router.refresh()
      } else {
        const data = await response.json()
        toast.error(data.error || 'Nepodařilo se smazat článek')
      }
    } catch (error) {
      console.error('Error deleting article:', error)
      toast.error('Nepodařilo se smazat článek')
    } finally {
      setDeleting(false)
    }
  }

  const getPreviewUrl = () => {
    if (!articlePortal?.slug) return '#'
    // Detect dev environment based on current admin URL
    const isDev = typeof window !== 'undefined' && window.location.hostname.includes('-dev.fun')
    const domain = isDev
      ? `${articlePortal.slug}-dev.fun`
      : `${articlePortal.slug}.cz`
    return `https://${domain}/clanky/${formData.slug}`
  }

  if (initialLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button asChild variant="ghost" size="icon">
            <Link href="/admin/articles">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Upravit článek</h1>
            <p className="text-gray-500">{formData.title}</p>
          </div>
        </div>
        <div className="flex gap-2">
          {formData.status === 'published' && (
            <Button variant="outline" asChild>
              <a href={getPreviewUrl()} target="_blank" rel="noopener noreferrer">
                <Eye className="mr-2 h-4 w-4" />
                Zobrazit
              </a>
            </Button>
          )}
          <Button variant="destructive" onClick={handleDelete} disabled={deleting}>
            <Trash2 className="mr-2 h-4 w-4" />
            {deleting ? 'Mažu...' : 'Smazat'}
          </Button>
        </div>
      </div>

      <form onSubmit={(e) => handleSubmit(e, false)}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Hlavní obsah */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Základní údaje</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
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
                  <Label htmlFor="title">Název článku *</Label>
                  <Input
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    placeholder="Jak najít práci ve stavebnictví"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="slug">URL slug *</Label>
                  <Input
                    id="slug"
                    name="slug"
                    value={formData.slug}
                    onChange={handleChange}
                    placeholder="jak-najit-praci-ve-stavebnictvi"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="author_name">Autor *</Label>
                  <Input
                    id="author_name"
                    name="author_name"
                    value={formData.author_name}
                    onChange={handleChange}
                    placeholder="Jan Novák"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="perex">Perex *</Label>
                  <Textarea
                    id="perex"
                    name="perex"
                    value={formData.perex}
                    onChange={handleChange}
                    placeholder="Krátký úvod článku zobrazený v náhledu..."
                    rows={3}
                    required
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Obsah článku</CardTitle>
                <CardDescription>
                  Obsah ve formátu Markdown. Pro YouTube video: ::youtube[VIDEO_ID]
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Textarea
                  id="content"
                  name="content"
                  value={formData.content}
                  onChange={handleChange}
                  rows={20}
                  className="font-mono text-sm"
                  required
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Galerie obrázků</CardTitle>
                <CardDescription>
                  Přidejte další obrázky k článku
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ArticleGalleryUpload
                  articleId={id}
                  gallery={gallery}
                  onGalleryChange={setGallery}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader
                className="cursor-pointer"
                onClick={() => setOgOpen(!ogOpen)}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>OpenGraph (volitelné)</CardTitle>
                    <CardDescription>
                      Vlastní metadata pro sdílení na sociálních sítích
                    </CardDescription>
                  </div>
                  {ogOpen ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                </div>
              </CardHeader>
              {ogOpen && (
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="og_title">OG Titulek</Label>
                    <Input
                      id="og_title"
                      name="og_title"
                      value={formData.og_title}
                      onChange={handleChange}
                      placeholder="Ponechte prázdné pro použití názvu článku"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="og_description">OG Popis</Label>
                    <Textarea
                      id="og_description"
                      name="og_description"
                      value={formData.og_description}
                      onChange={handleChange}
                      placeholder="Ponechte prázdné pro použití perexu"
                      rows={2}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>OG Obrázek</Label>
                    <ArticleImageUpload
                      articleId={id}
                      currentImageUrl={formData.og_image_url || null}
                      onUploadComplete={(url) => setFormData(prev => ({ ...prev, og_image_url: url }))}
                      onImageDelete={() => setFormData(prev => ({ ...prev, og_image_url: '' }))}
                      label="OG Obrázek"
                      maxSize={1200}
                    />
                    <p className="text-xs text-gray-500">
                      Ponechte prázdné pro použití hlavního obrázku.
                      Ideální rozměr: 1200×630 px pro Facebook/LinkedIn.
                    </p>
                  </div>
                </CardContent>
              )}
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Hlavní obrázek *</CardTitle>
              </CardHeader>
              <CardContent>
                <ArticleImageUpload
                  articleId={id}
                  currentImageUrl={formData.featured_image_url || null}
                  onUploadComplete={(url) => setFormData(prev => ({ ...prev, featured_image_url: url }))}
                  onImageDelete={() => setFormData(prev => ({ ...prev, featured_image_url: '' }))}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Publikace</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <select
                    id="status"
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border rounded-md"
                  >
                    <option value="draft">Rozpracováno</option>
                    <option value="published">Publikováno</option>
                    <option value="archived">Archivováno</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="sort_order">Pořadí</Label>
                  <Input
                    type="number"
                    id="sort_order"
                    name="sort_order"
                    value={formData.sort_order}
                    onChange={handleChange}
                  />
                  <p className="text-xs text-gray-500">
                    Nižší číslo = vyšší pozice
                  </p>
                </div>
              </CardContent>
            </Card>

            {tags.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Tagy</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {tags.map(tag => (
                      <Badge
                        key={tag.id}
                        variant={formData.tag_ids.includes(tag.id) ? 'default' : 'outline'}
                        className="cursor-pointer"
                        onClick={() => handleTagToggle(tag.id)}
                      >
                        {tag.name}
                        {formData.tag_ids.includes(tag.id) && (
                          <X className="ml-1 h-3 w-3" />
                        )}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardContent className="pt-6 space-y-2">
                <Button
                  type="button"
                  className="w-full"
                  onClick={(e) => handleSubmit(e as unknown as React.FormEvent, true)}
                  disabled={loading}
                >
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Publikovat
                </Button>
                <Button
                  type="submit"
                  variant="outline"
                  className="w-full"
                  disabled={loading}
                >
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Uložit změny
                </Button>
                <Button asChild variant="ghost" className="w-full">
                  <Link href="/admin/articles">Zrušit</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </div>
  )
}
