import Image from 'next/image';
import { WHATSAPP_URL, EXTERNAL_LINK_REL } from '@/lib/site-links';
import brandManifest from '@/lib/brand-manifest.json';

export default function AccountPage() {
  return (
    <div className="mx-auto max-w-lg px-4 py-16 text-center lg:px-8">
      <h1 className="font-display text-3xl uppercase tracking-wider text-text">
        Hablanos
      </h1>
      <p className="mt-2 text-sm text-text-muted">
        No hay cuentas aca - hablanos directo por WhatsApp.
      </p>
      <a
        href={WHATSAPP_URL}
        target="_blank"
        rel={EXTERNAL_LINK_REL}
        aria-label="Hablanos por WhatsApp"
        className="group mt-10 inline-block transition-transform hover:scale-105"
      >
        <Image
          src={brandManifest.sorneroLogo.src}
          width={200}
          height={200}
          alt="La Villa SB - hablanos por WhatsApp"
          className="h-40 w-40 rounded-2xl object-contain transition-opacity group-hover:opacity-80"
        />
      </a>
      <p className="mt-6 text-xs text-text-muted">
        Toca el logo para abrir WhatsApp y te ayudamos con tu pedido.
      </p>
    </div>
  );
}