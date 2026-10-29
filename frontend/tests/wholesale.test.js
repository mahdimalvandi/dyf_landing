import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { sampleTerms } from '../src/wholesale/sample-terms.js';

test('wholesale review keeps sample terms explicit and catalog private', () => {
  const html = readFileSync(new URL('../wholesale/index.html', import.meta.url), 'utf8');
  assert.match(html, /noindex,nofollow/);
  assert.doesNotMatch(html, /نسخهٔ بازبینی طراحی/);
  assert.match(html, /تمام شرایط این بخش آزمایشی/);
  assert.match(html, /واحدهای تولیدی همکار/);
  assert.match(html, /بنکداران/);
  assert.match(html, /تک‌فروشان/);
  assert.equal((html.match(/<h1\b/g) || []).length, 1);
  for (const id of ['inquiry', 'terms', 'process', 'faq', 'inquiryForm']) {
    assert.ok(html.includes(`id="${id}"`));
  }
  assert.equal(sampleTerms.length, 3);
  assert.ok(!html.includes('کارخانهٔ اختصاصی'));
  assert.doesNotMatch(html, /wh-hero-photo|src="\/assets\/images\/craft-/);
  assert.match(html, /id="delivery"/);
  assert.match(html, /href="tel:\+989153177455"/);
});
