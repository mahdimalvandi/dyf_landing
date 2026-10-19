/**
 * ==========================================================================
 * DYF Private Catalog — Admin Panel Logic (Design System v4)
 * Task 1: UI Foundation, Authentication & Panel Shell
 * ==========================================================================
 */

(function () {
  'use strict';

  // ==========================================================================
  // ۱. داده‌های اولیه و شبیه‌سازی‌شده (Mock Data Store)
  // ==========================================================================
  const DEFAULT_SHOES = [
    {
      id: 101,
      title: 'کفش رسمی آکسفورد تمام‌چرم دست‌دوز تبریز',
      categories: ['لاین رسمی و اداری', 'لاین چرم لوکس دست‌دوز'],
      colors: ['مشکی زغالی', 'قهوه‌ای سوخته'],
      sizes: ['۴۰', '۴۱', '۴۲', '۴۳', '۴۴'],
      status: 'published',
      description: 'رویه تمام چرم گاوی دباغی گیاهی درجه یک تبریز، آستر چرم بزی طبیعی ضدتعریق، زیره دایکست میکرولایت با پرداخت واکس دست‌ساز سراجی.',
      media: [
        { url: 'assets/images/shoes.jpeg', type: 'image', isPrimary: true },
        { url: 'assets/images/bag.jpeg', type: 'image', isPrimary: false },
        { url: 'assets/images/bag2.jpeg', type: 'image', isPrimary: false }
      ]
    },
    {
      id: 102,
      title: 'اسنیکر چرم کژوال دیفندر سری اسپرت',
      categories: ['لاین اسپرت و کژوال'],
      colors: ['عسلی کاراملی', 'سفید عاجی'],
      sizes: ['۴۰', '۴۱', '۴۲', '۴۳', '۴۴', '۴۵'],
      status: 'published',
      description: 'طراحی ارگونومیک برای ساعات طولانی پیاده‌روی، زیره سبک ترمو با گریپ ضدلغزش، کفی طبی تزریق فوم سرد با روکش چرم طبیعی.',
      media: [
        { url: 'assets/images/craft-sport.jpg', type: 'image', isPrimary: true },
        { url: 'assets/images/bag2.jpeg', type: 'image', isPrimary: false }
      ]
    },
    {
      id: 103,
      title: 'نیم‌بوت چلسی چرم گاوی هورس واکس',
      categories: ['لاین رسمی و اداری', 'لاین چرم لوکس دست‌دوز'],
      colors: ['مشکی مات', 'عسلی روغنی'],
      sizes: ['۴۰', '۴۱', '۴۲', '۴۳'],
      status: 'published',
      description: 'قالب اختصاصی کلاسیک تبریز با کش دوبل کشسانی بالا، دوخت سراجی تقویت‌شده و پاشنه چرم طبیعی لایه‌ای مناسب جلسات رسمی.',
      media: [
        { url: 'assets/images/craft-formal.jpeg', type: 'image', isPrimary: true },
        { url: 'assets/images/shoes.jpeg', type: 'image', isPrimary: false }
      ]
    },
    {
      id: 104,
      title: 'کفش دربی کلاسیک پنجه ارگونومیک',
      categories: ['لاین رسمی و اداری'],
      colors: ['قهوه‌ای هاوانا', 'مشکی'],
      sizes: ['۴۱', '۴۲', '۴۳', '۴۴', '۴۵'],
      status: 'draft',
      description: 'نمونه در حال بررسی آزمایشگاهی کارگاه؛ بهینه‌سازی فرم سرپنجه برای پای پهن بازار داخلی با آستر آنتی‌باکتریال.',
      media: [
        { url: 'assets/images/shoes.jpeg', type: 'image', isPrimary: true }
      ]
    },
    {
      id: 105,
      title: 'لوفر سراجی چرم کروکو هورس',
      categories: ['لاین چرم لوکس دست‌دوز'],
      colors: ['عسلی بافتی', 'شکلاتی تیره'],
      sizes: ['۴۰', '۴۱', '۴۲', '۴۳', '۴۴'],
      status: 'published',
      description: 'رویه چرم گاوی امباس کروکو دست‌چین، سگک برنجی مات با آبکاری کهنه‌کاری، بدون نیاز به بند و فوق‌العاده راحت.',
      media: [
        { url: 'assets/images/bag.jpeg', type: 'image', isPrimary: true },
        { url: 'assets/images/bag2.jpeg', type: 'image', isPrimary: false }
      ]
    },
    {
      id: 106,
      title: 'کتانی شهری دست‌دوز زیره سبک پی‌یو',
      categories: ['لاین اسپرت و کژوال'],
      colors: ['سفید-طوسی', 'مشکی'],
      sizes: ['۴۰', '۴۱', '۴۲', '۴۳', '۴۴'],
      status: 'archived',
      description: 'مدل فصل گذشته؛ تولید موقتاً متوقف گردیده و جهت حفظ سابقه سفارشات به بخش بایگانی منتقل شده است.',
      media: [
        { url: 'assets/images/craft-sport.jpg', type: 'image', isPrimary: true }
      ]
    },
    {
      id: 107,
      title: 'کفش رسمی مونک‌استراپ دو سگک برنجی',
      categories: ['لاین رسمی و اداری', 'لاین چرم لوکس دست‌دوز'],
      colors: ['قهوه‌ای فندقی', 'مشکی'],
      sizes: ['۴۰', '۴۱', '۴۲', '۴۳', '۴۴'],
      status: 'published',
      description: 'طراحی پرستیژ ایتالیایی با دو سگک قابل تنظیم، لبه‌های پولیش‌خورده دستی و زیره ترکیبی چرم و لاستیک ضدسایش.',
      media: [
        { url: 'assets/images/craft-formal.jpeg', type: 'image', isPrimary: true },
        { url: 'assets/images/bag.jpeg', type: 'image', isPrimary: false }
      ]
    },
    {
      id: 108,
      title: 'اسنیکر ساق‌کوتاه چرم طبیعی ناپا',
      categories: ['لاین اسپرت و کژوال'],
      colors: ['سرمه‌ای تیره', 'مشکی'],
      sizes: ['۴۰', '۴۱', '۴۲', '۴۳', '۴۴', '۴۵'],
      status: 'published',
      description: 'چرم بسیار نرم ناپا با پرداخت مات، دوردوخت کامل زیره به رویه با نخ موم‌زده ترک، بدون جداشدگی لبه در استفاده طولانی.',
      media: [
        { url: 'assets/images/craft-sport.jpg', type: 'image', isPrimary: true }
      ]
    },
    {
      id: 109,
      title: 'صندل ارگونومیک تابستانه چرم تخت',
      categories: ['لاین چرم لوکس دست‌دوز'],
      colors: ['عسلی کاراملی'],
      sizes: ['۴۰', '۴۱', '۴۲', '۴۳'],
      status: 'draft',
      description: 'طرح مفهومی فصل جدید جهت بررسی تیراژ سری در بنکداری‌های جنوب کشور.',
      media: [
        { url: 'assets/images/bag2.jpeg', type: 'image', isPrimary: true }
      ]
    },
    {
      id: 110,
      title: 'کفش فرمال بروگ سرپنجه گلدار تبریز',
      categories: ['لاین رسمی و اداری'],
      colors: ['قهوه‌ای سوخته', 'مشکی زغالی'],
      sizes: ['۴۰', '۴۱', '۴۲', '۴۳', '۴۴'],
      status: 'published',
      description: 'حکاکی پانچ سوراخ‌کاری دستی بروگ با ظرافت استادکاران کهنه‌کار تبریز، رنگ‌آمیزی پاتینای دستی رویه.',
      media: [
        { url: 'assets/images/shoes.jpeg', type: 'image', isPrimary: true },
        { url: 'assets/images/craft-formal.jpeg', type: 'image', isPrimary: false }
      ]
    },
    {
      id: 111,
      title: 'کفش کژوال روزمره کفی طبی آناتومیک',
      categories: ['لاین اسپرت و کژوال'],
      colors: ['خاکی روشن', 'مشکی'],
      sizes: ['۴۰', '۴۱', '۴۲', '۴۳', '۴۴'],
      status: 'published',
      description: 'وزن سبک ۴۲۰ گرم برای هر لنگه، قوس طبی استاندارد برای گودی کف پا و مناسب مشاغل با ایستادن ممتد.',
      media: [
        { url: 'assets/images/craft-sport.jpg', type: 'image', isPrimary: true }
      ]
    },
    {
      id: 112,
      title: 'پوتین کلاسیک ساق‌بلند دست‌دوز زمستانه',
      categories: ['لاین رسمی و اداری', 'لاین چرم لوکس دست‌دوز'],
      colors: ['قهوه‌ای تیره', 'مشکی'],
      sizes: ['۴۱', '۴۲', '۴۳', '۴۴', '۴۵'],
      status: 'published',
      description: 'رویه ضخیم ضدآب ۲ میلی‌متری، آستر پشم طبیعی لطیف و عایق سرما، زیره رابر با عاج‌های عمیق برفی.',
      media: [
        { url: 'assets/images/craft-formal.jpeg', type: 'image', isPrimary: true }
      ]
    },
    {
      id: 113,
      title: 'لوفر رسمی قایقی چرم جیر طبیعی',
      categories: ['لاین رسمی و اداری'],
      colors: ['سرمه‌ای', 'طوسی تیره', 'عسلی'],
      sizes: ['۴۰', '۴۱', '۴۲', '۴۳', '۴۴'],
      status: 'published',
      description: 'جیر طبیعی دباغی‌شده صادراتی، بند چرمی دور یقه و سگک مخفی، فوق‌العاده شیک با شلوارهای کتان و پارچه‌ای.',
      media: [
        { url: 'assets/images/shoes.jpeg', type: 'image', isPrimary: true }
      ]
    },
    {
      id: 114,
      title: 'کتانی رانینگ اسپرت چرم و برزنت کارگاهی',
      categories: ['لاین اسپرت و کژوال'],
      colors: ['مشکی-طوسی', 'سبز زیتونی'],
      sizes: ['۴۰', '۴۱', '۴۲', '۴۳', '۴۴', '۴۵'],
      status: 'published',
      description: 'تلفیق چرم گاوی هورس و پارچه برزنت تنفس‌پذیر ارتشی، ساختار منعطف با تست ۲۰۰ هزار خمش زیره بدون شکستگی.',
      media: [
        { url: 'assets/images/craft-sport.jpg', type: 'image', isPrimary: true }
      ]
    },
    {
      id: 115,
      title: 'کفش اداری سبک بدون‌بند تمام‌کش',
      categories: ['لاین رسمی و اداری'],
      colors: ['مشکی براق', 'قهوه‌ای'],
      sizes: ['۴۰', '۴۱', '۴۲', '۴۳', '۴۴'],
      status: 'published',
      description: 'پوشیدن سریع، رویه بدون ترک‌خوردگی، زیره تزریق مستقیم پی‌یو نشکن همراه با گارانتی کارگاهی DYF.',
      media: [
        { url: 'assets/images/shoes.jpeg', type: 'image', isPrimary: true }
      ]
    },
    {
      id: 116,
      title: 'نیم‌بوت زیپ‌دار چرم الگانت مجلسی',
      categories: ['لاین رسمی و اداری'],
      colors: ['مشکی واکس‌خورده'],
      sizes: ['۴۱', '۴۲', '۴۳', '۴۴'],
      status: 'draft',
      description: 'زیپ YKK استیل ضدزنگ، قالب کشیده اروپایی، در حال نهایی‌سازی نمونه‌برداری جهت افزودن به کاتالوگ زمستانه.',
      media: [
        { url: 'assets/images/craft-formal.jpeg', type: 'image', isPrimary: true }
      ]
    },
    {
      id: 117,
      title: 'اسنیکر کفی فوم سرد دست‌دوز',
      categories: ['لاین اسپرت و کژوال'],
      colors: ['سفید کاراملی', 'مشکی'],
      sizes: ['۴۰', '۴۱', '۴۲', '۴۳', '۴۴'],
      status: 'published',
      description: 'طراحی مینیمال مونوکروم، لبه‌های پدگذاری‌شده ضدتاول، منتخب فروشگاه‌های لوکس کفش تهران و شیراز.',
      media: [
        { url: 'assets/images/craft-sport.jpg', type: 'image', isPrimary: true }
      ]
    },
    {
      id: 118,
      title: 'کفش رسمی بنددار دوخت مخفی سراجی',
      categories: ['لاین رسمی و اداری', 'لاین چرم لوکس دست‌دوز'],
      colors: ['مشکی', 'قهوه‌ای تیره'],
      sizes: ['۴۰', '۴۱', '۴۲', '۴۳', '۴۴'],
      status: 'published',
      description: 'الگوی برش یک‌تکه Wholecut بدون درز اضافه، ظرافت فوق‌العاده در خط دوخت، نماد اصالت برند DYF.',
      media: [
        { url: 'assets/images/shoes.jpeg', type: 'image', isPrimary: true },
        { url: 'assets/images/bag2.jpeg', type: 'image', isPrimary: false }
      ]
    }
  ];

  const DEFAULT_CATEGORIES = [
    {
      id: 'cat-formal',
      name: 'لاین رسمی و اداری',
      slug: 'formal',
      desc: 'کفش‌های کلاسیک آکسفورد، دربی، مونک‌استراپ و هورس واکس مناسب بازرگانان، جلسات رسمی و کارهای اداری.',
      status: 'active',
      icon: 'briefcase',
    },
    {
      id: 'cat-sport',
      name: 'لاین اسپرت و کژوال',
      slug: 'sport-casual',
      desc: 'اسنیکرها و کتانی‌های شهری چرم طبیعی، کفی طبی و تزریق فوم سرد، سبک و مقاوم جهت پیاده‌روی روزانه.',
      status: 'active',
      icon: 'zap',
    },
    {
      id: 'cat-handmade',
      name: 'لاین چرم لوکس دست‌دوز',
      slug: 'luxury-handmade',
      desc: 'آثار نفیس سراجی کارگاه با دوخت‌های دست‌دوز، زیره چرم طبیعی و دباغی گیاهی درجه یک تبریز.',
      status: 'active',
      icon: 'award',
    },
    {
      id: 'cat-boots',
      name: 'نیم‌بوت و پوتین کلاسیک',
      slug: 'classic-boots',
      desc: 'بوت‌های زمستانه چلسی و پوتین‌های ساق‌دار چرم الگانت با یراق‌آلات استیل و زیره‌های ضدلغزش.',
      status: 'active',
      icon: 'shield',
    },
    {
      id: 'cat-leather-goods',
      name: 'اکسسوری و کیف سراجی',
      slug: 'accessories',
      desc: 'محصولات دست‌ساز مکمل شامل کیف‌های اداری چرم طبیعی، کمربند و جاکارتی هماهنگ با کفش‌ها.',
      status: 'inactive',
      icon: 'briefcase',
    },
  ];

  const DEFAULT_CUSTOMERS = [
    {
      id: 101,
      code: 'CUST-101',
      nameFa: 'حاج مصطفی کمالی',
      nameEn: 'Haj Mostafa Kamali',
      shop: 'بنکداری و پخش کمالی (بازار تهران)',
      phone: '09121112233',
      status: 'active',
      directAccess: {
        enabled: true,
        categories: ['لاین رسمی و اداری', 'لاین چرم لوکس دست‌دوز'],
        addModels: [102],
        excludeModels: [104],
        duration: '15m',
        deadline: '5d',
        lastLogin: 'دیروز ۱۶:۲۰',
      },
    },
    {
      id: 102,
      code: 'CUST-102',
      nameFa: 'مهندس امید شمس',
      nameEn: 'Omid Shams',
      shop: 'بازرگانی کفش امید (تبریز)',
      phone: '09142223344',
      status: 'active',
      directAccess: {
        enabled: true,
        categories: ['لاین رسمی و اداری', 'لاین اسپرت و کژوال', 'لاین چرم لوکس دست‌دوز'],
        addModels: [],
        excludeModels: [],
        duration: 'unlimited',
        deadline: 'none',
        lastLogin: '۳ روز پیش',
      },
    },
    {
      id: 103,
      code: 'CUST-103',
      nameFa: 'سپهر نوری‌زاده',
      nameEn: 'Sepehr Nourizadeh',
      shop: 'گالری کفش سپهر (شیراز)',
      phone: '09173334455',
      status: 'active',
      directAccess: {
        enabled: false,
        categories: ['لاین اسپرت و کژوال'],
        addModels: [],
        excludeModels: [],
        duration: '30m',
        deadline: '2d',
        lastLogin: '-',
      },
    },
    {
      id: 104,
      code: 'CUST-104',
      nameFa: 'آرتین قوامی',
      nameEn: 'Artin Ghavami',
      shop: 'بوتیک لوکس آرتین (اصفهان)',
      phone: '09134445566',
      status: 'active',
      directAccess: {
        enabled: true,
        categories: ['لاین چرم لوکس دست‌دوز', 'نیم‌بوت و پوتین کلاسیک'],
        addModels: [101],
        excludeModels: [],
        duration: '1h',
        deadline: '7d',
        lastLogin: 'هفته گذشته',
      },
    },
  ];

  const DYF_DATA = {
    admin: {
      name: 'مهدی مالوندی',
      role: 'مدیر ارشد کارگاه',
      phone: '09121234567',
      avatar: 'م‌م',
    },
    stats: {
      totalModels: 18,
      publishedModels: 14,
      draftModels: 3,
      archivedModels: 1,
      activeCustomers: 24,
      activeLinks: 9,
      expiredLinks: 3,
      weeklyViews: 142,
    },
    categories: [
      { id: 'cat-1', name: 'لاین رسمی و اداری (Formal & Dress)', count: 8, status: 'active' },
      { id: 'cat-2', name: 'لاین اسپرت و کژوال (Sport & Casual)', count: 6, status: 'active' },
      { id: 'cat-3', name: 'لاین چرم لوکس دست‌دوز (Handmade Atelier)', count: 4, status: 'active' },
    ],
    recentAccessLinks: [
      {
        id: 'LNK-9081',
        recipientFa: 'حاج مصطفی کمالی',
        recipientEn: 'Haj Mostafa Kamali',
        customer: 'بنکداری کمالی (بازار تهران)',
        authType: 'otp', // otp or direct
        categories: ['لاین رسمی و اداری', 'لاین دست‌دوز'],
        status: 'active', // active, expired, pending
        expiresAt: '۲ روز دیگر (۳۰ مهر ۱۴۰۵)',
        duration: '۱۰ دقیقه پس از ورود',
        views: 3,
        url: 'https://dyf-atelier.ir/catalog?token=c8f2a91e',
      },
      {
        id: 'LNK-9082',
        recipientFa: 'مهندس امید شمس',
        recipientEn: 'Omid Shams',
        customer: 'بازرگانی کفش امید (تبریز)',
        authType: 'direct',
        categories: ['همه دسته‌بندی‌ها'],
        status: 'active',
        expiresAt: '۵ روز دیگر (۳ آبان ۱۴۰۵)',
        duration: 'دسترسی نامحدود',
        views: 8,
        url: 'https://dyf-atelier.ir/catalog?token=9b44fa71',
      },
      {
        id: 'LNK-9083',
        recipientFa: 'سپهر نوری‌زاده',
        recipientEn: 'Sepehr Nourizadeh',
        customer: 'گالری کفش سپهر (شیراز)',
        authType: 'otp',
        categories: ['لاین اسپرت و کژوال'],
        status: 'pending',
        expiresAt: '۱ روز دیگر (۲۹ مهر ۱۴۰۵)',
        duration: '۱۵ دقیقه پس از ورود',
        views: 0,
        url: 'https://dyf-atelier.ir/catalog?token=e110b5c4',
      },
      {
        id: 'LNK-9084',
        recipientFa: 'آرتین قوامی',
        recipientEn: 'Artin Ghavami',
        customer: 'بوتیک آرتین (اصفهان)',
        authType: 'direct',
        categories: ['لاین رسمی و اداری'],
        status: 'expired',
        expiresAt: 'منقضی شده (دیروز)',
        duration: 'پایان مهلت شروع دسترسی',
        views: 2,
        url: 'https://dyf-atelier.ir/catalog?token=77fa33d2',
      },
    ],
  };

  // ==========================================================================
  // ۲. ماژول مدیریت اعلان‌ها (Toast Notification System)
  // ==========================================================================
  const DYF_Toast = {
    container: null,

    init() {
      this.container = document.getElementById('dyfToastContainer');
      if (!this.container) {
        this.container = document.createElement('div');
        this.container.id = 'dyfToastContainer';
        this.container.className = 'dyf-toast-container';
        document.body.appendChild(this.container);
      }
    },

    show({ type = 'info', title = '', message = '', duration = 4000 }) {
      this.init();

      const icons = {
        success: `<svg class="dyf-toast-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><path d="m9 11 3 3L22 4"/></svg>`,
        error: `<svg class="dyf-toast-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="m15 9-6 6"/><path d="m9 9 6 6"/></svg>`,
        warning: `<svg class="dyf-toast-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>`,
        info: `<svg class="dyf-toast-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>`,
      };

      const toast = document.createElement('div');
      toast.className = `dyf-toast dyf-toast-${type}`;
      toast.innerHTML = `
        ${icons[type] || icons.info}
        <div class="dyf-toast-content">
          ${title ? `<div class="dyf-toast-title">${title}</div>` : ''}
          <div class="dyf-toast-message">${message}</div>
        </div>
        <div class="dyf-toast-progress" style="transition: width ${duration}ms linear; width: 100%;"></div>
      `;

      this.container.appendChild(toast);

      // اجرای انیمیشن نوار پیشرفت
      requestAnimationFrame(() => {
        const progress = toast.querySelector('.dyf-toast-progress');
        if (progress) progress.style.width = '0%';
      });

      const timer = setTimeout(() => {
        this.dismiss(toast);
      }, duration);

      toast.addEventListener('click', () => {
        clearTimeout(timer);
        this.dismiss(toast);
      });
    },

    dismiss(toast) {
      toast.classList.add('is-leaving');
      setTimeout(() => {
        if (toast.parentNode) toast.parentNode.removeChild(toast);
      }, 260);
    },
  };

  window.DYF_Toast = DYF_Toast;

  // ==========================================================================
  // ۳. ماژول مدیریت مودال‌ها و تأیید عملیات (Modal System)
  // ==========================================================================
  const DYF_Modal = {
    open(modalId) {
      const modal = document.getElementById(modalId);
      if (!modal) return;
      modal.classList.add('is-open');
      document.body.style.overflow = 'hidden';
      const firstInput = modal.querySelector('input, button:not(.dyf-modal-close)');
      if (firstInput) firstInput.focus();
    },

    close(modalId) {
      const modal = document.getElementById(modalId);
      if (!modal) return;
      modal.classList.remove('is-open');
      document.body.style.overflow = '';
    },

    confirm({ title, message, confirmText = 'تأیید', cancelText = 'انصراف', onConfirm }) {
      let modal = document.getElementById('dyfConfirmModal');
      if (!modal) {
        modal = document.createElement('div');
        modal.id = 'dyfConfirmModal';
        modal.className = 'dyf-modal-backdrop';
        modal.innerHTML = `
          <div class="dyf-modal-card">
            <div class="dyf-modal-header">
              <h3 class="dyf-modal-title" id="dyfConfirmTitle"></h3>
              <button type="button" class="dyf-modal-close" data-close>&times;</button>
            </div>
            <div class="dyf-modal-body" id="dyfConfirmMessage"></div>
            <div class="dyf-modal-footer">
              <button type="button" class="dyf-btn dyf-btn-outline" data-close id="dyfConfirmCancelBtn"></button>
              <button type="button" class="dyf-btn dyf-btn-danger" id="dyfConfirmOkBtn"></button>
            </div>
          </div>
        `;
        document.body.appendChild(modal);

        modal.querySelectorAll('[data-close]').forEach((btn) => {
          btn.addEventListener('click', () => DYF_Modal.close('dyfConfirmModal'));
        });

        modal.addEventListener('click', (e) => {
          if (e.target === modal) DYF_Modal.close('dyfConfirmModal');
        });
      }

      document.getElementById('dyfConfirmTitle').textContent = title;
      document.getElementById('dyfConfirmMessage').innerHTML = message;
      document.getElementById('dyfConfirmCancelBtn').textContent = cancelText;
      const okBtn = document.getElementById('dyfConfirmOkBtn');
      okBtn.textContent = confirmText;

      const newOkBtn = okBtn.cloneNode(true);
      okBtn.parentNode.replaceChild(newOkBtn, okBtn);

      newOkBtn.addEventListener('click', () => {
        DYF_Modal.close('dyfConfirmModal');
        if (typeof onConfirm === 'function') onConfirm();
      });

      this.open('dyfConfirmModal');
    },
  };

  window.DYF_Modal = DYF_Modal;

  // بستن مودال با دکمه Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      const openModal = document.querySelector('.dyf-modal-backdrop.is-open');
      if (openModal) DYF_Modal.close(openModal.id);
    }
  });

  // ==========================================================================
  // ۴. جریان احراز هویت و ورود مدیر (Admin Authentication Flow)
  // ==========================================================================
  const AuthController = {
    authView: document.getElementById('authView'),
    adminApp: document.getElementById('adminApp'),
    stepPhone: document.getElementById('authStepPhone'),
    stepOtp: document.getElementById('authStepOtp'),
    phoneInput: document.getElementById('adminPhoneInput'),
    sendOtpBtn: document.getElementById('sendOtpBtn'),
    verifyOtpBtn: document.getElementById('verifyOtpBtn'),
    otpPhoneDisplay: document.getElementById('otpPhoneDisplay'),
    otpDigits: document.querySelectorAll('.dyf-otp-digit'),
    timerEl: document.getElementById('otpCountdown'),
    resendBtn: document.getElementById('resendOtpBtn'),
    changePhoneBtn: document.getElementById('changePhoneBtn'),
    testQuickFillBtn: document.getElementById('testQuickFillBtn'),
    testErrorOtpBtn: document.getElementById('testErrorOtpBtn'),

    timerInterval: null,
    timeLeft: 60,
    testCode: '12345',

    init() {
      const isAuth = localStorage.getItem('dyf_admin_auth') === 'true';

      if (isAuth) {
        this.showAdminApp(false);
      } else {
        this.showAuthView();
      }

      this.bindEvents();
    },

    bindEvents() {
      // مرحله ۱: ارسال شماره تلفن
      if (this.sendOtpBtn) {
        this.sendOtpBtn.addEventListener('click', () => this.handleSendPhone());
      }
      if (this.phoneInput) {
        this.phoneInput.addEventListener('keydown', (e) => {
          if (e.key === 'Enter') this.handleSendPhone();
        });
      }

      // تغییر شماره تلفن و بازگشت به مرحله ۱
      if (this.changePhoneBtn) {
        this.changePhoneBtn.addEventListener('click', () => {
          this.stepOtp.classList.add('is-hidden');
          this.stepPhone.classList.remove('is-hidden');
          this.stopTimer();
          if (this.phoneInput) this.phoneInput.focus();
        });
      }

      // ارسال مجدد کد
      if (this.resendBtn) {
        this.resendBtn.addEventListener('click', () => {
          this.startTimer();
          DYF_Toast.show({
            type: 'info',
            title: 'ارسال مجدد کد',
            message: `کد ۵ رقمی آزمایشی جدید (${this.testCode}) به شماره شما ارسال شد.`,
          });
        });
      }

      // ورودی‌های ۵ رقمی کد یک‌بارمصرف
      this.otpDigits.forEach((digit, index) => {
        digit.addEventListener('input', (e) => {
          const val = e.target.value;
          if (val) {
            digit.classList.add('is-filled');
            if (index < this.otpDigits.length - 1) {
              this.otpDigits[index + 1].focus();
            }
          } else {
            digit.classList.remove('is-filled');
          }
        });

        digit.addEventListener('keydown', (e) => {
          if (e.key === 'Backspace' && !digit.value && index > 0) {
            this.otpDigits[index - 1].focus();
          }
          if (e.key === 'Enter') {
            this.handleVerifyOtp();
          }
        });

        // پشتیبانی از Paste متن کد ۵ رقمی
        digit.addEventListener('paste', (e) => {
          e.preventDefault();
          const pasteData = (e.clipboardData || window.clipboardData).getData('text').trim();
          if (/^\d{5}$/.test(pasteData)) {
            pasteData.split('').forEach((char, i) => {
              if (this.otpDigits[i]) {
                this.otpDigits[i].value = char;
                this.otpDigits[i].classList.add('is-filled');
              }
            });
            this.otpDigits[4].focus();
          }
        });
      });

      // دکمه تأیید کد
      if (this.verifyOtpBtn) {
        this.verifyOtpBtn.addEventListener('click', () => this.handleVerifyOtp());
      }

      // ابزارهای تست سریع در صفحه ورود
      if (this.testQuickFillBtn) {
        this.testQuickFillBtn.addEventListener('click', () => {
          if (this.phoneInput) this.phoneInput.value = '09121234567';
          this.handleSendPhone();
          setTimeout(() => {
            this.fillOtpCode('12345');
            DYF_Toast.show({
              type: 'success',
              title: 'تکمیل خودکار تستی',
              message: 'شماره و کد پیش‌فرض تستی وارد شدند.',
            });
          }, 300);
        });
      }

      if (this.testErrorOtpBtn) {
        this.testErrorOtpBtn.addEventListener('click', () => {
          this.fillOtpCode('99999');
          this.handleVerifyOtp();
        });
      }

      // خروج از پنل (دکمه‌های هدر و سایدبار)
      document.querySelectorAll('.js-admin-logout').forEach((btn) => {
        btn.addEventListener('click', (e) => {
          e.preventDefault();
          DYF_Modal.confirm({
            title: 'خروج از حساب مدیریت',
            message: 'آیا برای خروج از پنل مدیریت کاتالوگ اطمینان دارید؟',
            confirmText: 'خروج از پنل',
            cancelText: 'انصراف',
            onConfirm: () => {
              localStorage.removeItem('dyf_admin_auth');
              DYF_Toast.show({
                type: 'info',
                title: 'خروج موفق',
                message: 'جلسه کاری شما با موفقیت به پایان رسید.',
              });
              setTimeout(() => {
                window.location.reload();
              }, 400);
            },
          });
        });
      });
    },

    handleSendPhone() {
      const phone = this.phoneInput ? this.phoneInput.value.trim() : '';
      const phoneRegex = /^09[0-9]{9}$/;

      if (!phoneRegex.test(phone)) {
        if (this.phoneInput) this.phoneInput.classList.add('dyf-input-error');
        DYF_Toast.show({
          type: 'error',
          title: 'شماره نامعتبر',
          message: 'لطفاً یک شماره موبایل معتبر ۱۱ رقمی (مثال: 09121234567) وارد کنید.',
        });
        return;
      }

      if (this.phoneInput) this.phoneInput.classList.remove('dyf-input-error');
      if (this.sendOtpBtn) this.sendOtpBtn.classList.add('is-loading');

      setTimeout(() => {
        if (this.sendOtpBtn) this.sendOtpBtn.classList.remove('is-loading');
        if (this.otpPhoneDisplay) this.otpPhoneDisplay.textContent = phone;

        this.stepPhone.classList.add('is-hidden');
        this.stepOtp.classList.remove('is-hidden');

        // فوکوس روی اولین خانه کد
        if (this.otpDigits[0]) this.otpDigits[0].focus();

        this.startTimer();

        DYF_Toast.show({
          type: 'success',
          title: 'کد یک‌بارمصرف ارسال شد',
          message: `کد ۵ رقمی آزمایشی ورود: ${this.testCode}`,
          duration: 6000,
        });
      }, 550);
    },

    handleVerifyOtp() {
      let code = '';
      this.otpDigits.forEach((d) => (code += d.value.trim()));

      if (code.length < 5) {
        DYF_Toast.show({
          type: 'warning',
          title: 'کد ناقص است',
          message: 'لطفاً هر ۵ رقم کد تأیید را وارد کنید.',
        });
        return;
      }

      if (this.verifyOtpBtn) this.verifyOtpBtn.classList.add('is-loading');

      setTimeout(() => {
        if (this.verifyOtpBtn) this.verifyOtpBtn.classList.remove('is-loading');

        if (code === this.testCode) {
          // ورود موفق
          localStorage.setItem('dyf_admin_auth', 'true');
          DYF_Toast.show({
            type: 'success',
            title: 'احراز هویت موفق',
            message: 'خوش آمدید! در حال انتقال به پیشخوان مدیریت کاتالوگ...',
            duration: 2500,
          });

          setTimeout(() => {
            this.showAdminApp(true);
          }, 600);
        } else {
          // خطای شبیه‌سازی‌شده کد نادرست
          this.otpDigits.forEach((d) => {
            d.classList.add('dyf-input-error');
          });

          DYF_Toast.show({
            type: 'error',
            title: 'کد تأیید نادرست است',
            message: `کد واردشده نامعتبر است. کد صحیح آزمایشی: ${this.testCode}`,
          });

          setTimeout(() => {
            this.otpDigits.forEach((d) => d.classList.remove('dyf-input-error'));
          }, 1500);
        }
      }, 500);
    },

    fillOtpCode(code) {
      code.split('').forEach((char, i) => {
        if (this.otpDigits[i]) {
          this.otpDigits[i].value = char;
          this.otpDigits[i].classList.add('is-filled');
        }
      });
      if (this.otpDigits[4]) this.otpDigits[4].focus();
    },

    startTimer() {
      this.stopTimer();
      this.timeLeft = 60;
      if (this.resendBtn) this.resendBtn.disabled = true;

      this.updateTimerDisplay();
      this.timerInterval = setInterval(() => {
        this.timeLeft--;
        this.updateTimerDisplay();

        if (this.timeLeft <= 0) {
          this.stopTimer();
          if (this.resendBtn) this.resendBtn.disabled = false;
        }
      }, 1000);
    },

    stopTimer() {
      if (this.timerInterval) {
        clearInterval(this.timerInterval);
        this.timerInterval = null;
      }
    },

    updateTimerDisplay() {
      if (!this.timerEl) return;
      const m = Math.floor(this.timeLeft / 60);
      const s = this.timeLeft % 60;
      this.timerEl.textContent = `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    },

    showAuthView() {
      if (this.authView) this.authView.style.display = 'flex';
      if (this.adminApp) this.adminApp.classList.add('is-hidden');
    },

    showAdminApp(animate = false) {
      if (this.authView) this.authView.style.display = 'none';
      if (this.adminApp) {
        this.adminApp.classList.remove('is-hidden');
        if (animate) {
          this.adminApp.style.opacity = '0';
          requestAnimationFrame(() => {
            this.adminApp.style.transition = 'opacity 0.4s ease';
            this.adminApp.style.opacity = '1';
          });
        }
      }
      Router.init();
    },
  };

  // ==========================================================================
  // ۵. مسیریاب سبک درون‌پنل (SPA Hash-based View Router)
  // ==========================================================================
  const Router = {
    views: {},
    navItems: [],
    breadcrumbActive: document.getElementById('dyfBreadcrumbActive'),

    routes: {
      '#dashboard': { title: 'داشبورد تحلیلی', viewId: 'viewDashboard' },
      '#shoes': { title: 'مدیریت مدل‌های کفش', viewId: 'viewShoes' },
      '#categories': { title: 'مدیریت دسته‌بندی‌ها', viewId: 'viewCategories' },
      '#customers': { title: 'مشتریان و همکاران', viewId: 'viewCustomers' },
      '#access-links': { title: 'لینک‌های دسترسی اختصاصی', viewId: 'viewAccessLinks' },
      '#components': { title: 'کامپوننت‌های مشترک دیزاین سیستم', viewId: 'viewComponents' },
      '#settings': { title: 'تنظیمات کاتالوگ', viewId: 'viewSettings' },
    },

    init() {
      this.navItems = document.querySelectorAll('.dyf-nav-item');
      window.addEventListener('hashchange', () => this.handleRoute());

      const currentHash = window.location.hash || '#dashboard';
      this.navigate(currentHash);
    },

    navigate(hash) {
      if (!this.routes[hash]) hash = '#dashboard';
      window.location.hash = hash;
      this.handleRoute();
    },

    handleRoute() {
      const hash = window.location.hash || '#dashboard';
      const route = this.routes[hash] || this.routes['#dashboard'];

      // مخفی کردن تمامی ویوها
      document.querySelectorAll('.dyf-view').forEach((v) => v.classList.remove('is-active'));

      // نمایش ویوی فعال
      const activeView = document.getElementById(route.viewId);
      if (activeView) {
        activeView.classList.add('is-active');
      }

      // به‌روزرسانی نوار سایدبار
      this.navItems.forEach((item) => {
        if (item.getAttribute('href') === hash) {
          item.classList.add('is-active');
        } else {
          item.classList.remove('is-active');
        }
      });

      // به‌روزرسانی مسیر موقعیت (Breadcrumbs)
      if (this.breadcrumbActive) {
        this.breadcrumbActive.textContent = route.title;
      }

      // بستن دراور سایدبار در موبایل پس از انتخاب مسیر
      SidebarController.closeMobileSidebar();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    },
  };

  // ==========================================================================
  // ۶. کنترلر سایدبار ریسپانسیو (Sidebar Controller)
  // ==========================================================================
  const SidebarController = {
    sidebar: document.getElementById('adminSidebar'),
    overlay: document.getElementById('sidebarOverlay'),
    toggleBtn: document.getElementById('hamburgerToggle'),

    init() {
      if (this.toggleBtn) {
        this.toggleBtn.addEventListener('click', () => this.toggleMobileSidebar());
      }
      if (this.overlay) {
        this.overlay.addEventListener('click', () => this.closeMobileSidebar());
      }
    },

    toggleMobileSidebar() {
      if (!this.sidebar) return;
      const isOpen = this.sidebar.classList.toggle('is-open');
      if (this.overlay) this.overlay.classList.toggle('is-open', isOpen);
    },

    closeMobileSidebar() {
      if (this.sidebar) this.sidebar.classList.remove('is-open');
      if (this.overlay) this.overlay.classList.remove('is-open');
    },
  };

  // ==========================================================================
  // ۷. رندر جدول لینک‌ها و اکشن‌های تعاملی داشبورد
  // ==========================================================================
  const DashboardController = {
    tableBody: document.getElementById('recentLinksTableBody'),
    emptyState: document.getElementById('tableEmptyState'),
    skeletonState: document.getElementById('tableSkeletonState'),

    init() {
      this.renderTable(DYF_DATA.recentAccessLinks);
      this.bindActions();
    },

    renderTable(links) {
      if (!this.tableBody) return;
      if (!links || links.length === 0) {
        this.tableBody.innerHTML = '';
        if (this.emptyState) this.emptyState.style.display = 'block';
        return;
      }

      if (this.emptyState) this.emptyState.style.display = 'none';

      const statusBadges = {
        active: `<span class="dyf-badge dyf-badge-active">فعال</span>`,
        expired: `<span class="dyf-badge dyf-badge-expired">منقضی</span>`,
        pending: `<span class="dyf-badge dyf-badge-draft">در انتظار ورود</span>`,
      };

      const authBadges = {
        otp: `<span style="color: var(--gold-light); font-size: 0.76rem;">همراه با OTP</span>`,
        direct: `<span style="color: var(--text-muted); font-size: 0.76rem;">ورود مستقیم</span>`,
      };

      this.tableBody.innerHTML = links
        .map(
          (lnk) => `
        <tr>
          <td>
            <div style="font-weight: 700; color: var(--text-ivory);">${lnk.recipientFa}</div>
            <div style="font-size: 0.74rem; color: var(--text-dim); font-family: var(--font-serif);">${lnk.recipientEn}</div>
          </td>
          <td>
            <div style="font-size: 0.82rem; color: var(--text-main);">${lnk.customer}</div>
            <div style="font-size: 0.72rem; color: var(--gold-primary);">${lnk.categories.join('، ')}</div>
          </td>
          <td>${authBadges[lnk.authType] || '-'}</td>
          <td>${statusBadges[lnk.status] || lnk.status}</td>
          <td>
            <div style="font-size: 0.8rem; color: var(--text-muted);">${lnk.expiresAt}</div>
            <div style="font-size: 0.7rem; color: var(--text-dim);">${lnk.duration}</div>
          </td>
          <td>
            <div style="display: flex; gap: 0.4rem; align-items: center;">
              <button type="button" class="dyf-btn dyf-btn-outline dyf-btn-sm js-copy-link" data-url="${lnk.url}" title="کپی لینک اختصاصی">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
                <span>کپی</span>
              </button>
              <button type="button" class="dyf-btn dyf-btn-specular dyf-btn-sm js-view-link-detail" data-id="${lnk.id}" title="مشاهده جزئیات">
                <span>جزئیات</span>
              </button>
            </div>
          </td>
        </tr>
      `
        )
        .join('');

      // پیوند رویداد کپی لینک
      this.tableBody.querySelectorAll('.js-copy-link').forEach((btn) => {
        btn.addEventListener('click', () => {
          const url = btn.getAttribute('data-url');
          if (navigator.clipboard) {
            navigator.clipboard.writeText(url).then(() => {
              DYF_Toast.show({
                type: 'success',
                title: 'لینک کپی شد',
                message: 'آدرس کاتالوگ اختصاصی در حافظه کپی شد.',
              });
            });
          } else {
            DYF_Toast.show({ type: 'info', title: 'لینک کاتالوگ', message: url });
          }
        });
      });

      // پیوند مشاهده جزئیات
      this.tableBody.querySelectorAll('.js-view-link-detail').forEach((btn) => {
        btn.addEventListener('click', () => {
          const id = btn.getAttribute('data-id');
          const item = DYF_DATA.recentAccessLinks.find((l) => l.id === id);
          if (item) {
            DYF_Modal.confirm({
              title: `شناسنامه لینک اختصاصی (${item.id})`,
              message: `
                <div style="display: grid; gap: 0.6rem; font-size: 0.88rem;">
                  <div><strong>گیرنده:</strong> ${item.recipientFa} (${item.recipientEn})</div>
                  <div><strong>مشتری مرتبط:</strong> ${item.customer}</div>
                  <div><strong>روش ورود:</strong> ${item.authType === 'otp' ? 'نیاز به تأیید شماره تلفن و OTP' : 'لینک مستقیم بدون OTP'}</div>
                  <div><strong>مهلت و مدت:</strong> ${item.expiresAt} — ${item.duration}</div>
                  <div><strong>تعداد دفعات مشاهده:</strong> ${item.views} بار</div>
                  <div><strong>آدرس:</strong> <span style="direction: ltr; display: inline-block; color: var(--gold-light); font-size: 0.78rem;">${item.url}</span></div>
                </div>
              `,
              confirmText: 'بستن',
              cancelText: 'لغو دسترسی این لینک',
              onConfirm: () => {},
            });
          }
        });
      });
    },

    bindActions() {
      // شبیه‌سازی کلید میانبر جست‌وجوی سریع
      document.addEventListener('keydown', (e) => {
        if (e.key === '/' && document.activeElement.tagName !== 'INPUT') {
          e.preventDefault();
          const searchInput = document.getElementById('quickSearchInput');
          if (searchInput) searchInput.focus();
        }
      });
    },
  };

  // ==========================================================================
  // ۸. ماژول مدیریت مدل‌های کفش (Task 2: Shoes & Media Controller)
  // ==========================================================================
  const ShoesController = {
    models: [],
    searchQuery: '',
    selectedCategory: 'all',
    selectedStatus: 'all',
    viewMode: 'grid', // 'grid' or 'table'
    currentPage: 1,
    pageSize: 6,
    currentEditingMedia: [],

    presetImages: [
      'assets/images/shoes.jpeg',
      'assets/images/craft-formal.jpeg',
      'assets/images/craft-sport.jpg',
      'assets/images/bag.jpeg',
      'assets/images/bag2.jpeg'
    ],

    init() {
      this.loadModels();
      this.bindEvents();
      this.render();
      this.updateGlobalCounters();
    },

    loadModels() {
      try {
        const saved = localStorage.getItem('dyf_admin_shoes_v1');
        if (saved) {
          this.models = JSON.parse(saved);
        } else {
          this.models = [...DEFAULT_SHOES];
          this.saveModels(false);
        }
      } catch (e) {
        this.models = [...DEFAULT_SHOES];
      }
    },

    saveModels(showToast = true) {
      try {
        localStorage.setItem('dyf_admin_shoes_v1', JSON.stringify(this.models));
        this.updateGlobalCounters();
        if (window.CategoriesController) {
          window.CategoriesController.updateGlobalCounters();
          window.CategoriesController.render();
        }
        if (showToast) {
          DYF_Toast.show({
            type: 'success',
            title: 'ذخیره پایگاه داده',
            message: 'اطلاعات مدل‌های کفش در حافظه محلی سیستم به‌روزرسانی شد.'
          });
        }
      } catch (e) {
        console.error('Error saving shoes:', e);
      }
    },

    bindEvents() {
      // جست‌وجوی زنده بر اساس عنوان و شناسه عددی
      const searchInput = document.getElementById('shoesSearchInput');
      if (searchInput) {
        searchInput.addEventListener('input', (e) => {
          this.searchQuery = e.target.value.trim().toLowerCase();
          this.currentPage = 1;
          this.render();
        });
      }

      // فیلتر دسته‌بندی
      const catFilter = document.getElementById('shoesCategoryFilter');
      if (catFilter) {
        catFilter.addEventListener('change', (e) => {
          this.selectedCategory = e.target.value;
          this.currentPage = 1;
          this.render();
        });
      }

      // تب‌های فیلتر وضعیت
      document.querySelectorAll('.dyf-filter-tab').forEach((tab) => {
        tab.addEventListener('click', () => {
          document.querySelectorAll('.dyf-filter-tab').forEach((t) => t.classList.remove('is-active'));
          tab.classList.add('is-active');
          this.selectedStatus = tab.getAttribute('data-status') || 'all';
          this.currentPage = 1;
          this.render();
        });
      });

      // سوئیچ نحوه نمایش (گرید / جدول)
      const gridBtn = document.getElementById('shoesViewGridBtn');
      const tableBtn = document.getElementById('shoesViewTableBtn');
      if (gridBtn && tableBtn) {
        gridBtn.addEventListener('click', () => {
          this.viewMode = 'grid';
          gridBtn.classList.add('is-active');
          tableBtn.classList.remove('is-active');
          this.render();
        });
        tableBtn.addEventListener('click', () => {
          this.viewMode = 'table';
          tableBtn.classList.add('is-active');
          gridBtn.classList.remove('is-active');
          this.render();
        });
      }

      // تغییر تعداد در هر صفحه
      const pageSizeSelect = document.getElementById('shoesPageSizeSelect');
      if (pageSizeSelect) {
        pageSizeSelect.addEventListener('change', (e) => {
          this.pageSize = parseInt(e.target.value, 10) || 6;
          this.currentPage = 1;
          this.render();
        });
      }

      // دکمه بازنشانی فیلترها
      const resetBtn = document.getElementById('resetShoesFiltersBtn');
      if (resetBtn) {
        resetBtn.addEventListener('click', () => {
          this.searchQuery = '';
          this.selectedCategory = 'all';
          this.selectedStatus = 'all';
          this.currentPage = 1;
          if (searchInput) searchInput.value = '';
          if (catFilter) catFilter.value = 'all';
          document.querySelectorAll('.dyf-filter-tab').forEach((t) => {
            t.classList.toggle('is-active', t.getAttribute('data-status') === 'all');
          });
          this.render();
        });
      }

      // دکمه باز کردن مودال ثبت مدل جدید
      const openAddBtn = document.getElementById('openAddShoeModalBtn');
      if (openAddBtn) {
        openAddBtn.addEventListener('click', () => this.openCreateModal());
      }

      // دکمه انتخاب فایل و آپلودر
      const triggerFileBtn = document.getElementById('triggerFileSelectBtn');
      const fileInput = document.getElementById('shoeFileInput');
      const dropzone = document.getElementById('shoeMediaDropzone');

      if (triggerFileBtn && fileInput) {
        triggerFileBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          fileInput.click();
        });
      }

      if (dropzone && fileInput) {
        dropzone.addEventListener('click', () => fileInput.click());

        dropzone.addEventListener('dragover', (e) => {
          e.preventDefault();
          dropzone.style.borderColor = 'var(--gold-primary)';
          dropzone.style.background = 'rgba(61, 36, 21, 0.5)';
        });

        dropzone.addEventListener('dragleave', () => {
          dropzone.style.borderColor = '';
          dropzone.style.background = '';
        });

        dropzone.addEventListener('drop', (e) => {
          e.preventDefault();
          dropzone.style.borderColor = '';
          dropzone.style.background = '';
          if (e.dataTransfer.files && e.dataTransfer.files.length) {
            this.handleUploadedFiles(e.dataTransfer.files);
          }
        });

        fileInput.addEventListener('change', (e) => {
          if (e.target.files && e.target.files.length) {
            this.handleUploadedFiles(e.target.files);
          }
        });
      }

      // افزودن تصویر نمونه کارگاه DYF
      const addPresetBtn = document.getElementById('addPresetImagesBtn');
      if (addPresetBtn) {
        addPresetBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          const randomPreset = this.presetImages[Math.floor(Math.random() * this.presetImages.length)];
          this.currentEditingMedia.push({
            url: randomPreset,
            type: 'image',
            isPrimary: this.currentEditingMedia.length === 0,
          });
          this.renderMediaGrid();
          DYF_Toast.show({
            type: 'info',
            title: 'تصویر نمونه افزوده شد',
            message: 'تصویر واقعی عکاسی کارگاه به گالری مدل پیوست شد.',
          });
        });
      }

      // ذخیره مدل
      const saveBtn = document.getElementById('saveShoeBtn');
      if (saveBtn) {
        saveBtn.addEventListener('click', () => this.handleSaveForm());
      }

      // دکمه ویرایش درون مودال شناسنامه
      const dossierEditBtn = document.getElementById('dossierEditBtn');
      if (dossierEditBtn) {
        dossierEditBtn.addEventListener('click', () => {
          const id = parseInt(dossierEditBtn.getAttribute('data-id'), 10);
          DYF_Modal.close('modalShoeDossier');
          if (id) this.openEditModal(id);
        });
      }
    },

    handleUploadedFiles(fileList) {
      Array.from(fileList).forEach((file) => {
        const isVideo = file.type.startsWith('video');
        const reader = new FileReader();
        reader.onload = (event) => {
          this.currentEditingMedia.push({
            url: event.target.result,
            type: isVideo ? 'video' : 'image',
            isPrimary: this.currentEditingMedia.length === 0,
          });
          this.renderMediaGrid();
        };
        reader.readAsDataURL(file);
      });

      DYF_Toast.show({
        type: 'success',
        title: 'پیش‌نمایش رسانه',
        message: `${fileList.length} فایل جدید با موفقیت در فرم بارگذاری شد.`,
      });
    },

    renderMediaGrid() {
      const container = document.getElementById('shoeMediaGrid');
      if (!container) return;

      if (!this.currentEditingMedia || !this.currentEditingMedia.length) {
        container.innerHTML = `
          <div style="grid-column: 1 / -1; text-align: center; padding: 1rem; color: var(--text-dim); font-size: 0.82rem;">
            هنوز تصویری انتخاب نشده است. لطفاً حداقل یک تصویر برای مدل بارگذاری کنید.
          </div>
        `;
        return;
      }

      container.innerHTML = this.currentEditingMedia
        .map((item, index) => {
          const isPrimary = item.isPrimary;
          return `
          <div class="dyf-media-item ${isPrimary ? 'is-primary' : ''}">
            ${
              item.type === 'video'
                ? `<video src="${item.url}" class="dyf-media-thumb" muted></video>`
                : `<img src="${item.url}" alt="پیش‌نمایش" class="dyf-media-thumb">`
            }
            ${isPrimary ? `<span class="dyf-media-primary-tag">تصویر اصلی</span>` : ''}
            <div class="dyf-media-actions">
              ${
                !isPrimary
                  ? `<button type="button" class="dyf-media-btn js-set-cover" data-index="${index}">انتخاب کاور</button>`
                  : ''
              }
              <button type="button" class="dyf-media-btn dyf-media-btn-danger js-remove-media" data-index="${index}">حذف</button>
            </div>
          </div>
        `;
        })
        .join('');

      // رویداد تنظیم به عنوان کاور
      container.querySelectorAll('.js-set-cover').forEach((btn) => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          const idx = parseInt(btn.getAttribute('data-index'), 10);
          this.currentEditingMedia.forEach((m, i) => (m.isPrimary = i === idx));
          this.renderMediaGrid();
          DYF_Toast.show({ type: 'info', title: 'کاور اصلی', message: 'تصویر اصلی مدل انتخاب شد.' });
        });
      });

      // رویداد حذف رسانه
      container.querySelectorAll('.js-remove-media').forEach((btn) => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          const idx = parseInt(btn.getAttribute('data-index'), 10);
          const wasPrimary = this.currentEditingMedia[idx]?.isPrimary;
          this.currentEditingMedia.splice(idx, 1);
          if (wasPrimary && this.currentEditingMedia.length > 0) {
            this.currentEditingMedia[0].isPrimary = true;
          }
          this.renderMediaGrid();
        });
      });
    },

    openCreateModal() {
      const modeInput = document.getElementById('shoeFormMode');
      const idInput = document.getElementById('shoeFormId');
      const titleInput = document.getElementById('shoeFormTitle');
      const descInput = document.getElementById('shoeFormDesc');
      const colorsInput = document.getElementById('shoeFormColors');
      const modalTitle = document.getElementById('shoeFormModalTitle');

      if (modeInput) modeInput.value = 'create';
      if (modalTitle) modalTitle.textContent = 'ثبت مدل کفش جدید';

      // محاسبه شناسه خودکار بعدی
      const maxId = this.models.reduce((max, m) => Math.max(max, m.id || 0), 100);
      const nextId = maxId + 1;
      if (idInput) idInput.value = nextId;

      if (titleInput) titleInput.value = '';
      if (descInput) descInput.value = '';
      if (colorsInput) colorsInput.value = 'مشکی کلاسیک، عسلی کاراملی';

      // انتخاب پیش‌فرض دسته‌ها بر اساس دسته‌بندی‌های فعال سیستم
      if (window.CategoriesController) {
        window.CategoriesController.renderCategoryCheckboxes();
      } else {
        document.querySelectorAll('#shoeFormCategoriesWrap input').forEach((chk, i) => {
          chk.checked = i === 0;
        });
      }

      // انتخاب پیش‌فرض سایزها
      document.querySelectorAll('#shoeFormSizesWrap input').forEach((chk) => {
        chk.checked = ['۴۰', '۴۱', '۴۲', '۴۳', '۴۴'].includes(chk.value);
      });

      // وضعیت پیش‌فرض: منتشرشده
      const pubRadio = document.querySelector('input[name="shoeStatus"][value="published"]');
      if (pubRadio) pubRadio.checked = true;

      // افزودن یک تصویر نمونه کارگاه به عنوان کاور اولیه
      this.currentEditingMedia = [
        { url: 'assets/images/shoes.jpeg', type: 'image', isPrimary: true },
      ];
      this.renderMediaGrid();

      DYF_Modal.open('modalShoeForm');
      if (titleInput) setTimeout(() => titleInput.focus(), 200);
    },

    openEditModal(id) {
      const model = this.models.find((m) => m.id === id);
      if (!model) return;

      const modeInput = document.getElementById('shoeFormMode');
      const idInput = document.getElementById('shoeFormId');
      const titleInput = document.getElementById('shoeFormTitle');
      const descInput = document.getElementById('shoeFormDesc');
      const colorsInput = document.getElementById('shoeFormColors');
      const modalTitle = document.getElementById('shoeFormModalTitle');

      if (modeInput) modeInput.value = 'edit';
      if (modalTitle) modalTitle.textContent = `ویرایش مدل کفش #${model.id}`;
      if (idInput) idInput.value = model.id;
      if (titleInput) titleInput.value = model.title || '';
      if (descInput) descInput.value = model.description || '';
      if (colorsInput) colorsInput.value = (model.colors || []).join('، ');

      // تیک دسته‌بندی‌ها
      if (window.CategoriesController) {
        window.CategoriesController.renderCategoryCheckboxes(model.categories || []);
      } else {
        document.querySelectorAll('#shoeFormCategoriesWrap input').forEach((chk) => {
          chk.checked = (model.categories || []).includes(chk.value);
        });
      }

      // تیک سایزها
      document.querySelectorAll('#shoeFormSizesWrap input').forEach((chk) => {
        chk.checked = (model.sizes || []).includes(chk.value);
      });

      // وضعیت
      const statusRadio = document.querySelector(`input[name="shoeStatus"][value="${model.status}"]`);
      if (statusRadio) statusRadio.checked = true;

      // کپی رسانه‌ها
      this.currentEditingMedia = JSON.parse(JSON.stringify(model.media || []));
      if (!this.currentEditingMedia.some((m) => m.isPrimary) && this.currentEditingMedia.length > 0) {
        this.currentEditingMedia[0].isPrimary = true;
      }
      this.renderMediaGrid();

      DYF_Modal.open('modalShoeForm');
    },

    handleSaveForm() {
      const mode = document.getElementById('shoeFormMode')?.value || 'create';
      const id = parseInt(document.getElementById('shoeFormId')?.value, 10);
      const title = document.getElementById('shoeFormTitle')?.value.trim();
      const desc = document.getElementById('shoeFormDesc')?.value.trim();
      const colorsRaw = document.getElementById('shoeFormColors')?.value.trim();
      const status = document.querySelector('input[name="shoeStatus"]:checked')?.value || 'published';

      if (!title) {
        DYF_Toast.show({
          type: 'error',
          title: 'عنوان الزامی است',
          message: 'لطفاً عنوان کامل مدل کفش را وارد کنید.',
        });
        document.getElementById('shoeFormTitle')?.focus();
        return;
      }

      // استخراج دسته‌بندی‌ها
      const categories = [];
      document.querySelectorAll('#shoeFormCategoriesWrap input:checked').forEach((c) => {
        categories.push(c.value);
      });

      if (!categories.length) {
        DYF_Toast.show({
          type: 'error',
          title: 'دسته‌بندی الزامی است',
          message: 'حداقل یک دسته‌بندی برای این مدل باید انتخاب شود.',
        });
        return;
      }

      // اعتبارسنجی رسانه برای حالت منتشرشده
      if (!this.currentEditingMedia.length && status === 'published') {
        DYF_Toast.show({
          type: 'error',
          title: 'تصویر مدل الزامی است',
          message: 'برای انتشار مدل در کاتالوگ، حداقل یک تصویر الزامی است.',
        });
        return;
      }

      // اطمینان از وجود یک کاور اصلی
      if (this.currentEditingMedia.length > 0 && !this.currentEditingMedia.some((m) => m.isPrimary)) {
        this.currentEditingMedia[0].isPrimary = true;
      }

      const colors = colorsRaw
        ? colorsRaw.split(/[,،]/).map((c) => c.trim()).filter(Boolean)
        : ['مشکی کلاسیک'];

      const sizes = [];
      document.querySelectorAll('#shoeFormSizesWrap input:checked').forEach((s) => sizes.push(s.value));

      if (mode === 'create') {
        const newModel = {
          id,
          title,
          categories,
          colors,
          sizes: sizes.length ? sizes : ['۴۰', '۴۱', '۴۲', '۴۳', '۴۴'],
          status,
          description: desc || 'توضیحات فنی کارگاهی این مدل به زودی افزوده خواهد شد.',
          media: this.currentEditingMedia,
        };
        this.models.unshift(newModel);
        this.saveModels();
        DYF_Toast.show({
          type: 'success',
          title: 'مدل جدید ثبت شد',
          message: `مدل «${title}» با شناسه DYF-${id} با موفقیت در سامانه ذخیره شد.`,
        });
      } else {
        const idx = this.models.findIndex((m) => m.id === id);
        if (idx !== -1) {
          this.models[idx] = {
            ...this.models[idx],
            title,
            categories,
            colors,
            sizes: sizes.length ? sizes : this.models[idx].sizes,
            status,
            description: desc,
            media: this.currentEditingMedia,
          };
          this.saveModels();
          DYF_Toast.show({
            type: 'success',
            title: 'ویرایش موفق',
            message: `مشخصات مدل «${title}» به‌روزرسانی شد.`,
          });
        }
      }

      DYF_Modal.close('modalShoeForm');
      this.render();
    },

    openDossierModal(id) {
      const model = this.models.find((m) => m.id === id);
      if (!model) return;

      const titleEl = document.getElementById('dossierTitle');
      const badgeEl = document.getElementById('dossierStatusBadge');
      const bodyEl = document.getElementById('dossierBody');
      const editBtn = document.getElementById('dossierEditBtn');

      if (titleEl) titleEl.textContent = `${model.title} (DYF-${model.id})`;
      if (editBtn) editBtn.setAttribute('data-id', model.id);

      const statusMap = {
        published: `<span class="dyf-badge dyf-badge-published">منتشرشده در کاتالوگ</span>`,
        draft: `<span class="dyf-badge dyf-badge-draft">پیش‌نویس کارگاه</span>`,
        archived: `<span class="dyf-badge dyf-badge-archived">بایگانی‌شده</span>`,
      };

      if (badgeEl) badgeEl.innerHTML = statusMap[model.status] || '';

      const coverMedia = (model.media || []).find((m) => m.isPrimary) || (model.media && model.media[0]) || { url: 'assets/images/shoes.jpeg' };

      const thumbnailsHtml = (model.media || [])
        .map(
          (m, idx) => `
        <img 
          src="${m.url}" 
          alt="عکس ${idx + 1}" 
          style="width: 58px; height: 58px; object-fit: cover; border-radius: var(--r-sm); border: 1px solid ${m.isPrimary ? 'var(--gold-primary)' : 'var(--border-subtle)'}; cursor: pointer;"
          onclick="document.getElementById('dossierMasterImg').src = '${m.url}'"
        >
      `
        )
        .join('');

      if (bodyEl) {
        bodyEl.innerHTML = `
          <div style="display: grid; grid-template-columns: 240px 1fr; gap: 1.5rem; margin-bottom: 1.5rem;">
            <div>
              <div style="width: 100%; aspect-ratio: 1; border-radius: var(--r-md); overflow: hidden; background: #0e0c0a; border: 1px solid var(--border-medium); margin-bottom: 0.75rem;">
                <img id="dossierMasterImg" src="${coverMedia.url}" alt="${model.title}" style="width: 100%; height: 100%; object-fit: cover;">
              </div>
              <div style="display: flex; gap: 0.4rem; overflow-x: auto; padding-bottom: 0.4rem;">
                ${thumbnailsHtml}
              </div>
            </div>

            <div style="display: flex; flex-direction: column; gap: 0.85rem; font-size: 0.88rem;">
              <div>
                <span style="color: var(--text-dim); font-size: 0.78rem;">دسته‌بندی‌های لاین:</span>
                <div style="display: flex; flex-wrap: wrap; gap: 0.4rem; margin-top: 0.25rem;">
                  ${(model.categories || []).map((c) => `<span class="dyf-category-pill">${c}</span>`).join('')}
                </div>
              </div>

              <div>
                <span style="color: var(--text-dim); font-size: 0.78rem;">شناسنامه و متریال کارگاه:</span>
                <p style="color: var(--text-main); line-height: 1.7; margin-top: 0.25rem;">${model.description || '-'}</p>
              </div>

              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.85rem; padding-top: 0.75rem; border-top: 1px solid var(--border-subtle);">
                <div>
                  <span style="color: var(--text-dim); font-size: 0.78rem;">رنگ‌های موجود:</span>
                  <div style="font-weight: 700; color: var(--gold-light); margin-top: 0.2rem;">${(model.colors || []).join('، ')}</div>
                </div>
                <div>
                  <span style="color: var(--text-dim); font-size: 0.78rem;">سایزبندی سری:</span>
                  <div style="font-weight: 700; color: var(--text-ivory); margin-top: 0.2rem;">${(model.sizes || []).join('، ')}</div>
                </div>
              </div>

              <div style="padding: 0.85rem; background: rgba(36, 30, 25, 0.45); border-radius: var(--r-sm); border: 1px dashed var(--border-subtle); font-size: 0.78rem; color: var(--text-muted);">
                <strong>شرایط تیراژ عمده B2B:</strong> حداقل سفارش ۱ سری (۱۰ جفت) با بسته‌بندی ویژه جعبه دو رنگ DYF. ارسال مستقیم از کارگاه تبریز یا انبار مرکزی بازار تهران.
              </div>
            </div>
          </div>
        `;
      }

      DYF_Modal.open('modalShoeDossier');
    },

    changeStatus(id, newStatus) {
      const model = this.models.find((m) => m.id === id);
      if (!model) return;

      if (newStatus === 'archived') {
        DYF_Modal.confirm({
          title: 'انتقال مدل به بایگانی کارگاه',
          message: `
            آیا از انتقال مدل <strong>«${model.title}»</strong> به بایگانی اطمینان دارید؟<br><br>
            <div style="background: rgba(36, 30, 25, 0.6); padding: 0.85rem; border-radius: var(--r-sm); font-size: 0.82rem; color: var(--leather-caramel);">
              ⚠️ <strong>پیامد عملیات:</strong> این مدل بلافاصله از تمام لینک‌های فعال و کاتالوگ مشتریان پنهان می‌شود؛ اما سوابق آن در پنل شما حفظ خواهد شد.
            </div>
          `,
          confirmText: 'انتقال به بایگانی',
          cancelText: 'انصراف',
          onConfirm: () => {
            model.status = 'archived';
            this.saveModels();
            DYF_Toast.show({
              type: 'info',
              title: 'مدل بایگانی شد',
              message: `مدل «${model.title}» به بایگانی منتقل شد.`,
            });
            this.render();
          },
        });
      } else if (newStatus === 'published') {
        model.status = 'published';
        this.saveModels();
        DYF_Toast.show({
          type: 'success',
          title: 'مدل منتشر شد',
          message: `مدل «${model.title}» در کاتالوگ مجاز همکاران فعال گردید.`,
        });
        this.render();
      } else {
        model.status = 'draft';
        this.saveModels();
        DYF_Toast.show({
          type: 'info',
          title: 'تغییر به پیش‌نویس',
          message: `مدل «${model.title}» به حالت پیش‌نویس تغییر یافت.`,
        });
        this.render();
      }
    },

    updateGlobalCounters() {
      const allCount = this.models.length;
      const pubCount = this.models.filter((m) => m.status === 'published').length;
      const draftCount = this.models.filter((m) => m.status === 'draft').length;
      const archCount = this.models.filter((m) => m.status === 'archived').length;

      // به‌روزرسانی شمارنده‌های هدر تب‌ها
      const elAll = document.getElementById('countAllModels');
      const elPub = document.getElementById('countPublishedModels');
      const elDraft = document.getElementById('countDraftModels');
      const elArch = document.getElementById('countArchivedModels');
      const badge = document.getElementById('shoesCountSummaryBadge');

      if (elAll) elAll.textContent = allCount;
      if (elPub) elPub.textContent = pubCount;
      if (elDraft) elDraft.textContent = draftCount;
      if (elArch) elArch.textContent = archCount;
      if (badge) badge.textContent = `${allCount} مدل کل (${pubCount} فعال)`;

      // به‌روزرسانی شمارنده سایدبار
      const navCounter = document.querySelector('a[href="#shoes"] .dyf-nav-counter');
      if (navCounter) navCounter.textContent = allCount;

      // به‌روزرسانی کارت داشبورد
      const dashStat = document.querySelector('.dyf-stat-card .dyf-stat-value');
      if (dashStat) dashStat.innerHTML = `${allCount} <span style="font-size: 0.95rem; font-weight: 500; color: var(--text-muted);">مدل</span>`;
    },

    getFilteredModels() {
      return this.models.filter((m) => {
        // فیلتر جست‌وجو (عنوان و شناسه عددی)
        if (this.searchQuery) {
          const matchTitle = (m.title || '').toLowerCase().includes(this.searchQuery);
          const matchId = String(m.id).includes(this.searchQuery) || `dyf-${m.id}`.includes(this.searchQuery);
          if (!matchTitle && !matchId) return false;
        }

        // فیلتر دسته‌بندی
        if (this.selectedCategory !== 'all') {
          if (!m.categories || !m.categories.includes(this.selectedCategory)) {
            return false;
          }
        }

        // فیلتر وضعیت
        if (this.selectedStatus !== 'all') {
          if (m.status !== this.selectedStatus) {
            return false;
          }
        }

        return true;
      });
    },

    render() {
      const filtered = this.getFilteredModels();
      const gridContainer = document.getElementById('shoesGridContainer');
      const tableContainer = document.getElementById('shoesTableContainer');
      const tableBody = document.getElementById('shoesTableBody');
      const emptyState = document.getElementById('shoesEmptyState');
      const paginationContainer = document.getElementById('shoesPagination');

      this.updateGlobalCounters();

      if (!filtered.length) {
        if (gridContainer) gridContainer.style.display = 'none';
        if (tableContainer) tableContainer.style.display = 'none';
        if (paginationContainer) paginationContainer.style.display = 'none';
        if (emptyState) emptyState.style.display = 'block';
        return;
      }

      if (emptyState) emptyState.style.display = 'none';

      // محاسبه بازه داده‌های صفحه جاری (Pagination Slicing)
      const totalItems = filtered.length;
      const totalPages = Math.ceil(totalItems / this.pageSize) || 1;
      if (this.currentPage > totalPages) this.currentPage = totalPages;
      if (this.currentPage < 1) this.currentPage = 1;

      const startIdx = (this.currentPage - 1) * this.pageSize;
      const endIdx = Math.min(startIdx + this.pageSize, totalItems);
      const paginated = filtered.slice(startIdx, endIdx);

      if (this.viewMode === 'grid') {
        if (tableContainer) tableContainer.style.display = 'none';
        if (gridContainer) {
          gridContainer.style.display = 'grid';
          gridContainer.innerHTML = paginated.map((m) => this.renderCardHtml(m)).join('');
          this.bindCardActions(gridContainer);
        }
      } else {
        if (gridContainer) gridContainer.style.display = 'none';
        if (tableContainer && tableBody) {
          tableContainer.style.display = 'block';
          tableBody.innerHTML = paginated.map((m) => this.renderTableRowHtml(m)).join('');
          this.bindCardActions(tableBody);
        }
      }

      // رندر المان‌ها و کنترل‌های صفحه‌بندی
      this.renderPagination(totalItems);
    },

    renderPagination(totalItems) {
      const paginationEl = document.getElementById('shoesPagination');
      const pagesContainer = document.getElementById('shoesPaginationPages');
      const startEl = document.getElementById('shoesPageStart');
      const endEl = document.getElementById('shoesPageEnd');
      const totalEl = document.getElementById('shoesTotalCount');

      if (!paginationEl) return;

      if (totalItems === 0) {
        paginationEl.style.display = 'none';
        return;
      }

      paginationEl.style.display = 'flex';

      const totalPages = Math.ceil(totalItems / this.pageSize) || 1;
      const startIdx = (this.currentPage - 1) * this.pageSize + 1;
      const endIdx = Math.min(this.currentPage * this.pageSize, totalItems);

      if (startEl) startEl.textContent = startIdx;
      if (endEl) endEl.textContent = endIdx;
      if (totalEl) totalEl.textContent = totalItems;

      if (!pagesContainer) return;

      let html = '';

      // دکمه قبلی
      html += `
        <button type="button" class="dyf-pagination-btn js-page-prev" ${this.currentPage === 1 ? 'disabled' : ''} title="صفحه قبلی">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
        </button>
      `;

      // شماره صفحات
      for (let p = 1; p <= totalPages; p++) {
        if (totalPages <= 5 || p === 1 || p === totalPages || (p >= this.currentPage - 1 && p <= this.currentPage + 1)) {
          html += `
            <button type="button" class="dyf-pagination-btn ${p === this.currentPage ? 'is-active' : ''} js-page-num" data-page="${p}">
              ${p}
            </button>
          `;
        } else if (p === this.currentPage - 2 || p === this.currentPage + 2) {
          html += `<span class="dyf-pagination-dots">...</span>`;
        }
      }

      // دکمه بعدی
      html += `
        <button type="button" class="dyf-pagination-btn js-page-next" ${this.currentPage === totalPages ? 'disabled' : ''} title="صفحه بعدی">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"/></svg>
        </button>
      `;

      pagesContainer.innerHTML = html;

      // رویدادهای دکمه‌ها
      pagesContainer.querySelector('.js-page-prev')?.addEventListener('click', () => {
        if (this.currentPage > 1) {
          this.currentPage--;
          this.render();
        }
      });

      pagesContainer.querySelector('.js-page-next')?.addEventListener('click', () => {
        if (this.currentPage < totalPages) {
          this.currentPage++;
          this.render();
        }
      });

      pagesContainer.querySelectorAll('.js-page-num').forEach((btn) => {
        btn.addEventListener('click', () => {
          const p = parseInt(btn.getAttribute('data-page'), 10);
          if (p && p !== this.currentPage) {
            this.currentPage = p;
            this.render();
          }
        });
      });
    },

    renderCardHtml(model) {
      const primaryMedia = (model.media || []).find((m) => m.isPrimary) || (model.media && model.media[0]) || { url: 'assets/images/shoes.jpeg' };
      const mediaCount = (model.media || []).length;

      const statusBadges = {
        published: `<span class="dyf-badge dyf-badge-published">منتشرشده</span>`,
        draft: `<span class="dyf-badge dyf-badge-draft">پیش‌نویس</span>`,
        archived: `<span class="dyf-badge dyf-badge-archived">بایگانی</span>`,
      };

      const categoriesHtml = (model.categories || [])
        .map((c) => `<span class="dyf-category-pill">${c}</span>`)
        .join('');

      return `
        <article class="dyf-product-card" data-id="${model.id}">
          <div class="dyf-product-thumb-wrap">
            <img src="${primaryMedia.url}" alt="${model.title}" class="dyf-product-thumb" loading="lazy">
            <div class="dyf-product-thumb-overlay"></div>
            <div class="dyf-product-badge-top">
              ${statusBadges[model.status] || ''}
            </div>
            <div class="dyf-product-id-badge">DYF-${model.id}</div>
            <div class="dyf-product-media-count">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>
              <span>${mediaCount} رسانه</span>
            </div>
          </div>

          <div class="dyf-product-body">
            <h3 class="dyf-product-title">${model.title}</h3>
            <div class="dyf-product-categories">${categoriesHtml}</div>
            <p class="dyf-product-desc">${model.description || '-'}</p>

            <div class="dyf-product-specs-row">
              <div style="display: flex; align-items: center; gap: 0.35rem;">
                <span>رنگ‌ها:</span>
                <span style="color: var(--text-main); font-weight: 600;">${(model.colors || []).join('، ')}</span>
              </div>
              <div>
                <span>سایزها:</span>
                <span style="color: var(--gold-light); font-weight: 700;">${(model.sizes || []).join(' ')}</span>
              </div>
            </div>
          </div>

          <div class="dyf-product-actions-footer">
            <div style="display: flex; gap: 0.4rem;">
              <button type="button" class="dyf-btn dyf-btn-outline dyf-btn-sm js-edit-shoe" data-id="${model.id}">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/></svg>
                <span>ویرایش</span>
              </button>
              <button type="button" class="dyf-btn dyf-btn-specular dyf-btn-sm js-dossier-shoe" data-id="${model.id}">
                <span>شناسنامه</span>
              </button>
            </div>

            <div>
              ${
                model.status === 'published'
                  ? `<button type="button" class="dyf-btn dyf-btn-outline dyf-btn-sm js-archive-shoe" data-id="${model.id}" title="انتقال به بایگانی" style="color: var(--text-muted); border-color: transparent;">بایگانی</button>`
                  : model.status === 'archived'
                  ? `<button type="button" class="dyf-btn dyf-btn-outline dyf-btn-sm js-publish-shoe" data-id="${model.id}" title="انتشار مجدد" style="color: var(--gold-primary);">انتشار</button>`
                  : `<button type="button" class="dyf-btn dyf-btn-primary dyf-btn-sm js-publish-shoe" data-id="${model.id}">انتشار</button>`
              }
            </div>
          </div>
        </article>
      `;
    },

    renderTableRowHtml(model) {
      const primaryMedia = (model.media || []).find((m) => m.isPrimary) || (model.media && model.media[0]) || { url: 'assets/images/shoes.jpeg' };

      const statusBadges = {
        published: `<span class="dyf-badge dyf-badge-published">منتشرشده</span>`,
        draft: `<span class="dyf-badge dyf-badge-draft">پیش‌نویس</span>`,
        archived: `<span class="dyf-badge dyf-badge-archived">بایگانی</span>`,
      };

      return `
        <tr data-id="${model.id}">
          <td style="width: 60px;">
            <img src="${primaryMedia.url}" alt="${model.title}" style="width: 48px; height: 48px; object-fit: cover; border-radius: var(--r-sm); border: 1px solid var(--border-subtle);">
          </td>
          <td style="font-family: var(--font-title); font-weight: 700; color: var(--gold-light); direction: ltr; text-align: right;">
            DYF-${model.id}
          </td>
          <td>
            <div style="font-weight: 700; color: var(--text-ivory);">${model.title}</div>
            <div style="font-size: 0.74rem; color: var(--text-muted);">${(model.media || []).length} تصویر و ویدئو</div>
          </td>
          <td>
            <div style="display: flex; flex-wrap: wrap; gap: 0.3rem;">
              ${(model.categories || []).map((c) => `<span class="dyf-category-pill" style="font-size: 0.68rem;">${c}</span>`).join('')}
            </div>
          </td>
          <td>
            <div style="font-size: 0.78rem; color: var(--text-main);">${(model.colors || []).join('، ')}</div>
            <div style="font-size: 0.72rem; color: var(--gold-primary); font-weight: 600;">سایز: ${(model.sizes || []).join(' ')}</div>
          </td>
          <td>${statusBadges[model.status] || model.status}</td>
          <td>
            <div style="display: flex; gap: 0.35rem; align-items: center;">
              <button type="button" class="dyf-btn dyf-btn-outline dyf-btn-sm js-edit-shoe" data-id="${model.id}">ویرایش</button>
              <button type="button" class="dyf-btn dyf-btn-specular dyf-btn-sm js-dossier-shoe" data-id="${model.id}">شناسنامه</button>
              ${
                model.status === 'published'
                  ? `<button type="button" class="dyf-btn dyf-btn-outline dyf-btn-sm js-archive-shoe" data-id="${model.id}" title="بایگانی">بایگانی</button>`
                  : `<button type="button" class="dyf-btn dyf-btn-primary dyf-btn-sm js-publish-shoe" data-id="${model.id}">انتشار</button>`
              }
            </div>
          </td>
        </tr>
      `;
    },

    bindCardActions(container) {
      // ویرایش
      container.querySelectorAll('.js-edit-shoe').forEach((btn) => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          const id = parseInt(btn.getAttribute('data-id'), 10);
          this.openEditModal(id);
        });
      });

      // شناسنامه فنی
      container.querySelectorAll('.js-dossier-shoe').forEach((btn) => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          const id = parseInt(btn.getAttribute('data-id'), 10);
          this.openDossierModal(id);
        });
      });

      // انتقال به بایگانی
      container.querySelectorAll('.js-archive-shoe').forEach((btn) => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          const id = parseInt(btn.getAttribute('data-id'), 10);
          this.changeStatus(id, 'archived');
        });
      });

      // انتشار
      container.querySelectorAll('.js-publish-shoe').forEach((btn) => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          const id = parseInt(btn.getAttribute('data-id'), 10);
          this.changeStatus(id, 'published');
        });
      });
    },
  };

  window.ShoesController = ShoesController;

  // ==========================================================================
  // ۹. ماژول مدیریت دسته‌بندی‌ها و لاین‌های محصول (Task 3: Categories Controller)
  // ==========================================================================
  const CategoriesController = {
    categories: [],
    searchQuery: '',
    selectedStatus: 'all', // 'all', 'active', 'inactive'
    viewMode: 'grid', // 'grid' or 'table'

    iconsMap: {
      briefcase: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="20" height="14" x="2" y="7" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>`,
      zap: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>`,
      award: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="8" r="7"/><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"/></svg>`,
      shield: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>`,
    },

    init() {
      this.loadCategories();
      this.bindEvents();
      this.render();
      this.syncWithShoeFilters();
      this.updateGlobalCounters();
    },

    loadCategories() {
      try {
        const saved = localStorage.getItem('dyf_admin_categories_v1');
        if (saved) {
          this.categories = JSON.parse(saved);
        } else {
          this.categories = [...DEFAULT_CATEGORIES];
          this.saveCategories(false);
        }
      } catch (e) {
        this.categories = [...DEFAULT_CATEGORIES];
      }
    },

    saveCategories(showToast = true) {
      try {
        localStorage.setItem('dyf_admin_categories_v1', JSON.stringify(this.categories));
        this.updateGlobalCounters();
        this.syncWithShoeFilters();
        if (showToast) {
          DYF_Toast.show({
            type: 'success',
            title: 'به‌روزرسانی دسته‌بندی‌ها',
            message: 'تغییرات لاین‌های محصول در حافظه سامانه ذخیره شد.',
          });
        }
      } catch (e) {
        console.error('Error saving categories:', e);
      }
    },

    getModelCountForCategory(categoryName) {
      const models = ShoesController.models || [];
      return models.filter((m) => (m.categories || []).includes(categoryName)).length;
    },

    syncWithShoeFilters() {
      // ۱. به‌روزرسانی دراپ‌داون فیلتر دسته‌بندی در نوار ابزار کفش‌ها
      const shoeFilterSelect = document.getElementById('shoesCategoryFilter');
      if (shoeFilterSelect) {
        const currentVal = shoeFilterSelect.value;
        let optionsHtml = '<option value="all">همه دسته‌بندی‌ها</option>';
        this.categories.forEach((cat) => {
          const count = this.getModelCountForCategory(cat.name);
          const isInactive = cat.status === 'inactive';
          optionsHtml += `
            <option value="${cat.name}" ${currentVal === cat.name ? 'selected' : ''}>
              ${cat.name} (${count} مدل) ${isInactive ? '— غیرفعال' : ''}
            </option>
          `;
        });
        shoeFilterSelect.innerHTML = optionsHtml;
      }

      // ۲. به‌روزرسانی چک‌باکس‌های دسته‌بندی در مودال ثبت/ویرایش مدل کفش
      this.renderCategoryCheckboxes();
    },

    renderCategoryCheckboxes(selectedNames = null) {
      const wrap = document.getElementById('shoeFormCategoriesWrap');
      if (!wrap) return;

      const activeCategories = this.categories.filter((c) => c.status === 'active' || (selectedNames && selectedNames.includes(c.name)));

      wrap.innerHTML = activeCategories
        .map((c, idx) => {
          const isChecked = selectedNames !== null ? selectedNames.includes(c.name) : idx === 0;
          return `
            <label class="dyf-switch-label" style="background: var(--bg-surface-elevated); padding: 0.45rem 0.85rem; border: 1px solid var(--border-subtle); border-radius: var(--r-sm);">
              <input type="checkbox" name="shoeCategories" value="${c.name}" ${isChecked ? 'checked' : ''}>
              <span style="font-size: 0.82rem;">${c.name}</span>
            </label>
          `;
        })
        .join('');
    },

    bindEvents() {
      // جست‌وجوی زنده دسته‌بندی‌ها
      const searchInput = document.getElementById('categorySearchInput');
      if (searchInput) {
        searchInput.addEventListener('input', (e) => {
          this.searchQuery = e.target.value.trim().toLowerCase();
          this.render();
        });
      }

      // تب‌های فیلتر وضعیت
      document.querySelectorAll('[data-cat-status]').forEach((tab) => {
        tab.addEventListener('click', () => {
          document.querySelectorAll('[data-cat-status]').forEach((t) => t.classList.remove('is-active'));
          tab.classList.add('is-active');
          this.selectedStatus = tab.getAttribute('data-cat-status') || 'all';
          this.render();
        });
      });

      // سوئیچ گرید / جدول
      const gridBtn = document.getElementById('categoriesViewGridBtn');
      const tableBtn = document.getElementById('categoriesViewTableBtn');
      if (gridBtn && tableBtn) {
        gridBtn.addEventListener('click', () => {
          this.viewMode = 'grid';
          gridBtn.classList.add('is-active');
          tableBtn.classList.remove('is-active');
          this.render();
        });
        tableBtn.addEventListener('click', () => {
          this.viewMode = 'table';
          tableBtn.classList.add('is-active');
          gridBtn.classList.remove('is-active');
          this.render();
        });
      }

      // دکمه بازنشانی فیلتر
      const resetBtn = document.getElementById('resetCategoryFiltersBtn');
      if (resetBtn) {
        resetBtn.addEventListener('click', () => {
          this.searchQuery = '';
          this.selectedStatus = 'all';
          if (searchInput) searchInput.value = '';
          document.querySelectorAll('[data-cat-status]').forEach((t) => {
            t.classList.toggle('is-active', t.getAttribute('data-cat-status') === 'all');
          });
          this.render();
        });
      }

      // باز کردن مودال ثبت دسته‌بندی
      const openAddBtn = document.getElementById('openAddCategoryModalBtn');
      if (openAddBtn) {
        openAddBtn.addEventListener('click', () => this.openCreateModal());
      }

      // ذخیره فرم دسته‌بندی
      const saveBtn = document.getElementById('saveCategoryBtn');
      if (saveBtn) {
        saveBtn.addEventListener('click', () => this.handleSaveForm());
      }
    },

    openCreateModal() {
      const modeInput = document.getElementById('categoryFormMode');
      const idInput = document.getElementById('categoryFormId');
      const nameInput = document.getElementById('categoryFormName');
      const slugInput = document.getElementById('categoryFormSlug');
      const descInput = document.getElementById('categoryFormDesc');
      const modalTitle = document.getElementById('categoryFormModalTitle');

      if (modeInput) modeInput.value = 'create';
      if (idInput) idInput.value = '';
      if (modalTitle) modalTitle.textContent = 'ایجاد دسته‌بندی / لاین جدید';

      if (nameInput) nameInput.value = '';
      if (slugInput) slugInput.value = '';
      if (descInput) descInput.value = '';

      const activeRadio = document.querySelector('input[name="categoryStatus"][value="active"]');
      if (activeRadio) activeRadio.checked = true;

      const firstIconRadio = document.querySelector('input[name="categoryIcon"][value="briefcase"]');
      if (firstIconRadio) firstIconRadio.checked = true;

      DYF_Modal.open('modalCategoryForm');
      if (nameInput) setTimeout(() => nameInput.focus(), 200);
    },

    openEditModal(id) {
      const cat = this.categories.find((c) => c.id === id);
      if (!cat) return;

      const modeInput = document.getElementById('categoryFormMode');
      const idInput = document.getElementById('categoryFormId');
      const nameInput = document.getElementById('categoryFormName');
      const slugInput = document.getElementById('categoryFormSlug');
      const descInput = document.getElementById('categoryFormDesc');
      const modalTitle = document.getElementById('categoryFormModalTitle');

      if (modeInput) modeInput.value = 'edit';
      if (idInput) idInput.value = cat.id;
      if (modalTitle) modalTitle.textContent = `ویرایش دسته‌بندی «${cat.name}»`;

      if (nameInput) nameInput.value = cat.name || '';
      if (slugInput) slugInput.value = cat.slug || '';
      if (descInput) descInput.value = cat.desc || '';

      const statusRadio = document.querySelector(`input[name="categoryStatus"][value="${cat.status}"]`);
      if (statusRadio) statusRadio.checked = true;

      const iconRadio = document.querySelector(`input[name="categoryIcon"][value="${cat.icon || 'briefcase'}"]`);
      if (iconRadio) iconRadio.checked = true;

      DYF_Modal.open('modalCategoryForm');
      if (nameInput) setTimeout(() => nameInput.focus(), 200);
    },

    handleSaveForm() {
      const mode = document.getElementById('categoryFormMode')?.value || 'create';
      const id = document.getElementById('categoryFormId')?.value;
      const name = document.getElementById('categoryFormName')?.value.trim();
      const slug = document.getElementById('categoryFormSlug')?.value.trim();
      const desc = document.getElementById('categoryFormDesc')?.value.trim();
      const status = document.querySelector('input[name="categoryStatus"]:checked')?.value || 'active';
      const icon = document.querySelector('input[name="categoryIcon"]:checked')?.value || 'briefcase';

      if (!name) {
        DYF_Toast.show({
          type: 'error',
          title: 'نام دسته‌بندی الزامی است',
          message: 'لطفاً عنوان کامل لاین محصول را وارد کنید.',
        });
        document.getElementById('categoryFormName')?.focus();
        return;
      }

      if (!slug) {
        DYF_Toast.show({
          type: 'error',
          title: 'شناسه انگلیسی الزامی است',
          message: 'لطفاً شناسه لاتین (Slug) دسته‌بندی را وارد کنید.',
        });
        document.getElementById('categoryFormSlug')?.focus();
        return;
      }

      if (mode === 'create') {
        const exists = this.categories.some(
          (c) => c.name.toLowerCase() === name.toLowerCase() || c.slug.toLowerCase() === slug.toLowerCase()
        );
        if (exists) {
          DYF_Toast.show({
            type: 'error',
            title: 'دسته‌بندی تکراری',
            message: 'دسته‌بندی دیگری با همین نام یا شناسه انگلیسی قبلاً ثبت شده است.',
          });
          return;
        }

        const newCat = {
          id: `cat-${Date.now()}`,
          name,
          slug,
          desc: desc || 'توضیحات تکمیلی این لاین کارگاهی به زودی درج خواهد شد.',
          status,
          icon,
        };

        this.categories.push(newCat);
        this.saveCategories();
        DYF_Toast.show({
          type: 'success',
          title: 'دسته‌بندی ایجاد شد',
          message: `دسته‌بندی «${name}» با موفقیت افزوده شد.`,
        });
      } else {
        const cat = this.categories.find((c) => c.id === id);
        if (cat) {
          const oldName = cat.name;
          cat.name = name;
          cat.slug = slug;
          cat.desc = desc;
          cat.status = status;
          cat.icon = icon;

          // به‌روزرسانی مدل‌های متصل در صورت تغییر عنوان دسته‌بندی
          if (oldName !== name && ShoesController.models) {
            let updatedCount = 0;
            ShoesController.models.forEach((m) => {
              if (m.categories && m.categories.includes(oldName)) {
                m.categories = m.categories.map((c) => (c === oldName ? name : c));
                updatedCount++;
              }
            });
            if (updatedCount > 0) {
              ShoesController.saveModels(false);
              ShoesController.render();
            }
          }

          this.saveCategories();
          DYF_Toast.show({
            type: 'success',
            title: 'ویرایش دسته‌بندی',
            message: `مشخصات دسته‌بندی «${name}» با موفقیت به‌روزرسانی شد.`,
          });
        }
      }

      DYF_Modal.close('modalCategoryForm');
      this.render();
      ShoesController.render();
    },

    changeStatus(id, newStatus) {
      const cat = this.categories.find((c) => c.id === id);
      if (!cat) return;

      const modelCount = this.getModelCountForCategory(cat.name);

      if (newStatus === 'inactive') {
        DYF_Modal.confirm({
          title: 'غیرفعال‌سازی دسته‌بندی',
          message: `
            آیا از غیرفعال‌سازی دسته‌بندی <strong>«${cat.name}»</strong> اطمینان دارید؟<br><br>
            <div style="background: rgba(36, 30, 25, 0.6); padding: 0.85rem; border-radius: var(--r-sm); font-size: 0.82rem; color: var(--leather-caramel);">
              ⚠️ <strong>پیامد عملیات:</strong> این دسته دارای <strong>${modelCount} مدل مرتبط</strong> است. مدل‌ها در سیستم باقی می‌مانند اما این لاین در کاتالوگ عمومی پنهان می‌گردد.
            </div>
          `,
          confirmText: 'غیرفعال‌سازی لاین',
          cancelText: 'انصراف',
          onConfirm: () => {
            cat.status = 'inactive';
            this.saveCategories();
            this.render();
            ShoesController.render();
            DYF_Toast.show({
              type: 'info',
              title: 'لاین غیرفعال شد',
              message: `دسته‌بندی «${cat.name}» به حالت غیرفعال تغییر یافت.`,
            });
          },
        });
      } else {
        cat.status = 'active';
        this.saveCategories();
        this.render();
        ShoesController.render();
        DYF_Toast.show({
          type: 'success',
          title: 'لاین فعال شد',
          message: `دسته‌بندی «${cat.name}» مجدداً فعال گردید.`,
        });
      }
    },

    deleteCategory(id) {
      const cat = this.categories.find((c) => c.id === id);
      if (!cat) return;

      const modelCount = this.getModelCountForCategory(cat.name);

      DYF_Modal.confirm({
        title: 'حذف دائمی دسته‌بندی',
        message: `
          آیا از حذف دسته‌بندی <strong>«${cat.name}»</strong> اطمینان دارید؟<br><br>
          <div style="background: rgba(58, 26, 26, 0.45); border: 1px solid rgba(224, 86, 74, 0.4); padding: 0.85rem; border-radius: var(--r-sm); font-size: 0.82rem; color: #ffb4a9;">
            🚨 <strong>توجه به مدل‌های متصل:</strong> این دسته‌بندی در حال حاضر به <strong>${modelCount} مدل کفش</strong> منتسب است. با حذف این دسته، مدل‌های کفش حذف فیزیکی نمی‌شوند اما انتساب این لاین از آن‌ها سلب خواهد شد.
          </div>
        `,
        confirmText: 'تأیید و حذف دسته‌بندی',
        cancelText: 'انصراف',
        onConfirm: () => {
          if (ShoesController.models) {
            ShoesController.models.forEach((m) => {
              if (m.categories && m.categories.includes(cat.name)) {
                m.categories = m.categories.filter((c) => c !== cat.name);
              }
            });
            ShoesController.saveModels(false);
            ShoesController.render();
          }

          this.categories = this.categories.filter((c) => c.id !== id);
          this.saveCategories();
          this.render();
          ShoesController.render();
          DYF_Toast.show({
            type: 'info',
            title: 'دسته‌بندی حذف شد',
            message: `دسته‌بندی «${cat.name}» حذف و پیوند آن با مدل‌ها آزاد شد.`,
          });
        },
      });
    },

    viewCategoryShoes(categoryName) {
      window.location.hash = '#shoes';
      const shoeFilterSelect = document.getElementById('shoesCategoryFilter');
      if (shoeFilterSelect) {
        shoeFilterSelect.value = categoryName;
        shoeFilterSelect.dispatchEvent(new Event('change'));
      }
    },

    updateGlobalCounters() {
      const allCount = this.categories.length;
      const activeCount = this.categories.filter((c) => c.status === 'active').length;
      const inactiveCount = this.categories.filter((c) => c.status === 'inactive').length;

      const elAll = document.getElementById('countAllCategories');
      const elAct = document.getElementById('countActiveCategories');
      const elInact = document.getElementById('countInactiveCategories');
      const badge = document.getElementById('categoriesCountSummaryBadge');

      if (elAll) elAll.textContent = allCount;
      if (elAct) elAct.textContent = activeCount;
      if (elInact) elInact.textContent = inactiveCount;
      if (badge) badge.textContent = `${activeCount} لاین فعال (${allCount} کل)`;

      // شمارنده در سایدبار
      const navCounter = document.querySelector('a[href="#categories"] .dyf-nav-counter');
      if (navCounter) navCounter.textContent = allCount;
    },

    getFilteredCategories() {
      return this.categories.filter((c) => {
        if (this.searchQuery) {
          const matchName = (c.name || '').toLowerCase().includes(this.searchQuery);
          const matchSlug = (c.slug || '').toLowerCase().includes(this.searchQuery);
          const matchDesc = (c.desc || '').toLowerCase().includes(this.searchQuery);
          if (!matchName && !matchSlug && !matchDesc) return false;
        }

        if (this.selectedStatus !== 'all') {
          if (c.status !== this.selectedStatus) return false;
        }

        return true;
      });
    },

    render() {
      const filtered = this.getFilteredCategories();
      const gridContainer = document.getElementById('categoriesGridContainer');
      const tableContainer = document.getElementById('categoriesTableContainer');
      const tableBody = document.getElementById('categoriesTableBody');
      const emptyState = document.getElementById('categoriesEmptyState');

      this.updateGlobalCounters();

      if (!filtered.length) {
        if (gridContainer) gridContainer.style.display = 'none';
        if (tableContainer) tableContainer.style.display = 'none';
        if (emptyState) emptyState.style.display = 'block';
        return;
      }

      if (emptyState) emptyState.style.display = 'none';

      if (this.viewMode === 'grid') {
        if (tableContainer) tableContainer.style.display = 'none';
        if (gridContainer) {
          gridContainer.style.display = 'grid';
          gridContainer.innerHTML = filtered.map((c) => this.renderCardHtml(c)).join('');
          this.bindCardActions(gridContainer);
        }
      } else {
        if (gridContainer) gridContainer.style.display = 'none';
        if (tableContainer && tableBody) {
          tableContainer.style.display = 'block';
          tableBody.innerHTML = filtered.map((c) => this.renderTableRowHtml(c)).join('');
          this.bindCardActions(tableBody);
        }
      }
    },

    renderCardHtml(cat) {
      const modelCount = this.getModelCountForCategory(cat.name);
      const iconSvg = this.iconsMap[cat.icon] || this.iconsMap.briefcase;
      const statusBadge =
        cat.status === 'active'
          ? `<span class="dyf-badge dyf-badge-active">فعال</span>`
          : `<span class="dyf-badge dyf-badge-archived">غیرفعال</span>`;

      return `
        <article class="dyf-category-card" data-id="${cat.id}">
          <div class="dyf-category-header">
            <div style="display: flex; align-items: center; gap: 0.85rem;">
              <div class="dyf-category-icon-box">${iconSvg}</div>
              <div>
                <h3 class="dyf-category-title">${cat.name}</h3>
                <span class="dyf-category-slug">slug: ${cat.slug}</span>
              </div>
            </div>
            <div>${statusBadge}</div>
          </div>

          <p class="dyf-category-desc">${cat.desc || '-'}</p>

          <div class="dyf-category-meta-box">
            <div class="dyf-category-models-count">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 14l3-6 4 2 5-4 4 8H4z"/></svg>
              <span><strong>${modelCount}</strong> مدل منتسب</span>
            </div>
            <button type="button" class="dyf-btn dyf-btn-specular dyf-btn-sm js-view-cat-shoes" data-name="${cat.name}">
              مشاهده مدل‌ها
            </button>
          </div>

          <div class="dyf-category-actions">
            <div style="display: flex; gap: 0.4rem;">
              <button type="button" class="dyf-btn dyf-btn-outline dyf-btn-sm js-edit-cat" data-id="${cat.id}">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/></svg>
                <span>ویرایش</span>
              </button>
              <button type="button" class="dyf-btn dyf-btn-outline dyf-btn-sm js-delete-cat" data-id="${cat.id}" style="color: var(--status-danger); border-color: rgba(224, 86, 74, 0.3);">
                <span>حذف</span>
              </button>
            </div>

            <div>
              ${
                cat.status === 'active'
                  ? `<button type="button" class="dyf-btn dyf-btn-outline dyf-btn-sm js-toggle-cat" data-id="${cat.id}" data-action="inactive" style="color: var(--text-muted);">غیرفعال‌سازی</button>`
                  : `<button type="button" class="dyf-btn dyf-btn-primary dyf-btn-sm js-toggle-cat" data-id="${cat.id}" data-action="active">فعال‌سازی</button>`
              }
            </div>
          </div>
        </article>
      `;
    },

    renderTableRowHtml(cat) {
      const modelCount = this.getModelCountForCategory(cat.name);
      const iconSvg = this.iconsMap[cat.icon] || this.iconsMap.briefcase;
      const statusBadge =
        cat.status === 'active'
          ? `<span class="dyf-badge dyf-badge-active">فعال</span>`
          : `<span class="dyf-badge dyf-badge-archived">غیرفعال</span>`;

      return `
        <tr data-id="${cat.id}">
          <td style="font-weight: 700; color: var(--text-ivory);">
            <div style="display: flex; align-items: center; gap: 0.65rem;">
              <div class="dyf-category-icon-box" style="width: 32px; height: 32px;">${iconSvg}</div>
              <span>${cat.name}</span>
            </div>
          </td>
          <td style="font-family: var(--font-title); color: var(--gold-light); direction: ltr; text-align: right;">${cat.slug}</td>
          <td style="max-width: 280px; font-size: 0.8rem; color: var(--text-muted); line-height: 1.5;">${cat.desc || '-'}</td>
          <td>
            <div style="display: flex; align-items: center; gap: 0.45rem;">
              <span class="dyf-badge dyf-badge-info">${modelCount} مدل</span>
              <button type="button" class="dyf-btn dyf-btn-specular dyf-btn-sm js-view-cat-shoes" data-name="${cat.name}">مشاهده</button>
            </div>
          </td>
          <td>${statusBadge}</td>
          <td>
            <div style="display: flex; gap: 0.35rem; align-items: center;">
              <button type="button" class="dyf-btn dyf-btn-outline dyf-btn-sm js-edit-cat" data-id="${cat.id}">ویرایش</button>
              ${
                cat.status === 'active'
                  ? `<button type="button" class="dyf-btn dyf-btn-outline dyf-btn-sm js-toggle-cat" data-id="${cat.id}" data-action="inactive">غیرفعال</button>`
                  : `<button type="button" class="dyf-btn dyf-btn-primary dyf-btn-sm js-toggle-cat" data-id="${cat.id}" data-action="active">فعال</button>`
              }
              <button type="button" class="dyf-btn dyf-btn-outline dyf-btn-sm js-delete-cat" data-id="${cat.id}" style="color: var(--status-danger);">حذف</button>
            </div>
          </td>
        </tr>
      `;
    },

    bindCardActions(container) {
      container.querySelectorAll('.js-edit-cat').forEach((btn) => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          const id = btn.getAttribute('data-id');
          this.openEditModal(id);
        });
      });

      container.querySelectorAll('.js-delete-cat').forEach((btn) => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          const id = btn.getAttribute('data-id');
          this.deleteCategory(id);
        });
      });

      container.querySelectorAll('.js-toggle-cat').forEach((btn) => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          const id = btn.getAttribute('data-id');
          const action = btn.getAttribute('data-action');
          this.changeStatus(id, action);
        });
      });

      container.querySelectorAll('.js-view-cat-shoes').forEach((btn) => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          const name = btn.getAttribute('data-name');
          this.viewCategoryShoes(name);
        });
      });
    },
  };

  window.CategoriesController = CategoriesController;

  // ==========================================================================
  // ۱۰. ماژول مدیریت مشتریان و دسترسی مستقیم (Task 4: Customers & Direct Access)
  // ==========================================================================
  const CustomersController = {
    customers: [],
    searchQuery: '',
    selectedStatus: 'all', // 'all', 'active', 'inactive'
    viewMode: 'grid', // 'grid' or 'table'
    currentViewingCustomerId: null,

    init() {
      this.loadCustomers();
      this.bindEvents();
      this.render();
      this.updateGlobalCounters();
    },

    loadCustomers() {
      try {
        const saved = localStorage.getItem('dyf_admin_customers_v1');
        if (saved) {
          this.customers = JSON.parse(saved);
        } else {
          this.customers = [...DEFAULT_CUSTOMERS];
          this.saveCustomers(false);
        }
      } catch (e) {
        this.customers = [...DEFAULT_CUSTOMERS];
      }
    },

    saveCustomers(showToast = true) {
      try {
        localStorage.setItem('dyf_admin_customers_v1', JSON.stringify(this.customers));
        this.updateGlobalCounters();
        if (showToast) {
          DYF_Toast.show({
            type: 'success',
            title: 'به‌روزرسانی مشتریان',
            message: 'اطلاعات مشتریان و تنظیمات دسترسی مستقیم با موفقیت ذخیره شد.',
          });
        }
      } catch (e) {
        console.error('Error saving customers:', e);
      }
    },

    bindEvents() {
      // جست‌وجوی زنده مشتریان
      const searchInput = document.getElementById('customerSearchInput');
      if (searchInput) {
        searchInput.addEventListener('input', (e) => {
          this.searchQuery = e.target.value.trim().toLowerCase();
          this.render();
        });
      }

      // فیلتر وضعیت
      document.querySelectorAll('[data-cust-status]').forEach((tab) => {
        tab.addEventListener('click', () => {
          document.querySelectorAll('[data-cust-status]').forEach((t) => t.classList.remove('is-active'));
          tab.classList.add('is-active');
          this.selectedStatus = tab.getAttribute('data-cust-status') || 'all';
          this.render();
        });
      });

      // سوئیچ گرید / جدول
      const gridBtn = document.getElementById('customersViewGridBtn');
      const tableBtn = document.getElementById('customersViewTableBtn');
      if (gridBtn && tableBtn) {
        gridBtn.addEventListener('click', () => {
          this.viewMode = 'grid';
          gridBtn.classList.add('is-active');
          tableBtn.classList.remove('is-active');
          this.render();
        });
        tableBtn.addEventListener('click', () => {
          this.viewMode = 'table';
          tableBtn.classList.add('is-active');
          gridBtn.classList.remove('is-active');
          this.render();
        });
      }

      // دکمه بازنشانی فیلترها
      const resetBtn = document.getElementById('resetCustomerFiltersBtn');
      if (resetBtn) {
        resetBtn.addEventListener('click', () => {
          this.searchQuery = '';
          this.selectedStatus = 'all';
          if (searchInput) searchInput.value = '';
          document.querySelectorAll('[data-cust-status]').forEach((t) => {
            t.classList.toggle('is-active', t.getAttribute('data-cust-status') === 'all');
          });
          this.render();
        });
      }

      // باز کردن مودال ثبت مشتری
      const openAddBtn = document.getElementById('openAddCustomerModalBtn');
      if (openAddBtn) {
        openAddBtn.addEventListener('click', () => this.openCreateModal());
      }

      // ذخیره فرم مشتری
      const saveBtn = document.getElementById('saveCustomerBtn');
      if (saveBtn) {
        saveBtn.addEventListener('click', () => this.handleSaveForm());
      }

      // سوئیچ فعال/غیرفعال‌سازی دسترسی مستقیم درون مودال جزئیات
      const directToggle = document.getElementById('directAccessToggle');
      if (directToggle) {
        directToggle.addEventListener('change', (e) => {
          const isEnabled = e.target.checked;
          const label = document.getElementById('directAccessStatusLabel');
          const controls = document.getElementById('directAccessControlsWrap');
          if (label) {
            label.textContent = isEnabled ? 'دسترسی فعال' : 'دسترسی غیرفعال';
            label.style.color = isEnabled ? 'var(--gold-primary)' : 'var(--text-muted)';
          }
          if (controls) {
            controls.style.opacity = isEnabled ? '1' : '0.45';
            controls.style.pointerEvents = isEnabled ? 'all' : 'none';
          }
        });
      }

      // ذخیره تنظیمات دسترسی مستقیم
      const saveDirectBtn = document.getElementById('saveDirectAccessBtn');
      if (saveDirectBtn) {
        saveDirectBtn.addEventListener('click', () => this.handleSaveDirectAccess());
      }
    },

    openCreateModal() {
      const modeInput = document.getElementById('customerFormMode');
      const idInput = document.getElementById('customerFormId');
      const nameFa = document.getElementById('customerFormNameFa');
      const nameEn = document.getElementById('customerFormNameEn');
      const shop = document.getElementById('customerFormShop');
      const phone = document.getElementById('customerFormPhone');
      const modalTitle = document.getElementById('customerFormModalTitle');

      if (modeInput) modeInput.value = 'create';
      if (modalTitle) modalTitle.textContent = 'ثبت مشتری و همکار جدید';

      const maxId = this.customers.reduce((max, c) => Math.max(max, c.id || 0), 100);
      const nextId = maxId + 1;
      if (idInput) idInput.value = `CUST-${nextId}`;

      if (nameFa) nameFa.value = '';
      if (nameEn) nameEn.value = '';
      if (shop) shop.value = '';
      if (phone) phone.value = '';

      const activeRadio = document.querySelector('input[name="customerStatus"][value="active"]');
      if (activeRadio) activeRadio.checked = true;

      DYF_Modal.open('modalCustomerForm');
      if (nameFa) setTimeout(() => nameFa.focus(), 200);
    },

    openEditModal(id) {
      const cust = this.customers.find((c) => c.id === id);
      if (!cust) return;

      const modeInput = document.getElementById('customerFormMode');
      const idInput = document.getElementById('customerFormId');
      const nameFa = document.getElementById('customerFormNameFa');
      const nameEn = document.getElementById('customerFormNameEn');
      const shop = document.getElementById('customerFormShop');
      const phone = document.getElementById('customerFormPhone');
      const modalTitle = document.getElementById('customerFormModalTitle');

      if (modeInput) modeInput.value = 'edit';
      if (modalTitle) modalTitle.textContent = `ویرایش مشخصات مشتری (${cust.code})`;
      if (idInput) idInput.value = cust.code || `CUST-${cust.id}`;

      if (nameFa) nameFa.value = cust.nameFa || '';
      if (nameEn) nameEn.value = cust.nameEn || '';
      if (shop) shop.value = cust.shop || '';
      if (phone) phone.value = cust.phone || '';

      const statusRadio = document.querySelector(`input[name="customerStatus"][value="${cust.status}"]`);
      if (statusRadio) statusRadio.checked = true;

      DYF_Modal.open('modalCustomerForm');
      if (nameFa) setTimeout(() => nameFa.focus(), 200);
    },

    handleSaveForm() {
      const mode = document.getElementById('customerFormMode')?.value || 'create';
      const code = document.getElementById('customerFormId')?.value;
      const nameFa = document.getElementById('customerFormNameFa')?.value.trim();
      const nameEn = document.getElementById('customerFormNameEn')?.value.trim();
      const shop = document.getElementById('customerFormShop')?.value.trim();
      const phone = document.getElementById('customerFormPhone')?.value.trim();
      const status = document.querySelector('input[name="customerStatus"]:checked')?.value || 'active';

      if (!nameFa) {
        DYF_Toast.show({ type: 'error', title: 'نام مشتری الزامی است', message: 'لطفاً نام و نام خانوادگی فارسی مشتری را وارد کنید.' });
        document.getElementById('customerFormNameFa')?.focus();
        return;
      }

      if (!nameEn) {
        DYF_Toast.show({ type: 'error', title: 'نام انگلیسی الزامی است', message: 'لطفاً نام و نام خانوادگی انگلیسی مشتری را وارد کنید.' });
        document.getElementById('customerFormNameEn')?.focus();
        return;
      }

      if (!phone || !phone.match(/^09\d{9}$/)) {
        DYF_Toast.show({ type: 'error', title: 'شماره تلفن نامعتبر', message: 'شماره تلفن همراه باید با ۰۹ شروع شده و ۱۱ رقم باشد.' });
        document.getElementById('customerFormPhone')?.focus();
        return;
      }

      if (mode === 'create') {
        const id = parseInt(code.replace(/\D/g, ''), 10) || (Date.now() % 10000);
        const existsPhone = this.customers.some((c) => c.phone === phone);
        if (existsPhone) {
          DYF_Toast.show({ type: 'error', title: 'شماره تکراری', message: 'مشتری دیگری با این شماره تلفن قبلاً در سامانه ثبت شده است.' });
          return;
        }

        const newCust = {
          id,
          code,
          nameFa,
          nameEn,
          shop: shop || 'فروشگاه آزاد',
          phone,
          status,
          directAccess: {
            enabled: false,
            categories: ['لاین رسمی و اداری'],
            addModels: [],
            excludeModels: [],
            duration: '30m',
            deadline: 'none',
            lastLogin: '-',
          },
        };

        this.customers.push(newCust);
        this.saveCustomers();
        DYF_Toast.show({
          type: 'success',
          title: 'مشتری ثبت شد',
          message: `پروفایل «${nameFa}» با شناسه ${code} با موفقیت ایجاد گردید.`,
        });
      } else {
        const id = parseInt(code.replace(/\D/g, ''), 10);
        const cust = this.customers.find((c) => c.id === id || c.code === code);
        if (cust) {
          cust.nameFa = nameFa;
          cust.nameEn = nameEn;
          cust.shop = shop;
          cust.phone = phone;
          cust.status = status;
          this.saveCustomers();
          DYF_Toast.show({
            type: 'success',
            title: 'ویرایش موفق',
            message: `مشخصات مشتری «${nameFa}» به‌روزرسانی شد.`,
          });
        }
      }

      DYF_Modal.close('modalCustomerForm');
      this.render();
    },

    openDirectAccessModal(id) {
      const cust = this.customers.find((c) => c.id === id);
      if (!cust) return;

      this.currentViewingCustomerId = id;

      const initials = cust.nameFa.split(' ').map((p) => p[0]).slice(0, 2).join('‌') || 'م';
      const avatarEl = document.getElementById('custDetailsAvatar');
      const nameFaEl = document.getElementById('custDetailsNameFa');
      const nameEnEl = document.getElementById('custDetailsNameEn');
      const shopEl = document.getElementById('custDetailsShop');
      const idEl = document.getElementById('custDetailsId');
      const phoneEl = document.getElementById('custDetailsPhone');
      const badgeEl = document.getElementById('custDetailsAccountBadge');

      if (avatarEl) avatarEl.textContent = initials || 'م';
      if (nameFaEl) nameFaEl.textContent = cust.nameFa;
      if (nameEnEl) nameEnEl.textContent = cust.nameEn;
      if (shopEl) shopEl.textContent = cust.shop || '-';
      if (idEl) idEl.textContent = cust.code;
      if (phoneEl) phoneEl.textContent = cust.phone;
      if (badgeEl) {
        badgeEl.innerHTML =
          cust.status === 'active'
            ? `<span class="dyf-badge dyf-badge-active">حساب فعال</span>`
            : `<span class="dyf-badge dyf-badge-disabled">حساب مسدود</span>`;
      }

      const da = cust.directAccess || {
        enabled: false,
        categories: [],
        addModels: [],
        excludeModels: [],
        duration: 'unlimited',
        deadline: 'none',
      };

      const toggle = document.getElementById('directAccessToggle');
      const label = document.getElementById('directAccessStatusLabel');
      const controls = document.getElementById('directAccessControlsWrap');
      const durSelect = document.getElementById('directAccessDurationSelect');
      const ddlSelect = document.getElementById('directAccessDeadlineSelect');

      if (toggle) toggle.checked = da.enabled;
      if (label) {
        label.textContent = da.enabled ? 'دسترسی فعال' : 'دسترسی غیرفعال';
        label.style.color = da.enabled ? 'var(--gold-primary)' : 'var(--text-muted)';
      }
      if (controls) {
        controls.style.opacity = da.enabled ? '1' : '0.45';
        controls.style.pointerEvents = da.enabled ? 'all' : 'none';
      }
      if (durSelect) durSelect.value = da.duration || 'unlimited';
      if (ddlSelect) ddlSelect.value = da.deadline || 'none';

      // ۱. رندر دسته‌بندی‌های مجاز
      const catWrap = document.getElementById('directAccessCategoriesWrap');
      if (catWrap) {
        const allCats = CategoriesController.categories || DEFAULT_CATEGORIES;
        catWrap.innerHTML = allCats
          .map((cat) => {
            const isChecked = (da.categories || []).includes(cat.name);
            return `
              <label class="dyf-chip-checkbox">
                <input type="checkbox" name="daCategory" value="${cat.name}" ${isChecked ? 'checked' : ''}>
                <span class="dyf-chip-pill">${cat.name}</span>
              </label>
            `;
          })
          .join('');
      }

      // ۲. رندر افزودن مدل‌های خاص
      const addWrap = document.getElementById('directAccessAddModelsWrap');
      if (addWrap) {
        const allShoes = ShoesController.models || DEFAULT_SHOES;
        addWrap.innerHTML = allShoes
          .filter((s) => s.status === 'published')
          .map((shoe) => {
            const isChecked = (da.addModels || []).includes(shoe.id);
            return `
              <label class="dyf-chip-checkbox">
                <input type="checkbox" name="daAddModel" value="${shoe.id}" ${isChecked ? 'checked' : ''}>
                <span class="dyf-chip-pill">+ DYF-${shoe.id}: ${shoe.title.substring(0, 28)}...</span>
              </label>
            `;
          })
          .join('');
      }

      // ۳. رندر مستثناکردن مدل‌های خاص
      const excWrap = document.getElementById('directAccessExcludeModelsWrap');
      if (excWrap) {
        const allShoes = ShoesController.models || DEFAULT_SHOES;
        excWrap.innerHTML = allShoes
          .filter((s) => s.status === 'published')
          .map((shoe) => {
            const isChecked = (da.excludeModels || []).includes(shoe.id);
            return `
              <label class="dyf-chip-checkbox">
                <input type="checkbox" name="daExcludeModel" value="${shoe.id}" ${isChecked ? 'checked' : ''}>
                <span class="dyf-chip-pill" style="border-color: rgba(224, 86, 74, 0.35);">🚫 DYF-${shoe.id}: ${shoe.title.substring(0, 26)}...</span>
              </label>
            `;
          })
          .join('');
      }

      DYF_Modal.open('modalCustomerDetails');
    },

    handleSaveDirectAccess() {
      const id = this.currentViewingCustomerId;
      const cust = this.customers.find((c) => c.id === id);
      if (!cust) return;

      const enabled = document.getElementById('directAccessToggle')?.checked || false;
      const duration = document.getElementById('directAccessDurationSelect')?.value || 'unlimited';
      const deadline = document.getElementById('directAccessDeadlineSelect')?.value || 'none';

      const selectedCats = [];
      document.querySelectorAll('input[name="daCategory"]:checked').forEach((chk) => selectedCats.push(chk.value));

      const addModels = [];
      document.querySelectorAll('input[name="daAddModel"]:checked').forEach((chk) => addModels.push(parseInt(chk.value, 10)));

      const excludeModels = [];
      document.querySelectorAll('input[name="daExcludeModel"]:checked').forEach((chk) => excludeModels.push(parseInt(chk.value, 10)));

      cust.directAccess = {
        enabled,
        categories: selectedCats,
        addModels,
        excludeModels,
        duration,
        deadline,
        lastLogin: cust.directAccess?.lastLogin || '-',
      };

      this.saveCustomers();
      this.render();
      DYF_Modal.close('modalCustomerDetails');

      DYF_Toast.show({
        type: 'success',
        title: 'تنظیمات دسترسی مستقیم ذخیره شد',
        message: `قواعد کاتالوگ مستقیم برای «${cust.nameFa}» با موفقیت اعمال شد.`,
      });
    },

    changeStatus(id, newStatus) {
      const cust = this.customers.find((c) => c.id === id);
      if (!cust) return;

      if (newStatus === 'inactive') {
        DYF_Modal.confirm({
          title: 'غیرفعال‌سازی حساب مشتری',
          message: `
            آیا از غیرفعال‌سازی حساب <strong>«${cust.nameFa}»</strong> اطمینان دارید؟<br><br>
            <div style="background: rgba(36, 30, 25, 0.6); padding: 0.85rem; border-radius: var(--r-sm); font-size: 0.82rem; color: var(--leather-caramel);">
              ⚠️ <strong>پیامد عملیات:</strong> ورود مستقیم پیامکی و دسترسی این مشتری به کاتالوگ مسدود می‌شود؛ اما سوابق سفارشات و اطلاعات حساب حفظ خواهد شد.
            </div>
          `,
          confirmText: 'غیرفعال‌سازی مشتری',
          cancelText: 'انصراف',
          onConfirm: () => {
            cust.status = 'inactive';
            this.saveCustomers();
            this.render();
            DYF_Toast.show({
              type: 'info',
              title: 'حساب مسدود شد',
              message: `حساب کاربری «${cust.nameFa}» غیرفعال گردید.`,
            });
          },
        });
      } else {
        cust.status = 'active';
        this.saveCustomers();
        this.render();
        DYF_Toast.show({
          type: 'success',
          title: 'حساب فعال شد',
          message: `حساب کاربری «${cust.nameFa}» مجدداً فعال گردید.`,
        });
      }
    },

    updateGlobalCounters() {
      const allCount = this.customers.length;
      const activeCount = this.customers.filter((c) => c.status === 'active').length;
      const inactiveCount = this.customers.filter((c) => c.status === 'inactive').length;

      const elAll = document.getElementById('countAllCustomers');
      const elAct = document.getElementById('countActiveCustomers');
      const elInact = document.getElementById('countInactiveCustomers');
      const badge = document.getElementById('customersCountSummaryBadge');

      if (elAll) elAll.textContent = allCount;
      if (elAct) elAct.textContent = activeCount;
      if (elInact) elInact.textContent = inactiveCount;
      if (badge) badge.textContent = `${activeCount} مشتری فعال (${allCount} کل)`;

      // سایدبار
      const navCounter = document.querySelector('a[href="#customers"] .dyf-nav-counter');
      if (navCounter) navCounter.textContent = allCount;

      // داشبورد
      const dashStat = document.querySelectorAll('.dyf-stat-card .dyf-stat-value')[1];
      if (dashStat) dashStat.innerHTML = `${activeCount} <span style="font-size: 0.95rem; font-weight: 500; color: var(--text-muted);">مشتری</span>`;
    },

    getFilteredCustomers() {
      return this.customers.filter((c) => {
        if (this.searchQuery) {
          const matchFa = (c.nameFa || '').toLowerCase().includes(this.searchQuery);
          const matchEn = (c.nameEn || '').toLowerCase().includes(this.searchQuery);
          const matchShop = (c.shop || '').toLowerCase().includes(this.searchQuery);
          const matchPhone = (c.phone || '').includes(this.searchQuery);
          const matchCode = (c.code || '').toLowerCase().includes(this.searchQuery);
          if (!matchFa && !matchEn && !matchShop && !matchPhone && !matchCode) return false;
        }

        if (this.selectedStatus !== 'all') {
          if (c.status !== this.selectedStatus) return false;
        }

        return true;
      });
    },

    render() {
      const filtered = this.getFilteredCustomers();
      const gridContainer = document.getElementById('customersGridContainer');
      const tableContainer = document.getElementById('customersTableContainer');
      const tableBody = document.getElementById('customersTableBody');
      const emptyState = document.getElementById('customersEmptyState');

      this.updateGlobalCounters();

      if (!filtered.length) {
        if (gridContainer) gridContainer.style.display = 'none';
        if (tableContainer) tableContainer.style.display = 'none';
        if (emptyState) emptyState.style.display = 'block';
        return;
      }

      if (emptyState) emptyState.style.display = 'none';

      if (this.viewMode === 'grid') {
        if (tableContainer) tableContainer.style.display = 'none';
        if (gridContainer) {
          gridContainer.style.display = 'grid';
          gridContainer.innerHTML = filtered.map((c) => this.renderCardHtml(c)).join('');
          this.bindCardActions(gridContainer);
        }
      } else {
        if (gridContainer) gridContainer.style.display = 'none';
        if (tableContainer && tableBody) {
          tableContainer.style.display = 'block';
          tableBody.innerHTML = filtered.map((c) => this.renderTableRowHtml(c)).join('');
          this.bindCardActions(tableBody);
        }
      }
    },

    renderCardHtml(cust) {
      const initials = cust.nameFa.split(' ').map((p) => p[0]).slice(0, 2).join('‌') || 'م';
      const isDirectActive = cust.directAccess?.enabled;

      return `
        <article class="dyf-customer-card" data-id="${cust.id}">
          <div class="dyf-customer-header">
            <div style="display: flex; align-items: center; gap: 0.85rem;">
              <div class="dyf-customer-avatar">${initials}</div>
              <div>
                <h3 class="dyf-customer-title">${cust.nameFa}</h3>
                <span class="dyf-customer-en">${cust.nameEn}</span>
              </div>
            </div>
            <div>
              <span class="dyf-badge ${cust.status === 'active' ? 'dyf-badge-active' : 'dyf-badge-disabled'}">
                ${cust.status === 'active' ? 'فعال' : 'مسدود'}
              </span>
            </div>
          </div>

          <div class="dyf-customer-shop">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
            <span>${cust.shop || 'فروشگاه آزاد'}</span>
          </div>

          <div class="dyf-customer-info-box">
            <div class="dyf-customer-info-row">
              <span style="color: var(--text-dim);">شناسه سیستمی:</span>
              <span style="font-family: var(--font-title); font-weight: 700; color: var(--gold-light); direction: ltr;">${cust.code}</span>
            </div>
            <div class="dyf-customer-info-row">
              <span style="color: var(--text-dim);">شماره تلفن ورود:</span>
              <span style="font-family: var(--font-title); font-weight: 600; color: var(--text-main); direction: ltr;">${cust.phone}</span>
            </div>
            <div class="dyf-customer-info-row" style="padding-top: 0.35rem; border-top: 1px solid var(--border-subtle);">
              <span style="color: var(--text-dim);">دسترسی مستقیم کاتالوگ:</span>
              <span class="dyf-badge ${isDirectActive ? 'dyf-badge-published' : 'dyf-badge-archived'}" style="font-size: 0.68rem;">
                ${isDirectActive ? 'فعال (OTP مستقیم)' : 'غیرفعال'}
              </span>
            </div>
          </div>

          <div class="dyf-customer-actions">
            <div style="display: flex; gap: 0.4rem;">
              <button type="button" class="dyf-btn dyf-btn-primary dyf-btn-sm js-access-cust" data-id="${cust.id}">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
                <span>دسترسی مستقیم</span>
              </button>
              <button type="button" class="dyf-btn dyf-btn-outline dyf-btn-sm js-edit-cust" data-id="${cust.id}">
                <span>ویرایش</span>
              </button>
            </div>

            <div>
              ${
                cust.status === 'active'
                  ? `<button type="button" class="dyf-btn dyf-btn-outline dyf-btn-sm js-toggle-cust" data-id="${cust.id}" data-action="inactive" style="color: var(--status-danger); border-color: rgba(224, 86, 74, 0.35);">مسدود</button>`
                  : `<button type="button" class="dyf-btn dyf-btn-outline dyf-btn-sm js-toggle-cust" data-id="${cust.id}" data-action="active" style="color: #4cd964; border-color: rgba(76, 217, 100, 0.35);">فعال</button>`
              }
            </div>
          </div>
        </article>
      `;
    },

    renderTableRowHtml(cust) {
      const isDirectActive = cust.directAccess?.enabled;

      return `
        <tr data-id="${cust.id}">
          <td style="font-family: var(--font-title); font-weight: 700; color: var(--gold-light); direction: ltr; text-align: right;">${cust.code}</td>
          <td>
            <div style="font-weight: 700; color: var(--text-ivory);">${cust.nameFa}</div>
            <div style="font-size: 0.72rem; color: var(--text-dim); font-family: var(--font-title);">${cust.nameEn}</div>
          </td>
          <td style="font-size: 0.82rem; color: var(--text-muted);">${cust.shop || '-'}</td>
          <td style="font-family: var(--font-title); direction: ltr; text-align: right; color: var(--text-main);">${cust.phone}</td>
          <td>
            <span class="dyf-badge ${cust.status === 'active' ? 'dyf-badge-active' : 'dyf-badge-disabled'}">
              ${cust.status === 'active' ? 'فعال' : 'مسدود'}
            </span>
          </td>
          <td>
            <span class="dyf-badge ${isDirectActive ? 'dyf-badge-published' : 'dyf-badge-archived'}">
              ${isDirectActive ? 'مستقیم فعال' : 'غیرفعال'}
            </span>
          </td>
          <td>
            <div style="display: flex; gap: 0.35rem; align-items: center;">
              <button type="button" class="dyf-btn dyf-btn-primary dyf-btn-sm js-access-cust" data-id="${cust.id}">دسترسی</button>
              <button type="button" class="dyf-btn dyf-btn-outline dyf-btn-sm js-edit-cust" data-id="${cust.id}">ویرایش</button>
              ${
                cust.status === 'active'
                  ? `<button type="button" class="dyf-btn dyf-btn-outline dyf-btn-sm js-toggle-cust" data-id="${cust.id}" data-action="inactive" style="color: var(--status-danger);">مسدود</button>`
                  : `<button type="button" class="dyf-btn dyf-btn-outline dyf-btn-sm js-toggle-cust" data-id="${cust.id}" data-action="active" style="color: #4cd964;">فعال</button>`
              }
            </div>
          </td>
        </tr>
      `;
    },

    bindCardActions(container) {
      container.querySelectorAll('.js-edit-cust').forEach((btn) => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          const id = parseInt(btn.getAttribute('data-id'), 10);
          this.openEditModal(id);
        });
      });

      container.querySelectorAll('.js-access-cust').forEach((btn) => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          const id = parseInt(btn.getAttribute('data-id'), 10);
          this.openDirectAccessModal(id);
        });
      });

      container.querySelectorAll('.js-toggle-cust').forEach((btn) => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          const id = parseInt(btn.getAttribute('data-id'), 10);
          const action = btn.getAttribute('data-action');
          this.changeStatus(id, action);
        });
      });
    },
  };

  window.CustomersController = CustomersController;

  // ==========================================================================
  // ۹. کنترلر نمایش و تست آزمایشگاهی کامپوننت‌ها (Component Kitchen-Sink)
  // ==========================================================================
  const ComponentDemoController = {
    init() {
      // تست توست‌ها
      document.getElementById('demoToastSuccess')?.addEventListener('click', () => {
        DYF_Toast.show({
          type: 'success',
          title: 'عملیات موفق',
          message: 'مدل کفش «دیفندر هورس واکس» با موفقیت در کاتالوگ منتشر شد.',
        });
      });

      document.getElementById('demoToastError')?.addEventListener('click', () => {
        DYF_Toast.show({
          type: 'error',
          title: 'خطای اعتبارسنجی',
          message: 'حداقل یک تصویر اصلی برای انتشار مدل کفش الزامی است.',
        });
      });

      document.getElementById('demoToastWarning')?.addEventListener('click', () => {
        DYF_Toast.show({
          type: 'warning',
          title: 'هشدار مهلت دسترسی',
          message: 'مهلت مشاهده کاتالوگ برای مشتری «آرتین قوامی» کمتر از ۱ ساعت دیگر به پایان می‌رسد.',
        });
      });

      document.getElementById('demoToastInfo')?.addEventListener('click', () => {
        DYF_Toast.show({
          type: 'info',
          title: 'به‌روزرسانی کاتالوگ',
          message: '۳ مدل جدید به لاین اسپرت و کژوال افزوده شد.',
        });
      });

      // تست مودال تأیید حذف
      document.getElementById('demoConfirmModal')?.addEventListener('click', () => {
        DYF_Modal.confirm({
          title: 'تأیید بایگانی مدل کفش',
          message: 'آیا از انتقال مدل <strong>«کفش رسمی آکسفورد تمام‌چرم»</strong> به بخش بایگانی اطمینان دارید؟<br><small style="color: var(--text-dim);">این مدل از دید تمام لینک‌ها و کاتالوگ‌های اختصاصی مشتریان حذف خواهد شد.</small>',
          confirmText: 'بایگانی مدل',
          cancelText: 'انصراف',
          onConfirm: () => {
            DYF_Toast.show({
              type: 'info',
              title: 'مدل بایگانی شد',
              message: 'مدل انتخابی به آرشیو منتقل شد و در کاتالوگ فعال نمایش داده نمی‌شود.',
            });
          },
        });
      });

      // تست شبیه‌سازی لودینگ دکمه
      document.getElementById('demoBtnLoading')?.addEventListener('click', function () {
        const btn = this;
        btn.classList.add('is-loading');
        setTimeout(() => {
          btn.classList.remove('is-loading');
          DYF_Toast.show({ type: 'success', title: 'تکمیل عملیات', message: 'عملیات با موفقیت پایان یافت.' });
        }, 1800);
      });

      // تست تعویض حالت جدول (عادی / خالی / لودینگ اسکلتون)
      document.getElementById('demoTableToggleEmpty')?.addEventListener('click', () => {
        const tbody = document.getElementById('recentLinksTableBody');
        const empty = document.getElementById('tableEmptyState');
        if (tbody.children.length > 0) {
          tbody.innerHTML = '';
          empty.style.display = 'block';
        } else {
          DashboardController.renderTable(DYF_DATA.recentAccessLinks);
        }
      });
    },
  };

  // ==========================================================================
  // ۱۰. اجرای اولیه پس از آماده شدن DOM
  // ==========================================================================
  document.addEventListener('DOMContentLoaded', () => {
    AuthController.init();
    SidebarController.init();
    DashboardController.init();
    ShoesController.init();
    CategoriesController.init();
    CustomersController.init();
    ComponentDemoController.init();
  });
})();
