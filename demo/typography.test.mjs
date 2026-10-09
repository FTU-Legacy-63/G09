import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

test('All product surfaces use the shared local Vietnamese font layer last', () => {
  const html = readFileSync(new URL('./index.html', import.meta.url), 'utf8');
  assert.ok(html.indexOf('/demo/typography.css') > html.indexOf('/demo/product.css'));
  assert.match(html, /lang="vi"/);
  assert.match(html, /\/demo\/fonts\/fonts.css/);
  const css = readFileSync(new URL('./typography.css', import.meta.url), 'utf8');
  assert.match(css, /svg text/);
  assert.match(css, /option, optgroup/);
  assert.match(css, /Noto Sans Variable/);
  assert.match(css, /Noto Serif Variable/);
});
test('Vercel build does not expect a nonexistent public directory', () => {
  const config = JSON.parse(readFileSync(new URL('../vercel.json', import.meta.url), 'utf8'));
  assert.equal(config.outputDirectory, '.');
  assert.equal(config.buildCommand, 'npm run build');
  const pkg = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8'));
  assert.match(pkg.scripts.build, /build-fonts.mjs/);
});
