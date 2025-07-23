'use client';

import Link from "next/link";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">
            <Link href="/admin/dashboard" className="hover:text-blue-600 transition-colors">
              Admin Area
            </Link>
          </h1>
          <nav>
            <ul className="flex space-x-4">
              <li>
                <Link 
                  href="/admin/dashboard" 
                  className="text-gray-700 hover:text-blue-600 transition-colors"
                >
                  Dashboard
                </Link>
              </li>
              <li>
                <Link 
                  href="/" 
                  className="text-gray-700 hover:text-blue-600 transition-colors"
                >
                  Back to Site
                </Link>
              </li>
            </ul>
          </nav>
        </div>
      </header>
      <main>
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          {children}
        </div>
      </main>
      <footer className="bg-white border-t border-gray-200 mt-auto">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 text-center text-gray-500 text-sm">
          Admin Dashboard © {new Date().getFullYear()} Spain Dream Home
        </div>
      </footer>
    </div>
  );
}