import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

test('2D emblem stays hidden while 3D loads and appears only on failure', () => {
  const css = readFileSync(new URL('../src/styles/landing/hero.css', import.meta.url), 'utf8');
  assert.match(css, /\.hero-fallback-emblem\s*\{[^}]*visibility:\s*hidden/);
  assert.match(css, /\.hero-3d-wrapper\.has-model-error \.hero-fallback-emblem\s*\{[^}]*visibility:\s*visible/);
});
