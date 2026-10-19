# سند مرجع سیستم دیزاین و راهنمای جامع معماری بصری DYF (Defender Your Foot)

> **نسخه سند:** ۴.۰ (سازگار با برنچ `v4` و کد نهایی HTML / CSS / JS)  
> **کاربرد:** سند مرجع یکپارچه و Single Source of Truth برای طراحی، توسعه مجدد در فریم‌ورک‌های مدرن (Next.js / Nuxt / Vite / React) و ساخت صفحات جدید (کاتالوگ، تک‌محصول، درباره ما، استعلام و...).

---

## ۱. هویت برند و مانیفست طراحی (Brand Philosophy & Design Manifesto)

برند **DYF (Defender Your Foot)** یک کارگاه تخصصی تولید و پخش عمده کفش‌های چرم طبیعی مردانه در تبریز و تهران است که با بنکداران، عمده‌فروشان و بوتیک‌های مطرح همکاری می‌کند.

هویت دیزاین DYF بر سه اصل بنیادین استوار است:
1. **اصالت کارگاهی در برابر ظاهر قالب‌های هوش مصنوعی (Artisan over Generic Template):**  
   طراحی نباید شبیه قالب‌های آماده شرکتی یا تم‌های روشن استارتاپی باشد؛ بلکه باید حس ورق زدن یک کاتالوگ چرم ایتالیایی دست‌ساز، تاریکی مجلل کارگاه چرم‌سازی و پرستیژ جعبه فیزیکی کفش را تداعی کند.
2. **تمرکز بر خریدار عمده و بنکدار (B2B Focus):**  
   تمام المان‌ها از جمله تیراژ سری‌های ۱۰ تا ۱۰۰ جفتی، مشخصات متریال رویه و زیره، شفافیت ۴ مرحله‌ای سفارش و دکمه‌های مستقیم واتساپ و تماس بر سهولت و اعتماد در معاملات B2B تمرکز دارند.
3. **تضاد تیره لوکس (Dark Espresso & Warm Leather Palette):**  
   رنگ غالب، مشکی کربنی با ته‌رنگ چرم سوخته (`#141210`) است که با انعکاس‌های برنجی و طلای مات (`#D8B264`)، چرم عسلی کاراملی (`#C29553`) و عاجی خالص (`#FDFBF7`) نورپردازی شده است.

---

## ۲. توکن‌های سیستم دیزاین (Design Tokens)

### ۲.۱. پالت رنگ رسمی (Color Tokens)

| نام متغیر CSS | کد Hex / RGBA | نام فارسی و منبع الهام | کاربرد اختصاصی در رابط کاربری |
| :--- | :--- | :--- | :--- |
| `--bg-deep` | `#141210` | مشکی عمیق با گرمای چرم | پس‌زمینه اصلی تمام صفحات، کانتینرها و بستر مادر |
| `--leather-dark` | `#3D2415` | قهوه‌ای شکلاتی سوخته (Dark Espresso) | پس‌زمینه کارت‌های ثانویه، دایره‌های تایم‌لاین، گرادیان‌های نوری |
| `--leather-caramel` | `#C29553` | عسلی کاراملی چرم دباغی‌شده | هایلایت‌ها، نشانگرها، لینک‌های متنی و علامت‌های تفکیک‌کننده |
| `--gold-primary` | `#D8B264` | طلای مات پرستیژ (Signature Gold) | حاشیه‌های ظریف، تیترهای تأکیدی، دکمه‌های اکشن اصلی، خطوط کوک |
| `--gold-light` | `#F6E7B2` | طلایی روشن متالیک | وضعیت هاور دکمه‌ها، بج‌های نورانی، هایلایت‌های Specular |
| `--gold-glow` | `rgba(216, 178, 100, 0.35)` | هاله درخشش طلایی | سایه‌ها و جلوه‌های نوری اطراف دکمه‌ها و نشانگرها در هاور |
| `--text-ivory` | `#FDFBF7` | سفید عاجی دست‌نخورده | تیترهای اصلی سطوح H1 تا H3، متون پررنگ و ارقام مهم |
| `--text-main` | `#E8E4D9` | عاجی کدر برای خوانایی متن | متون بدنه و پاراگراف‌های اصلی با کنتراست ارگونومیک |
| `--text-muted` | `#9E9587` | خاکستری گرم ملایم | توضیحات تکمیلی، برچسب‌های متادیتا، پاورقی‌ها و ایندکس‌ها |
| `--stitch-line` | `#E8E4D9` | خط دوخت سراجی چرم | نوارهای استیکی کوک چرم و المان‌های خط‌چین صنعتی |

---

### ۲.۲. سیستم تایپوگرافی ۳ لایه‌ای (Typography Architecture)

برای دستیابی به ترکیبی متمایز و بین‌المللی، تایپوگرافی سایت به صورت ۳ سطحی معماری شده است:

```
┌─────────────────────────────────────────────────────────────┐
│ 1. فونت تیترهای فارسی (Display & Headings): Estedad         │
│    وزن‌های Bold (700)، ExtraBold (800)، Black (900)         │
├─────────────────────────────────────────────────────────────┤
│ 2. فونت متن بدنه و پاراگراف‌ها (Body & UI): Vazirmatn       │
│    وزن‌های Light (300)، Regular (400)، SemiBold (600)       │
├─────────────────────────────────────────────────────────────┤
│ 3. فونت لاتین ادیتوریال و اعداد (Serif & Kickers): Cormorant│
│    وزن‌های SemiBold (600)، Bold (700) با استایل ایتالیک     │
└─────────────────────────────────────────────────────────────┘
```

#### متغیرها و قوانین تایپوگرافی در CSS:
```css
:root {
  --font-body: 'Vazirmatn', -apple-system, BlinkMacSystemFont, sans-serif;
  --font-title: 'Estedad', 'Vazirmatn', sans-serif;
  --font-serif: 'Cormorant Garamond', Georgia, serif;
}

/* توازن متن در تیترها */
h1, h2, h3, h4, h5, h6,
.hero-main-title,
.story-title,
.craft-main-title,
.craft-line-title,
.defender-showcase-title,
.pipeline-title,
.inquiry-main-title,
.faq-title {
  font-family: var(--font-title);
  text-wrap: balance;
}

/* کیکرها و اعداد شاخص با فونت سریف کلاسیک */
.craft-line-en,
.craft-line-num,
.inquiry-kicker,
.signoff-label,
.defender-essence-tag {
  font-family: var(--font-serif);
}
```

#### مقیاس اندازه قلم (Fluid Type Scale):
- **Hero Title:** `clamp(2.5rem, 5vw, 4.2rem)` با وزن ۹۰۰
- **Section Heading (H2):** `clamp(2rem, 3.8vw, 3.2rem)` با وزن ۹۰۰
- **Sub-headings (H3):** `clamp(1.35rem, 2.4vw, 1.85rem)` با وزن ۸۰۰
- **Body Text:** `1rem` تا `1.08rem` با `line-height: 1.85` تا `2.0`
- **حداقل اندازه متون ریز (Accessibility Safeguard):** هیچ المان متنی در موبایل و دسکتاپ نباید از `0.8rem` (حدود ۱۳ پیکسل) کوچک‌تر باشد تا خوانایی چشمگیر تضمین گردد.

---

### ۲.۳. مقیاس شعاع انحنا (Border Radii) و فواصل (Spacing System)

```css
:root {
  --r-sm: 6px;   /* ورودی‌های فرم، دکمه‌های کوچک، پیل‌های مشخصات */
  --r-md: 12px;  /* فریم تصاویر کارگاهی، کادرهای اطلاعاتی */
  --r-lg: 20px;  /* کارت‌های شاخص هیرو، پاپ‌آپ‌ها */
}
```

#### قوانین فواصل عمودی (Vertical Rhythm):
- **فاصله استاندارد سکشن‌ها (Desktop):** `padding: 6.5rem 0 6rem`
- **فاصله استاندارد سکشن‌ها (Mobile ≤ 992px):** `padding: 3.5rem 0 3rem`
- **حداکثر عرض کانتینر:** `max-width: 1240px` با پدینگ ریسپانسیو `padding: 0 clamp(1.1rem, 3vw, 2.5rem)`

---

## ۳. معماری چیدمان و ساختار پایه صفحات (Layout & Foundation)

### ۳.۱. حل مشکل اسکرول هدر استیکی و ریسپانسیو
برای جلوگیری از شکستن هدر ثابت (`position: sticky`) در تلفیق با کتابخانه‌های اسکرول مثل Lenis:
- به هیچ عنوان روی `body` از `overflow-x: hidden` استفاده نمی‌شود.
- روی عنصر ریشه `html` فقط از `overflow-x: clip` استفاده شده و ویژگی سنتی `scroll-behavior: smooth` حذف می‌شود تا تداخلی با موتور محاسبه موقعیت Lenis ایجاد نگردد:

```css
html {
  overflow-x: clip;
  scroll-padding-top: 85px;
}

body {
  position: relative;
  background-color: var(--bg-deep);
  color: var(--text-main);
  min-height: 100vh;
}
```

---

### ۳.۲. نوار دوخت سراجی بالای صفحه (Top Saddle Stitch)
یک خط ثابت ۳ پیکسلی در بالاترین لبه مانیتور که حس کوک چرم را در تمام مسیر پیمایش همراه کاربر نگه می‌دارد:
```css
.top-saddle-stitch {
  position: sticky;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: repeating-linear-gradient(
    90deg,
    var(--gold-primary) 0,
    var(--gold-primary) 12px,
    transparent 12px,
    transparent 18px
  );
  z-index: 101;
}
```

---

### ۳.۳. هدر و سیستم ناوبری (Sticky Header)
- **ساختار:** ارتفاع بهینه (`72px`)، زمینه شفاف تیره با اعمال بلور نرم (`backdrop-filter: blur(12px)`).
- **وضعیت اسکرول:** با گذر اسکرول از ۲۵ پیکسل، کلاس `.is-scrolled` اضافه شده که پس‌زمینه را تیره‌تر (`rgba(14, 11, 8, 0.96)`) و بوردر زیرین طلایی را فعال می‌کند.
- **منوی موبایل:** در رزولوشن `≤ 920px` ناوبری متنی حذف و دکمه سه‌خط (`hamburger-btn`) فعال می‌شود؛ با باز شدن منو، اسکرول صفحه موقتاً با `lenis.stop()` قفل و با بسته شدن مجدداً با `lenis.start()` فعال می‌گردد.

---

### ۳.۴. نوار ثابت پایین صفحه در موبایل (Mobile Bottom Dock)
جایگزین دکمه‌های شناور واتساپ که روی محتوا می‌افتند؛ این نوار ۲ اکشن اساسی را در تمام صفحات موبایل (`≤ 992px`) در دسترس قرار می‌دهد:
- **دکمه ۱ (تماس مستقیم):** تماس فوری B2B با استایل چرم تیره و کادر طلایی
- **دکمه ۲ (واتساپ کارگاه):** پیام فوری به مدیر فروش با رنگ سبز سازمانی تیره و شفاف (`#1f7a42`)

```html
<aside class="mobile-bottom-dock" aria-label="ارتباط سریع">
  <a href="tel:09120000000" class="dock-action-btn dock-btn-call">
    <svg>...</svg>
    <span>تماس مستقیم</span>
  </a>
  <a href="https://wa.me/..." target="_blank" rel="noopener" class="dock-action-btn dock-btn-whatsapp">
    <svg>...</svg>
    <span>پیام در واتساپ</span>
  </a>
</aside>
```

---

## ۴. کتابخانه کامپوننت‌های پایه (Component Library)

### ۴.۱. دکمه‌های اقدام (Call to Actions)

#### الف) دکمه ویژه با بازتاب نور پویا (Specular Button):
دکمه‌های اصلی هدر و فرم مجهز به نور ماوس/تاچ هستند. با حرکت نشانگر، مختصات `(--x, --y)` با رویدادهای `mousemove` و `touchmove` تنظیم شده و هاله بازتاب نوری ایجاد می‌شود:

```css
.btn-specular {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.75rem 1.6rem;
  min-height: 44px;
  background: linear-gradient(135deg, rgba(61, 36, 21, 0.9) 0%, rgba(20, 18, 16, 0.95) 100%);
  border: 1px solid rgba(216, 178, 100, 0.35);
  border-radius: var(--r-sm);
  color: var(--gold-light);
  font-weight: 700;
  overflow: hidden;
  cursor: pointer;
  transition: border-color 0.25s ease, transform 0.2s ease, box-shadow 0.25s ease;
}

.btn-specular::before {
  content: '';
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  background: radial-gradient(circle 90px at var(--x, 50%) var(--y, 50%), rgba(246, 231, 178, 0.3) 0%, transparent 80%);
  pointer-events: none;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.btn-specular:hover::before {
  opacity: 1;
}

.btn-specular:hover {
  border-color: var(--gold-primary);
  box-shadow: 0 4px 18px var(--gold-glow);
  transform: translateY(-1px);
}
```

#### ب) دکمه طلایی سالید (Primary Submit):
برای ثبت فرم‌ها؛ پس‌زمینه یکپارچه طلایی (`var(--gold-primary)`)، متن مشکی کربنی با وزن ۸۰۰، بدون شیمر یا لرزش اضافه.

#### ج) لینک‌های ادیتوریال (Editorial Text Link):
استفاده از آیکون فلش `←` با هاور نرم در ترنزیشن افقی:
```css
.craft-order-link {
  display: inline-flex;
  align-items: center;
  gap: 0.75rem;
  color: var(--text-ivory);
  font-weight: 700;
  border-bottom: 1.5px solid var(--gold-primary);
  padding: 6px 0;
  transition: color 0.25s ease, border-color 0.25s ease;
}
.craft-order-link:hover {
  color: var(--gold-light);
  border-color: var(--gold-light);
}
.craft-order-link:hover .craft-link-arrow {
  transform: translateX(-6px);
}
```

---

### ۴.۲. بج‌ها، برچسب‌ها و کپسول‌های مشخصات (Pills & Badges)

1. **نشان تیتر (Section Kicker):**  
   حروف بزرگ انگلیسی، سریف یا سنس، با اندازه `0.8rem`، فاصله حروف `letter-spacing: 2.5px` و رنگ طلایی اصلی (`var(--gold-primary)`).
2. **پیل مشخصات فنی (Spec Pill):**  
   کپسول‌های تیره با حاشیه ۲۰٪ طلایی، نمایش جفت کلید-مقدار در یک خط:
   ```html
   <div class="craft-spec-pill">
     <span class="spec-label">متریال اصلی رویه:</span>
     <span class="spec-value">چرم طبیعی هورس و گاوی واکس‌خورده دستی</span>
   </div>
   ```
3. **زیرنویس گوشه تصاویر (Corner Caption):**  
   نشان‌های شیشه‌ای تیره در گوشه پایین تصاویر کارگاه همراه با ایندکس عددی و عنوان:
   ```html
   <div class="defender-frame-caption">
     <span class="caption-index">01</span>
     <span class="caption-title">فرم قالب و ساختار کفش</span>
   </div>
   ```

---

### ۴.۳. جداکننده‌ها و خطوط هویت بصری (Signature Separators)

1. **جداکننده با نماد لوزی طلایی (Editorial Diamond Divider):**
   ```html
   <div class="craft-editorial-separator" aria-hidden="true">
     <span class="separator-line"></span>
     <span class="separator-symbol">✦</span>
     <span class="separator-line"></span>
   </div>
   ```
2. **خط امضای پایان سکشن (Brand Signoff Hairline):**
   ```html
   <div class="defender-brand-signoff">
     <span class="signoff-hairline"></span>
     <span class="signoff-label">DEFENDER YOUR FOOT — DYF</span>
     <span class="signoff-hairline"></span>
   </div>
   ```

---

### ۴.۴. فیلدهای فرم و قوانین فوکوس (Form Elements & Accessibility)

- **پس‌زمینه ورودی‌ها:** `rgba(22, 18, 15, 0.65)` با بردر ۱ پیکسلی طلایی ملایم.
- **رنگ متن نگه‌دارنده (Placeholder):** با کنتراست ارتقایافته `rgba(223, 215, 204, 0.75)` برای وضوح کامل در نور محیط.
- **سلکت‌باکس با آیکون اختصاصی SVG:** حذف آیکون پیش‌فرض سیستم‌عامل و جایگزینی با شورون طلایی در سمت چپ (موقعیت RTL).
- **قانون فوکوس سراسری (Keyboard Focus Visible):**
  ```css
  a:focus-visible,
  button:focus-visible,
  input:focus-visible,
  select:focus-visible,
  textarea:focus-visible,
  summary:focus-visible {
    outline: 2px solid var(--gold-primary);
    outline-offset: 3px;
  }
  ```

---

### ۴.۵. آکاردئون‌های سؤالات متداول (Native FAQ Details)

بدون نیاز به کتابخانه‌های سنگین جاوااسکریپت و با استفاده از تگ‌های استاندارد `<details>` و `<summary>`:
- باز و بسته شدن آنی و سازگار با سئو.
- نشانگر مثبت و منفی (`+` و `−`) با اندازه `1.4rem` و رنگ کاراملی.
- تغییر رنگ عنوان به طلایی روشن هنگام باز بودن (`details[open] summary`).

---

## ۵. معماری موشن، اسکرول و تعاملات (Motion & Scroll Architecture)

### ۵.۱. اسکرول نرم طبیعی با Lenis
موتور اسکرول Lenis با تنظیمات اختصاصی هماهنگ شده تا اسکرول مصنوعی یا با تأخیر آزاردهنده ایجاد نکند:

```javascript
const lenis = new window.Lenis({
  duration: 1.05,
  easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // شتاب‌گیری و توقف ارگانیک
  orientation: 'vertical',
  gestureOrientation: 'vertical',
  smoothWheel: true,
  wheelMultiplier: 0.95,
  touchMultiplier: 1.15,
});

// همگام‌سازی کامل با تیکر GSAP
window.gsap.registerPlugin(window.ScrollTrigger);
lenis.on('scroll', window.ScrollTrigger.update);
window.gsap.ticker.add((time) => lenis.raf(time * 1000));
window.gsap.ticker.lagSmoothing(0);
```

---

### ۵.۲. سیستم ظهور نرم با اسکرول (Fade-Up Reveal Pipeline)
همه سکشن‌ها از طریق آرایه پیکربندی مشترک و با پارامترهای یکدست هنگام رسیدن به دید کاربر ظاهر می‌شوند:

```javascript
const revealConfigs = [
  { trigger: '.hero-content-top', elements: '.hero-badge, .hero-main-title, .hero-main-desc, .hero-actions-group', start: 'top 90%' },
  { trigger: '.story-text-col', elements: '.story-badge, .story-title, .story-description, .story-point-item', start: 'top 85%', stagger: 0.08 },
  { trigger: '.craft-editorial-header', elements: '.craft-editorial-kicker, .craft-main-title, .craft-main-desc, .craft-curation-badge', start: 'top 85%' },
  { trigger: '.craft-row-formal', elements: '.craft-row-formal .craft-media-frame, .craft-row-formal .craft-text-col > *', start: 'top 80%', stagger: 0.08 },
  { trigger: '.craft-row-sport', elements: '.craft-row-sport .craft-media-frame, .craft-row-sport .craft-text-col > *', start: 'top 80%', stagger: 0.08 },
  { trigger: '.defender-showcase-header', elements: '.defender-showcase-kicker, .defender-showcase-title, .defender-showcase-lead', start: 'top 85%' },
  { trigger: '.pipeline-header', elements: '.pipeline-kicker, .pipeline-title, .pipeline-desc', start: 'top 85%' },
  { trigger: '.pipeline-timeline', elements: '.pipeline-node', start: 'top 82%', stagger: 0.12 },
  { trigger: '.inquiry-intro-col', elements: '.inquiry-meta, .inquiry-main-title, .inquiry-intro-desc, .inquiry-ledger-item', start: 'top 85%', stagger: 0.08 },
  { trigger: '.inquiry-form-sector', elements: '.inquiry-form-header, .inquiry-fields-grid, .inquiry-form-actions, .inquiry-privacy-note', start: 'top 85%', stagger: 0.08 },
  { trigger: '.faq-section', elements: '.faq-title, .faq-section details', start: 'top 85%', stagger: 0.07 },
];

revealConfigs.forEach(cfg => {
  const triggerEl = document.querySelector(cfg.trigger);
  if (!triggerEl) return;
  const items = triggerEl.querySelectorAll(cfg.elements);
  if (!items.length) return;

  window.gsap.from(items, {
    scrollTrigger: { trigger: triggerEl, start: cfg.start || 'top 85%', once: true },
    y: 22,
    opacity: 0,
    duration: 0.68,
    ease: 'power2.out',
    stagger: cfg.stagger || 0.07,
    clearProps: 'transform,opacity', // آزادسازی استایل برای عملکرد بی‌نقص هاور پس از انیمیشن
  });
});
```

---

### ۵.۳. انیمیشن برش تصویری (Clip Reveal & Subtle Unzoom)
تصاویر بخش گالری و متریال دیفندر به جای محو شدن ساده، با افکت پرده‌ای عمودی (`clipPath`) همراه با زوم معکوس ظریف باز می‌شوند:

```javascript
clipTl.fromTo(masterImg,
  { clipPath: 'inset(0 0 100% 0)', scale: 1.03 },
  { clipPath: 'inset(0 0 0% 0)', scale: 1.0, duration: 0.82, ease: 'power2.out' }
);
```

---

### ۵.۴. روایت چسبان در دسکتاپ (Sticky Scrollytelling)
در بخش داستان برند (`#about`) در دسکتاپ (`≥ 993px`):
- تصویر میز کار (`.story-image-card`) با ویژگی `position: sticky; top: 110px` در حین اسکرول متن در دید باقی می‌ماند.
- با عبور از هر نکته (`.story-point-item`)، از طریق `ScrollTrigger.create` کلاس `.is-active` اعمال شده و هاله طلایی و پررنگ شدن متن فعال می‌شود.

---

### ۵.۵. احترام کامل به تنظیمات کاهش حرکت سیستم‌عامل
در صورت فعال بودن `prefers-reduced-motion: reduce`:
- تمام انیمیشن‌های ترنزیشن و اسکرول نرم لغو می‌شوند.
- عناصر بلافاصله با `opacity: 1` و بدون تأخیر رندر می‌شوند.

---

## ۶. استاندارد المان سه‌بعدی تعاملی (`<model-viewer>`)

برای ارائه پرستیژ تکنولوژیک در بخش هیرو، نشان رسمی برند به‌صورت مدل سه‌بعدی `GLB` تعاملی تعبیه شده است:

```html
<model-viewer
  src="assets/models/emblem_3d.glb"
  poster="assets/images/logo.png"
  alt="نشان سه‌بعدی رسمی برند DYF"
  camera-controls
  auto-rotate
  auto-rotate-delay="400"
  rotation-per-second="20deg"
  interaction-prompt="none"
  disable-pan
  disable-tap
  disable-zoom
  touch-action="pan-y"
  tabindex="-1"
  shadow-intensity="1.0"
  shadow-softness="1.0"
  exposure="1.2"
  environment-image="neutral"
  camera-orbit="0deg 85deg 94%"
  loading="eager"
  class="hero-model-viewer">
</model-viewer>
```

### الزامات رفتاری مدل سه‌بعدی:
1. **جلوگیری از قفل شدن اسکرول:** با `touch-action="pan-y"` کاربر روی موبایل هنگام کشیدن انگشت روی مدل، در صفحه بالا و پایین می‌رود و اسکرول قفل نمی‌شود.
2. **غیرفعال‌سازی زوم و جابجایی:** برای حفظ جایگاه لوگو در قاب، `disable-zoom` و `disable-pan` اجباری است.
3. **خنثی‌سازی کلیدهای جهت‌نما:** رویدادهای `ArrowDown` و `ArrowUp` روی مدل لغو شده و بلافاصله `blur()` فراخوانی می‌شود تا اسکرول کیبورد مختل نگردد.

---

## ۷. ساختار فایل‌ها و سازمان‌دهی پروژه (Asset Architecture)

پروژه به صورت کاملاً مرتب و استاندارد پوشه‌بندی شده است:

```text
dyf_landing/
├── index.html                  # مارک‌آپ اصلی صفحات
├── README.md                   # مستندات معرفی ریپازیتوری
├── DESIGN.md                   # سند حاضر (سیستم جامع دیزاین)
└── assets/
    ├── css/
    │   └── style.css           # استایل‌شیت یکپارچه و ماژولار
    ├── js/
    │   ├── script.js           # منطق تعاملات، اسکرول و اعتبارسنجی فرم
    │   └── model-viewer.min.js # کتابخانه آفلاین و بدون فیلتر رندر سه‌بعدی
    ├── models/
    │   └── emblem_3d.glb       # آبجکت سه‌بعدی بهینه‌شده سپر برند
    └── images/
        ├── logo.png            # لوگوی رسمی با کیفیت بالا
        ├── hero-bg.jpeg        # بافت چرم قهوه‌ای عمیق پس‌زمینه هیرو
        ├── story-workshop.jpeg # تصویر کارگاه و ابزارها در بخش داستان
        ├── craft-formal.jpeg   # عکاسی استادکار لاین رسمی و چرمی
        ├── craft-sport.jpg     # عکاسی کارگاه اتصال زیره لاین اسپرت
        ├── shoes.jpeg          # تصویر مستر کفش تمام‌چرم دیفندر
        ├── bag.jpeg            # نمای نزدیک از بافت دانه طبیعی چرم
        ├── bag2.jpeg           # نمای نزدیک از فرایند دوخت سراجی
        └── defender-bg.jpeg    # بک‌گراند بخش متریال
```

---

## ۸. راهنمای طراحی صفحات جدید (New Pages Blueprint)

برای ایجاد هر صفحه جدید در وب‌سایت یا پنل برند DYF، از الگوهای استاندارد زیر استفاده کنید:

### ۸.۱. صفحه کاتالوگ و گالری محصولات (Product Catalog / Line Archive)
- **هدر سکشن:** دارای کیکر ادیتوریال انگلیسی (`ATELIER LOOKBOOK COLLECTION`)، تیتر بولد فارسی با فونت استعداد (`Estedad`) و نوار فیلتر لاین‌ها (رسمی / کژوال / اکسسوری).
- **کارت محصول (Product Card):**
  - فریم تصویر با نسبت ابعاد `4:5`، حاشیه نازک `rgba(216, 178, 100, 0.18)` و بک‌گراند `#1a1512`.
  - بج گوشه بالا: وضعیت تیراژ کارگاهی (مثلاً «سری ۱۰ تا ۱۰۰ جفتی»).
  - عنوان مدل به رنگ عاجی (`var(--text-ivory)`) و کد محصول با فونت سریف (`var(--font-serif)`).
  - پیل خلاصه متریال رویه و زیره.
  - دکمه استعلام تیراژ متصل به فرم همراه با پارامتر اختصاصی کد محصول.

### ۸.۲. صفحه جزئیات تک‌محصول (Product Dossier / Technical Showcase)
- **بخش بالا (Hero Dossier):** ترکیب دو ستونه؛ اسلایدر تصاویر واقعی کارگاهی با زوم کنترل‌شده در سمت راست، شناسنامه فنی، جدول سایزبندی عمده، نوع چرم، نوع کفی طبی و دکمه‌های اقدام سریع در سمت چپ.
- **بخش میانی (Anatomy Study):** نمایش دیاگرام اجزای کفش بر بستر بک‌گراند چرم تیره با پوینترهای متصل به نقاط کلیدی (دوخت دور، زیره، پنجه تقویت‌شده).
- **بخش سفارش (Wholesale Batch Selector):** فرم پیشرفته محاسبه تیراژ بر اساس سری و ارسال مستقیم پیش‌سفارش در واتساپ.

### ۸.۳. صفحه درباره کارگاه و اصالت چرم تبریز (Atelier Story)
- استفاده از ساختار چیدمان مجله‌ای (Magazine Layout) با نسبت‌های نامتقارن (مثلاً گرید ۶۰/۴۰).
- نقل قول‌های برجسته از سرپرست کارگاه با گیومه طلایی بزرگ و فونت تیتر `Estedad`.
- تایم‌لاین تاریخی با خط اتصال طلایی مشابه سکشن `pipeline-timeline`.

---

## ۹. چک‌لیست کنترل کیفیت پیش از انتشار (Pre-flight Design Checklist)

پیش از مرج کردن یا انتشار هر صفحه جدید، مطابقت با موارد زیر الزامی است:
- [ ] آیا از پالت رنگی رسمی و متغیرهای تعریف‌شده CSS استفاده شده است؟
- [ ] آیا تیترها با فونت `Estedad` و بدنه با `Vazirmatn` پیاده‌سازی شده‌اند؟
- [ ] آیا هیچ متنی در موبایل کوچک‌تر از `0.8rem` نیست؟
- [ ] آیا همه دکمه‌ها و المان‌های تعاملی حداقل ارتفاع لمسی `44px` را دارند؟
- [ ] آیا در صورت پیمایش کیبورد، حلقه فوکوس طلایی (`outline: 2px solid var(--gold-primary)`) به درستی نمایش داده می‌شود؟
- [ ] آیا در سایز موبایل (≤ 640px) هیچ سرریز افقی (Horizontal Overflow) وجود ندارد؟
- [ ] آیا المان‌های جدید به آرایه `revealConfigs` در جاوااسکریپت برای ظهور نرم هنگام اسکرول اضافه شده‌اند؟
- [ ] آیا تصاویر در پوشه `assets/images` با نام‌گذاری معنادار و بدون کاراکترهای نامفهوم ذخیره شده‌اند؟

---
*این سند توسط تیم معماری فرانت‌اند و هویت بصری برند DYF تنظیم شده و هرگونه توسعه باید بر مبنای مفاد آن صورت پذیرد.*
