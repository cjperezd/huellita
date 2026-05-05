import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import Link from 'next/link';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Huellita — Mascotas Perdidas',
  description: 'Encontrá o reportá mascotas perdidas en Argentina.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className={`${inter.className} flex flex-col h-screen`}>
        <header className="h-14 shrink-0 flex items-center justify-between px-4 bg-white border-b border-gray-100 shadow-sm z-50">
          <Link href="/" className="flex items-center gap-2 font-bold text-gray-900 hover:opacity-80 transition-opacity">
            <span className="text-2xl">🐾</span>
            <span>Huellita</span>
          </Link>
          <nav className="flex items-center gap-2">
            <Link
              href="/"
              className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 transition-colors"
            >
              Mapa
            </Link>
            <Link
              href="/reportar"
              className="px-4 py-1.5 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
            >
              + Reportar
            </Link>
          </nav>
        </header>
        <main className="flex-1 min-h-0">{children}</main>
      </body>
    </html>
  );
}
