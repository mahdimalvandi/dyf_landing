import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

test('home replaces order timeline with a short wholesale invitation and preserves old anchor', () => {
  const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
  assert.match(html, /class="partner-invitation" id="order"/);
  assert.match(html, /href="\/wholesale\/">شرایط همکاری و خرید عمده/);
  assert.doesNotMatch(html, /pipeline-timeline|مسیر سفارش عمده در DYF/);
  assert.ok(html.indexOf('id="order"') < html.indexOf('id="contact"'));
});
