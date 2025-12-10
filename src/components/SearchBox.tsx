'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Search } from 'lucide-react'

interface SearchBoxProps {
  portalSlug: string
  placeholder?: string
}

export function SearchBox({
  portalSlug,
  placeholder = 'Hledej firmu, pozici nebo obor…',
}: SearchBoxProps) {
  const [query, setQuery] = useState('')
  const router = useRouter()

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) {
      router.push(`/katalog?search=${encodeURIComponent(query.trim())}`)
    } else {
      router.push('/katalog')
    }
  }

  return (
    <form onSubmit={handleSearch} className="relative">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={placeholder}
            className="pl-10 h-12"
          />
        </div>
        <Button type="submit" size="lg" className="h-12 px-6">
          Hledat
        </Button>
      </div>
    </form>
  )
}
