import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { supportsWebGL } from '../src/landing/modules/model-viewer.js';

test('public metadata points to the .ir domain', () => {
  for (const file of ['index.html', 'public/sitemap.xml', 'public/robots.txt']) {
    const content = readFileSync(new URL(`../${file}`, import.meta.url), 'utf8');
    assert.ok(content.includes('https://dyfshoes.ir/'));
    assert.ok(!content.includes('dyfshoes.com'));
  }
});

test('private entrypoints opt out of indexing and referrer leakage', () => {
  for (const file of ['admin/index.html', 'catalog/index.html']) {
    const content = readFileSync(new URL(`../${file}`, import.meta.url), 'utf8');
    assert.match(content, /name="robots" content="noindex, nofollow, noarchive"/);
    assert.match(content, /name="referrer" content="no-referrer"/);
  }
});

test('unsupported WebGL uses the static image without loading the renderer', () => {
  const oldDocument = globalThis.document;
  try {
    globalThis.document = { createElement: () => ({ getContext: () => null }) };
    assert.equal(supportsWebGL(), false);
    globalThis.document = { createElement: () => ({ getContext: () => { throw new Error('unavailable'); } }) };
    assert.equal(supportsWebGL(), false);
  } finally { globalThis.document = oldDocument; }
});
