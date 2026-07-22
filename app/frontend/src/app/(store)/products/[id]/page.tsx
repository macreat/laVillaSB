'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useCart } from '@/hooks/useCart';

const PRODUCTS: Record<string, { name: string; price: number; category: string; description: string }> = {
  '1': { name: 'Dark Realm Deck', price: 64.99, category: 'decks', description: '7-ply maple deck with dark realm graphic. Available in 8.0" - 8.5" widths.' },
  '2': { name: 'Lurk Tee', price: 32.00, category: 'apparel', description: 'Heavyweight cotton tee with screen-printed la Villa logo. Relaxed fit.' },
  '3': { name: 'Hesh Wheels 54mm', price: 42.00, category: 'gear', description: '99a durometer, perfect for park and street. Fast and durable urethane.' },
  '4': { name: 'Creature Grip Tape', price: 18.00, category: 'accessories', description: 'Standard 9" x 33" grip tape with Creature logo cutout. Maximum grip.' },
  '5': { name: 'Prowler Deck 8.25', price: 68.00, category: 'decks', description: 'Pro model deck with prowler graphic. Medium concave, 8.25" width.' },
  '6': { name: 'Skull Logo Hoodie', price: 58.00, category: 'apparel', description: 'Heavyweight fleece hoodie with embroidered skull logo. Kangaroo pocket.' },
  '7': { name: 'Bones Reds Bearings', price: 24.99, category: 'gear', description: 'Standard precision bearings. Pre-lubricated with Speed Cream. Set of 8.' },
  '8': { name: 'Vomit King Deck 8.0', price: 62.00, category: 'decks', description: 'Full shape, medium concave. Classic vomit king graphic on 7-ply maple.' },
  '9': { name: 'Fiend Beanie', price: 22.00, category: 'apparel', description: 'Knit beanie with embroidered logo. One size fits all. Acrylic blend.' },
  '10': { name: 'Spitfire Formula Four 52mm', price: 38.00, category: 'gear', description: '99a classic shape. Best-selling wheel for all-terrain skating.' },
  '11': { name: 'Creature Sticker Pack', price: 8.00, category: 'accessories', description: 'Pack of 5 die-cut vinyl stickers. Weatherproof and dishwasher safe.' },
  '12': { name: 'Dark Side Deck 8.5', price: 72.00, category: 'decks', description: 'Wide shape for transition skating. 8.5" with dark side graphic.' },
};

export default function ProductDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const product = PRODUCTS[id];
  const { addItem } = useCart();

  if (!product) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4">
        <p className="text-text-muted">Product not found.</p>
        <Link href="/products" className="btn-secondary">
          Back to Products
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 lg:px-8">
      <div className="mb-6">
        <Link href="/products" className="text-sm text-text-muted hover:text-accent transition-colors">
          &larr; Back to Products
        </Link>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Image */}
        <div className="flex aspect-square items-center justify-center rounded-lg border border-border bg-surface p-8">
          <div className="flex h-40 w-40 items-center justify-center rounded-xl border border-border text-text-muted">
            <svg className="h-16 w-16 opacity-20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        </div>

        {/* Details */}
        <div>
          <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-accent">
            {product.category}
          </p>
          <h1 className="font-display text-3xl uppercase tracking-wider text-text sm:text-4xl">
            {product.name}
          </h1>
          <p className="mt-4 font-display text-2xl text-text">
            ${product.price.toFixed(2)}
          </p>
          <p className="mt-4 text-sm text-text-muted leading-relaxed">
            {product.description}
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <button
              onClick={() =>
                addItem({
                  id,
                  name: product.name,
                  price: product.price,
                })
              }
              className="btn-primary px-8 py-3 text-base"
            >
              Add to Cart
            </button>
            <Link href="/cart" className="btn-secondary px-8 py-3 text-base text-center">
              View Cart
            </Link>
          </div>

          {/* WhatsApp CTA */}
          <div className="mt-6 rounded-lg border border-border bg-surface p-4">
            <p className="text-sm text-text-muted">
              Prefer to order via WhatsApp?{' '}
              <a
                href="https://wa.me/"
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-accent hover:text-accent-hover transition-colors"
              >
                Message us directly &rarr;
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
