// Genera el logo optimizado a partir del original (PNG de 324×240 px).
// Se corre a mano, una sola vez o cuando cambie el logo:  node scripts/optimizar-logo.mjs
// El resultado se sube al repo; el build del sitio no procesa imágenes.
//
// El logo se muestra a 42 px de alto en la cabecera y 38 px en el footer:
// 100 px de alto (135×100) conserva la proporción exacta del original (1.35) y
// cubre pantallas de densidad 2x.
import sharp from 'sharp';

const ORIGEN = 'src/assets/marca/logo-original.png';
const ALTO = 100;

const meta = await sharp(ORIGEN).metadata();
console.log(`original: ${meta.width}×${meta.height} ${meta.format}`);

const webp = await sharp(ORIGEN)
  .resize({ height: ALTO })
  .webp({ quality: 90, alphaQuality: 100, effort: 6 })
  .toFile('src/assets/marca/logo.webp');
console.log(`logo.webp: ${webp.width}×${webp.height}, ${webp.size} bytes`);
