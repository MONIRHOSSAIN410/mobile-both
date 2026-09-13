/**
 * Renders one HD product image per seed product into frontend/public/products/.
 *
 *   node tools/generate-product-images.mjs            # only missing images
 *   node tools/generate-product-images.mjs --force    # re-render everything
 *   node tools/generate-product-images.mjs --png      # also keep a PNG copy
 *
 * Requires: npm i -D playwright sharp  (from the repo root)
 * Chromium does the rasterising, so gradients, blurs and clip paths all match
 * exactly what a browser would show.
 *
 * Drop a real photo in as `public/products/<slug>.webp` and it wins — this
 * script never overwrites a file unless you pass --force.
 */

import { mkdir, writeFile, access } from "node:fs/promises";
import { constants } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { chromium } from "playwright";
import sharp from "sharp";

import { products, brands } from "../backend/src/seed/data.js";
import { slugify } from "../backend/src/utils/slugify.js";
import { deviceSvg, SIZE } from "./device-art.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const OUT = path.join(ROOT, "frontend", "public", "products");

const FORCE = process.argv.includes("--force");
const KEEP_PNG = process.argv.includes("--png");

const brandBySlug = Object.fromEntries(
  brands.map((b) => [slugify(b.name), { ...b, slug: slugify(b.name) }])
);

const exists = (p) =>
  access(p, constants.F_OK).then(
    () => true,
    () => false
  );

async function main() {
  await mkdir(OUT, { recursive: true });

  const seen = new Set();
  const jobs = [];

  for (const product of products) {
    const brand = brandBySlug[product.brandSlug];
    if (!brand) continue;

    let slug = slugify(product.name);
    while (seen.has(slug)) slug = `${slug}-2`;
    seen.add(slug);

    jobs.push({
      slug,
      name: product.name,
      brandName: brand.name,
      brandSlug: brand.slug,
      accent: brand.accent,
      categorySlug: product.categorySlug,
    });
  }

  const todo = [];
  for (const job of jobs) {
    const target = path.join(OUT, `${job.slug}.webp`);
    if (!FORCE && (await exists(target))) continue;
    todo.push(job);
  }

  if (todo.length === 0) {
    console.log(`  ✅  ${jobs.length} images already present — nothing to do.`);
    console.log("      Pass --force to re-render them.");
    return;
  }

  console.log(`  🎨  Rendering ${todo.length} of ${jobs.length} product images…`);

  // CHROMIUM_PATH lets you point at an existing browser instead of the one
  // `npx playwright install chromium` downloads.
  const browser = await chromium.launch(
    process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {}
  );
  const page = await browser.newPage({
    viewport: { width: SIZE, height: SIZE },
    deviceScaleFactor: 1,
  });

  let done = 0;
  for (const job of todo) {
    const svg = deviceSvg(job);

    await page.setContent(
      `<!doctype html><meta charset="utf-8">
       <style>html,body{margin:0;background:transparent}svg{display:block}</style>
       ${svg}`,
      { waitUntil: "load" }
    );

    const png = await page.screenshot({ omitBackground: true });

    await sharp(png)
      .webp({ quality: 92, effort: 5, alphaQuality: 100 })
      .toFile(path.join(OUT, `${job.slug}.webp`));

    if (KEEP_PNG) await writeFile(path.join(OUT, `${job.slug}.png`), png);

    done += 1;
    if (done % 10 === 0 || done === todo.length) {
      console.log(`      ${done}/${todo.length}`);
    }
  }

  await browser.close();

  console.log(`\n  ✅  Wrote ${done} images to frontend/public/products/\n`);
}

main().catch((error) => {
  console.error("  ❌  Image generation failed:", error);
  process.exit(1);
});
