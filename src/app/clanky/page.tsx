import { headers } from 'next/headers'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/server'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Calendar, User, FileText, ArrowRight } from 'lucide-react'
import { PortalHeader } from '@/components/PortalHeader'
import { PortalFooter } from '@/components/PortalFooter'
import type { Metadata } from 'next'
import type { ArticleTag } from '@/types/database'

interface ArticlesPageProps {
  searchParams: Promise<{ tag?: string }>
}

export async function generateMetadata(): Promise<Metadata> {
  const headersList = await headers()
  const portalSlug = headersList.get('x-portal-slug')

  const supabase = await createClient()

  const { data: portal } = await supabase
    .from('portals')
    .select('name')
    .eq('slug', portalSlug)
    .single()

  return {
    title: `Články | ${portal?.name || 'proKariéru'}`,
    description: `Přečtěte si naše články o kariéře a práci v oboru.`,
  }
}

function formatDate(dateString: string | null): string {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleDateString('cs-CZ', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })
}

function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength).trim() + '...'
}

export default async function ArticlesPage({ searchParams }: ArticlesPageProps) {
  const { tag: tagSlug } = await searchParams
  const headersList = await headers()
  const portalSlug = headersList.get('x-portal-slug')

  const supabase = await createClient()

  // Get portal
  const { data: portal } = await supabase
    .from('portals')
    .select('*')
    .eq('slug', portalSlug)
    .eq('is_active', true)
    .single()

  if (!portal) {
    notFound()
  }

  // Get all tags for this portal
  const { data: allTags } = await supabase
    .from('article_tags')
    .select('*')
    .eq('portal_id', portal.id)
    .order('name')

  // Get articles
  let articlesQuery = supabase
    .from('articles')
    .select(`
      id,
      title,
      slug,
      perex,
      featured_image_url,
      author_name,
      published_at,
      sort_order,
      article_tag_relations(
        tag:article_tags(id, name, slug)
      )
    `)
    .eq('portal_id', portal.id)
    .eq('status', 'published')
    .order('sort_order', { ascending: true })

  // Filter by tag if provided
  let selectedTag: ArticleTag | null = null
  if (tagSlug) {
    const { data: tag } = await supabase
      .from('article_tags')
      .select('*')
      .eq('portal_id', portal.id)
      .eq('slug', tagSlug)
      .single()

    if (tag) {
      selectedTag = tag

      // Get article IDs with this tag
      const { data: relations } = await supabase
        .from('article_tag_relations')
        .select('article_id')
        .eq('tag_id', tag.id)

      if (relations && relations.length > 0) {
        const articleIds = relations.map(r => r.article_id)
        articlesQuery = articlesQuery.in('id', articleIds)
      } else {
        // No articles with this tag
        return (
          <ArticlesLayout portal={portal} allTags={allTags || []} selectedTag={selectedTag}>
            <EmptyState message={`Žádné články s tagem "${tag.name}"`} />
          </ArticlesLayout>
        )
      }
    }
  }

  const { data: articles } = await articlesQuery

  // Transform articles
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const transformedArticles = articles?.map((article: any) => ({
    ...article,
    tags: article.article_tag_relations
      ?.map((r: { tag: ArticleTag }) => r.tag)
      .filter(Boolean) || []
  })) || []

  return (
    <ArticlesLayout portal={portal} allTags={allTags || []} selectedTag={selectedTag}>
      {transformedArticles.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {transformedArticles.map(article => (
            <ArticleCard
              key={article.id}
              article={article}
              primaryColor={portal.primary_color}
            />
          ))}
        </div>
      ) : (
        <EmptyState message="Zatím nemáme žádné články" />
      )}
    </ArticlesLayout>
  )
}

// Layout component
function ArticlesLayout({
  portal,
  allTags,
  selectedTag,
  children
}: {
  portal: { name: string; primary_color: string; domain: string }
  allTags: ArticleTag[]
  selectedTag: ArticleTag | null
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <PortalHeader
        portalName={portal.name}
        primaryColor={portal.primary_color}
        currentPage="clanky"
      />

      <main className="flex-1 py-8 md:py-12 px-4">
        <div className="max-w-6xl mx-auto">
          {/* Page header */}
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold mb-2">Články</h1>
            <p className="text-gray-600">
              Tipy a informace o kariéře v oboru
            </p>
          </div>

          {/* Tags filter */}
          {allTags.length > 0 && (
            <div className="mb-8">
              <div className="flex flex-wrap gap-2">
                <Link href="/clanky">
                  <Badge
                    variant={!selectedTag ? 'default' : 'outline'}
                    className="cursor-pointer hover:bg-gray-100"
                  >
                    Všechny
                  </Badge>
                </Link>
                {allTags.map(tag => (
                  <Link key={tag.id} href={`/clanky?tag=${tag.slug}`}>
                    <Badge
                      variant={selectedTag?.id === tag.id ? 'default' : 'outline'}
                      className="cursor-pointer hover:bg-gray-100"
                    >
                      {tag.name}
                    </Badge>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {children}
        </div>
      </main>

      {/* Footer */}
      <PortalFooter />
    </div>
  )
}

// Article card component
function ArticleCard({
  article,
  primaryColor
}: {
  article: {
    id: string
    title: string
    slug: string
    perex: string
    featured_image_url: string
    author_name: string
    published_at: string | null
    tags: ArticleTag[]
  }
  primaryColor: string
}) {
  return (
    <Link href={`/clanky/${article.slug}`}>
      <Card className="h-full overflow-hidden hover:shadow-lg transition-shadow group p-0">
        <div className="relative aspect-[16/10] bg-gray-100 -m-px">
          <Image
            src={article.featured_image_url}
            alt={article.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>
        <CardContent className="p-4">
          {/* Tags */}
          {article.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-2">
              {article.tags.slice(0, 2).map(tag => (
                <Badge key={tag.id} variant="secondary" className="text-xs">
                  {tag.name}
                </Badge>
              ))}
            </div>
          )}

          <h2 className="font-bold text-lg mb-2 group-hover:text-primary transition-colors line-clamp-2">
            {article.title}
          </h2>

          <p className="text-gray-600 text-sm mb-3 line-clamp-3">
            {truncateText(article.perex, 150)}
          </p>

          <div className="flex items-center justify-between text-xs text-gray-500">
            <div className="flex items-center gap-1">
              <User className="w-3 h-3" />
              {article.author_name}
            </div>
            {article.published_at && (
              <div className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {formatDate(article.published_at)}
              </div>
            )}
          </div>

          <div
            className="mt-3 text-sm font-medium flex items-center gap-1"
            style={{ color: primaryColor }}
          >
            Číst více
            <ArrowRight className="w-4 h-4" />
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}

// Empty state component
function EmptyState({ message }: { message: string }) {
  return (
    <div className="text-center py-16">
      <FileText className="w-16 h-16 mx-auto text-gray-300 mb-4" />
      <p className="text-gray-500">{message}</p>
    </div>
  )
}
