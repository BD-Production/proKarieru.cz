'use client'

import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

interface ArticleContentProps {
  content: string
}

// Custom component for YouTube embeds
function YouTubeEmbed({ videoId }: { videoId: string }) {
  return (
    <div className="relative w-full aspect-video my-6">
      <iframe
        src={`https://www.youtube.com/embed/${videoId}`}
        title="YouTube video"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        className="absolute inset-0 w-full h-full rounded-lg"
      />
    </div>
  )
}

// Process content to handle custom YouTube syntax ::youtube[VIDEO_ID]
function processYouTubeEmbeds(content: string): (string | { type: 'youtube'; videoId: string })[] {
  const parts: (string | { type: 'youtube'; videoId: string })[] = []
  const regex = /::youtube\[([^\]]+)\]/g
  let lastIndex = 0
  let match

  while ((match = regex.exec(content)) !== null) {
    // Add text before the match
    if (match.index > lastIndex) {
      parts.push(content.slice(lastIndex, match.index))
    }
    // Add YouTube embed marker
    parts.push({ type: 'youtube', videoId: match[1] })
    lastIndex = match.index + match[0].length
  }

  // Add remaining text
  if (lastIndex < content.length) {
    parts.push(content.slice(lastIndex))
  }

  return parts
}

export function ArticleContent({ content }: ArticleContentProps) {
  // Normalize line endings and ensure proper paragraph breaks
  const lines = content
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0)

  // Join with double newlines for proper paragraph separation
  const normalizedContent = lines.join('\n\n')

  const parts = processYouTubeEmbeds(normalizedContent)

  return (
    <div className="prose prose-lg max-w-none prose-headings:font-bold prose-headings:mt-8 prose-headings:mb-4 prose-p:text-gray-700 prose-a:text-blue-600 hover:prose-a:text-blue-800 prose-img:rounded-lg prose-blockquote:border-l-4 prose-blockquote:border-gray-300 prose-blockquote:pl-4 prose-blockquote:italic [&_h1]:text-3xl [&_h1]:font-bold [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:mt-10 [&_h2]:mb-4 [&_h3]:text-xl [&_h3]:font-bold [&_p]:mb-8">
      {parts.map((part, index) => {
        if (typeof part === 'string') {
          return (
            <ReactMarkdown
              key={index}
              remarkPlugins={[remarkGfm]}
              components={{
                // Custom link handling - open external links in new tab
                a: ({ href, children, ...props }) => {
                  const isExternal = href?.startsWith('http')
                  return (
                    <a
                      href={href}
                      target={isExternal ? '_blank' : undefined}
                      rel={isExternal ? 'noopener noreferrer' : undefined}
                      {...props}
                    >
                      {children}
                    </a>
                  )
                },
                // Custom image handling
                img: ({ src, alt, ...props }) => (
                  <img
                    src={src}
                    alt={alt || ''}
                    loading="lazy"
                    className="rounded-lg"
                    {...props}
                  />
                ),
              }}
            >
              {part}
            </ReactMarkdown>
          )
        } else {
          return <YouTubeEmbed key={index} videoId={part.videoId} />
        }
      })}
    </div>
  )
}
