import { Suspense } from 'react'
import { Loader } from '@/components/Loader'
import { PortalAnalytics } from '@/components/PortalAnalytics'

export default function CatalogLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <PortalAnalytics />
      <Suspense fallback={<Loader text="Načítání katalogu..." />}>{children}</Suspense>
    </>
  )
}
