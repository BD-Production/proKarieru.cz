'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Plus, Loader2, Tag, Pencil, Trash2, ArrowLeft } from 'lucide-react'
import { useAdminPortal } from '@/contexts/AdminPortalContext'
import { toast } from 'sonner'

type ArticleTag = {
  id: string
  portal_id: string
  name: string
  slug: string
  created_at: string
  portal: { id: string; name: string; slug: string } | null
  article_count: number
}

function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function ArticleTagsPageClient() {
  const supabase = createClient()
  const { selectedPortalId, portals, loading: portalLoading } = useAdminPortal()
  const [tags, setTags] = useState<ArticleTag[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingTag, setEditingTag] = useState<ArticleTag | null>(null)
  const [formData, setFormData] = useState({
    portal_id: '',
    name: '',
    slug: ''
  })
  const [saving, setSaving] = useState(false)

  const loadTags = async () => {
    if (portalLoading) return
    setLoading(true)

    try {
      const params = new URLSearchParams()
      if (selectedPortalId) {
        params.set('portal_id', selectedPortalId)
      }

      const response = await fetch(`/api/admin/article-tags?${params}`)
      const data = await response.json()

      if (response.ok) {
        setTags(data.tags || [])
      } else {
        toast.error(data.error || 'Nepodařilo se načíst tagy')
      }
    } catch (error) {
      console.error('Error loading tags:', error)
      toast.error('Nepodařilo se načíst tagy')
    }

    setLoading(false)
  }

  useEffect(() => {
    loadTags()
  }, [selectedPortalId, portalLoading])

  const openCreateDialog = () => {
    setEditingTag(null)
    setFormData({
      portal_id: selectedPortalId || (portals[0]?.id || ''),
      name: '',
      slug: ''
    })
    setDialogOpen(true)
  }

  const openEditDialog = (tag: ArticleTag) => {
    setEditingTag(tag)
    setFormData({
      portal_id: tag.portal_id,
      name: tag.name,
      slug: tag.slug
    })
    setDialogOpen(true)
  }

  const handleNameChange = (name: string) => {
    setFormData(prev => ({
      ...prev,
      name,
      slug: editingTag ? prev.slug : generateSlug(name)
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      const url = editingTag
        ? `/api/admin/article-tags/${editingTag.id}`
        : '/api/admin/article-tags'

      const response = await fetch(url, {
        method: editingTag ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      const data = await response.json()

      if (response.ok) {
        toast.success(editingTag ? 'Tag byl aktualizován' : 'Tag byl vytvořen')
        setDialogOpen(false)
        loadTags()
      } else {
        toast.error(data.error || 'Nepodařilo se uložit tag')
      }
    } catch (error) {
      console.error('Error saving tag:', error)
      toast.error('Nepodařilo se uložit tag')
    }

    setSaving(false)
  }

  const handleDelete = async (tag: ArticleTag) => {
    if (!confirm(`Opravdu chcete smazat tag "${tag.name}"?`)) {
      return
    }

    try {
      const response = await fetch(`/api/admin/article-tags/${tag.id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        toast.success('Tag byl smazán')
        loadTags()
      } else {
        const data = await response.json()
        toast.error(data.error || 'Nepodařilo se smazat tag')
      }
    } catch (error) {
      console.error('Error deleting tag:', error)
      toast.error('Nepodařilo se smazat tag')
    }
  }

  if (loading || portalLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/admin/articles">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Zpět na články
          </Link>
        </Button>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Tagy článků</h1>
          <p className="text-gray-500">
            {selectedPortalId
              ? 'Tagy ve vybraném portálu'
              : 'Správa tagů pro články'}
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openCreateDialog}>
              <Plus className="mr-2 h-4 w-4" />
              Nový tag
            </Button>
          </DialogTrigger>
          <DialogContent>
            <form onSubmit={handleSubmit}>
              <DialogHeader>
                <DialogTitle>
                  {editingTag ? 'Upravit tag' : 'Nový tag'}
                </DialogTitle>
                <DialogDescription>
                  {editingTag
                    ? 'Upravte název nebo slug tagu'
                    : 'Vytvořte nový tag pro kategorizaci článků'}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="portal">Portál</Label>
                  <select
                    id="portal"
                    className="w-full px-3 py-2 border rounded-md"
                    value={formData.portal_id}
                    onChange={(e) => setFormData(prev => ({ ...prev, portal_id: e.target.value }))}
                    required
                    disabled={!!editingTag}
                  >
                    <option value="">Vyberte portál</option>
                    {portals.map(portal => (
                      <option key={portal.id} value={portal.id}>
                        {portal.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="name">Název</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleNameChange(e.target.value)}
                    placeholder="Např. Kariérní tipy"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="slug">Slug</Label>
                  <Input
                    id="slug"
                    value={formData.slug}
                    onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                    placeholder="karierni-tipy"
                    required
                  />
                  <p className="text-xs text-gray-500">
                    URL adresa tagu (automaticky generováno z názvu)
                  </p>
                </div>
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setDialogOpen(false)}
                >
                  Zrušit
                </Button>
                <Button type="submit" disabled={saving}>
                  {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {editingTag ? 'Uložit' : 'Vytvořit'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="bg-white rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Název</TableHead>
              <TableHead>Slug</TableHead>
              {!selectedPortalId && <TableHead>Portál</TableHead>}
              <TableHead>Počet článků</TableHead>
              <TableHead className="text-right">Akce</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tags && tags.length > 0 ? (
              tags.map((tag) => (
                <TableRow key={tag.id}>
                  <TableCell className="font-medium">{tag.name}</TableCell>
                  <TableCell className="text-gray-500">{tag.slug}</TableCell>
                  {!selectedPortalId && (
                    <TableCell>
                      {tag.portal ? (
                        <Badge variant="outline">{tag.portal.name}</Badge>
                      ) : (
                        '-'
                      )}
                    </TableCell>
                  )}
                  <TableCell>
                    <Badge variant="secondary">{tag.article_count}</Badge>
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openEditDialog(tag)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(tag)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={selectedPortalId ? 4 : 5}
                  className="text-center py-8 text-gray-500"
                >
                  <Tag className="h-12 w-12 mx-auto text-gray-300 mb-4" />
                  <p>Žádné tagy. Přidejte první tag.</p>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
