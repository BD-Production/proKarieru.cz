import { redirect } from 'next/navigation'
import { headers } from 'next/headers'

export default async function RootPage() {
  const headersList = await headers()
  const hostname = headersList.get('host') || ''

  // Admin domain redirect to /admin
  if (hostname.includes('admin.')) {
    redirect('/admin')
  }

  // For other domains, this shouldn't be reached due to middleware rewrites
  // But just in case, show a simple message
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">proKarieru Platform</h1>
        <p className="text-gray-600">Neplatná doména nebo cesta</p>
      </div>
    </div>
  )
}
