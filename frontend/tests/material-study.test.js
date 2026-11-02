import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

test('material study preserves the triptych with related shoe imagery and concise copy', () => {
  const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
  const section = html.match(/<section class="defender-section"[\s\S]*?<\/section>/)[0];
  assert.match(section, /aria-labelledby="material-title"/);
  assert.match(section, /جزئیات، پیش از محصول/);
  assert.equal((section.match(/<img\b/g) || []).length, 3);
  assert.equal((section.match(/src="assets\/images\/shoes.jpeg"/g) || []).length, 3);
  assert.doesNotMatch(section, /bag2?\.|defender-showcase-kicker|defender-showcase-footer|مهندسی گام/);
});
