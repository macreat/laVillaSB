'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { ProductCard } from '@/components/store/product/ProductCard';
import { fetchStoreProducts, type StoreProduct } from '@/lib/store-catalog';
import brandManifest from '@/lib/brand-manifest.json';

const CATEGORY_TILES = [
  { name: 'Decks', href: '/products?category=decks' },
  { name: 'Apparel', href: '/products?category=apparel' },
  { name: 'Accessories', href: '/products?category=accessories' },
  { name: 'Gear', href: '/products?category=gear' },
];

export default function StoreHomePage() {
  const [featuredProducts, setFeaturedProducts] = useState<StoreProduct[]>([]);

  useEffect(() => {
    fetchStoreProducts().then((products) => setFeaturedProducts(products.slice(0, 6)));
  }, []);

  const { villaScene, kunst, lavirgen, stickerFox } = brandManifest;

  return (
    <div>
      {/* 1. Hero */}
      <section className="relative overflow-hidden bg-villa-black">
        <div className="hero-reveal grid grid-cols-1 lg:grid-cols-5">
          {/* Image zone */}
          <div className="relative order-1 h-[62vh] min-h-[420px] lg:order-2 lg:col-span-3 lg:h-auto lg:min-h-[640px]">
            <Image
              src={villaScene.src}
              alt="La Villa skater tearing through a night street scene"
              fill
              priority
              placeholder="blur"
              blurDataURL={villaScene.blurDataURL}
              sizes="(min-width: 1024px) 60vw, 100vw"
              className="object-cover object-[70%_30%]"
            />
          </div>

          {/* Text zone, maroon tinted panel */}
          <div className="relative order-2 flex flex-col justify-center gap-8 bg-villa-maroon px-6 py-16 lg:order-1 lg:col-span-2 lg:px-12 lg:py-0">
            <p className="font-sans text-xs uppercase tracking-[0.12em] text-villa-smoke">
              Est. La Villa / Skate / Colombia
            </p>
            <h1 className="font-display text-6xl uppercase leading-[0.85] tracking-tight text-villa-bone sm:text-7xl lg:-mr-6 lg:text-8xl">
              The Darker Side
            </h1>
            <p className="max-w-sm text-base leading-relaxed text-villa-bone/80">
              Handpicked decks, apparel, and gear for the devoted fiend. Ride with us.
            </p>
            <div className="flex flex-wrap items-center gap-6">
              <Link href="/products" className="btn-primary px-8 py-3 text-base">
                Shop Now
              </Link>
              <Link
                href="/products?category=decks"
                className="text-sm font-semibold uppercase tracking-wide text-villa-bone underline decoration-villa-fox decoration-2 underline-offset-4 transition-colors hover:text-villa-fox"
              >
                Shop Decks
              </Link>
            </div>
          </div>
        </div>

        <style jsx>{`
          .hero-reveal {
            opacity: 0;
            transform: translateY(24px);
            animation: hero-reveal 500ms cubic-bezier(0.16, 1, 0.3, 1) forwards;
          }

          @keyframes hero-reveal {
            to {
              opacity: 1;
              transform: none;
            }
          }

          @media (prefers-reduced-motion: reduce) {
            .hero-reveal {
              animation: none;
              opacity: 1;
              transform: none;
            }
          }
        `}</style>
      </section>

      {/* 2. Featured products rail */}
      <section className="mx-auto max-w-7xl px-4 py-20 lg:px-8">
        <div className="mb-10 flex items-center gap-4 border-b border-villa-smoke/25 pb-6">
          <Image
            src={stickerFox.src}
            width={56}
            height={56}
            alt=""
            aria-hidden="true"
            className="-rotate-6 select-none"
          />
          <div>
            <h2 className="font-display text-3xl uppercase tracking-wide text-villa-bone sm:text-4xl">
              Featured
            </h2>
            <p className="mt-1 text-sm text-villa-smoke">
              Fresh drops and skate essentials
            </p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-3 lg:gap-6">
          {featuredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
        <div className="mt-10 text-center">
          <Link href="/products" className="btn-secondary px-8 py-3">
            View All Products
          </Link>
        </div>
      </section>

      {/* 3. Category tiles */}
      <section className="border-t border-villa-smoke/25 bg-villa-black">
        <div className="mx-auto max-w-7xl px-4 py-20 lg:px-8">
          <h2 className="mb-10 font-display text-3xl uppercase tracking-wide text-villa-bone sm:text-4xl">
            Shop By Category
          </h2>
          <div className="grid grid-cols-2 gap-px bg-villa-smoke/25 lg:grid-cols-4">
            {CATEGORY_TILES.map((cat) => (
              <Link
                key={cat.name}
                href={cat.href}
                className="category-tile flex h-32 items-center justify-center bg-villa-black lg:h-44"
              >
                <span className="category-tile__label font-display text-xl uppercase tracking-wide text-villa-bone transition-colors hover:text-villa-fox">
                  {cat.name}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 4. Community / editorial (kunst) */}
      <section className="relative -mt-px bg-villa-bone [clip-path:polygon(0_56px,100%_0,100%_100%,0_100%)]">
        <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-10 px-4 pb-20 pt-24 lg:grid-cols-10 lg:gap-16 lg:px-8 lg:pb-28 lg:pt-32">
          <div className="order-2 lg:order-1 lg:col-span-6">
            <h2 className="font-display text-4xl uppercase tracking-tight text-villa-black sm:text-5xl">
              Not Here To Fit In
            </h2>
            <p className="mt-6 max-w-md text-base leading-relaxed text-villa-black/80">
              We build for the ones who skate empty parking lots at midnight and
              never ask permission. Every graphic starts as a sketch on a wall,
              not a mood board, and the apparel is cut for movement, not for a
              lookbook.
            </p>
            <Link
              href="/products?category=apparel"
              className="mt-8 inline-flex items-center gap-2 border-b-2 border-villa-slime pb-1 text-sm font-semibold uppercase tracking-wide text-villa-black transition-colors hover:text-villa-slime"
            >
              Shop Apparel &rarr;
            </Link>
          </div>
          <div className="relative order-1 aspect-[1163/1200] w-full lg:order-2 lg:col-span-4 lg:justify-self-end">
            <Image
              src={kunst.src}
              alt="Raw hand-drawn illustration of a La Villa skater with slime-green lettering"
              fill
              loading="lazy"
              placeholder="blur"
              blurDataURL={kunst.blurDataURL}
              sizes="(min-width: 1024px) 40vw, 90vw"
              className="object-cover"
            />
          </div>
        </div>
      </section>

      {/* 5. Heritage / shop (lavirgen) */}
      <section className="relative bg-villa-black">
        <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-10 px-4 py-20 lg:grid-cols-10 lg:gap-16 lg:px-8 lg:py-28">
          <div className="relative order-1 aspect-[569/784] w-full lg:col-span-3">
            <Image
              src={lavirgen.src}
              alt="La Villa skate shop tattoo-flash Madonna illustration with blackletter banner"
              fill
              loading="lazy"
              placeholder="blur"
              blurDataURL={lavirgen.blurDataURL}
              sizes="(min-width: 1024px) 30vw, 90vw"
              className="object-cover"
            />
          </div>
          <div className="order-2 lg:col-span-7">
            <p className="text-xs font-medium uppercase tracking-[0.12em] text-villa-teal">
              La Villa Skate Shop
            </p>
            <h2 className="mt-3 font-display text-4xl uppercase tracking-tight text-villa-bone sm:text-5xl">
              Built From The Ground Up
            </h2>
            <p className="mt-6 max-w-md text-base leading-relaxed text-villa-smoke">
              La Villa started as a shop counter and a stack of decks nobody
              else would carry. Years later we still curate every board,
              graphic, and drop ourselves, no corporate committee involved.
            </p>
            <Link
              href="/products"
              className="mt-8 inline-flex items-center gap-2 border-b-2 border-villa-teal pb-1 text-sm font-semibold uppercase tracking-wide text-villa-bone transition-colors hover:text-villa-teal"
            >
              Visit The Shop &rarr;
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
