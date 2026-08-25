import Image from 'next/image';
import brandManifest from '@/lib/brand-manifest.json';

type BrandWordmarkProps = {
  variant?: 'default' | 'fire' | 'camo';
  width: number;
  priority?: boolean;
  className?: string;
};

const wordmarks = {
  default: brandManifest.wordmark,
  fire: brandManifest.wordmarkFire,
  camo: brandManifest.wordmarkCamo,
} as const;

export function BrandWordmark({
  variant = 'default',
  width,
  priority = false,
  className,
}: BrandWordmarkProps) {
  const wordmark = wordmarks[variant];

  return (
    <Image
      src={wordmark.src}
      width={width}
      height={(width * wordmark.height) / wordmark.width}
      alt="La Villa Skateboarding"
      priority={priority}
      className={className}
    />
  );
}
