'use client'

import { useRouter } from 'next/navigation'

type Edition = {
  id: string
  name: string
  is_active: boolean
}

interface EditionTabsProps {
  editions: Edition[]
  activeEditionId: string
  basePath: string
  primaryColor?: string
}

export function EditionTabs({
  editions,
  activeEditionId,
  basePath,
  primaryColor = '#C34751',
}: EditionTabsProps) {
  const router = useRouter()

  const handleEditionChange = (editionId: string) => {
    router.push(`${basePath}?edition=${editionId}`)
  }

  if (editions.length <= 1) {
    return null
  }

  return (
    <div className="flex gap-2 overflow-x-auto pb-2">
      {editions.map((edition) => (
        <button
          key={edition.id}
          onClick={() => handleEditionChange(edition.id)}
          className={`px-4 py-2 rounded-full text-sm whitespace-nowrap transition-colors ${
            edition.id === activeEditionId
              ? 'text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
          style={
            edition.id === activeEditionId
              ? { backgroundColor: primaryColor }
              : {}
          }
        >
          {edition.name}
        </button>
      ))}
    </div>
  )
}
