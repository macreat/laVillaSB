'use client';

import Link from 'next/link';
import { ProductCard } from '@/components/store/product/ProductCard';

const FEATURED_PRODUCTS = [
  { id: '1', name: 'Dark Realm Deck', price: 64.99, category: 'decks', image: '' },
  { id: '2', name: 'Lurk Tee', price: 32.00, category: 'apparel', image: '' },
  { id: '3', name: 'Hesh Wheels 54mm', price: 42.00, category: 'gear', image: '' },
  { id: '4', name: 'Creature Grip Tape', price: 18.00, category: 'accessories', image: '' },
  { id: '5', name: 'Prowler Deck 8.25', price: 68.00, category: 'decks', image: '' },
  { id: '6', name: 'Skull Logo Hoodie', price: 58.00, category: 'apparel', image: '' },
];

export default function StoreHomePage() {
  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-surface">
        <div className="mx-auto max-w-7xl px-4 py-20 text-center lg:px-8 lg:py-32">
          <p className="mb-4 font-display text-sm uppercase tracking-[0.3em] text-accent">
            La Villa Skateboarding
          </p>
          <h1 className="font-display text-6xl uppercase tracking-wider text-text sm:text-7xl lg:text-8xl">
            The Darker Side
          </h1>
          <h2 className="font-display text-4xl uppercase tracking-wider text-text-muted sm:text-5xl lg:text-6xl">
            Of Skateboarding
          </h2>
          <p className="mx-auto mt-6 max-w-lg text-base text-text-muted leading-relaxed">
            Handpicked decks, apparel, and gear for the devoted fiend.
            Ride with us.
          </p>
          <div className="mt-8 flex items-center justify-center gap-4">
            <Link href="/products" className="btn-primary px-8 py-3 text-base">
              Shop Now
            </Link>
            <Link href="/products?category=decks" className="btn-secondary px-8 py-3 text-base">
              Decks
            </Link>
          </div>
        </div>
      </section>

      {/* Announcement bar */}
      <section className="bg-accent py-3 text-center">
        <p className="font-display text-lg uppercase tracking-widest text-bg">
          Free Shipping On Orders Over $85 &mdash; 60-Day Returns
        </p>
      </section>

      {/* Featured products */}
      <section className="mx-auto max-w-7xl px-4 py-16 lg:px-8">
        <div className="mb-8 text-center">
          <h2 className="font-display text-3xl uppercase tracking-wider text-text">
            Featured
          </h2>
          <p className="mt-2 text-sm text-text-muted">
            Fresh drops and skate essentials
          </p>
        </div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-3 lg:gap-6">
          {FEATURED_PRODUCTS.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
        <div className="mt-10 text-center">
          <Link href="/products" className="btn-secondary px-8 py-3">
            View All Products
          </Link>
        </div>
      </section>

      {/* Categories */}
      <section className="border-t border-border bg-surface">
        <div className="mx-auto max-w-7xl px-4 py-16 lg:px-8">
          <h2 className="mb-8 text-center font-display text-3xl uppercase tracking-wider text-text">
            Shop By Category
          </h2>
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4 lg:gap-6">
            {[
              { name: 'Decks', href: '/products?category=decks', color: 'bg-accent/10' },
              { name: 'Apparel', href: '/products?category=apparel', color: 'bg-accent/10' },
              { name: 'Accessories', href: '/products?category=accessories', color: 'bg-accent/10' },
              { name: 'Gear', href: '/products?category=gear', color: 'bg-accent/10' },
            ].map((cat) => (
              <Link
                key={cat.name}
                href={cat.href}
                className="group flex h-32 items-center justify-center rounded-lg border border-border bg-surface-elevated transition-all hover:border-accent/40 hover:shadow-lg hover:shadow-accent/5 lg:h-40"
              >
                <span className="font-display text-xl uppercase tracking-wider text-text-muted transition-colors group-hover:text-accent">
                  {cat.name}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Brand statement */}
      <section className="border-t border-border">
        <div className="mx-auto max-w-3xl px-4 py-20 text-center lg:px-8">
          <h2 className="font-display text-4xl uppercase tracking-wider text-text sm:text-5xl">
            Lurk With Us
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-base text-text-muted leading-relaxed">
            La Villa Skateboarding represents the darker side of skate culture.
            From eye-shattering graphics to jaw-dropping decks, we offer a complete
            lifestyle for like-minded fiends.
          </p>
          <div className="mt-8 flex items-center justify-center gap-6">
            {['Instagram', 'YouTube', 'TikTok'].map((platform) => (
              <span
                key={platform}
                className="text-sm font-semibold uppercase tracking-wider text-text-muted hover:text-accent cursor-pointer transition-colors"
              >
                {platform}
              </span>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
