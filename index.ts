import sharp from 'sharp';
import { glob } from 'glob';
import fs from 'fs/promises';
import path from 'path';

const QUALITY_WEBP: number = 65;
const QUALITY_AVIF: number = 50;
const OUTPUT_DIR: string = 'public/optimized';
const fileType: string = 'jpg'

async function optimizeImages(): Promise<void> {
  const files: string[] = await glob(`public/**/*.${fileType}`);
  
  if (files.length === 0) {
    console.log('[Info] No PNG files found.');
    return;
  }

  // Ensure output directory exists
  await fs.mkdir(OUTPUT_DIR, { recursive: true });

  const tasks: Promise<void>[] = files.map(async (file: string) => {
    const { name } = path.parse(file);
    const relativePath: string = path.relative('public', file);
    const relativeDir: string = path.dirname(relativePath);
    
    const outputSubDir: string = path.join(OUTPUT_DIR, relativeDir);
    await fs.mkdir(outputSubDir, { recursive: true });

    const webpPath: string = path.join(outputSubDir, `${name}.webp`);
    const avifPath: string = path.join(outputSubDir, `${name}.avif`);

    try {
      await Promise.all([
        sharp(file).webp({ quality: QUALITY_WEBP, effort: 6 }).toFile(webpPath),
        // sharp(file).avif({ quality: QUALITY_AVIF, effort: 9 }).toFile(avifPath)
      ]);

      console.log(`[Optimized] ${file} → ${outputSubDir}`);
    } catch (err) {
      console.error(`[Error] Processing ${file}:`, err instanceof Error ? err.message : err);
    }
  });

  await Promise.all(tasks);
  console.log(`[Success] Processed ${files.length} images.`);
}

optimizeImages().catch((err: unknown) => {
  console.error('[Fatal]', err);
  process.exit(1);
});
