'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
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
import { Plus, Loader2, FileText, Pencil, Trash2, Tag, Eye } from 'lucide-react'
import { useAdminPortal } from '@/contexts/AdminPortalContext'
import { toast } from 'sonner'

type ArticleTag = {
  id: string
  name: string
  slug: string
}

type Article = {
  id: string
  portal_id: string
  title: string
  slug: string
  perex: string
  featured_image_url: string
  author_name: string
  status: 'draft' | 'published' | 'archived'
  sort_order: number
  published_at: string | null
  created_at: string
  portal: { id: string; name: string; slug: string; domain: string } | null
  tags: ArticleTag[]
}

const statusLabels: Record<string, { label: string; variant: 'default' | 'secondary' | 'outline' }> = {
  draft: { label: 'Rozpracováno', variant: 'secondary' },
  published: { label: 'Publikováno', variant: 'default' },
  archived: { label: 'Archivováno', variant: 'outline' },
}

function formatDate(dateString: string | null): string {
  if (!dateString) return '-'
  const date = new Date(dateString)
  return date.toLocaleDateString('cs-CZ', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })
}

export function ArticlesPageClient() {
  const { selectedPortalId, loading: portalLoading } = useAdminPortal()
  const [articles, setArticles] = useState<Article[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<string>('')

  const loadArticles = async () => {
    if (portalLoading) return
    setLoading(true)

    try {
      const params = new URLSearchParams()
      if (selectedPortalId) {
        params.set('portal_id', selectedPortalId)
      }
      if (statusFilter) {
        params.set('status', statusFilter)
      }

      const response = await fetch(`/api/admin/articles?${params}`)
      const data = await response.json()

      if (response.ok) {
        setArticles(data.articles || [])
      } else {
        toast.error(data.error || 'Nepodařilo se načíst články')
      }
    } catch (error) {
      console.error('Error loading articles:', error)
      toast.error('Nepodařilo se načíst články')
    }

    setLoading(false)
  }

  useEffect(() => {
    loadArticles()
  }, [selectedPortalId, portalLoading, statusFilter])

  const handleDelete = async (article: Article) => {
    if (!confirm(`Opravdu chcete smazat článek "${article.title}"?`)) {
      return
    }

    try {
      const response = await fetch(`/api/admin/articles/${article.id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        toast.success('Článek byl smazán')
        loadArticles()
      } else {
        const data = await response.json()
        toast.error(data.error || 'Nepodařilo se smazat článek')
      }
    } catch (error) {
      console.error('Error deleting article:', error)
      toast.error('Nepodařilo se smazat článek')
    }
  }

  const getArticleUrl = (article: Article) => {
    if (!article.portal) return '#'
    // Detect dev environment based on current admin URL
    const isDev = typeof window !== 'undefined' && window.location.hostname.includes('-dev.fun')
    const domain = isDev
      ? `${article.portal.slug}-dev.fun`
      : `${article.portal.slug}.cz`
    return `https://${domain}/clanky/${article.slug}`
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Články</h1>
          <p className="text-gray-500">
            {selectedPortalId
              ? 'Články ve vybraném portálu'
              : 'Správa článků a blogu'}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href="/admin/articles/tags">
              <Tag className="mr-2 h-4 w-4" />
              Tagy
            </Link>
          </Button>
          <Button asChild>
            <Link href="/admin/articles/new">
              <Plus className="mr-2 h-4 w-4" />
              Nový článek
            </Link>
          </Button>
        </div>
      </div>

      <div className="flex gap-2">
        <Button
          variant={statusFilter === '' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setStatusFilter('')}
        >
          Všechny
        </Button>
        <Button
          variant={statusFilter === 'draft' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setStatusFilter('draft')}
        >
          Rozpracované
        </Button>
        <Button
          variant={statusFilter === 'published' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setStatusFilter('published')}
        >
          Publikované
        </Button>
        <Button
          variant={statusFilter === 'archived' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setStatusFilter('archived')}
        >
          Archivované
        </Button>
      </div>

      <div className="bg-white rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-16">Obrázek</TableHead>
              <TableHead>Název</TableHead>
              {!selectedPortalId && <TableHead>Portál</TableHead>}
              <TableHead>Status</TableHead>
              <TableHead>Pořadí</TableHead>
              <TableHead>Publikováno</TableHead>
              <TableHead className="text-right">Akce</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {articles && articles.length > 0 ? (
              articles.map((article) => (
                <TableRow key={article.id}>
                  <TableCell>
                    <div className="w-12 h-12 rounded overflow-hidden bg-gray-100">
                      {article.featured_image_url && (
                        <Image
                          src={article.featured_image_url}
                          alt={article.title}
                          width={48}
                          height={48}
                          className="w-full h-full object-cover"
                        />
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="font-medium">{article.title}</div>
                      <div className="text-sm text-gray-500">
                        {article.author_name}
                      </div>
                      {article.tags.length > 0 && (
                        <div className="flex gap-1 flex-wrap">
                          {article.tags.map(tag => (
                            <Badge key={tag.id} variant="outline" className="text-xs">
                              {tag.name}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  {!selectedPortalId && (
                    <TableCell>
                      {article.portal ? (
                        <Badge variant="outline">{article.portal.name}</Badge>
                      ) : (
                        '-'
                      )}
                    </TableCell>
                  )}
                  <TableCell>
                    <Badge variant={statusLabels[article.status]?.variant || 'secondary'}>
                      {statusLabels[article.status]?.label || article.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <span className="text-gray-500">{article.sort_order}</span>
                  </TableCell>
                  <TableCell>
                    {formatDate(article.published_at)}
                  </TableCell>
                  <TableCell className="text-right space-x-1">
                    {article.status === 'published' && (
                      <Button
                        variant="ghost"
                        size="sm"
                        asChild
                      >
                        <a href={getArticleUrl(article)} target="_blank" rel="noopener noreferrer">
                          <Eye className="h-4 w-4" />
                        </a>
                      </Button>
                    )}
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={`/admin/articles/${article.id}`}>
                        <Pencil className="h-4 w-4" />
                      </Link>
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(article)}
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
                  colSpan={selectedPortalId ? 6 : 7}
                  className="text-center py-8 text-gray-500"
                >
                  <FileText className="h-12 w-12 mx-auto text-gray-300 mb-4" />
                  <p>Žádné články. Přidejte první článek.</p>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
