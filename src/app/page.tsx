export default function RootPage() {
  // This page should not be reached in production due to middleware rewrites
  // prokarieru.cz → /landing
  // prostavare.cz → /portal
  // katalog.prostavare.cz → /firmy
  // etc.

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">proKarieru Platform</h1>
        <p className="text-gray-600">Neplatná doména nebo cesta</p>
      </div>
    </div>
  )
}
