import Image from 'next/image';
import { WHATSAPP_URL, EXTERNAL_LINK_REL } from '@/lib/site-links';
import brandManifest from '@/lib/brand-manifest.json';

export default function AccountPage() {
  return (
    <div className="mx-auto max-w-lg px-4 py-16 text-center lg:px-8">
      <h1 className="font-display text-3xl uppercase tracking-wider text-text">
        Talk To Us
      </h1>
      <p className="mt-2 text-sm text-text-muted">
        No accounts here - just chat with us directly on WhatsApp.
      </p>
      <a
        href={WHATSAPP_URL}
        target="_blank"
        rel={EXTERNAL_LINK_REL}
        aria-label="Talk to us on WhatsApp"
        className="group mt-10 inline-block transition-transform hover:scale-105"
      >
        <Image
          src={brandManifest.sorneroLogo.src}
          width={200}
          height={200}
          alt="La Villa SB - chat with us on WhatsApp"
          className="h-40 w-40 rounded-2xl object-contain transition-opacity group-hover:opacity-80"
        />
      </a>
      <p className="mt-6 text-xs text-text-muted">
        Tap the logo to open WhatsApp and we will help you with your order.
      </p>
    </div>
  );
}