import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md mx-auto text-center p-6">
        <div className="text-6xl mb-4">🏠</div>
        <h2 className="text-2xl font-semibold text-gray-900 mb-2">
          Page not found
        </h2>
        <p className="text-gray-600 mb-6 text-sm leading-relaxed">
          The page you&apos;re looking for doesn&apos;t exist.
        </p>
        <div className="space-y-3">
          <Link
            href="/"
            className="block w-full bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors font-medium"
          >
            Go home
          </Link>
          <Link
            href="/properties"
            className="block w-full bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-3 rounded-lg transition-colors font-medium"
          >
            Browse properties
          </Link>
        </div>
      </div>
    </div>
  )
}