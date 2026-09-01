'use client';

import Image from 'next/image';
import brandManifest from '@/lib/brand-manifest.json';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

export function SkeletonRows({ label, rows = 6 }: { label: string; rows?: number }) {
  return (
    <Card className="p-0">
      <div role="status" aria-label={label} className="divide-y divide-villa-smoke/25">
        {Array.from({ length: rows }).map((_, index) => (
          <div key={index} className="h-11 w-full animate-pulse bg-surface-elevated" />
        ))}
      </div>
    </Card>
  );
}

export function ServiceOfflinePanel({
  description,
  onRetry,
  retrying = false,
}: {
  description: string;
  onRetry: () => void;
  retrying?: boolean;
}) {
  return (
    <Card>
      <div className="flex flex-col items-center gap-3 py-12 text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-text-muted">
          Servicio Fuera De Linea
        </p>
        <p aria-live="polite" className="max-w-md text-sm text-text-muted">
          {description}
        </p>
        <Button variant="secondary" onClick={onRetry} isLoading={retrying}>
          Reintentar
        </Button>
      </div>
    </Card>
  );
}

export function EmptyStatePanel({ title, description }: { title: string; description: string }) {
  const { stickerFox } = brandManifest;

  return (
    <Card>
      <div className="flex flex-col items-center gap-3 py-12 text-center">
        <Image
          src={stickerFox.src}
          width={(96 * stickerFox.width) / stickerFox.height}
          height={96}
          alt=""
          aria-hidden="true"
          className="opacity-90"
        />
        <p className="text-lg font-medium text-text-muted">{title}</p>
        <p className="text-sm text-text-muted">{description}</p>
      </div>
    </Card>
  );
}
