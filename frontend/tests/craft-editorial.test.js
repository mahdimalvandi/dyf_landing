import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

test('craft editorial section maintains correct order between about and leather', () => {
  const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');

  const aboutIndex = html.indexOf('id="about"');
  const craftIndex = html.indexOf('class="craft-editorial-section"');
  const leatherIndex = html.indexOf('id="leather"');

  assert.ok(aboutIndex !== -1, 'about section must exist');
  assert.ok(craftIndex !== -1, 'craft editorial section must exist');
  assert.ok(leatherIndex !== -1, 'leather section must exist');

  assert.ok(aboutIndex < craftIndex, 'craft editorial section must be ordered after about');
  assert.ok(craftIndex < leatherIndex, 'craft editorial section must be ordered before leather');
});

test('craft editorial section retains both rows, alternating layout, and required content', () => {
  const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
  const craftSectionMatch = html.match(/<section\b[^>]*class="[^"]*craft-editorial-section[^"]*"[^>]*>([\s\S]*?)<\/section>/);
  assert.ok(craftSectionMatch, 'craft editorial section must be present');
  const craftSection = craftSectionMatch[0];

  // Header content checks
  assert.match(craftSection, /<h2\b[^>]*class="craft-main-title"[^>]*>\s*برای هر سبک، یک انتخاب\.\s*<\/h2>/);
  assert.match(craftSection, /<p\b[^>]*class="craft-main-desc"[^>]*>\s*دو مسیر در کفش مردانه؛ برای استایل رسمی و استفادهٔ روزمره\.\s*<\/p>/);

  // Both rows exist
  assert.match(craftSection, /<article\b[^>]*class="[^"]*craft-editorial-row[^"]*craft-row-formal[^"]*"/);
  assert.match(craftSection, /<article\b[^>]*class="[^"]*craft-editorial-row[^"]*craft-row-sport[^"]*"/);

  // Separator exists
  assert.match(craftSection, /<div\b[^>]*class="craft-editorial-separator"/);

  // Formal row: media first, text second, exact content
  const formalMatch = craftSection.match(/<article\b[^>]*class="[^"]*craft-row-formal[^"]*"[^>]*>([\s\S]*?)<\/article>/);
  assert.ok(formalMatch, 'formal row must exist');
  const formalRow = formalMatch[0];
  const formalMediaIndex = formalRow.indexOf('craft-media-col');
  const formalTextIndex = formalRow.indexOf('craft-text-col');
  assert.ok(formalMediaIndex < formalTextIndex, 'formal row must have photo before text');
  assert.match(formalRow, /alt="پرداخت و دوخت کفش چرمی با ابزار کفاشی"/);
  assert.match(formalRow, /<h3\b[^>]*class="craft-line-title"[^>]*>\s*رسمی و چرمی\s*<\/h3>/);
  assert.match(formalRow, /<p\b[^>]*class="craft-line-desc"[^>]*>\s*مدل‌های رسمی مردانه برای مشتریانی که کفش را برای محل کار، مهمانی یا همراه کت‌وشلوار انتخاب می‌کنند\.\s*<\/p>/);
  assert.match(formalRow, /class="craft-line-details"/);
  assert.match(formalRow, /<dt>\s*نوع مدل\s*<\/dt>\s*<dd>\s*کفش رسمی مردانه\s*<\/dd>/);
  assert.match(formalRow, /<dt>\s*مورد استفاده\s*<\/dt>\s*<dd>\s*محل کار، مهمانی و پوشش رسمی\s*<\/dd>/);

  // Sport row: text first, media second, exact content
  const sportMatch = craftSection.match(/<article\b[^>]*class="[^"]*craft-row-sport[^"]*"[^>]*>([\s\S]*?)<\/article>/);
  assert.ok(sportMatch, 'sport row must exist');
  const sportRow = sportMatch[0];
  const sportTextIndex = sportRow.indexOf('craft-text-col');
  const sportMediaIndex = sportRow.indexOf('craft-media-col');
  assert.ok(sportTextIndex < sportMediaIndex, 'sport row must have text before photo');
  assert.match(sportRow, /alt="دوخت رویه و اتصال زیرهٔ کفش با چرخ کفاشی"/);
  assert.match(sportRow, /<h3\b[^>]*class="craft-line-title"[^>]*>\s*اسپرت و کژوال\s*<\/h3>/);
  assert.match(sportRow, /<p\b[^>]*class="craft-line-desc"[^>]*>\s*مدل‌های اسپرت و کژوال مردانه برای مشتریانی که کفش را برای رفت‌وآمد و پوشش روزمره انتخاب می‌کنند\.\s*<\/p>/);
  assert.match(sportRow, /class="craft-line-details"/);
  assert.match(sportRow, /<dt>\s*نوع مدل\s*<\/dt>\s*<dd>\s*کفش اسپرت و کژوال مردانه\s*<\/dd>/);
  assert.match(sportRow, /<dt>\s*مورد استفاده\s*<\/dt>\s*<dd>\s*رفت‌وآمد و پوشش روزمره\s*<\/dd>/);
});

test('craft editorial section removes kicker, curation badge, line meta, spec strip, and order link', () => {
  const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
  const craftSectionMatch = html.match(/<section\b[^>]*class="[^"]*craft-editorial-section[^"]*"[^>]*>([\s\S]*?)<\/section>/);
  assert.ok(craftSectionMatch, 'craft editorial section must be present');
  const craftSection = craftSectionMatch[0];

  // Absence of removed blocks and classes within this section
  assert.doesNotMatch(craftSection, /craft-editorial-kicker/);
  assert.doesNotMatch(craftSection, /DYF LOOKBOOK/i);
  assert.doesNotMatch(craftSection, /craft-curation-badge/);
  assert.doesNotMatch(craftSection, /تولید اختصاصی کارگاهی تبریز/);
  assert.doesNotMatch(craftSection, /سری‌های ۱۰ تا ۱۰۰ جفتی/);
  assert.doesNotMatch(craftSection, /ویژه بنکداران/);

  assert.doesNotMatch(craftSection, /craft-line-meta/);
  assert.doesNotMatch(craftSection, /craft-line-num/);
  assert.doesNotMatch(craftSection, /craft-line-divider/);
  assert.doesNotMatch(craftSection, /craft-line-en/);
  assert.doesNotMatch(craftSection, /craft-spec-strip/);
  assert.doesNotMatch(craftSection, /craft-spec-pill/);
  assert.doesNotMatch(craftSection, /craft-order-link/);
  assert.doesNotMatch(craftSection, /بررسی شرایط سفارش/);

  // Absence of technical claims and jargon within this section
  assert.doesNotMatch(craftSection, /زبان طراحی/);
  assert.doesNotMatch(craftSection, /جایگاه در مجموعه/);
  assert.doesNotMatch(craftSection, /هورس/);
  assert.doesNotMatch(craftSection, /نیولایت/);
  assert.doesNotMatch(craftSection, /ناپا/);
  assert.doesNotMatch(craftSection, /Nappa/i);
  assert.doesNotMatch(craftSection, /ضدسایش/);
});
