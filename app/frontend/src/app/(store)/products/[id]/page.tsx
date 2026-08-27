'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useCart } from '@/hooks/useCart';
import { ProductImage } from '@/components/store/product/ProductImage';
import { displayCategoryGroup, fetchStoreProduct, type StoreProduct } from '@/lib/store-catalog';
import { buildWhatsAppHref, EXTERNAL_LINK_REL } from '@/lib/site-links';

export default function ProductDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const { addItem } = useCart();
  const [product, setProduct] = useState<StoreProduct | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setNotFound(false);

    fetchStoreProduct(id)
      .then((data) => {
        if (!active) {
          return;
        }
        setProduct(data);
      })
      .catch(() => {
        if (!active) {
          return;
        }
        setNotFound(true);
      })
      .finally(() => {
        if (!active) {
          return;
        }
        setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [id]);

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-accent border-t-transparent" />
      </div>
    );
  }

  if (notFound || !product) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4">
        <p className="text-text-muted">Product not found.</p>
        <Link href="/products" className="btn-secondary">
          Back to Products
        </Link>
      </div>
    );
  }
  const whatsappText = `Hi, I'm interested in ${product.name} ($${product.price.toFixed(2)})`;

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 lg:px-8">
      <div className="mb-6">
        <Link href="/products" className="text-sm text-text-muted hover:text-accent transition-colors">
          &larr; Back to Products
        </Link>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Image */}
        <ProductImage
          src={product.image}
          alt={product.name}
          className="flex aspect-square items-center justify-center rounded-lg border border-border bg-surface p-8"
          fallbackClassName="flex h-40 w-40 items-center justify-center rounded-xl border border-border text-text-muted"
          imageClassName="h-full w-full rounded-lg object-cover"
        />

        {/* Details */}
        <div>
          <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-accent">
            {displayCategoryGroup(product.categoryGroup)}
          </p>
          <h1 className="font-display text-3xl uppercase tracking-wider text-text sm:text-4xl">
            {product.name}
          </h1>
          <p className="mt-4 font-display text-2xl text-text">
            ${product.price.toFixed(2)}
          </p>
          <p className="mt-4 text-sm text-text-muted leading-relaxed">
            {product.description ?? 'Live catalog product.'}
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <button
              onClick={() =>
                addItem({
                  id,
                  name: product.name,
                  price: product.price,
                  image: product.image,
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
                href={buildWhatsAppHref(whatsappText)}
                target="_blank"
                rel={EXTERNAL_LINK_REL}
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
