import Image from 'next/image';
import brandManifest from '@/lib/brand-manifest.json';

type FoxMarkProps = {
  size: number;
  className?: string;
};

export function FoxMark({ size, className }: FoxMarkProps) {
  const { foxMark } = brandManifest;

  return (
    <Image
      src={foxMark.src}
      width={(size * foxMark.width) / foxMark.height}
      height={size}
      alt="La Villa fox mark"
      className={className}
    />
  );
}
