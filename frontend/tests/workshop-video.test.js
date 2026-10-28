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
  assert.ok(html.indexOf('id="workshop"') < html.indexOf('id="editorial-lines"'));
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
