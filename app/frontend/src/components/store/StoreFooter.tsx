'use client';

import Link from 'next/link';
import { BrandWordmark } from '@/components/brand/BrandWordmark';
import { MacreatScript } from '@/components/brand/MacreatScript';

const FOOTER_LINKS = [
  {
    title: 'Shop',
    links: [
      { label: 'Decks', href: '/products?category=decks' },
      { label: 'Apparel', href: '/products?category=apparel' },
      { label: 'Accessories', href: '/products?category=accessories' },
      { label: 'All Products', href: '/products' },
    ],
  },
  {
    title: 'Help',
    links: [
      { label: 'Contact Us', href: '/account' },
      { label: 'Shipping Info', href: '/account' },
      { label: 'Returns', href: '/account' },
      { label: 'Size Guide', href: '/account' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'About', href: '/' },
      { label: 'Team', href: '/' },
      { label: 'Events', href: '/' },
      { label: 'Dealers', href: '/' },
    ],
  },
];

export function StoreFooter() {
  return (
    <footer className="bg-bg border-t border-border">
      <div className="mx-auto max-w-7xl px-4 py-12 lg:px-8">
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
          {/* Brand */}
          <div className="col-span-2 sm:col-span-1">
            <Link href="/" className="mb-4 block w-fit">
              <BrandWordmark width={150} />
            </Link>
            <p className="text-sm text-text-muted leading-relaxed">
              La Villa Skateboarding &mdash; The darker side of skateboarding.
            </p>
            <div className="mt-4">
              <a
                href="https://macreat.com"
                aria-label="Developed by Macreat"
                className="inline-block"
              >
                <MacreatScript width={90} />
              </a>
            </div>
          </div>

          {/* Link columns */}
          {FOOTER_LINKS.map((col) => (
            <div key={col.title}>
              <h4 className="mb-3 font-display text-sm uppercase tracking-widest text-text">
                {col.title}
              </h4>
              <ul className="space-y-2">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-text-muted hover:text-accent transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Newsletter */}
        <div className="mt-10 border-t border-border pt-8">
          <div className="mx-auto max-w-md text-center">
            <h4 className="font-display text-lg uppercase tracking-wider text-text mb-2">
              Lurk With Us
            </h4>
            <p className="text-sm text-text-muted mb-4">
              Join the mailing list for drops, deals, and skate content.
            </p>
            <form className="flex gap-2" onSubmit={(e) => e.preventDefault()}>
              <input
                type="email"
                placeholder="you@example.com"
                className="input-field flex-1"
              />
              <button type="submit" className="btn-primary">
                Join
              </button>
            </form>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-8 border-t border-border pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-text-muted">
            &copy; {new Date().getFullYear()} La Villa Skateboarding. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            {['Instagram', 'YouTube', 'TikTok'].map((platform) => (
              <span key={platform} className="text-xs text-text-muted hover:text-accent cursor-pointer transition-colors">
                {platform}
              </span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
