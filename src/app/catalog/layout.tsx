import { Suspense } from 'react'
import { Loader } from '@/components/Loader'

export default function CatalogLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <Suspense fallback={<Loader text="Načítání katalogu..." />}>{children}</Suspense>
  )
}
