#!/usr/bin/env node
/**
 * Build optimized web derivatives of the La Villa brand artwork.
 *
 * Sources live outside the repo in reference/docs/imgs (read-only originals).
 * Outputs land in public/brand plus a typed manifest in src/lib/brand-manifest.json
 * containing intrinsic dimensions and blur placeholders for next/image.
 *
 * Usage: npm run build:brand
 */
import { mkdir, writeFile, access } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const FRONTEND_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SOURCE_DIR =
  process.env.BRAND_SOURCE_DIR ??
  path.resolve(FRONTEND_DIR, '../../../reference/docs/imgs');
const OUT_DIR = path.join(FRONTEND_DIR, 'public/brand');
const MANIFEST_PATH = path.join(FRONTEND_DIR, 'src/lib/brand-manifest.json');
const APP_DIR = path.join(FRONTEND_DIR, 'src/app');

const ILLUSTRATIONS = 'graphicLin/ilustraciones/Ilustraciones La Villa';

/**
 * whiteOnBlack: source is white artwork on a black field; the black is
 * converted to transparency (luminance becomes the alpha channel) so the
 * mark can sit on any dark surface.
 */
const ASSETS = [
  { key: 'wordmark', src: `${ILLUSTRATIONS}/logoOG.png`, whiteOnBlack: true, format: 'png' },
  { key: 'wordmarkFire', src: 'graphicLin/logo/Dos/logo fuego SI.png', format: 'webp' },
  { key: 'wordmarkCamo', src: 'graphicLin/logo/Dos/Azul.png', format: 'webp' },
  { key: 'foxMark', src: `${ILLUSTRATIONS}/Sornero-La Villa Logo.png`, whiteOnBlack: true, format: 'png', maxEdge: 640 },
  { key: 'foxSornero', src: `${ILLUSTRATIONS}/Sornero zorror.png`, format: 'webp', maxEdge: 1600, blur: true },
  { key: 'villaScene', src: `${ILLUSTRATIONS}/lavillasb.png`, format: 'webp', maxEdge: 1600, blur: true },
  { key: 'kunst', src: `${ILLUSTRATIONS}/kunst.png`, format: 'webp', maxEdge: 1200, blur: true },
  { key: 'lavirgen', src: `${ILLUSTRATIONS}/lavirgen.png`, format: 'webp', blur: true },
  { key: 'stickerFox', src: `${ILLUSTRATIONS}/IMG_2890.png`, format: 'webp' },
  { key: 'stickerBubble', src: `${ILLUSTRATIONS}/IMG_2899.png`, format: 'webp' },
  { key: 'macreatScript', src: 'designLet/macreat.jpeg', whiteOnBlack: true, format: 'png' },
];

const kebab = (key) => key.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`);

async function whiteOnBlackToAlpha(sourcePath) {
  // Flatten onto black first so pre-existing transparency reads as black,
  // then use luminance as the alpha channel of a pure-white fill.
  const { data, info } = await sharp(sourcePath)
    .flatten({ background: '#000000' })
    .greyscale()
    .raw()
    .toBuffer({ resolveWithObject: true });
  return sharp({
    create: {
      width: info.width,
      height: info.height,
      channels: 3,
      background: { r: 255, g: 255, b: 255 },
    },
  })
    .joinChannel(data, { raw: { width: info.width, height: info.height, channels: 1 } })
    .png();
}

async function buildAsset(asset) {
  const sourcePath = path.join(SOURCE_DIR, asset.src);
  await access(sourcePath);

  let image = asset.whiteOnBlack ? await whiteOnBlackToAlpha(sourcePath) : sharp(sourcePath);

  const meta = await image.clone().metadata();
  let { width, height } = meta;
  if (asset.maxEdge && Math.max(width, height) > asset.maxEdge) {
    const scale = asset.maxEdge / Math.max(width, height);
    width = Math.round(width * scale);
    height = Math.round(height * scale);
    image = image.resize({ width, height });
  }

  const fileName = `${kebab(asset.key)}.${asset.format}`;
  const output =
    asset.format === 'webp' ? image.webp({ quality: 82 }) : image.png({ compressionLevel: 9 });
  await output.toFile(path.join(OUT_DIR, fileName));

  let blurDataURL;
  if (asset.blur) {
    const blurBuffer = await sharp(path.join(OUT_DIR, fileName))
      .resize(16)
      .webp({ quality: 40 })
      .toBuffer();
    blurDataURL = `data:image/webp;base64,${blurBuffer.toString('base64')}`;
  }

  return [asset.key, { src: `/brand/${fileName}`, width, height, ...(blurDataURL && { blurDataURL }) }];
}

async function buildFavicons() {
  const foxSource = path.join(SOURCE_DIR, `${ILLUSTRATIONS}/Sornero-La Villa Logo.png`);
  const onBlack = sharp(await (await whiteOnBlackToAlpha(foxSource)).toBuffer())
    .flatten({ background: '#0A0A0A' });
  await onBlack.clone().resize(512, 512, { fit: 'contain', background: '#0A0A0A' })
    .png().toFile(path.join(APP_DIR, 'icon.png'));
  await onBlack.clone().resize(180, 180, { fit: 'contain', background: '#0A0A0A' })
    .png().toFile(path.join(APP_DIR, 'apple-icon.png'));
}

async function main() {
  await mkdir(OUT_DIR, { recursive: true });
  const entries = [];
  for (const asset of ASSETS) {
    try {
      entries.push(await buildAsset(asset));
      console.log(`built ${asset.key}`);
    } catch (error) {
      console.error(`FAILED ${asset.key} (${asset.src}): ${error.message}`);
      process.exitCode = 1;
    }
  }
  await buildFavicons();
  console.log('built favicons (icon.png, apple-icon.png)');
  await writeFile(MANIFEST_PATH, `${JSON.stringify(Object.fromEntries(entries), null, 2)}\n`);
  console.log(`manifest: ${path.relative(FRONTEND_DIR, MANIFEST_PATH)} (${entries.length} assets)`);
}

main();
