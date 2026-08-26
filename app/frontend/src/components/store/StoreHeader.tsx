'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { clsx } from 'clsx';
import { ShoppingCart, Menu, X } from 'lucide-react';
import { BrandWordmark } from '@/components/brand/BrandWordmark';
import { useCart } from '@/hooks/useCart';

const NAV_LINKS = [
  { label: 'Decks', href: '/products?category=decks' },
  { label: 'Apparel', href: '/products?category=apparel' },
  { label: 'Accessories', href: '/products?category=accessories' },
  { label: 'Gear', href: '/products?category=gear' },
] as const;

export function StoreHeader() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const { itemCount } = useCart();

  return (
    <header className="sticky top-0 z-50 bg-villa-black">
      {/* Top banner */}
      <div className="bg-villa-fox text-villa-black text-center font-sans text-[11px] font-bold uppercase tracking-[0.15em] py-1.5 px-4">
        Free shipping on orders over $85 &bull; 60-day returns
      </div>

      {/* Main nav */}
      <div className="border-b border-villa-smoke/25">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 lg:px-8">
          {/* Mobile toggle */}
          <button
            className="lg:hidden p-1 text-villa-bone"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <BrandWordmark width={120} priority />
          </Link>

          {/* Center nav (desktop) */}
          <nav className="hidden lg:flex items-center gap-1">
            {NAV_LINKS.map((link, i) => (
              <div key={link.href} className="flex items-center">
                {i > 0 && <span className="mx-2 text-villa-smoke/50">|</span>}
                <Link
                  href={link.href}
                  className={clsx(
                    'px-2 py-1 font-sans text-sm font-semibold uppercase tracking-wide transition-colors hover:text-villa-bone',
                    pathname === link.href || pathname.startsWith(link.href.split('?')[0])
                      ? 'text-villa-fox'
                      : 'text-villa-smoke',
                  )}
                >
                  {link.label}
                </Link>
              </div>
            ))}
          </nav>

          {/* Right actions */}
          <div className="flex items-center gap-3">
            <Link
              href="/account"
              className="font-sans text-sm font-semibold uppercase tracking-wide text-villa-smoke hover:text-villa-bone transition-colors hidden sm:block"
            >
              Account
            </Link>
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
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className={clsx(
                  'rounded-none px-3 py-3 font-sans text-sm font-bold uppercase tracking-wide transition-colors',
                  pathname === link.href
                    ? 'bg-villa-smoke/10 text-villa-fox border-l-2 border-villa-fox'
                    : 'text-villa-smoke hover:bg-villa-smoke/5 hover:text-villa-bone border-l-2 border-transparent',
                )}
              >
                {link.label}
              </Link>
            ))}
            <div className="my-2 border-t border-villa-smoke/10" />
            <Link
              href="/account"
              onClick={() => setMobileOpen(false)}
              className="rounded-none px-3 py-3 font-sans text-sm font-bold uppercase tracking-wide text-villa-smoke hover:bg-villa-smoke/5 hover:text-villa-bone border-l-2 border-transparent"
            >
              Account
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
