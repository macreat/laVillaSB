import type { Metadata } from 'next';
import { Anton, Archivo } from 'next/font/google';
import { AuthProvider } from '@/lib/auth';
import { CartProvider } from '@/lib/cart';
import './globals.css';

const archivo = Archivo({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-archivo',
  display: 'swap',
});

const anton = Anton({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-anton',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
  title: {
    default: 'La Villa Skateboarding',
    template: '%s - La Villa Skateboarding',
  },
  description: 'La Villa Skateboarding - La villa es la ley del skate. Compra tablas, ropa y equipo.',
  openGraph: {
    title: 'La Villa Skateboarding',
    description: 'La Villa Skateboarding - La villa es la ley del skate. Compra tablas, ropa y equipo.',
    images: ['/brand/villa-scene.webp'],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className={`dark ${archivo.variable} ${anton.variable}`}>
      <body className="min-h-screen bg-bg font-sans text-text antialiased">
        <AuthProvider>
          <CartProvider>{children}</CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
