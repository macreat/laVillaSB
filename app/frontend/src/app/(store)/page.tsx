'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { ProductCard } from '@/components/store/product/ProductCard';
import { fetchStoreProducts, type StoreProduct } from '@/lib/store-catalog';
import brandManifest from '@/lib/brand-manifest.json';


export default function StoreHomePage() {
  const [featuredProducts, setFeaturedProducts] = useState<StoreProduct[]>([]);

  useEffect(() => {
    fetchStoreProducts().then((products) => setFeaturedProducts(products.slice(0, 6)));
  }, []);

  const { villaScene, kunst, lavirgen, stickerFox, sorneroLogo, sorneroFox, lavillaSb, lavillaSbHero, logoOG, logoFuego } = brandManifest;

  return (
    <div>
      {/* 1. Hero */}
      <section className="relative overflow-hidden bg-villa-black">
        <div className="hero-reveal grid grid-cols-1 gap-2 lg:grid-cols-7 lg:gap-3">
          {/* Image zone */}
          <div className="relative order-1 h-[45vh] min-h-[320px] lg:order-2 lg:col-span-4 lg:h-auto lg:min-h-[450px]">
            <Image
              src={lavillaSbHero.src}
              alt="La Villa SB full brand logo"
              fill
              priority
              sizes="(min-width: 1024px) 57vw, 100vw"
              className="object-contain object-center"
            />
          </div>

          {/* Text zone, maroon tinted panel */}
          <div className="relative order-2 flex flex-col justify-center gap-8 bg-villa-maroon px-6 py-16 lg:order-1 lg:col-span-3 lg:px-12 lg:py-0">
            <p className="font-sans text-xs uppercase tracking-[0.12em] text-villa-smoke">
              Est. La Villa / Skate / Colombia
            </p>
            <h1 className="font-display text-6xl uppercase leading-[0.85] tracking-tight text-villa-bone sm:text-7xl lg:-mr-6 lg:text-8xl">
              La Villa Es La Ley
            </h1>
            <p className="max-w-sm text-base leading-relaxed text-villa-bone/80">
              Tablas, ropa y equipo seleccionados para los que siguen la ley del skate. Roda con nosotros.
            </p>
            <div className="flex flex-wrap items-center gap-6">
              <Link href="/products" className="btn-primary px-8 py-3 text-base">
                Comprar Ahora
              </Link>
              <Link
                href="/products?category=decks"
                className="text-sm font-semibold uppercase tracking-wide text-villa-bone underline decoration-villa-fox decoration-2 underline-offset-4 transition-colors hover:text-villa-fox"
              >
                Ver Tablas
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
              Lo Mas Nuevo
            </h2>
            <p className="mt-1 text-sm text-villa-smoke">
              Drops frescos y lo esencial del skate
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
            Ver Todos Los Productos
          </Link>
        </div>
      </section>

      {/* 4. Community / editorial (kunst) */}
      <section className="relative -mt-px bg-villa-bone [clip-path:polygon(0_56px,100%_0,100%_100%,0_100%)]">
        <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-10 px-4 pb-20 pt-24 lg:grid-cols-10 lg:gap-16 lg:px-8 lg:pb-28 lg:pt-32">
          <div className="order-2 lg:order-1 lg:col-span-6">
            <h2 className="font-display text-4xl uppercase tracking-tight text-villa-black sm:text-5xl">
              No Estamos Para Encajar
            </h2>
            <p className="mt-6 max-w-md text-base leading-relaxed text-villa-black/80">
              Creamos para los que rodan estacionamientos vacios de madrugada y
              nunca piden permiso. Cada grafico empieza como un garabato en la
              pared, no en un mood board, y la ropa esta cortada para el
              movimiento, no para un catalogo.
            </p>
            <Link
              href="/products?category=apparel"
              className="mt-8 inline-flex items-center gap-2 border-b-2 border-villa-slime pb-1 text-sm font-semibold uppercase tracking-wide text-villa-black transition-colors hover:text-villa-slime"
            >
              Ver Ropa &rarr;
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

      {/* 4.5 Shop By Category */}
      <section className="relative border-t border-villa-smoke/10 bg-villa-black py-16 lg:py-20">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <div className="mb-10 text-center">
            <p className="text-xs font-medium uppercase tracking-[0.12em] text-villa-teal">
              Comprar Por Categoria
            </p>
            <h2 className="mt-3 font-display text-3xl uppercase tracking-tight text-villa-bone sm:text-4xl">
              Encuentra Tu Estilo
            </h2>
          </div>
          <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
            {[
              { label: 'Tablas', href: '/products?category=decks' },
              { label: 'Ropa', href: '/products?category=apparel' },
              { label: 'Accesorios', href: '/products?category=accessories' },
              { label: 'Equipo', href: '/products?category=gear' },
            ].map((cat) => (
              <Link
                key={cat.label}
                href={cat.href}
                className="group rounded-lg border border-villa-smoke/20 bg-villa-ink p-6 text-center transition-colors hover:border-villa-teal hover:bg-villa-ink/80"
              >
                <p className="font-display text-lg uppercase tracking-wide text-villa-bone transition-colors group-hover:text-villa-teal">
                  {cat.label}
                </p>
              </Link>
            ))}
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
              Hecho Desde Cero
            </h2>
            <p className="mt-6 max-w-md text-base leading-relaxed text-villa-smoke">
              La Villa empezo con un mostrador y un monton de tablas que nadie
              mas queria. Anos despues seguimos seleccionando cada tabla,
              grafico y drop nosotros mismos, sin comites corporativos.
            </p>
            <Link
              href="/products"
              className="mt-8 inline-flex items-center gap-2 border-b-2 border-villa-teal pb-1 text-sm font-semibold uppercase tracking-wide text-villa-bone transition-colors hover:text-villa-teal"
            >
              Visitar La Tienda &rarr;
            </Link>
          </div>
        </div>
      </section>

      {/* 6. Logos & Graphics - Original Brand Identity */}
      <section className="relative -mt-px bg-villa-maroon py-16 lg:py-24">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <div className="mb-12 text-center">
            <p className="text-xs font-medium uppercase tracking-[0.12em] text-villa-fox">
              Identidad De Marca
            </p>
            <h2 className="mt-3 font-display text-3xl uppercase tracking-tight text-villa-bone sm:text-4xl">
              Nuestros Logos Y Graficos
            </h2>
          </div>
          
          <div className="grid grid-cols-2 gap-8 md:grid-cols-3 lg:grid-cols-4">
            {/* Sornero Logo */}
            <div className="flex flex-col items-center gap-4">
              <div className="relative aspect-square w-full overflow-hidden">
                <Image
                  src={sorneroLogo.src}
                  alt="Sornero La Villa Logo - Main brand mark"
                  fill
                  loading="lazy"
                  sizes="(min-width: 768px) 25vw, 50vw"
                  className="object-contain"
                />
              </div>
              <p className="text-center text-sm font-medium text-villa-bone">Sornero Logo</p>
            </div>

            {/* Sornero Fox */}
            <div className="flex flex-col items-center gap-4">
              <div className="relative aspect-square w-full overflow-hidden">
                <Image
                  src={sorneroFox.src}
                  alt="Sornero Zorror - Fox mascot illustration"
                  fill
                  loading="lazy"
                  sizes="(min-width: 768px) 25vw, 50vw"
                  className="object-contain"
                />
              </div>
              <p className="text-center text-sm font-medium text-villa-bone">Sornero Zorror</p>
            </div>

            {/* La Villa SB */}
            <div className="flex flex-col items-center gap-4">
              <div className="relative aspect-square w-full overflow-hidden">
                <Image
                  src={lavillaSb.src}
                  alt="La Villa Skateboarding - Full brand logo"
                  fill
                  loading="lazy"
                  sizes="(min-width: 768px) 25vw, 50vw"
                  className="object-contain"
                />
              </div>
              <p className="text-center text-sm font-medium text-villa-bone">La Villa SB</p>
            </div>

            {/* Logo OG */}
            <div className="flex flex-col items-center gap-4">
              <div className="relative aspect-square w-full overflow-hidden">
                <Image
                  src={logoOG.src}
                  alt="Logo OG - Original brand mark"
                  fill
                  loading="lazy"
                  sizes="(min-width: 768px) 25vw, 50vw"
                  className="object-contain"
                />
              </div>
              <p className="text-center text-sm font-medium text-villa-bone">Logo OG</p>
            </div>

            {/* Logo Fuego */}
            <div className="flex flex-col items-center gap-4">
              <div className="relative aspect-square w-full overflow-hidden">
                <Image
                  src={logoFuego.src}
                  alt="Logo Fuego - Fire variant brand mark"
                  fill
                  loading="lazy"
                  sizes="(min-width: 768px) 25vw, 50vw"
                  className="object-contain"
                />
              </div>
              <p className="text-center text-sm font-medium text-villa-bone">Logo Fuego</p>
            </div>

            {/* Azul Camo */}
            <div className="flex flex-col items-center gap-4">
              <div className="relative aspect-square w-full overflow-hidden">
                <Image
                  src={brandManifest.azulCamo.src}
                  alt="Azul Camo - Blue camouflage pattern"
                  fill
                  loading="lazy"
                  sizes="(min-width: 768px) 25vw, 50vw"
                  className="object-contain"
                />
              </div>
              <p className="text-center text-sm font-medium text-villa-bone">Azul Camo</p>
            </div>

            {/* Fox Mark */}
            <div className="flex flex-col items-center gap-4">
              <div className="relative aspect-square w-full overflow-hidden">
                <Image
                  src={brandManifest.foxMark.src}
                  alt="Fox Mark - Iconic fox symbol"
                  fill
                  loading="lazy"
                  sizes="(min-width: 768px) 25vw, 50vw"
                  className="object-contain"
                />
              </div>
              <p className="text-center text-sm font-medium text-villa-bone">Fox Mark</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
