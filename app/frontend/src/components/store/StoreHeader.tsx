'use client';

import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { clsx } from 'clsx';
import { Menu, Search, ShoppingCart, X } from 'lucide-react';
import { BrandWordmark } from '@/components/brand/BrandWordmark';
import { WhatsAppMark } from '@/components/brand/WhatsAppMark';
import { useCart } from '@/hooks/useCart';
import { WHATSAPP_URL, EXTERNAL_LINK_REL } from '@/lib/site-links';
import { buildStoreHref } from '@/lib/store-catalog';

const NAV_LINKS = [
  { label: 'Skate', section: 'skate', category: undefined },
  { label: 'Tablas', section: 'skate', category: 'tablas' },
  { label: 'Ropa', section: 'ropa', category: undefined },
  { label: 'Zapatos', section: 'ropa', category: 'zapatos' },
] as const;

export function StoreHeader() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { itemCount } = useCart();

  // A nav entry is current only when the browsed section and category both
  // match it, so exactly one entry highlights instead of every /products link.
  const isCurrent = (section: string, category?: string) =>
    pathname === '/products' &&
    searchParams.get('section') === section &&
    (searchParams.get('category') ?? undefined) === category;

  return (
    <header className="sticky top-0 z-50 bg-villa-black">
      {/* Top banner */}
      <div className="bg-villa-fox text-villa-black text-center font-sans text-[11px] font-bold uppercase tracking-[0.15em] py-1.5 px-4">
        Envios gratis en compras desde $250.000 COP &bull; Devoluciones en 60 dias
      </div>

      {/* Main nav */}
      <div className="border-b border-villa-smoke/25">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 lg:px-8">
          {/* Mobile toggle */}
          <button
            className="lg:hidden p-1 text-villa-bone"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Abrir menu"
          >
            {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <BrandWordmark width={120} priority />
          </Link>

          {/* Center nav (desktop) */}
          <nav className="hidden lg:flex items-center gap-1">
            {NAV_LINKS.map((link, i) => {
              const href = buildStoreHref(link.section, link.category);
              const active = isCurrent(link.section, link.category);
              return (
                <div key={href} className="flex items-center">
                  {i > 0 && <span className="mx-2 text-villa-smoke/50">|</span>}
                  <Link
                    href={href}
                    aria-current={active ? 'page' : undefined}
                    className={clsx(
                      'px-2 py-1 font-sans text-sm font-semibold uppercase tracking-wide transition-colors hover:text-villa-bone',
                      active ? 'text-villa-fox' : 'text-villa-smoke',
                    )}
                  >
                    {link.label}
                  </Link>
                </div>
              );
            })}
          </nav>

          {/* Right actions */}
          <div className="flex items-center gap-3">
            <Link
              href="/products#buscar"
              aria-label="Ir a la busqueda inteligente"
              title="Busqueda inteligente"
              className="flex items-center justify-center h-11 w-11 rounded-full border-2 border-villa-fox/30 bg-villa-fox/10 text-villa-bone transition-all hover:border-villa-fox hover:bg-villa-fox/20 hover:text-villa-fox hover:scale-110 hover:shadow-lg hover:shadow-villa-fox/20"
            >
              <Search className="h-5 w-5" />
            </Link>
            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel={EXTERNAL_LINK_REL}
              aria-label="Hablanos por WhatsApp"
              className="hidden sm:flex items-center justify-center h-11 w-11 rounded-full border-2 border-villa-fox/30 bg-villa-fox/10 transition-all hover:border-villa-fox hover:bg-villa-fox/20 hover:scale-110 hover:shadow-lg hover:shadow-villa-fox/20"
            >
              <WhatsAppMark size={36} className="h-9 w-9" />
            </a>
            <Link href="/cart" className="relative p-1 text-villa-bone hover:text-villa-fox transition-colors">
              <ShoppingCart className="h-5 w-5" />
              {itemCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-sm bg-villa-fox font-sans text-[10px] font-bold text-villa-black">
                  {itemCount}
                </span>
              )}
            </Link>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="lg:hidden border-b border-villa-smoke/25 bg-villa-ink shadow-2xl">
          <nav className="flex flex-col px-4 py-4 gap-1">
            {NAV_LINKS.map((link) => {
              const href = buildStoreHref(link.section, link.category);
              const active = isCurrent(link.section, link.category);
              return (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setMobileOpen(false)}
                  aria-current={active ? 'page' : undefined}
                  className={clsx(
                    'rounded-none px-3 py-3 font-sans text-sm font-bold uppercase tracking-wide transition-colors',
                    active
                      ? 'bg-villa-smoke/10 text-villa-fox border-l-2 border-villa-fox'
                      : 'text-villa-smoke hover:bg-villa-smoke/5 hover:text-villa-bone border-l-2 border-transparent',
                  )}
                >
                  {link.label}
                </Link>
              );
            })}
            <div className="my-2 border-t border-villa-smoke/10" />
            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel={EXTERNAL_LINK_REL}
              onClick={() => setMobileOpen(false)}
              className="flex items-center gap-3 rounded-none px-3 py-3 font-sans text-sm font-bold uppercase tracking-wide text-villa-smoke hover:bg-villa-smoke/5 hover:text-villa-bone border-l-2 border-transparent"
            >
              <div className="flex items-center justify-center h-9 w-9 rounded-full border-2 border-villa-fox/30 bg-villa-fox/10">
                <WhatsAppMark size={28} className="h-7 w-7" />
              </div>
              WhatsApp
            </a>
          </nav>
        </div>
      )}
    </header>
  );
}
