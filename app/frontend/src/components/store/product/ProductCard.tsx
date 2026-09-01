'use client';

import Link from 'next/link';
import { useCart } from '@/hooks/useCart';
import { ShoppingCart } from 'lucide-react';
import { ProductImage } from './ProductImage';

interface Product {
  id: string;
  name: string;
  price: number;
  image?: string;
}

export function ProductCard({ product }: { product: Product }) {
  const { addItem } = useCart();

  return (
    <div className="group card-elevated relative overflow-hidden transition-all hover:border-accent/30 hover:shadow-lg hover:shadow-accent/5 p-0">
      {/* Image area */}
      <Link href={`/products/${product.id}`} className="block">
        <ProductImage src={product.image} alt={product.name} />
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
            aria-label={`Agregar ${product.name} al carrito`}
          >
            <ShoppingCart className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
