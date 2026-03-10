/**
 * Generate PWA icons from an SVG source.
 * Usage: npx tsx scripts/generate-pwa-icons.ts
 * Requires: sharp (already in dependencies)
 */
import sharp from "sharp";
import path from "path";
import fs from "fs";

const ICONS_DIR = path.join(process.cwd(), "public", "icons");

// Emerald SIGA180 logo SVG
const logoSvg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <rect width="512" height="512" rx="96" fill="#10b981"/>
  <text x="256" y="200" text-anchor="middle" font-family="Arial,sans-serif" font-weight="bold" font-size="120" fill="white">SIGA</text>
  <text x="256" y="350" text-anchor="middle" font-family="Arial,sans-serif" font-weight="bold" font-size="160" fill="white">180</text>
</svg>`;

// Maskable version (more padding for safe zone)
const maskableSvg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <rect width="512" height="512" fill="#10b981"/>
  <text x="256" y="210" text-anchor="middle" font-family="Arial,sans-serif" font-weight="bold" font-size="100" fill="white">SIGA</text>
  <text x="256" y="340" text-anchor="middle" font-family="Arial,sans-serif" font-weight="bold" font-size="130" fill="white">180</text>
</svg>`;

const sizes = [32, 72, 96, 128, 144, 152, 180, 192, 384, 512];
const maskableSizes = [192, 512];

async function generateIcons() {
  if (!fs.existsSync(ICONS_DIR)) {
    fs.mkdirSync(ICONS_DIR, { recursive: true });
  }

  const svgBuffer = Buffer.from(logoSvg);
  const maskableBuffer = Buffer.from(maskableSvg);

  for (const size of sizes) {
    const filename =
      size === 180
        ? "apple-touch-icon.png"
        : `icon-${size}x${size}.png`;
    await sharp(svgBuffer)
      .resize(size, size)
      .png()
      .toFile(path.join(ICONS_DIR, filename));
    console.log(`✓ ${filename}`);
  }

  for (const size of maskableSizes) {
    const filename = `icon-maskable-${size}x${size}.png`;
    await sharp(maskableBuffer)
      .resize(size, size)
      .png()
      .toFile(path.join(ICONS_DIR, filename));
    console.log(`✓ ${filename}`);
  }

  // Favicon
  await sharp(svgBuffer)
    .resize(32, 32)
    .png()
    .toFile(path.join(process.cwd(), "public", "favicon.png"));
  console.log("✓ favicon.png");

  console.log("\nAll PWA icons generated!");
}

generateIcons().catch(console.error);
