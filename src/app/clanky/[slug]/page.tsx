import { headers } from 'next/headers'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/server'
import { ArrowLeft, Calendar, User } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { ArticleContent } from '@/components/ArticleContent'
import { ArticleGallery } from '@/components/ArticleGallery'
import type { Metadata } from 'next'
import type { ArticleTag, ArticleGalleryImage } from '@/types/database'

interface ArticlePageProps {
  params: Promise<{ slug: string }>
}

// Generate metadata for SEO
export async function generateMetadata({ params }: ArticlePageProps): Promise<Metadata> {
  const { slug } = await params
  const headersList = await headers()
  const portalSlug = headersList.get('x-portal-slug')

  const supabase = await createClient()

  // Get portal
  const { data: portal } = await supabase
    .from('portals')
    .select('id, name, domain')
    .eq('slug', portalSlug)
    .single()

  if (!portal) {
    return { title: 'Článek nenalezen' }
  }

  // Get article
  const { data: article } = await supabase
    .from('articles')
    .select('title, perex, featured_image_url, og_title, og_description, og_image_url, author_name, published_at')
    .eq('portal_id', portal.id)
    .eq('slug', slug)
    .eq('status', 'published')
    .single()

  if (!article) {
    return { title: 'Článek nenalezen' }
  }

  const title = article.og_title || article.title
  const description = article.og_description || article.perex
  const image = article.og_image_url || article.featured_image_url

  return {
    title: `${title} | ${portal.name}`,
    description,
    openGraph: {
      title,
      description,
      type: 'article',
      publishedTime: article.published_at || undefined,
      authors: [article.author_name],
      images: image ? [{ url: image }] : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: image ? [image] : undefined,
    },
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

export default async function ArticlePage({ params }: ArticlePageProps) {
  const { slug } = await params
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

  // Get article with tags and gallery
  const { data: article } = await supabase
    .from('articles')
    .select(`
      *,
      article_tag_relations(
        tag:article_tags(id, name, slug)
      ),
      article_gallery(
        id,
        image_url,
        caption,
        sort_order
      )
    `)
    .eq('portal_id', portal.id)
    .eq('slug', slug)
    .eq('status', 'published')
    .single()

  if (!article) {
    notFound()
  }

  // Transform data
  const tags: ArticleTag[] = article.article_tag_relations
    ?.map((r: { tag: ArticleTag }) => r.tag)
    .filter(Boolean) || []

  const gallery: ArticleGalleryImage[] = article.article_gallery || []

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <header className="border-b sticky top-0 bg-white/95 backdrop-blur-sm z-40">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-xl font-bold" style={{ color: portal.primary_color }}>
              {portal.name}
            </span>
          </Link>
          <nav className="hidden md:flex items-center gap-6">
            <Link href="/katalog" className="text-gray-600 hover:text-gray-900 text-sm font-medium">
              Katalog firem
            </Link>
            <Link href="/clanky" className="text-gray-600 hover:text-gray-900 text-sm font-medium">
              Články
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero image */}
        <div className="relative w-full h-64 md:h-96 bg-gray-100">
          <Image
            src={article.featured_image_url}
            alt={article.title}
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
        </div>

        <article className="max-w-4xl mx-auto px-4 -mt-16 relative z-10">
          {/* Article header */}
          <div className="bg-white rounded-t-2xl p-6 md:p-10 shadow-lg">
            {/* Back link */}
            <Link
              href="/clanky"
              className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-4"
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              Zpět na články
            </Link>

            {/* Title */}
            <h1 className="text-3xl md:text-4xl font-bold mb-4">{article.title}</h1>

            {/* Meta info */}
            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-6">
              <div className="flex items-center gap-1">
                <User className="w-4 h-4" />
                {article.author_name}
              </div>
              {article.published_at && (
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {formatDate(article.published_at)}
                </div>
              )}
            </div>

            {/* Tags */}
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-6">
                {tags.map(tag => (
                  <Link key={tag.id} href={`/clanky?tag=${tag.slug}`}>
                    <Badge
                      variant="secondary"
                      className="hover:bg-gray-200 cursor-pointer"
                    >
                      {tag.name}
                    </Badge>
                  </Link>
                ))}
              </div>
            )}

            {/* Perex */}
            <p className="text-lg text-gray-600 leading-relaxed border-l-4 pl-4 italic" style={{ borderColor: portal.primary_color }}>
              {article.perex}
            </p>
          </div>

          {/* Article content */}
          <div className="bg-white px-6 md:px-10 pb-10">
            <ArticleContent content={article.content} />

            {/* Gallery */}
            {gallery.length > 0 && (
              <ArticleGallery images={gallery} />
            )}

            {/* Back to articles */}
            <div className="mt-10 pt-6 border-t">
              <Link
                href="/clanky"
                className="inline-flex items-center text-sm font-medium hover:underline"
                style={{ color: portal.primary_color }}
              >
                <ArrowLeft className="w-4 h-4 mr-1" />
                Zpět na články
              </Link>
            </div>
          </div>
        </article>
      </main>

      {/* Footer */}
      <footer className="border-t py-8 px-4 mt-auto">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-gray-500 text-sm">
              &copy; {new Date().getFullYear()} proKariéru
            </p>
            <nav className="flex items-center gap-6 text-sm">
              <Link href="/katalog" className="text-gray-500 hover:text-gray-900">
                Katalog
              </Link>
              <Link href="/clanky" className="text-gray-500 hover:text-gray-900">
                Články
              </Link>
              <Link href="/profirmy" className="text-gray-500 hover:text-gray-900">
                Pro firmy
              </Link>
            </nav>
          </div>
        </div>
      </footer>
    </div>
  )
}
