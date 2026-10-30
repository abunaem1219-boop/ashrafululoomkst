import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const publicDir = path.resolve('public');
const svgPath = path.join(publicDir, 'icon.svg');

async function generateIcons() {
  if (!fs.existsSync(svgPath)) {
    console.error('icon.svg not found!');
    return;
  }

  // 1. pwa-192x192.png
  await sharp(svgPath)
    .resize(192, 192)
    .png()
    .toFile(path.join(publicDir, 'pwa-192x192.png'));
  console.log('Created pwa-192x192.png');

  // 2. pwa-512x512.png
  await sharp(svgPath)
    .resize(512, 512)
    .png()
    .toFile(path.join(publicDir, 'pwa-512x512.png'));
  console.log('Created pwa-512x512.png');

  // 3. apple-touch-icon.png (180x180)
  await sharp(svgPath)
    .resize(180, 180)
    .png()
    .toFile(path.join(publicDir, 'apple-touch-icon.png'));
  console.log('Created apple-touch-icon.png');

  // 4. pwa-maskable-512x512.png (512x512 with 10% padding for Android safe zone)
  const innerIcon = await sharp(svgPath)
    .resize(410, 410)
    .toBuffer();

  await sharp({
    create: {
      width: 512,
      height: 512,
      channels: 4,
      background: { r: 3, g: 54, b: 36, alpha: 1 } // #033624
    }
  })
    .composite([{ input: innerIcon, top: 51, left: 51 }])
    .png()
    .toFile(path.join(publicDir, 'pwa-maskable-512x512.png'));
  console.log('Created pwa-maskable-512x512.png');

  // 5. favicon.ico / favicon.png
  await sharp(svgPath)
    .resize(64, 64)
    .png()
    .toFile(path.join(publicDir, 'favicon.png'));
  console.log('Created favicon.png');
}

generateIcons().catch(err => {
  console.error('Error generating icons:', err);
  process.exit(1);
});
