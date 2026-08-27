'use client';

import Link from 'next/link';
import { useCart } from '@/hooks/useCart';
import { Trash2, Plus, Minus } from 'lucide-react';
import { ProductImage } from '@/components/store/product/ProductImage';
import { buildWhatsAppHref, EXTERNAL_LINK_REL } from '@/lib/site-links';

export default function CartPage() {
  const { items, total, removeItem, updateQuantity, clearCart } = useCart();

  if (items.length === 0) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 px-4">
        <div className="flex h-20 w-20 items-center justify-center rounded-full border border-border bg-surface">
          <svg className="h-8 w-8 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" />
          </svg>
        </div>
        <h1 className="font-display text-2xl uppercase tracking-wider text-text">
          Your Cart Is Empty
        </h1>
        <p className="text-sm text-text-muted">Time to lurk the shop.</p>
        <Link href="/products" className="btn-primary mt-2 px-8 py-3">
          Shop Now
        </Link>
      </div>
    );
  }

  const whatsappText = [
    items.map((i) => `${i.name} x${i.quantity} — $${(i.price * i.quantity).toFixed(2)}`).join('\n'),
    `Total: $${total.toFixed(2)}`,
  ].join('\n\n');

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 lg:px-8">
      <h1 className="mb-8 font-display text-3xl uppercase tracking-wider text-text">
        Your Cart
      </h1>

      <div className="space-y-4">
        {items.map((item) => (
          <div
            key={item.id}
            className="card-elevated flex items-center gap-4 sm:gap-6"
          >
            <ProductImage
              src={item.image}
              alt={item.name}
              className="flex h-16 w-16 shrink-0 items-center justify-center rounded-md border border-border bg-surface sm:h-20 sm:w-20"
              fallbackClassName="flex h-10 w-10 items-center justify-center rounded-md border border-border text-text-muted"
              imageClassName="h-full w-full rounded-md object-cover"
            />

            {/* Info */}
            <div className="flex-1 min-w-0">
              <Link
                href={`/products/${item.id}`}
                className="text-sm font-bold uppercase tracking-wide text-text hover:text-accent transition-colors"
              >
                {item.name}
              </Link>
              <p className="mt-0.5 font-display text-lg text-text">
                ${item.price.toFixed(2)}
              </p>
            </div>

            {/* Quantity */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                className="rounded-md border border-border p-1 text-text-muted hover:bg-surface-elevated hover:text-text transition-colors"
                disabled={item.quantity <= 1}
              >
                <Minus className="h-3 w-3" />
              </button>
              <span className="w-8 text-center text-sm font-medium text-text">
                {item.quantity}
              </span>
              <button
                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                className="rounded-md border border-border p-1 text-text-muted hover:bg-surface-elevated hover:text-text transition-colors"
              >
                <Plus className="h-3 w-3" />
              </button>
            </div>

            {/* Subtotal + remove */}
            <div className="text-right">
              <p className="font-display text-lg text-text">
                ${(item.price * item.quantity).toFixed(2)}
              </p>
              <button
                onClick={() => removeItem(item.id)}
                className="mt-1 text-text-muted hover:text-danger transition-colors"
                aria-label={`Remove ${item.name}`}
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Totals */}
      <div className="mt-8 border-t border-border pt-6">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-text-muted">Subtotal</span>
          <span className="font-display text-2xl text-text">${total.toFixed(2)}</span>
        </div>
      </div>

      {/* Actions */}
      <div className="mt-6 flex flex-col gap-3">
        <a
          href={buildWhatsAppHref(whatsappText)}
          target="_blank"
          rel={EXTERNAL_LINK_REL}
          className="btn-primary w-full py-3.5 text-base text-center"
        >
          Order via WhatsApp
        </a>
        <div className="flex gap-3">
          <Link href="/products" className="btn-secondary flex-1 py-3 text-center">
            Continue Shopping
          </Link>
          <button onClick={clearCart} className="btn-danger px-6 py-3">
            Clear
          </button>
        </div>
      </div>
    </div>
  );
}
