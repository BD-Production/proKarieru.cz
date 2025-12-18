import Link from 'next/link'
import Image from 'next/image'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Calendar, ArrowRight, FileText } from 'lucide-react'
import type { ArticleTag } from '@/types/database'

interface ArticleForSection {
  id: string
  title: string
  slug: string
  perex: string
  featured_image_url: string
  author_name: string
  published_at: string | null
  tags: ArticleTag[]
}

interface ArticlesSectionProps {
  articles: ArticleForSection[]
  portalName: string
  primaryColor: string
  totalCount: number
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

export function ArticlesSection({
  articles,
  portalName,
  primaryColor,
  totalCount
}: ArticlesSectionProps) {
  // Don't render if no articles
  if (articles.length === 0) {
    return null
  }

  return (
    <section className="py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold">Články</h2>
            <p className="text-gray-600 text-sm mt-1">
              Tipy a informace ze světa {portalName.toLowerCase().replace('pro', '')}
            </p>
          </div>
          {totalCount > 3 && (
            <Link
              href="/clanky"
              className="text-sm font-medium hidden md:flex items-center gap-1 hover:underline"
              style={{ color: primaryColor }}
            >
              Zobrazit všechny
              <ArrowRight className="h-4 w-4" />
            </Link>
          )}
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {articles.map(article => (
            <Link key={article.id} href={`/clanky/${article.slug}`}>
              <Card className="h-full overflow-hidden hover:shadow-lg transition-shadow group">
                <div className="relative aspect-[16/10] bg-gray-100">
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

                  <h3 className="font-bold text-lg mb-2 group-hover:text-primary transition-colors line-clamp-2">
                    {article.title}
                  </h3>

                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                    {truncateText(article.perex, 120)}
                  </p>

                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>{article.author_name}</span>
                    {article.published_at && (
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {formatDate(article.published_at)}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {/* Mobile link */}
        {totalCount > 3 && (
          <div className="mt-6 text-center md:hidden">
            <Link
              href="/clanky"
              className="inline-flex items-center gap-1 text-sm font-medium hover:underline"
              style={{ color: primaryColor }}
            >
              Zobrazit všechny články
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        )}
      </div>
    </section>
  )
}
