'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { clsx } from 'clsx';
import { ShoppingCart, Menu, X, Search } from 'lucide-react';
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
    <header className="sticky top-0 z-50 bg-bg">
      {/* Top banner */}
      <div className="bg-accent text-bg text-center text-xs font-bold uppercase tracking-widest py-1.5 px-4">
        Free shipping on orders over $85 &bull; 60-day returns
      </div>

      {/* Main nav */}
      <div className="border-b border-border">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 lg:px-8">
          {/* Mobile toggle */}
          <button
            className="lg:hidden p-1 text-text"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent font-display text-xl font-bold text-bg">
              LV
            </div>
            <span className="font-display text-2xl tracking-wider text-text hidden sm:block">
              LA VILLA
            </span>
          </Link>

          {/* Center nav (desktop) */}
          <nav className="hidden lg:flex items-center gap-1">
            {NAV_LINKS.map((link, i) => (
              <div key={link.href} className="flex items-center">
                {i > 0 && <span className="mx-2 text-border">|</span>}
                <Link
                  href={link.href}
                  className={clsx(
                    'px-2 py-1 text-sm font-semibold uppercase tracking-wide transition-colors',
                    pathname === link.href || pathname.startsWith(link.href.split('?')[0])
                      ? 'text-accent'
                      : 'text-text-muted hover:text-text',
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
              className="text-sm font-medium text-text-muted hover:text-text transition-colors hidden sm:block"
            >
              Account
            </Link>
            <Link href="/cart" className="relative p-1 text-text">
              <ShoppingCart className="h-5 w-5" />
              {itemCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-accent text-[10px] font-bold text-bg">
                  {itemCount}
                </span>
              )}
            </Link>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="lg:hidden border-b border-border bg-surface">
          <nav className="flex flex-col px-4 py-4 gap-1">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className={clsx(
                  'rounded-md px-3 py-2.5 text-sm font-semibold uppercase tracking-wide transition-colors',
                  pathname === link.href
                    ? 'bg-accent/10 text-accent'
                    : 'text-text-muted hover:bg-surface-elevated hover:text-text',
                )}
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/account"
              onClick={() => setMobileOpen(false)}
              className="rounded-md px-3 py-2.5 text-sm font-semibold uppercase tracking-wide text-text-muted hover:bg-surface-elevated hover:text-text"
            >
              Account
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
