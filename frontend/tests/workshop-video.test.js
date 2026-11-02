import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, statSync } from 'node:fs';
import { allowsWorkshopAutoplay } from '../src/landing/modules/workshop-video.js';

test('workshop autoplay respects reduced motion and data saving', () => {
  assert.equal(allowsWorkshopAutoplay(false, false), true);
  assert.equal(allowsWorkshopAutoplay(true, false), false);
  assert.equal(allowsWorkshopAutoplay(false, true), false);
  assert.equal(allowsWorkshopAutoplay(true, true), false);
});

test('workshop prototype follows about, stays out of hero, and loads video lazily', () => {
  const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
  assert.ok(html.indexOf('id="about"') < html.indexOf('id="workshop"'));
  assert.ok(html.indexOf('id="hero"') < html.indexOf('id="editorial-lines"'));
  assert.ok(html.indexOf('id="editorial-lines"') < html.indexOf('id="about"'));

  const aboutSection = html.match(/<section\b[^>]*id="about"[^>]*>([\s\S]*?)<\/section>/)?.[0];
  assert.ok(aboutSection, 'about section must exist');
  assert.ok(aboutSection.includes('تجربه‌ای که پیش از'), 'independent brand story must remain');
  assert.ok(aboutSection.includes('brand-story__frame'), 'story photograph must have its own frame');
  assert.ok(!aboutSection.includes('<video'), 'story and workshop must be separate sections');
  assert.doesNotMatch(html, /<section\b[^>]*id="workshop"/, 'workshop must not be a standalone section');
  assert.match(html, /<figure\b[^>]*id="workshop"/, 'workshop must be a nested figure/region');

  assert.ok(!html.includes('story-points'), 'old story points must be removed');
  assert.ok(!html.includes('story-point-item'), 'old story point items must be removed');
  assert.ok(!html.includes('story-badge'), 'old story badge must be removed');
  assert.ok(!html.includes('story-workbench-img'), 'old static workbench image must be removed');
  assert.ok(!html.includes('workshop-film__content'), 'duplicated overlaid workshop content must be removed');

  assert.ok(html.includes('پیش از آنکه<br>یک جفت کفش شود.'));
  assert.ok(!html.includes('workshop-film__control'), 'workshop control button must be removed');
  assert.ok(!html.includes('workshop-film__footer'), 'workshop footer figcaption must be removed');
  assert.ok(!html.includes('کفش، از نزدیک.'), 'workshop footer text must be removed');
  assert.ok(!html.includes('برش، دوخت، پرداخت'), 'workshop footer text must be removed');

  const video = html.match(/<video\b[^>]*class="workshop-film__video"[^>]*>/)?.[0];
  assert.ok(video);
  assert.match(video, /data-src="\/assets\/videos\/workshop-demo.mp4"/);
  assert.doesNotMatch(video, /\s+src=/);
  assert.match(video, /preload="none"/);
  assert.match(video, /muted loop playsinline/);
  assert.ok(!html.includes('workshop-film__caption'));
  assert.ok(!html.includes('workshop-film__shade'));
  assert.ok(!html.includes('workshop-film__toggle'));
  for (const file of ['workshop-demo.mp4', 'workshop-demo-poster.jpg']) {
    const size = statSync(new URL(`../public/assets/videos/${file}`, import.meta.url)).size;
    assert.ok(size > 1000 && size < 5_000_000, `${file} must be present and lightweight`);
  }
});
