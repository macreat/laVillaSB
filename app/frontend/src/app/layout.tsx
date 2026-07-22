import type { Metadata } from 'next';
import { AuthProvider } from '@/lib/auth';
import { CartProvider } from '@/lib/cart';
import './globals.css';

export const metadata: Metadata = {
  title: {
    default: 'La Villa Skateboarding',
    template: '%s — La Villa Skateboarding',
  },
  description: 'La Villa Skateboarding — The darker side of skateboarding. Shop decks, apparel, and gear.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen bg-bg text-text antialiased">
        <AuthProvider>
          <CartProvider>{children}</CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
