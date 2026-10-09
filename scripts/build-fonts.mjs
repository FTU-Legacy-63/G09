import { readFile, writeFile, mkdir, copyFile } from 'node:fs/promises';
import { resolve } from 'node:path';

// Generated assets: pin the font packages and keep upstream unicode ranges/licenses.
const out = resolve('demo/fonts');
await mkdir(out, { recursive: true });
const faces = [];
for (const family of ['noto-sans', 'noto-serif']) {
  const source = resolve(`node_modules/@fontsource-variable/${family}`);
  for (const style of ['normal', 'italic']) {
    const css = await readFile(`${source}/${style === 'normal' ? 'wght' : 'wght-italic'}.css`, 'utf8');
    for (const face of css.match(/@font-face\s*\{[^}]+\}/g) || []) {
      const name = face.match(/url\(\.\/files\/([^)]*)\)/)?.[1];
      if (!name || !['latin', 'latin-ext', 'vietnamese'].some(subset => name === `${family}-${subset}-wght-${style}.woff2`)) continue;
      await copyFile(`${source}/files/${name}`, `${out}/${name}`);
      faces.push(face.replace('./files/', './'));
    }
  }
  await copyFile(`${source}/LICENSE`, `${out}/${family}-LICENSE.txt`);
}
if (faces.length !== 12) throw new Error('Incomplete Vietnamese font bundle');
await writeFile(`${out}/fonts.css`, faces.join('\n\n') + '\n');
console.log('Built 12 local font faces: Latin, Latin Extended and Vietnamese; normal/italic.');
