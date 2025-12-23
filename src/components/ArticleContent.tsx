'use client'

import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { VideoPlayer } from './VideoPlayer'

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

// Custom component for hosted video embeds
function HostedVideoEmbed({ url }: { url: string }) {
  return (
    <div className="my-6">
      <VideoPlayer src={url} />
    </div>
  )
}

type ContentPart =
  | string
  | { type: 'youtube'; videoId: string }
  | { type: 'video'; url: string }

// Process content to handle custom syntax ::youtube[VIDEO_ID] and ::video[URL]
function processCustomEmbeds(content: string): ContentPart[] {
  const parts: ContentPart[] = []
  // Combined regex for YouTube and video embeds
  const regex = /::youtube\[([^\]]+)\]|::video\[([^\]]+)\]/g
  let lastIndex = 0
  let match

  while ((match = regex.exec(content)) !== null) {
    // Add text before the match
    if (match.index > lastIndex) {
      parts.push(content.slice(lastIndex, match.index))
    }

    // Determine which type of embed
    if (match[1]) {
      // YouTube embed
      parts.push({ type: 'youtube', videoId: match[1] })
    } else if (match[2]) {
      // Hosted video embed
      parts.push({ type: 'video', url: match[2] })
    }

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
  let normalizedContent = content
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')

  // Fix common Markdown mistakes: spaces between ] and ( in links
  // [text] (url) -> [text](url)
  normalizedContent = normalizedContent.replace(/\]\s+\(/g, '](')

  // Split into lines, trim and filter empty
  const lines = normalizedContent
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0)

  // Join with double newlines for proper paragraph separation
  normalizedContent = lines.join('\n\n')

  const parts = processCustomEmbeds(normalizedContent)

  return (
    <div className="prose prose-lg max-w-none prose-headings:font-bold prose-headings:mt-8 prose-headings:mb-4 prose-p:text-gray-700 prose-a:text-blue-600 hover:prose-a:text-blue-800 prose-img:rounded-lg prose-blockquote:border-l-4 prose-blockquote:border-gray-300 prose-blockquote:pl-4 prose-blockquote:italic [&_h1]:text-3xl [&_h1]:font-bold [&_h1]:mb-6 [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:mt-10 [&_h2]:mb-4 [&_h3]:text-xl [&_h3]:font-bold [&_p]:mb-6 [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:mb-6 [&_ul]:space-y-2 [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:mb-6 [&_ol]:space-y-2 [&_li]:text-gray-700">
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
        } else if (part.type === 'youtube') {
          return <YouTubeEmbed key={index} videoId={part.videoId} />
        } else if (part.type === 'video') {
          return <HostedVideoEmbed key={index} url={part.url} />
        }
        return null
      })}
    </div>
  )
}
