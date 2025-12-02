import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <main className="text-center space-y-8 p-8">
        <h1 className="text-4xl font-bold">proKarieru</h1>
        <p className="text-xl text-gray-600 max-w-md">
          Multi-tenant system pro spráaavu kariernich portalu
        </p>

        <div className="flex gap-4 justify-center">
          <Button asChild>
            <Link href="/admin">Admin</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/admin/login">Prihlaseni</Link>
          </Button>
        </div>

        <div className="text-sm text-gray-500 pt-8">
          <p>Pro lokalni vyvoj:</p>
          <ul className="mt-2 space-y-1">
            <li><code className="bg-gray-200 px-2 py-1 rounded">/admin</code> - Administrace</li>
            <li><code className="bg-gray-200 px-2 py-1 rounded">/landing</code> - prokarieru.cz</li>
            <li><code className="bg-gray-200 px-2 py-1 rounded">/portal</code> - Portal landing</li>
            <li><code className="bg-gray-200 px-2 py-1 rounded">/catalog</code> - Katalog firem</li>
          </ul>
        </div>
      </main>
    </div>
  )
}
