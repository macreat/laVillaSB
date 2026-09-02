import Image from 'next/image';
import brandManifest from '@/lib/brand-manifest.json';

type FoxMarkProps = {
  size: number;
  className?: string;
  white?: boolean;
};

export function FoxMark({ size, className, white }: FoxMarkProps) {
  const { foxMark } = brandManifest;

  return (
    <Image
      src={foxMark.src}
      width={(size * foxMark.width) / foxMark.height}
      height={size}
      alt="La Villa fox mark"
      className={`${white ? 'brightness-0 invert' : ''} ${className ?? ''}`}
    />
  );
}
