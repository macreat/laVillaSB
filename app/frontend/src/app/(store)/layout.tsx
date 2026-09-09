import { Suspense } from 'react';
import { StoreHeader } from '@/components/store/StoreHeader';
import { StoreFooter } from '@/components/store/StoreFooter';
import { CookiesConsent } from '@/components/store/CookiesConsent';

export default function StoreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      {/* The header reads the browse params to mark the current nav entry, so it
          needs its own boundary to stay statically prerenderable. */}
      <Suspense fallback={<div className="h-[86px] bg-villa-black" />}>
        <StoreHeader />
      </Suspense>
      <main className="flex-1">{children}</main>
      <StoreFooter />
      <CookiesConsent />
    </div>
  );
}
