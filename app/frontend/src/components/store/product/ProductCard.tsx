'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useCart } from '@/hooks/useCart';
import { ShoppingCart } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  price: number;
  image?: string;
}

export function ProductCard({ product }: { product: Product }) {
  const { addItem } = useCart();
  const [imageFailed, setImageFailed] = useState(false);
  const imageSrc = !imageFailed ? product.image : '';

  return (
    <div className="group card-elevated relative overflow-hidden transition-all hover:border-accent/30 hover:shadow-lg hover:shadow-accent/5 p-0">
      {/* Image area */}
      <Link href={`/products/${product.id}`} className="block">
        <div className="flex aspect-square items-center justify-center bg-surface p-6">
          {imageSrc ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={imageSrc}
              alt={product.name}
              loading="lazy"
              className="h-full w-full rounded-lg object-cover"
              onError={() => setImageFailed(true)}
            />
          ) : (
            <div className="flex h-24 w-24 items-center justify-center rounded-lg border border-border text-text-muted">
              <svg className="h-10 w-10 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          )}
        </div>
      </Link>

      {/* Info */}
      <div className="p-4">
        <Link href={`/products/${product.id}`}>
          <h3 className="text-sm font-bold uppercase tracking-wide text-text group-hover:text-accent transition-colors line-clamp-1">
            {product.name}
          </h3>
        </Link>
        <div className="mt-1 flex items-center justify-between">
          <span className="font-display text-lg text-text">
            ${product.price.toFixed(2)}
          </span>
          <button
            onClick={() =>
              addItem({
                id: product.id,
                name: product.name,
                price: product.price,
                image: product.image,
              })
            }
            className="rounded-md bg-accent/10 p-2 text-accent transition-colors hover:bg-accent hover:text-bg"
            aria-label={`Add ${product.name} to cart`}
          >
            <ShoppingCart className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
