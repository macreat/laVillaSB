import Image from 'next/image';
import brandManifest from '@/lib/brand-manifest.json';

type MacreatScriptProps = {
  width: number;
  priority?: boolean;
  className?: string;
};

export function MacreatScript({
  width,
  priority = false,
  className,
}: MacreatScriptProps) {
  const { macreatScript } = brandManifest;

  return (
    <Image
      src={macreatScript.src}
      width={width}
      height={(width * macreatScript.height) / macreatScript.width}
      alt="Macreat"
      priority={priority}
      className={className}
    />
  );
}
