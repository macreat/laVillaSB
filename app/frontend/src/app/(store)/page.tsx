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

  const { kunst, lavirgen, stickerFox, lavillaSbHero, sorneroLogo, sorneroFox, lavillaSb, logoOG, logoFuego } = brandManifest;

  return (
    <div>
      {/* 1. Hero */}
      <section className="relative overflow-hidden bg-villa-black">
        <div className="hero-reveal grid grid-cols-1 gap-2 lg:grid-cols-7 lg:gap-3">
          {/* Image zone */}
          <div className="group/hero relative order-1 h-[52vh] min-h-[360px] overflow-hidden lg:order-2 lg:col-span-4 lg:h-auto lg:min-h-[600px]">
            <Image
              src={lavillaSbHero.src}
              alt="La Villa SB full brand logo"
              fill
              priority
              sizes="(min-width: 1024px) 57vw, 100vw"
              className="scale-100 object-cover object-center transition-transform duration-700 ease-out group-hover/hero:scale-[1.04]"
            />
            {/* Edge falloff so the crop blends into the black section */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 bg-gradient-to-t from-villa-black/45 via-transparent to-transparent lg:bg-gradient-to-r lg:from-villa-black/35 lg:via-transparent lg:to-transparent"
            />
          </div>

          {/* Text zone, maroon tinted panel */}
          <div className="relative order-2 flex flex-col justify-center gap-8 bg-villa-maroon px-6 py-16 lg:order-1 lg:col-span-3 lg:px-12 lg:py-0">
            <h1 className="font-display text-6xl uppercase leading-[0.82] text-villa-bone sm:text-7xl lg:-mr-6 lg:text-[5.75rem] lg:leading-[0.8]">
              <span className="logo-type block">La Villa</span>
              <span className="logo-type block">Es La Ley</span>
            </h1>
            <p className="max-w-sm text-base leading-relaxed text-villa-bone/80">
              Tablas, ropa y equipo para los que ruedan a su manera.
            </p>
            <div className="flex flex-wrap items-center gap-6">
              <Link href="/products" className="btn-primary press-scale px-8 py-3 text-base">
                Comprar Ahora
              </Link>
              <Link
                href="/products?category=decks"
                className="text-sm font-semibold uppercase tracking-wide text-villa-bone underline decoration-villa-fox decoration-2 underline-offset-4 transition-colors hover:text-villa-fox text-glow-hover"
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

      {/* 1b. "La Villa Es La Ley" marquee band */}
      <section aria-hidden="true" className="relative z-10">
        <div className="marquee border-y border-villa-fox/30 bg-villa-black py-3.5">
          {[0, 1].map((track) => (
            <div key={track} className="marquee__track">
              {Array.from({ length: 8 }).map((_, i) => (
                <span key={i} className="marquee__item font-display text-2xl uppercase tracking-tight text-villa-bone/80 sm:text-3xl">
                  La Villa Es La Ley
                  <span className="text-villa-fox">&#9670;</span>
                </span>
              ))}
            </div>
          ))}
        </div>
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
              Lo que acaba de salir.
            </p>
          </div>
        </div>
        <p className="mb-8 max-w-md text-sm leading-relaxed text-villa-smoke/70">
          Graficos nuevos. Prendas nuevas. Lo demas puede esperar.
        </p>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-3 lg:gap-6">
          {featuredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
        <div className="mt-10 text-center">
          <Link href="/products" className="btn-secondary press-scale px-8 py-3">
            Ver Todos Los Productos
          </Link>
        </div>
      </section>

      {/* 3. Community / editorial (kunst) */}
      <section className="relative -mt-px bg-villa-bone [clip-path:polygon(0_56px,100%_0,100%_100%,0_100%)]">
        <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-10 px-4 pb-20 pt-24 lg:grid-cols-10 lg:gap-16 lg:px-8 lg:pb-28 lg:pt-32">
          <div className="order-2 lg:order-1 lg:col-span-6">
            <h2 className="font-display text-4xl uppercase tracking-tight text-villa-black sm:text-5xl">
              No Estamos Para Encajar
            </h2>
            <p className="mt-6 max-w-lg text-base leading-relaxed text-villa-black/80">
              No hacemos skatewear para combinar con el resto.
              Hacemos cosas para los que salen cuando la ciudad esta vacia,
              ruedan hasta tarde y convierten cualquier lugar en spot.
            </p>
            <p className="mt-4 max-w-lg text-base leading-relaxed text-villa-black/80">
              Cada grafico nace de una idea, un garabato, una pared o una obsesion.
              Nada de plantillas. Nada de reuniones para decidir que esta de moda.
            </p>
            <p className="mt-4 max-w-lg text-sm font-semibold uppercase tracking-wide text-villa-black">
              Hecho para rodar. Hecho para durar. Hecho en La Villa.
            </p>
            <Link
              href="/products?category=apparel"
              className="mt-8 inline-flex items-center gap-2 border-b-2 border-villa-slime pb-1 text-sm font-semibold uppercase tracking-wide text-villa-black transition-colors hover:text-villa-slime text-glow-hover"
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

      {/* 4. Heritage / shop (lavirgen) */}
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
            <p className="mt-6 max-w-lg text-base leading-relaxed text-villa-smoke">
              Empezamos con un mostrador, unas cuantas tablas y ganas de hacer
              las cosas diferente. Seguimos igual.
            </p>
            <p className="mt-4 max-w-lg text-base leading-relaxed text-villa-smoke">
              Seleccionamos cada tabla, cada grafico y cada drop porque creemos
              que lo que llevas encima deberia tener algo que decir.
            </p>
            <p className="mt-4 max-w-lg text-sm text-villa-smoke/70">
              Sin comites. Sin formulas. Sin pedir permiso.
            </p>
            <p className="mt-6 text-sm font-semibold uppercase tracking-wide text-villa-teal">
              La Villa.<br />
              Est. Narino, Colombia.
            </p>
            <Link
              href="/products"
              className="mt-8 inline-flex items-center gap-2 border-b-2 border-villa-teal pb-1 text-sm font-semibold uppercase tracking-wide text-villa-bone transition-colors hover:text-villa-teal text-glow-hover"
            >
              Visitar La Tienda &rarr;
            </Link>
          </div>
        </div>
      </section>

      {/* 5. Shop By Category */}
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
                className="group shine-hover glow-hover rounded-lg border border-villa-smoke/20 bg-villa-ink p-6 text-center transition-colors hover:border-villa-teal hover:bg-villa-ink/80"
              >
                <p className="font-display text-lg uppercase tracking-wide text-villa-bone transition-colors group-hover:text-villa-teal">
                  {cat.label}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 6. Cierre */}
      <section className="cierre-bg group/cierre relative bg-villa-void py-20 lg:py-28">
        <div aria-hidden="true" className="cierre-shine" />
        <div className="mx-auto max-w-3xl px-4 text-center lg:px-8">
          <h2 className="font-display text-5xl uppercase leading-[0.85] tracking-tight text-villa-bone sm:text-6xl lg:text-7xl transition-text-shadow duration-300 group-hover/cierre:[text-shadow:0_0_40px_rgba(79,131,241,0.3)]">
            Rueda Con Nosotros.
          </h2>
          <p className="mt-8 max-w-md mx-auto text-base leading-relaxed text-villa-bone/80">
            La calle no necesita otra marca.<br />
            Necesita algo real.
          </p>
          <p className="mt-6 font-display text-2xl uppercase tracking-wider text-villa-fox">
            La Villa Es La Ley.
          </p>
          <div className="mt-10">
            <Link href="/products" className="btn-primary press-scale px-10 py-4 text-base glow-hover">
              Comprar Ahora
            </Link>
          </div>
        </div>
      </section>

      {/* 7. Logos & Graphics - Brand Identity */}
      <section className="relative -mt-px bg-villa-black py-16 lg:py-24">
        <div className="mx-auto max-w-5xl px-4 lg:px-8">
          <div className="mb-12 text-center">
            <p className="text-xs font-medium uppercase tracking-[0.12em] text-villa-fox">
              Identidad De Marca
            </p>
            <h2 className="mt-3 font-display text-3xl uppercase tracking-tight text-villa-bone sm:text-4xl">
              Nuestros Logos Y Graficos
            </h2>
          </div>
          
          <div className="grid grid-cols-3 gap-6 lg:gap-10">
            {/* Row 1 */}
            <div className="flex flex-col items-center gap-3">
              <div className="logo-hover shine-hover relative aspect-square w-full max-w-[220px] mx-auto overflow-hidden rounded-lg border border-villa-smoke/10 bg-villa-ink/30 p-4">
                <Image
                  src={sorneroLogo.src}
                  alt="Sornero La Villa Logo - Main brand mark"
                  fill
                  loading="lazy"
                  sizes="(min-width: 768px) 25vw, 33vw"
                  className="object-contain"
                />
              </div>
              <p className="text-center text-xs font-medium text-villa-smoke">Sornero Logo</p>
            </div>

            <div className="flex flex-col items-center gap-3">
              <div className="logo-hover shine-hover relative aspect-square w-full max-w-[220px] mx-auto overflow-hidden rounded-lg border border-villa-smoke/10 bg-villa-ink/30 p-4">
                <Image
                  src={sorneroFox.src}
                  alt="Sornero Zorror - Fox mascot illustration"
                  fill
                  loading="lazy"
                  sizes="(min-width: 768px) 25vw, 33vw"
                  className="object-contain"
                />
              </div>
              <p className="text-center text-xs font-medium text-villa-smoke">Sornero Zorror</p>
            </div>

            <div className="flex flex-col items-center gap-3">
              <div className="logo-hover shine-hover relative aspect-square w-full max-w-[220px] mx-auto overflow-hidden rounded-lg border border-villa-smoke/10 bg-villa-ink/30 p-4">
                <Image
                  src={lavillaSb.src}
                  alt="La Villa Skateboarding - Full brand logo"
                  fill
                  loading="lazy"
                  sizes="(min-width: 768px) 25vw, 33vw"
                  className="object-contain"
                />
              </div>
              <p className="text-center text-xs font-medium text-villa-smoke">La Villa SB</p>
            </div>

            {/* Row 2 */}
            <div className="flex flex-col items-center gap-3">
              <div className="logo-hover shine-hover relative aspect-square w-full max-w-[220px] mx-auto overflow-hidden rounded-lg border border-villa-smoke/10 bg-villa-ink/30 p-4">
                <Image
                  src={logoOG.src}
                  alt="Logo OG - Original brand mark"
                  fill
                  loading="lazy"
                  sizes="(min-width: 768px) 25vw, 33vw"
                  className="object-contain"
                />
              </div>
              <p className="text-center text-xs font-medium text-villa-smoke">Logo OG</p>
            </div>

            <div className="flex flex-col items-center gap-3">
              <div className="logo-hover shine-hover relative aspect-square w-full max-w-[220px] mx-auto overflow-hidden rounded-lg border border-villa-smoke/10 bg-villa-ink/30 p-4">
                <Image
                  src={logoFuego.src}
                  alt="Logo Fuego - Fire variant brand mark"
                  fill
                  loading="lazy"
                  sizes="(min-width: 768px) 25vw, 33vw"
                  className="object-contain"
                />
              </div>
              <p className="text-center text-xs font-medium text-villa-smoke">Logo Fuego</p>
            </div>

            <div className="flex flex-col items-center gap-3">
              <div className="logo-hover shine-hover relative aspect-square w-full max-w-[220px] mx-auto overflow-hidden rounded-lg border border-villa-smoke/10 bg-villa-ink/30 p-4">
                <Image
                  src={brandManifest.azulCamo.src}
                  alt="Azul Camo - Blue camouflage pattern"
                  fill
                  loading="lazy"
                  sizes="(min-width: 768px) 25vw, 33vw"
                  className="object-contain"
                />
              </div>
              <p className="text-center text-xs font-medium text-villa-smoke">Azul Camo</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
