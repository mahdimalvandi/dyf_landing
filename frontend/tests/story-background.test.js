import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, statSync } from 'node:fs';

test('story leather background image exists and has valid size and jpeg header', () => {
  const filePath = new URL('../public/assets/images/story-leather-bg.jpg', import.meta.url);
  const stats = statSync(filePath);
  assert.ok(stats.size > 50_000, 'image must be non-empty and high quality');
  assert.ok(stats.size < 2_000_000, 'image must be appropriately sized');
  assert.equal(stats.size, 503348, 'image size must match Poly Haven 1k diffuse texture (503348 bytes)');

  const buf = readFileSync(filePath);
  assert.equal(buf[0], 0xff, 'must have JPEG SOI byte 1');
  assert.equal(buf[1], 0xd8, 'must have JPEG SOI byte 2');
  assert.equal(buf[buf.length - 2], 0xff, 'must have JPEG EOI byte 1');
  assert.equal(buf[buf.length - 1], 0xd9, 'must have JPEG EOI byte 2');
});

test('brand story CSS applies layered gradients and leather photo background', () => {
  const css = readFileSync(new URL('../src/styles/landing/story.css', import.meta.url), 'utf8');
  const brandStoryBlock = css.match(/\.brand-story\s*\{([^}]+)\}/)?.[1];
  assert.ok(brandStoryBlock, '.brand-story rule must exist in story.css');

  assert.match(brandStoryBlock, /linear-gradient\(90deg,\s*rgba\(20,\s*18,\s*16,\s*0?\.75\),\s*rgba\(20,\s*18,\s*16,\s*0?\.55\)\)/);
  assert.match(brandStoryBlock, /linear-gradient\(180deg,\s*rgba\(20,\s*18,\s*16,\s*0?\.45\),\s*transparent\s+25%,\s*transparent\s+75%,\s*rgba\(20,\s*18,\s*16,\s*0?\.65\)\)/);
  assert.match(brandStoryBlock, /url\(['"]?\/assets\/images\/story-leather-bg\.jpg['"]?\)/);
  assert.match(brandStoryBlock, /background-size:\s*cover/);
  assert.match(brandStoryBlock, /background-position:\s*center center/);
  assert.doesNotMatch(brandStoryBlock, /background-attachment:\s*fixed/);
  assert.doesNotMatch(brandStoryBlock, /filter:\s*blur/);
  assert.doesNotMatch(brandStoryBlock, /animation/);
});

test('story background documentation records source, license and verified attribution status', () => {
  const doc = readFileSync(new URL('../../docs/design/story-background.md', import.meta.url), 'utf8');
  assert.ok(doc.includes('https://polyhaven.com/a/brown_leather'));
  assert.ok(doc.includes('https://dl.polyhaven.org/file/ph-assets/Textures/jpg/1k/brown_leather/brown_leather_albedo_1k.jpg'));
  assert.ok(doc.includes('https://polyhaven.com/license'));
  assert.ok(doc.includes('CC0'));
  assert.ok(doc.includes('story-leather-bg.jpg'));
  assert.ok(!doc.includes('pexels.com'), 'obsolete Pexels attribution must be removed');
});
