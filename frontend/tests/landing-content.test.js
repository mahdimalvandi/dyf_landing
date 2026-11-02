import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';

const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');

test('model preview uses six distinct local reference photographs with honest descriptions', () => {
  const section = html.match(/<section class="collection-preview"[\s\S]*?<\/section>/)[0];
  const photos = [...section.matchAll(/<img src="([^"]+)" alt="([^"]+)"/g)];
  assert.equal(photos.length, 6);
  assert.equal(new Set(photos.map(match => match[1])).size, 6);
  for (const [, path, alt] of photos) {
    assert.ok(existsSync(new URL(`../public${path}`, import.meta.url)));
    assert.match(alt, /عکس مرجع/);
  }
  assert.doesNotMatch(section, /collection-preview__note|نه محصولات DYF/);
});

test('landing describes partner production without invented capacity or ownership claims', () => {
  assert.match(html, /مواد اولیه را تأمین می‌کنیم/);
  assert.match(html, /واحدهای تولیدی همکار/);
  assert.doesNotMatch(html, /مهندسی محافظت|تولید انحصاری سری‌های|تمام‌چرم طبیعی تبریز/);
  assert.match(html, /href="\/media-credits.html"/);
  assert.doesNotMatch(html, /media-source-note|تصویر مرجع<|فیلم مرجع از کارگاه مستقل/);
  const credits = readFileSync(new URL('../public/media-credits.html', import.meta.url), 'utf8');
  assert.match(credits, /Der Schuhmache/);
  assert.match(credits, /Ayten Fadel/);
  assert.match(credits, /creativecommons.org\/licenses\/by\/3.0/);
});

test('wholesale uses the landing footer structure and correct cross-page links', () => {
  const wholesale = readFileSync(new URL('../wholesale/index.html', import.meta.url), 'utf8');
  const footer = wholesale.match(/<footer class="site-footer"[\s\S]*?<\/footer>/)?.[0];
  assert.ok(footer);
  for (const label of ['بخش‌های اصلی', 'تماس و کانال‌های رسمی', 'DEFENDER YOUR FOOT (DYF)', 'منابع تصاویر و فیلم']) {
    assert.ok(footer.includes(label));
  }
  assert.match(footer, /href="\/#about"/);
  assert.match(footer, /class="footer-grid"/);
  assert.match(footer, /class="footer-bottom"/);
  assert.doesNotMatch(wholesale, /class="wh-footer/);
});
