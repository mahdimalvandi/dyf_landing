/**
 * ==========================================================================
 * DYF Private Catalog — Admin Panel Logic (Design System v4)
 * Task 1: UI Foundation, Authentication & Panel Shell
 * ==========================================================================
 */

(function () {
  'use strict';

  // تابع تبدیل ارقام فارسی و عربی به انگلیسی
  function toEnglishDigits(str) {
    if (!str && str !== 0) return '';
    return String(str)
      .replace(/[۰-۹]/g, (d) => '۰۱۲۳۴۵۶۷۸۹'.indexOf(d))
      .replace(/[٠-٩]/g, (d) => '٠١٢٣٤٥٦٧٨٩'.indexOf(d));
  }

  // تابع تبدیل اعداد انگلیسی به فارسی برای نمایش در رابط کاربری
  function toPersianDigits(str) {
    if (!str && str !== 0) return '';
    const farsiDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
    return String(str).replace(/[0-9]/g, (d) => farsiDigits[parseInt(d, 10)]);
  }

  // لایت‌باکس بزرگنمایی تصویر کفش
  window.openShoeLightbox = function (url, title) {
    const lbImg = document.getElementById('lightboxImg');
    const lbCaption = document.getElementById('lightboxCaption');
    if (lbImg) lbImg.src = url;
    if (lbCaption) lbCaption.textContent = title || '';
    if (window.DYF_Modal) window.DYF_Modal.open('modalShoeLightbox');
  };

  // ==========================================================================
  // ۱. داده‌های اولیه و شبیه‌سازی‌شده (Mock Data Store)
  // ==========================================================================
  const DEFAULT_SHOES = [
    {
      id: 101,
      title: 'کفش رسمی آکسفورد تمام‌چرم دست‌دوز تبریز',
      categories: ['کفش رسمی و اداری', 'چرم لوکس دست‌دوز'],
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
      categories: ['کفش اسپرت و کژوال'],
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
      categories: ['کفش رسمی و اداری', 'چرم لوکس دست‌دوز'],
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
      categories: ['کفش رسمی و اداری'],
      colors: ['قهوه‌ای هاوانا', 'مشکی'],
      sizes: ['۴۱', '۴۲', '۴۳', '۴۴', '۴۵'],
      status: 'published',
      description: 'نمونه در حال بررسی آزمایشگاهی کارگاه؛ بهینه‌سازی فرم سرپنجه برای پای پهن بازار داخلی با آستر آنتی‌باکتریال.',
      media: [
        { url: 'assets/images/shoes.jpeg', type: 'image', isPrimary: true }
      ]
    },
    {
      id: 105,
      title: 'لوفر سراجی چرم کروکو هورس',
      categories: ['چرم لوکس دست‌دوز'],
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
      categories: ['کفش اسپرت و کژوال'],
      colors: ['سفید-طوسی', 'مشکی'],
      sizes: ['۴۰', '۴۱', '۴۲', '۴۳', '۴۴'],
      status: 'published',
      description: 'مدل ویژه فصل؛ تولید با زیره بسیار سبک و کفی طبی ارگونومیک.',
      media: [
        { url: 'assets/images/craft-sport.jpg', type: 'image', isPrimary: true }
      ]
    },
    {
      id: 107,
      title: 'کفش رسمی مونک‌استراپ دو سگک برنجی',
      categories: ['کفش رسمی و اداری', 'چرم لوکس دست‌دوز'],
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
      categories: ['کفش اسپرت و کژوال'],
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
      categories: ['چرم لوکس دست‌دوز'],
      colors: ['عسلی کاراملی'],
      sizes: ['۴۰', '۴۱', '۴۲', '۴۳'],
      status: 'published',
      description: 'طرح مفهومی فصل جدید با چرم طبیعی درجه یک و قالب راحت.',
      media: [
        { url: 'assets/images/bag2.jpeg', type: 'image', isPrimary: true }
      ]
    },
    {
      id: 110,
      title: 'کفش فرمال بروگ سرپنجه گلدار تبریز',
      categories: ['کفش رسمی و اداری'],
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
      categories: ['کفش اسپرت و کژوال'],
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
      categories: ['کفش رسمی و اداری', 'چرم لوکس دست‌دوز'],
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
      categories: ['کفش رسمی و اداری'],
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
      categories: ['کفش اسپرت و کژوال'],
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
      categories: ['کفش رسمی و اداری'],
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
      categories: ['کفش رسمی و اداری'],
      colors: ['مشکی واکس‌خورده'],
      sizes: ['۴۱', '۴۲', '۴۳', '۴۴'],
      status: 'published',
      description: 'زیپ YKK استیل ضدزنگ، قالب کشیده اروپایی، چرم دست‌چین درجه یک.',
      media: [
        { url: 'assets/images/craft-formal.jpeg', type: 'image', isPrimary: true }
      ]
    },
    {
      id: 117,
      title: 'اسنیکر کفی فوم سرد دست‌دوز',
      categories: ['کفش اسپرت و کژوال'],
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
      categories: ['کفش رسمی و اداری', 'چرم لوکس دست‌دوز'],
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
      name: 'کفش رسمی و اداری',
      status: 'active',
    },
    {
      id: 'cat-sport',
      name: 'کفش اسپرت و کژوال',
      status: 'active',
    },
    {
      id: 'cat-handmade',
      name: 'چرم لوکس دست‌دوز',
      status: 'active',
    },
    {
      id: 'cat-boots',
      name: 'نیم‌بوت و پوتین کلاسیک',
      status: 'active',
    },
    {
      id: 'cat-leather-goods',
      name: 'اکسسوری و کیف سراجی',
      status: 'active',
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
        categories: ['کفش رسمی و اداری', 'چرم لوکس دست‌دوز'],
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
        categories: ['کفش رسمی و اداری', 'کفش اسپرت و کژوال', 'چرم لوکس دست‌دوز'],
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
        categories: ['کفش اسپرت و کژوال'],
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
        categories: ['چرم لوکس دست‌دوز', 'نیم‌بوت و پوتین کلاسیک'],
        addModels: [101],
        excludeModels: [],
        duration: '1h',
        deadline: '7d',
        lastLogin: 'هفته گذشته',
      },
    },
  ];

  const DEFAULT_ACCESS_LINKS = [
    {
      id: 'LNK-9081',
      token: 'c8f2a91e',
      recipientFa: 'حاج مصطفی کمالی',
      recipientEn: '',
      customer: '',
      customerId: null,
      phone: '',
      authType: 'direct',
      categories: ['کفش رسمی و اداری', 'چرم لوکس دست‌دوز'],
      addModels: [101, 103],
      excludeModels: [104],
      startDeadline: '3d',
      viewingDuration: '15m',
      createdAt: '۱۴۰۵/۰۷/۲۸',
      status: 'active',
      reason: null,
      views: 3,
      url: 'catalog.html?token=c8f2a91e',
    },
    {
      id: 'LNK-9082',
      token: '9b44fa71',
      recipientFa: 'مهندس امید شمس',
      recipientEn: '',
      customer: '',
      customerId: null,
      phone: '',
      authType: 'direct',
      categories: ['کفش رسمی و اداری', 'کفش اسپرت و کژوال', 'چرم لوکس دست‌دوز'],
      addModels: [101, 102, 103],
      excludeModels: [],
      startDeadline: '7d',
      viewingDuration: 'unlimited',
      createdAt: '۱۴۰۵/۰۷/۲۵',
      status: 'active',
      reason: null,
      views: 8,
      url: 'catalog.html?token=9b44fa71',
    },
    {
      id: 'LNK-9083',
      token: 'e110b5c4',
      recipientFa: 'سپهر نوری‌زاده',
      recipientEn: '',
      customer: '',
      customerId: null,
      phone: '',
      authType: 'direct',
      categories: ['کفش اسپرت و کژوال'],
      addModels: [102],
      excludeModels: [],
      startDeadline: '24h',
      viewingDuration: '15m',
      createdAt: '۱۴۰۵/۰۷/۲۷',
      status: 'pending',
      reason: 'در انتظار اولین ورود خریدار',
      views: 0,
      url: 'catalog.html?token=e110b5c4',
    },
    {
      id: 'LNK-9084',
      token: '77fa33d2',
      recipientFa: 'آرتین قوامی',
      recipientEn: '',
      customer: '',
      customerId: null,
      phone: '',
      authType: 'direct',
      categories: ['کفش رسمی و اداری'],
      addModels: [101],
      excludeModels: [],
      startDeadline: '24h',
      viewingDuration: '10m',
      createdAt: '۱۴۰۵/۰۷/۲۲',
      status: 'expired',
      reason: 'پایان مهلت شروع دسترسی (عدم مراجعه در مهلت ۲۴ ساعته)',
      views: 0,
      url: 'catalog.html?token=77fa33d2',
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
        categories: ['کفش رسمی و اداری', 'چرم دست‌دوز'],
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
        categories: ['کفش اسپرت و کژوال'],
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
        categories: ['کفش رسمی و اداری'],
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

    show({ type = 'info', title = '', message = '', duration = 3000, force = false }) {
      // فقط برای عملیات کپی لینک یا مواردی که صریحاً مجاز شده‌اند اعلان نمایش داده شود
      const isCopyToast = (title && title.includes('کپی')) || (message && message.includes('کپی'));
      if (!force && !isCopyToast) {
        return;
      }

      this.init();

      const icons = {
        success: `<svg class="dyf-toast-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><path d="m9 11 3 3L22 4"/></svg>`,
        error: `<svg class="dyf-toast-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="m15 9-6 6"/><path d="m9 9 6 6"/></svg>`,
        warning: `<svg class="dyf-toast-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>`,
        info: `<svg class="dyf-toast-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>`,
      };

      const effectiveDuration = duration || 3000;
      const toast = document.createElement('div');
      toast.className = `dyf-toast dyf-toast-${type}`;
      toast.innerHTML = `
        ${icons[type] || icons.info}
        <div class="dyf-toast-content">
          ${title ? `<div class="dyf-toast-title">${title}</div>` : ''}
          <div class="dyf-toast-message">${message}</div>
        </div>
        <div class="dyf-toast-progress" style="transition: width ${effectiveDuration}ms linear; width: 100%;"></div>
      `;

      this.container.appendChild(toast);

      // اجرای انیمیشن نوار پیشرفت
      requestAnimationFrame(() => {
        const progress = toast.querySelector('.dyf-toast-progress');
        if (progress) progress.style.width = '0%';
      });

      const timer = setTimeout(() => {
        this.dismiss(toast);
      }, effectiveDuration);

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
      const remainingOpen = document.querySelectorAll('.dyf-modal-backdrop.is-open');
      if (remainingOpen.length === 0) {
        document.body.style.overflow = '';
      }
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

  // بستن تمامی مودال‌ها با کلیک روی المان‌های دارای [data-close] یا خارج از باکس مودال
  document.addEventListener('click', (e) => {
    const closeBtn = e.target.closest('[data-close]');
    if (closeBtn) {
      const modal = closeBtn.closest('.dyf-modal-backdrop');
      if (modal) {
        DYF_Modal.close(modal.id);
        return;
      }
    }

    const openModal = e.target.closest('.dyf-modal-backdrop.is-open');
    if (openModal) {
      const isInsideCard = e.target.closest('.dyf-modal-card');
      const isInsideLightboxImg = e.target.closest('.dyf-lightbox-img');
      if (!isInsideCard && !isInsideLightboxImg) {
        DYF_Modal.close(openModal.id);
      }
    }
  });

  // بستن مودال با دکمه Escape (بستن بالاترین مودال باز)
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      const openModals = document.querySelectorAll('.dyf-modal-backdrop.is-open');
      if (openModals.length > 0) {
        const topmost = openModals[openModals.length - 1];
        DYF_Modal.close(topmost.id);
      }
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
      if (this.phoneInput) {
        this.phoneInput.addEventListener('input', (e) => {
          e.target.value = toEnglishDigits(e.target.value).replace(/\D/g, '');
        });
        this.phoneInput.addEventListener('keydown', (e) => {
          if (e.key === 'Enter') this.handleSendPhone();
        });
      }
      if (this.sendOtpBtn) {
        this.sendOtpBtn.addEventListener('click', () => this.handleSendPhone());
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
            message: 'کد ۵ رقمی تأیید مجدداً به شماره شما ارسال شد.',
          });
        });
      }

      // ورودی‌های ۵ رقمی کد یک‌بارمصرف (پشتیبانی خودکار از صفحه کلید فارسی و انگلیسی)
      this.otpDigits.forEach((digit, index) => {
        digit.addEventListener('input', (e) => {
          const raw = toEnglishDigits(e.target.value).replace(/\D/g, '');
          e.target.value = raw ? raw.slice(-1) : '';
          if (e.target.value) {
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

        // پشتیبانی از Paste متن کد ۵ رقمی (انگلیسی یا فارسی)
        digit.addEventListener('paste', (e) => {
          e.preventDefault();
          const raw = (e.clipboardData || window.clipboardData).getData('text').trim();
          const pasteData = toEnglishDigits(raw).replace(/\D/g, '');
          if (pasteData.length >= 5) {
            pasteData.slice(0, 5).split('').forEach((char, i) => {
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
      const phone = toEnglishDigits(this.phoneInput ? this.phoneInput.value.trim() : '').replace(/\D/g, '');
      if (this.phoneInput) this.phoneInput.value = phone;
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
          title: 'کد تأیید ارسال شد',
          message: 'کد ۵ رقمی تأیید برای شماره شما ارسال شد.',
          duration: 4000,
        });
      }, 550);
    },

    handleVerifyOtp() {
      let code = '';
      this.otpDigits.forEach((d) => (code += toEnglishDigits(d.value.trim())));

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
      '#dashboard': { title: 'داشبورد', viewId: 'viewDashboard' },
      '#shoes': { title: 'مدیریت مدل‌های کفش', viewId: 'viewShoes' },
      '#categories': { title: 'مدیریت دسته‌بندی‌ها', viewId: 'viewCategories' },
      '#customers': { title: 'مشتریان و همکاران', viewId: 'viewCustomers' },
      '#access-links': { title: 'لینک‌های دسترسی اختصاصی', viewId: 'viewAccessLinks' },
      '#components': { title: 'کامپوننت‌های مشترک دیزاین سیستم', viewId: 'viewComponents' },
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
      // بستن سایدبار با کلیک روی هر نقطه خارج از منو در موبایل
      document.addEventListener('click', (e) => {
        if (!this.sidebar || !this.sidebar.classList.contains('is-open')) return;
        if (!this.sidebar.contains(e.target) && !this.toggleBtn?.contains(e.target)) {
          this.closeMobileSidebar();
        }
      });
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
      this.renderActiveCustomers();
      this.bindActions();
    },

    renderActiveCustomers() {
      const container = document.getElementById('dashboardActiveCustomersList');
      if (!container) return;

      let customers = [];
      try {
        const saved = localStorage.getItem('dyf_admin_customers_v1');
        customers = saved ? JSON.parse(saved) : DEFAULT_CUSTOMERS;
      } catch (e) {
        customers = DEFAULT_CUSTOMERS;
      }

      const activeCusts = customers.filter((c) => c.status === 'active').slice(0, 4);
      if (!activeCusts.length) {
        container.innerHTML = '<div style="color: var(--text-dim); font-size: 0.8rem; text-align: center; padding: 1rem;">مشتری فعالی ثبت نشده است.</div>';
        return;
      }

      container.innerHTML = activeCusts
        .map((c) => {
          const initials = (c.nameFa || 'م').split(' ').map((p) => p[0]).slice(0, 2).join('‌');
          return `
          <div style="display: flex; align-items: center; justify-content: space-between; gap: 0.75rem; padding: 0.65rem 0.85rem; background: var(--bg-surface-elevated); border: 1px solid var(--border-subtle); border-radius: var(--r-sm);">
            <div style="display: flex; align-items: center; gap: 0.7rem; min-width: 0;">
              <div class="dyf-customer-avatar" style="width: 36px; height: 36px; font-size: 0.82rem; flex-shrink: 0;">${initials}</div>
              <div style="min-width: 0;">
                <div style="font-weight: 700; color: var(--text-ivory); font-size: 0.86rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${c.nameFa}</div>
                <div style="font-size: 0.74rem; color: var(--text-muted); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${c.shop || c.city || 'همکار کارگاه'}</div>
              </div>
            </div>
            <div style="display: flex; align-items: center; gap: 0.5rem; flex-shrink: 0;">
              <span class="dyf-badge dyf-badge-active" style="font-size: 0.7rem; padding: 0.15rem 0.5rem; white-space: nowrap;">فعال</span>
            </div>
          </div>
        `;
        })
        .join('');
    },

    renderTable(links) {
      if (!this.tableBody) return;
      const displayLinks = (links || []).slice(0, 4);
      if (!displayLinks.length) {
        this.tableBody.innerHTML = '';
        if (this.emptyState) this.emptyState.style.display = 'block';
        return;
      }

      if (this.emptyState) this.emptyState.style.display = 'none';

      const statusBadges = {
        active: `<span class="dyf-badge dyf-badge-active" style="white-space: nowrap;">فعال</span>`,
        expired: `<span class="dyf-badge dyf-badge-expired" style="white-space: nowrap;">منقضی</span>`,
        pending: `<span class="dyf-badge dyf-badge-pending" style="white-space: nowrap;">در انتظار ورود</span>`,
      };

      this.tableBody.innerHTML = displayLinks
        .map(
          (lnk) => `
        <tr class="dyf-dashboard-tr">
          <td class="dyf-td-recipient">
            <div style="font-weight: 700; color: var(--text-ivory);">${lnk.recipientFa}</div>
          </td>
          <td class="dyf-td-status">${statusBadges[lnk.status] || `<span class="dyf-badge dyf-badge-pending" style="white-space: nowrap;">${lnk.status}</span>`}</td>
          <td class="dyf-td-expires">
            <div style="font-size: 0.8rem; color: var(--text-muted); white-space: nowrap;">${lnk.expiresAt}</div>
            <div style="font-size: 0.7rem; color: var(--text-dim); white-space: nowrap;">${lnk.duration}</div>
          </td>
          <td class="dyf-td-actions">
            <div class="dyf-table-actions" style="display: flex; flex-direction: row; gap: 0.45rem; align-items: center; white-space: nowrap;">
              <button type="button" class="dyf-btn dyf-btn-outline dyf-btn-sm js-copy-link" data-url="${lnk.url}" title="کپی لینک اختصاصی">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
                <span>کپی</span>
              </button>
              <button type="button" class="dyf-btn dyf-btn-specular dyf-btn-sm js-view-link-detail" data-id="${lnk.id}" title="مشاهده جزئیات">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
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
          const showSuccess = () => {
            DYF_Toast.show({
              type: 'success',
              title: 'کپی در کلیپ‌بورد',
              message: 'لینک در کلیپ‌بورد کپی شد',
              force: true,
            });
          };

          if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(url)
              .then(showSuccess)
              .catch(() => {
                const ta = document.createElement('textarea');
                ta.value = url;
                ta.style.position = 'fixed';
                ta.style.left = '-9999px';
                document.body.appendChild(ta);
                ta.focus();
                ta.select();
                try { document.execCommand('copy'); } catch (e) {}
                document.body.removeChild(ta);
                showSuccess();
              });
          } else {
            const ta = document.createElement('textarea');
            ta.value = url;
            ta.style.position = 'fixed';
            ta.style.left = '-9999px';
            document.body.appendChild(ta);
            ta.focus();
            ta.select();
            try { document.execCommand('copy'); } catch (e) {}
            document.body.removeChild(ta);
            showSuccess();
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
      if (this.models) {
        this.models.forEach((m) => {
          m.status = 'published';
          m.categories = (m.categories || []).map((c) => c.replace(/^لاین\s+/, ''));
        });
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
      const status = 'published';

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
      if (badgeEl) badgeEl.innerHTML = '';

      const coverMedia = (model.media || []).find((m) => m.isPrimary) || (model.media && model.media[0]) || { url: 'assets/images/shoes.jpeg' };

      const safeTitle = (model.title || '').replace(/'/g, "\\'").replace(/"/g, '&quot;');
      const thumbnailsHtml = (model.media || [])
        .map(
          (m, idx) => `
        <img 
          src="${m.url}" 
          alt="عکس ${idx + 1}" 
          style="width: 64px; height: 64px; object-fit: cover; border-radius: var(--r-sm); border: 1px solid ${m.isPrimary ? 'var(--gold-primary)' : 'var(--border-subtle)'}; cursor: pointer; transition: all 0.2s ease;"
          onclick="document.getElementById('dossierMasterImg').src = '${m.url}'; this.parentElement.querySelectorAll('img').forEach(img => img.style.borderColor = 'var(--border-subtle)'); this.style.borderColor = 'var(--gold-primary)';"
          title="مشاهده این تصویر"
        >
      `
        )
        .join('');

      if (bodyEl) {
        bodyEl.innerHTML = `
          <div class="dyf-dossier-grid" style="display: grid; grid-template-columns: 380px 1fr; gap: 2rem; margin-bottom: 1.5rem;">
            <div>
              <div 
                style="position: relative; width: 100%; aspect-ratio: 1; border-radius: var(--r-md); overflow: hidden; background: #0e0c0a; border: 1px solid var(--border-medium); margin-bottom: 0.75rem; cursor: zoom-in;" 
                title="برای بزرگنمایی و مشاهده تمام‌صفحه کلیک کنید"
                onclick="window.openShoeLightbox(document.getElementById('dossierMasterImg').src, '${safeTitle}')"
              >
                <img id="dossierMasterImg" src="${coverMedia.url}" alt="${model.title}" style="width: 100%; height: 100%; object-fit: cover; transition: transform 0.3s ease;">
                <div style="position: absolute; bottom: 10px; left: 10px; background: rgba(14, 12, 10, 0.8); backdrop-filter: blur(4px); padding: 0.3rem 0.65rem; border-radius: 6px; font-size: 0.74rem; color: var(--gold-light); display: flex; align-items: center; gap: 0.35rem; border: 1px solid var(--border-subtle); pointer-events: none;">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/><path d="M11 8v6"/><path d="M8 11h6"/></svg>
                  <span>مشاهده تمام‌صفحه</span>
                </div>
              </div>
              <div style="display: flex; gap: 0.5rem; overflow-x: auto; padding-bottom: 0.4rem;">
                ${thumbnailsHtml}
              </div>
            </div>

            <div style="display: flex; flex-direction: column; gap: 0.95rem; font-size: 0.88rem;">
              <div>
                <span style="color: var(--text-dim); font-size: 0.78rem;">دسته‌بندی‌ها:</span>
                <div style="display: flex; flex-wrap: wrap; gap: 0.4rem; margin-top: 0.25rem;">
                  ${(model.categories || []).map((c) => `<span class="dyf-category-pill">${c}</span>`).join('')}
                </div>
              </div>

              <div>
                <span style="color: var(--text-dim); font-size: 0.78rem;">شناسنامه و متریال کارگاه:</span>
                <p style="color: var(--text-main); line-height: 1.7; margin-top: 0.25rem;">${model.description || '-'}</p>
              </div>

              <div class="dyf-dossier-specs-grid" style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.85rem; padding-top: 0.75rem; border-top: 1px solid var(--border-subtle);">
                <div>
                  <span style="color: var(--text-dim); font-size: 0.78rem;">رنگ‌های موجود:</span>
                  <div style="font-weight: 700; color: var(--gold-light); margin-top: 0.2rem;">${(model.colors || []).join('، ')}</div>
                </div>
                <div>
                  <span style="color: var(--text-dim); font-size: 0.78rem;">سایزبندی سری:</span>
                  <div style="font-weight: 700; color: var(--text-ivory); margin-top: 0.2rem;">${(model.sizes || []).join('، ')}</div>
                </div>
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

      // به‌روزرسانی شمارنده سایدبار
      const navCounter = document.querySelector('a[href="#shoes"] .dyf-nav-counter');
      if (navCounter) navCounter.textContent = allCount;

      // به‌روزرسانی کارت داشبورد
      const dashStat = document.querySelector('.dyf-stat-card .dyf-stat-value');
      if (dashStat) dashStat.innerHTML = `${allCount} <span>مدل</span>`;

      // هماهنگ‌سازی تعداد دسته‌بندی‌ها در فیلتر
      if (window.DYF_Categories && typeof window.DYF_Categories.syncWithShoeFilters === 'function') {
        window.DYF_Categories.syncWithShoeFilters();
      }
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

      if (!paginationEl) return;

      if (totalItems === 0) {
        paginationEl.style.display = 'none';
        return;
      }

      const totalPages = Math.ceil(totalItems / this.pageSize) || 1;
      if (totalPages <= 1) {
        paginationEl.style.display = 'none';
        return;
      }

      paginationEl.style.display = 'flex';

      if (!pagesContainer) return;

      let html = '';
      for (let p = 1; p <= totalPages; p++) {
        html += `
          <button type="button" class="dyf-pagination-btn ${p === this.currentPage ? 'is-active' : ''} js-page-num" data-page="${p}">
            ${p}
          </button>
        `;
      }

      pagesContainer.innerHTML = html;

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

      const categoriesHtml = (model.categories || [])
        .map((c) => `<span class="dyf-category-pill">${c}</span>`)
        .join('');

      return `
        <article class="dyf-product-card" data-id="${model.id}" title="مشاهده شناسنامه و جزئیات">
          <div class="dyf-product-thumb-wrap">
            <img src="${primaryMedia.url}" alt="${model.title}" class="dyf-product-thumb" loading="lazy">
            <div class="dyf-product-id-badge">DYF-${model.id}</div>
          </div>

          <div class="dyf-product-body">
            <h3 class="dyf-product-title">${model.title}</h3>
            <div class="dyf-product-categories">${categoriesHtml}</div>

            <div class="dyf-product-specs-row">
              <div style="display: flex; align-items: center; gap: 0.35rem;">
                <span>تعداد رنگ:</span>
                <span style="color: var(--text-main); font-weight: 700;">${(model.colors || []).length}</span>
              </div>
              <div style="display: flex; align-items: center; gap: 0.35rem;">
                <span>تعداد سایز:</span>
                <span style="color: var(--gold-light); font-weight: 700;">${(model.sizes || []).length}</span>
              </div>
            </div>
          </div>
        </article>
      `;
    },

    renderTableRowHtml(model) {
      const primaryMedia = (model.media || []).find((m) => m.isPrimary) || (model.media && model.media[0]) || { url: 'assets/images/shoes.jpeg' };

      return `
        <tr data-id="${model.id}">
          <td style="width: 60px;">
            <img src="${primaryMedia.url}" alt="${model.title}" style="width: 48px; height: 48px; object-fit: cover; border-radius: var(--r-sm); border: 1px solid var(--border-subtle);">
          </td>
          <td style="font-family: var(--font-title); font-weight: 700; color: var(--gold-light); direction: ltr; text-align: right;">
            ${model.id}
          </td>
          <td>
            <div style="font-weight: 700; color: var(--text-ivory);">${model.title}</div>
          </td>
          <td>
            <div style="display: flex; flex-wrap: wrap; gap: 0.3rem;">
              ${(model.categories || []).map((c) => `<span class="dyf-category-pill" style="font-size: 0.68rem;">${c}</span>`).join('')}
            </div>
          </td>
          <td>
            <div style="display: flex; gap: 0.35rem; align-items: center;">
              <button type="button" class="dyf-btn dyf-btn-outline dyf-btn-sm js-edit-shoe" data-id="${model.id}">ویرایش</button>
              <button type="button" class="dyf-btn dyf-btn-specular dyf-btn-sm js-dossier-shoe" data-id="${model.id}">شناسنامه</button>
            </div>
          </td>
        </tr>
      `;
    },

    bindCardActions(container) {
      // کلیک روی کارت برای مشاهده پرونده و جزئیات مدل
      container.querySelectorAll('.dyf-product-card').forEach((card) => {
        card.addEventListener('click', (e) => {
          if (e.target.closest('button, a')) return;
          const id = parseInt(card.getAttribute('data-id'), 10);
          if (id) this.openDossierModal(id);
        });
      });

      // ویرایش در حالت جدول
      container.querySelectorAll('.js-edit-shoe').forEach((btn) => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          const id = parseInt(btn.getAttribute('data-id'), 10);
          this.openEditModal(id);
        });
      });

      // شناسنامه فنی در حالت جدول
      container.querySelectorAll('.js-dossier-shoe').forEach((btn) => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          const id = parseInt(btn.getAttribute('data-id'), 10);
          this.openDossierModal(id);
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
        const saved = localStorage.getItem('dyf_admin_categories_v2');
        if (saved) {
          this.categories = JSON.parse(saved);
        } else {
          const old = localStorage.getItem('dyf_admin_categories_v1');
          if (old) {
            this.categories = JSON.parse(old).map((c) => ({
              id: c.id,
              name: (c.name || '').replace(/^لاین\s+/, ''),
              status: 'active',
            }));
          } else {
            this.categories = JSON.parse(JSON.stringify(DEFAULT_CATEGORIES));
          }
          this.saveCategories(false);
        }
      } catch (e) {
        this.categories = JSON.parse(JSON.stringify(DEFAULT_CATEGORIES));
      }
      if (this.categories) {
        this.categories.forEach((c) => {
          c.name = (c.name || '').replace(/^لاین\s+/, '');
          c.status = 'active';
        });
      }
    },

    saveCategories(showToast = true) {
      try {
        localStorage.setItem('dyf_admin_categories_v2', JSON.stringify(this.categories));
        this.updateGlobalCounters();
        this.syncWithShoeFilters();
        if (showToast) {
          DYF_Toast.show({
            type: 'success',
            title: 'به‌روزرسانی دسته‌بندی‌ها',
            message: 'تغییرات دسته‌بندی‌ها با موفقیت ذخیره شد.',
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
        const totalModelsCount = (ShoesController.models || []).length;
        let optionsHtml = `<option value="all">همه دسته‌بندی‌ها (${totalModelsCount})</option>`;
        this.categories.forEach((cat) => {
          const count = this.getModelCountForCategory(cat.name);
          const isInactive = cat.status === 'inactive';
          optionsHtml += `
            <option value="${cat.name}" ${currentVal === cat.name ? 'selected' : ''}>
              ${cat.name} (${count})${isInactive ? ' — غیرفعال' : ''}
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
      const modalTitle = document.getElementById('categoryFormModalTitle');

      if (modeInput) modeInput.value = 'create';
      if (idInput) idInput.value = '';
      if (modalTitle) modalTitle.textContent = 'ایجاد دسته‌بندی جدید';
      if (nameInput) nameInput.value = '';

      DYF_Modal.open('modalCategoryForm');
      if (nameInput) setTimeout(() => nameInput.focus(), 200);
    },

    openEditModal(id) {
      const cat = this.categories.find((c) => c.id === id);
      if (!cat) return;

      const modeInput = document.getElementById('categoryFormMode');
      const idInput = document.getElementById('categoryFormId');
      const nameInput = document.getElementById('categoryFormName');
      const modalTitle = document.getElementById('categoryFormModalTitle');

      if (modeInput) modeInput.value = 'edit';
      if (idInput) idInput.value = cat.id;
      if (modalTitle) modalTitle.textContent = `ویرایش دسته‌بندی «${cat.name}»`;
      if (nameInput) nameInput.value = cat.name || '';

      DYF_Modal.open('modalCategoryForm');
      if (nameInput) setTimeout(() => nameInput.focus(), 200);
    },

    handleSaveForm() {
      const mode = document.getElementById('categoryFormMode')?.value || 'create';
      const id = document.getElementById('categoryFormId')?.value;
      const name = document.getElementById('categoryFormName')?.value.trim();

      if (!name) {
        DYF_Toast.show({
          type: 'error',
          title: 'نام دسته‌بندی الزامی است',
          message: 'لطفاً نام دسته‌بندی را وارد کنید.',
        });
        document.getElementById('categoryFormName')?.focus();
        return;
      }

      if (mode === 'create') {
        const exists = this.categories.some(
          (c) => c.name.toLowerCase() === name.toLowerCase()
        );
        if (exists) {
          DYF_Toast.show({
            type: 'error',
            title: 'دسته‌بندی تکراری',
            message: 'دسته‌بندی دیگری با همین نام قبلاً ثبت شده است.',
          });
          return;
        }

        const newCat = {
          id: `cat-${Date.now()}`,
          name,
          status: 'active',
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
          cat.status = 'active';

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

      // شمارنده در سایدبار
      const navCounter = document.querySelector('a[href="#categories"] .dyf-nav-counter');
      if (navCounter) navCounter.textContent = allCount;
    },

    getFilteredCategories() {
      return this.categories.filter((c) => {
        if (this.searchQuery) {
          const matchName = (c.name || '').toLowerCase().includes(this.searchQuery);
          if (!matchName) return false;
        }
        return true;
      });
    },

    render() {
      const filtered = this.getFilteredCategories();
      const gridContainer = document.getElementById('categoriesGridContainer');
      const emptyState = document.getElementById('categoriesEmptyState');

      this.updateGlobalCounters();

      if (!filtered.length) {
        if (gridContainer) gridContainer.style.display = 'none';
        if (emptyState) emptyState.style.display = 'block';
        return;
      }

      if (emptyState) emptyState.style.display = 'none';

      if (gridContainer) {
        gridContainer.style.display = 'grid';
        gridContainer.innerHTML = filtered.map((c) => this.renderCardHtml(c)).join('');
        this.bindCardActions(gridContainer);
      }
    },

    renderCardHtml(cat) {
      const modelCount = this.getModelCountForCategory(cat.name);

      return `
        <article class="dyf-category-card" data-id="${cat.id}">
          <div class="dyf-category-header">
            <h3 class="dyf-category-title">${cat.name}</h3>
            <span class="dyf-category-badge">${modelCount} مدل</span>
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
            <button type="button" class="dyf-btn dyf-btn-specular dyf-btn-sm js-view-cat-shoes" data-name="${cat.name}">
              مدل‌ها
            </button>
          </div>
        </article>
      `;
    },

    renderTableRowHtml(cat) {
      const modelCount = this.getModelCountForCategory(cat.name);

      return `
        <tr data-id="${cat.id}">
          <td style="font-weight: 700; color: var(--text-ivory); font-size: 0.92rem;">
            ${cat.name}
          </td>
          <td>
            <span class="dyf-badge dyf-badge-active" style="font-size: 0.74rem;">${modelCount} مدل مرتبط</span>
          </td>
          <td>
            <div style="display: flex; gap: 0.35rem; align-items: center;">
              <button type="button" class="dyf-btn dyf-btn-outline dyf-btn-sm js-edit-cat" data-id="${cat.id}">ویرایش</button>
              <button type="button" class="dyf-btn dyf-btn-outline dyf-btn-sm js-delete-cat" data-id="${cat.id}" style="color: var(--status-danger);">حذف</button>
              <button type="button" class="dyf-btn dyf-btn-specular dyf-btn-sm js-view-cat-shoes" data-name="${cat.name}">مشاهده مدل‌ها</button>
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
  // کامپوننت انتخابگر محصولات دسته‌بندی‌شده (Hierarchical Product Selector)
  // ==========================================================================
  const DYF_ProductSelector = {
    instances: {},

    render(containerId, options = {}) {
      const container = typeof containerId === 'string' ? document.getElementById(containerId) : containerId;
      if (!container) return null;

      const cid = typeof containerId === 'string' ? containerId : (container.id || `ps_${Date.now()}`);
      const allShoes = (window.ShoesController && window.ShoesController.models) || DEFAULT_SHOES;
      const publishedShoes = allShoes.filter((s) => s.status === 'published');
      const allCats = (window.CategoriesController && window.CategoriesController.categories) || DEFAULT_CATEGORIES;

      let selectedIds = new Set();
      if (Array.isArray(options.selectedShoeIds) && options.selectedShoeIds.length > 0) {
        options.selectedShoeIds.forEach((id) => selectedIds.add(Number(id)));
      } else if (Array.isArray(options.addModels) && options.addModels.length > 0) {
        options.addModels.forEach((id) => selectedIds.add(Number(id)));
      } else if (Array.isArray(options.categories) && options.categories.length > 0) {
        publishedShoes.forEach((shoe) => {
          const match = (shoe.categories || []).some((c) => options.categories.includes(c));
          if (match && !(options.excludeModels || []).includes(shoe.id)) {
            selectedIds.add(shoe.id);
          }
        });
      } else if (options.defaultSelectAll !== false) {
        publishedShoes.forEach((s) => selectedIds.add(s.id));
      }

      const instance = {
        containerId: cid,
        publishedShoes,
        allCats,
        selectedIds,
        onChange: options.onChange || null,
      };

      this.instances[cid] = instance;

      container.innerHTML = this.buildHtml(instance);
      this.bindEvents(instance, container);
      this.updateSummary(instance, container);

      return instance;
    },

    buildHtml(inst) {
      const totalShoes = inst.publishedShoes.length;
      const selectedCount = inst.selectedIds.size;

      const catBlocksHtml = inst.allCats.map((cat) => {
        const catShoes = inst.publishedShoes.filter((shoe) =>
          (shoe.categories || []).includes(cat.name)
        );
        if (!catShoes.length) return '';

        const allChecked = catShoes.every((s) => inst.selectedIds.has(s.id));
        const someChecked = !allChecked && catShoes.some((s) => inst.selectedIds.has(s.id));

        const shoesHtml = catShoes.map((shoe) => {
          const isChecked = inst.selectedIds.has(shoe.id);
          const thumb = shoe.media?.find((m) => m.isPrimary)?.url || shoe.media?.[0]?.url || 'assets/images/shoes.jpeg';

          return `
            <label class="dyf-shoe-item-select ${isChecked ? 'is-selected' : ''}" data-shoe-id="${shoe.id}">
              <input type="checkbox" class="js-shoe-checkbox" value="${shoe.id}" ${isChecked ? 'checked' : ''}>
              <img src="${thumb}" alt="${shoe.title}" class="dyf-shoe-item-thumb">
              <div class="dyf-shoe-item-info">
                <span class="dyf-shoe-item-code">DYF-${shoe.id}</span>
                <span class="dyf-shoe-item-title" title="${shoe.title}">${shoe.title}</span>
              </div>
            </label>
          `;
        }).join('');

        return `
          <div class="dyf-category-group" data-cat-name="${cat.name}">
            <div class="dyf-category-group-header">
              <label class="dyf-category-group-title">
                <input type="checkbox" class="js-cat-checkbox" ${allChecked ? 'checked' : ''} ${someChecked ? 'data-indeterminate="true"' : ''}>
                <span>${cat.name}</span>
              </label>
              <span class="dyf-category-group-count">${catShoes.length} مدل</span>
            </div>
            <div class="dyf-category-shoes-grid">
              ${shoesHtml}
            </div>
          </div>
        `;
      }).join('');

      return `
        <div class="dyf-products-selector">
          <div class="dyf-products-selector-toolbar">
            <div class="dyf-products-selector-actions">
              <button type="button" class="dyf-btn dyf-btn-specular dyf-btn-sm js-select-all-btn">
                <span>انتخاب همه محصولات</span>
              </button>
              <button type="button" class="dyf-btn dyf-btn-outline dyf-btn-sm js-deselect-all-btn">
                <span>لغو انتخاب همه</span>
              </button>
            </div>
            <div class="dyf-products-selector-summary">
              <span class="dyf-badge dyf-badge-active js-summary-badge">${selectedCount} از ${totalShoes} مدل مجاز</span>
            </div>
          </div>
          <div class="dyf-products-selector-body">
            ${catBlocksHtml}
          </div>
        </div>
      `;
    },

    bindEvents(inst, container) {
      container.querySelector('.js-select-all-btn')?.addEventListener('click', (e) => {
        e.preventDefault();
        inst.publishedShoes.forEach((s) => inst.selectedIds.add(s.id));
        this.syncCheckboxes(inst, container);
        this.updateSummary(inst, container);
      });

      container.querySelector('.js-deselect-all-btn')?.addEventListener('click', (e) => {
        e.preventDefault();
        inst.selectedIds.clear();
        this.syncCheckboxes(inst, container);
        this.updateSummary(inst, container);
      });

      container.querySelectorAll('.dyf-category-group').forEach((groupEl) => {
        const catCheckbox = groupEl.querySelector('.js-cat-checkbox');
        const catName = groupEl.getAttribute('data-cat-name');
        const catShoes = inst.publishedShoes.filter((s) => (s.categories || []).includes(catName));

        catCheckbox?.addEventListener('change', (e) => {
          const checked = e.target.checked;
          catShoes.forEach((shoe) => {
            if (checked) {
              inst.selectedIds.add(shoe.id);
            } else {
              inst.selectedIds.delete(shoe.id);
            }
          });
          this.syncCheckboxes(inst, container);
          this.updateSummary(inst, container);
        });
      });

      container.querySelectorAll('.js-shoe-checkbox').forEach((shoeCheckbox) => {
        shoeCheckbox.addEventListener('change', (e) => {
          const shoeId = Number(e.target.value);
          if (e.target.checked) {
            inst.selectedIds.add(shoeId);
          } else {
            inst.selectedIds.delete(shoeId);
          }
          this.syncCheckboxes(inst, container);
          this.updateSummary(inst, container);
        });
      });
    },

    syncCheckboxes(inst, container) {
      container.querySelectorAll('.dyf-shoe-item-select').forEach((itemEl) => {
        const shoeId = Number(itemEl.getAttribute('data-shoe-id'));
        const isChecked = inst.selectedIds.has(shoeId);
        const chk = itemEl.querySelector('.js-shoe-checkbox');
        if (chk) chk.checked = isChecked;
        itemEl.classList.toggle('is-selected', isChecked);
      });

      container.querySelectorAll('.dyf-category-group').forEach((groupEl) => {
        const catName = groupEl.getAttribute('data-cat-name');
        const catShoes = inst.publishedShoes.filter((s) => (s.categories || []).includes(catName));
        const catCheckbox = groupEl.querySelector('.js-cat-checkbox');
        if (catCheckbox && catShoes.length) {
          const allChecked = catShoes.every((s) => inst.selectedIds.has(s.id));
          const someChecked = !allChecked && catShoes.some((s) => inst.selectedIds.has(s.id));
          catCheckbox.checked = allChecked;
          catCheckbox.indeterminate = someChecked;
        }
      });
    },

    updateSummary(inst, container) {
      const badge = container.querySelector('.js-summary-badge');
      if (badge) {
        badge.textContent = `${inst.selectedIds.size} از ${inst.publishedShoes.length} مدل مجاز`;
      }
      if (inst.onChange) inst.onChange(this.getData(inst.containerId));
    },

    getData(containerId) {
      const inst = this.instances[containerId];
      if (!inst) return { selectedShoeIds: [], addModels: [], excludeModels: [], categories: [] };

      const selectedShoeIds = Array.from(inst.selectedIds);
      const unselectedShoeIds = inst.publishedShoes
        .filter((s) => !inst.selectedIds.has(s.id))
        .map((s) => s.id);

      const selectedCats = inst.allCats
        .filter((c) => {
          const catShoes = inst.publishedShoes.filter((s) => (s.categories || []).includes(c.name));
          return catShoes.some((s) => inst.selectedIds.has(s.id));
        })
        .map((c) => c.name);

      return {
        selectedShoeIds,
        addModels: selectedShoeIds,
        excludeModels: unselectedShoeIds,
        categories: selectedCats,
      };
    },
  };

  window.DYF_ProductSelector = DYF_ProductSelector;

  // ==========================================================================
  // ۹-ب. مودال دو‌بخشی پیشرفته انتخاب محصولات و مدل‌های مجاز (Split-Pane Product Picker Modal)
  const DYF_ProductPickerModal = {
    activeCategoryKey: '__uncategorized__',
    searchQuery: '',
    categories: new Set(),
    addModels: new Set(),
    excludeModels: new Set(),
    onConfirmCallback: null,
    initialized: false,

    init() {
      if (this.initialized) return;
      this.initialized = true;

      // جست‌وجوی زنده مدل‌ها
      const searchInput = document.getElementById('pickerSearchInput');
      const searchClearBtn = document.getElementById('pickerSearchClearBtn');

      if (searchInput) {
        searchInput.addEventListener('input', (e) => {
          this.searchQuery = toEnglishDigits(e.target.value.trim());
          if (searchClearBtn) {
            searchClearBtn.style.display = this.searchQuery ? 'flex' : 'none';
          }
          this.renderCategoriesSidebar();
          this.renderModelsPanel();
        });
      }

      if (searchClearBtn) {
        searchClearBtn.addEventListener('click', () => {
          if (searchInput) {
            searchInput.value = '';
            this.searchQuery = '';
            searchClearBtn.style.display = 'none';
            this.renderCategoriesSidebar();
            this.renderModelsPanel();
            searchInput.focus();
          }
        });
      }

      // دکمه‌های هدر نوار کناری دسته‌بندی‌ها
      document.getElementById('pickerSelectAllCatsBtn')?.addEventListener('click', () => {
        this.selectAllCategories();
      });
      document.getElementById('pickerDeselectAllCatsBtn')?.addEventListener('click', () => {
        this.deselectAllCategories();
      });

      // دکمه‌های هدر پنل مدل‌ها
      document.getElementById('pickerSelectCurrentCatModelsBtn')?.addEventListener('click', () => {
        this.selectCurrentCategoryModels();
      });
      document.getElementById('pickerDeselectCurrentCatModelsBtn')?.addEventListener('click', () => {
        this.deselectCurrentCategoryModels();
      });

      // دکمه تأیید نهایی
      document.getElementById('pickerConfirmBtn')?.addEventListener('click', () => {
        this.confirm();
      });
    },

    open({ categories = null, addModels = null, excludeModels = null, selectedShoeIds = null, onConfirm }) {
      this.init();
      this.onConfirmCallback = onConfirm;
      this.searchQuery = '';

      const searchInput = document.getElementById('pickerSearchInput');
      if (searchInput) searchInput.value = '';
      const searchClearBtn = document.getElementById('pickerSearchClearBtn');
      if (searchClearBtn) searchClearBtn.style.display = 'none';

      const activeCats = this.getCategories();

      // مقداردهی اولیه قوانین دسترسی
      if (Array.isArray(categories) && categories.length > 0) {
        this.categories = new Set(categories);
        this.addModels = new Set(Array.isArray(addModels) ? addModels.map(Number) : []);
        this.excludeModels = new Set(Array.isArray(excludeModels) ? excludeModels.map(Number) : []);
      } else if (Array.isArray(selectedShoeIds) && selectedShoeIds.length > 0) {
        const selSet = new Set(selectedShoeIds.map(Number));
        this.categories = new Set();
        this.addModels = new Set();
        this.excludeModels = new Set();

        // دسته‌بندی‌های کاملاً انتخاب‌شده
        const uncatShoes = this.getUncategorizedShoes();
        if (uncatShoes.length > 0 && uncatShoes.every((s) => selSet.has(s.id))) {
          this.categories.add('__uncategorized__');
        } else {
          uncatShoes.filter((s) => selSet.has(s.id)).forEach((s) => this.addModels.add(s.id));
        }

        activeCats.forEach((cat) => {
          const catShoes = this.getShoesForCategory(cat.name);
          if (catShoes.length > 0 && catShoes.every((s) => selSet.has(s.id))) {
            this.categories.add(cat.name);
          } else {
            catShoes.filter((s) => selSet.has(s.id)).forEach((s) => this.addModels.add(s.id));
          }
        });
      } else {
        // پیش‌فرض: تمام دسته‌بندی‌ها فعال
        this.categories = new Set(['__uncategorized__', ...activeCats.map((c) => c.name)]);
        this.addModels = new Set();
        this.excludeModels = new Set();
      }

      // اولویت نمایش دسته‌ها: بدون دسته‌بندی در ردیف اول
      this.activeCategoryKey = '__uncategorized__';

      this.renderCategoriesSidebar();
      this.renderModelsPanel();
      this.updateSummary();

      DYF_Modal.open('modalProductPicker');
    },

    close() {
      DYF_Modal.close('modalProductPicker');
    },

    getAllPublishedShoes() {
      const all = (window.ShoesController && window.ShoesController.models) || DEFAULT_SHOES;
      return all.filter((s) => s.status === 'published');
    },

    getCategories() {
      const cats = (window.CategoriesController && window.CategoriesController.categories) || DEFAULT_CATEGORIES;
      return cats.filter((c) => c.status === 'active');
    },

    getUncategorizedShoes() {
      const all = this.getAllPublishedShoes();
      const activeCatNames = this.getCategories().map((c) => c.name);
      return all.filter((s) => {
        if (!s.categories || !Array.isArray(s.categories) || s.categories.length === 0) return true;
        return !s.categories.some((c) => activeCatNames.includes(c));
      });
    },

    getShoesForCategory(catKey) {
      if (catKey === '__uncategorized__') {
        return this.getUncategorizedShoes();
      }
      return this.getAllPublishedShoes().filter((s) => (s.categories || []).includes(catKey));
    },

    isShoeEligible(shoe) {
      // ۱. استثنا کردن قطعی اولویت بالاتر دارد
      if (this.excludeModels.has(shoe.id)) return false;

      // ۲. افزودن مدل مشخص
      if (this.addModels.has(shoe.id)) return true;

      // ۳. تطابق با دسته‌بندی مجاز
      const activeCatNames = this.getCategories().map((c) => c.name);
      const shoeCats = (shoe.categories || []).filter((c) => activeCatNames.includes(c));
      if (shoeCats.length === 0) {
        return this.categories.has('__uncategorized__');
      }

      return shoeCats.some((c) => this.categories.has(c));
    },

    getAllEligibleShoes() {
      return this.getAllPublishedShoes().filter((s) => this.isShoeEligible(s));
    },

    getCategorySelectionState(catKey) {
      const shoes = this.getShoesForCategory(catKey);
      if (!shoes || shoes.length === 0) {
        return { checked: false, indeterminate: false, eligibleCount: 0, total: 0 };
      }

      const eligibleCount = shoes.filter((s) => this.isShoeEligible(s)).length;
      if (eligibleCount === shoes.length) {
        return { checked: true, indeterminate: false, eligibleCount, total: shoes.length };
      }
      if (eligibleCount === 0) {
        return { checked: false, indeterminate: false, eligibleCount: 0, total: shoes.length };
      }
      return { checked: false, indeterminate: true, eligibleCount, total: shoes.length };
    },

    toggleCategory(catKey) {
      const state = this.getCategorySelectionState(catKey);
      const catShoes = this.getShoesForCategory(catKey);

      if (state.checked) {
        // لغو کامل انتخاب این دسته
        this.categories.delete(catKey);
        catShoes.forEach((s) => {
          this.addModels.delete(s.id);
          this.excludeModels.delete(s.id);
        });
      } else {
        // انتخاب کامل این دسته و پاکسازی استثناها
        this.categories.add(catKey);
        catShoes.forEach((s) => {
          this.excludeModels.delete(s.id);
          this.addModels.delete(s.id);
        });
      }

      this.renderCategoriesSidebar();
      this.renderModelsPanel();
      this.updateSummary();
    },

    toggleShoe(shoeId) {
      const shoe = this.getAllPublishedShoes().find((s) => s.id === shoeId);
      if (!shoe) return;

      const isEligible = this.isShoeEligible(shoe);
      const activeCatNames = this.getCategories().map((c) => c.name);
      const shoeCats = (shoe.categories || []).filter((c) => activeCatNames.includes(c));
      const isUncat = shoeCats.length === 0;
      const isCatPermitted = isUncat
        ? this.categories.has('__uncategorized__')
        : shoeCats.some((c) => this.categories.has(c));

      if (isEligible) {
        // لغو تیک مدل
        if (isCatPermitted) {
          // چون دسته‌بندی مجاز است، لغو تیک به معنی استثنا کردن مدل است
          this.excludeModels.add(shoe.id);
          this.addModels.delete(shoe.id);
        } else {
          // چون دسته‌بندی مجاز نبود، از لیست مدل‌های خاص حذف می‌شود
          this.addModels.delete(shoe.id);
          this.excludeModels.delete(shoe.id);
        }
      } else {
        // فعال‌سازی تیک مدل
        if (isCatPermitted) {
          // دسته مجاز است، رفع استثنا
          this.excludeModels.delete(shoe.id);
          this.addModels.delete(shoe.id);
        } else {
          // دسته غیرمجاز است، اضافه به مدل‌های مجاز دستی
          this.addModels.add(shoe.id);
          this.excludeModels.delete(shoe.id);
        }
      }

      this.renderCategoriesSidebar();
      this.renderModelsPanel();
      this.updateSummary();
    },

    selectAllCategories() {
      const activeCats = this.getCategories();
      this.categories = new Set(['__uncategorized__', ...activeCats.map((c) => c.name)]);
      this.excludeModels.clear();
      this.addModels.clear();
      this.renderCategoriesSidebar();
      this.renderModelsPanel();
      this.updateSummary();
    },

    deselectAllCategories() {
      this.categories.clear();
      this.addModels.clear();
      this.excludeModels.clear();
      this.renderCategoriesSidebar();
      this.renderModelsPanel();
      this.updateSummary();
    },

    selectCurrentCategoryModels() {
      if (this.searchQuery) {
        const matching = this.getMatchingShoesForSearch();
        matching.forEach((s) => {
          this.excludeModels.delete(s.id);
          this.addModels.add(s.id);
        });
      } else {
        this.categories.add(this.activeCategoryKey);
        const catShoes = this.getShoesForCategory(this.activeCategoryKey);
        catShoes.forEach((s) => {
          this.excludeModels.delete(s.id);
          this.addModels.delete(s.id);
        });
      }
      this.renderCategoriesSidebar();
      this.renderModelsPanel();
      this.updateSummary();
    },

    deselectCurrentCategoryModels() {
      if (this.searchQuery) {
        const matching = this.getMatchingShoesForSearch();
        matching.forEach((s) => {
          this.addModels.delete(s.id);
          this.excludeModels.add(s.id);
        });
      } else {
        this.categories.delete(this.activeCategoryKey);
        const catShoes = this.getShoesForCategory(this.activeCategoryKey);
        catShoes.forEach((s) => {
          this.addModels.delete(s.id);
          this.excludeModels.delete(s.id);
        });
      }
      this.renderCategoriesSidebar();
      this.renderModelsPanel();
      this.updateSummary();
    },

    getMatchingShoesForSearch() {
      const q = (this.searchQuery || '').toLowerCase().trim();
      if (!q) return [];
      const all = this.getAllPublishedShoes();
      return all.filter((s) => {
        const matchTitle = (s.title || '').toLowerCase().includes(q);
        const matchId = String(s.id).includes(q) || `dyf-${s.id}`.toLowerCase().includes(q);
        const matchCat = (s.categories || []).some((c) => c.toLowerCase().includes(q));
        return matchTitle || matchId || matchCat;
      });
    },

    renderCategoriesSidebar() {
      const listEl = document.getElementById('pickerCatsList');
      if (!listEl) return;

      const uncatShoes = this.getUncategorizedShoes();
      const activeCats = this.getCategories();

      // ساخت لیست دسته‌بندی‌ها با قراردادن «بدون دسته‌بندی» در ردیف اول
      const items = [
        {
          key: '__uncategorized__',
          title: 'بدون دسته‌بندی',
          shoes: uncatShoes,
        },
        ...activeCats.map((cat) => ({
          key: cat.name,
          title: cat.name,
          shoes: this.getShoesForCategory(cat.name),
        })),
      ];

      let html = '';
      items.forEach((item) => {
        const state = this.getCategorySelectionState(item.key);
        const isActive = this.activeCategoryKey === item.key && !this.searchQuery;

        html += `
          <div class="dyf-picker-cat-item ${isActive ? 'is-active' : ''}" data-cat-key="${item.key}">
            <div class="dyf-picker-cat-item-main">
              <input type="checkbox" class="dyf-picker-cat-cb js-cat-cb" data-cat-key="${item.key}"
                ${state.checked ? 'checked' : ''}
                ${state.indeterminate ? 'data-indeterminate="true"' : ''}>
              <span class="dyf-picker-cat-label" title="${item.title}">${item.title}</span>
            </div>
            <span class="dyf-picker-cat-badge">${toPersianDigits(state.eligibleCount)} / ${toPersianDigits(item.shoes.length)}</span>
          </div>
        `;
      });

      listEl.innerHTML = html;

      // اعمال وضعیت نیمه‌انتخاب (indeterminate)
      listEl.querySelectorAll('.js-cat-cb').forEach((cb) => {
        if (cb.getAttribute('data-indeterminate') === 'true') {
          cb.indeterminate = true;
        }
      });

      // رویدادهای کلیک روی ردیف دسته‌بندی و چک‌باکس
      listEl.querySelectorAll('.dyf-picker-cat-item').forEach((row) => {
        const key = row.getAttribute('data-cat-key');
        const cb = row.querySelector('.js-cat-cb');

        cb?.addEventListener('click', (e) => {
          e.stopPropagation();
        });

        cb?.addEventListener('change', () => {
          this.toggleCategory(key);
        });

        row.addEventListener('click', (e) => {
          if (e.target === cb) return;
          this.activeCategoryKey = key;
          this.searchQuery = '';
          const searchInput = document.getElementById('pickerSearchInput');
          if (searchInput) searchInput.value = '';
          const searchClearBtn = document.getElementById('pickerSearchClearBtn');
          if (searchClearBtn) searchClearBtn.style.display = 'none';

          this.renderCategoriesSidebar();
          this.renderModelsPanel();
        });
      });
    },

    renderModelsPanel() {
      const titleEl = document.getElementById('pickerActiveCategoryTitle');
      const countEl = document.getElementById('pickerActiveCategoryCount');
      const scrollEl = document.getElementById('pickerModelsScroll');
      if (!scrollEl) return;

      let displayShoes = [];
      let isSearchMode = false;

      if (this.searchQuery) {
        isSearchMode = true;
        displayShoes = this.getMatchingShoesForSearch();
        if (titleEl) titleEl.textContent = `نتایج جست‌وجو برای «${this.searchQuery}»`;
        if (countEl) countEl.textContent = `${toPersianDigits(displayShoes.length)} مدل یافت شد`;
      } else {
        displayShoes = this.getShoesForCategory(this.activeCategoryKey);
        const titleText = this.activeCategoryKey === '__uncategorized__'
          ? 'مدل‌های بدون دسته‌بندی'
          : `مدل‌های دسته‌بندی ${this.activeCategoryKey}`;
        if (titleEl) titleEl.textContent = titleText;
        if (countEl) countEl.textContent = `${toPersianDigits(displayShoes.length)} مدل`;
      }

      if (displayShoes.length === 0) {
        scrollEl.innerHTML = `
          <div style="text-align: center; padding: 4rem 1.5rem; color: var(--text-muted);">
            <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="margin-bottom: 0.85rem; opacity: 0.5;"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
            <h4 style="font-family: var(--font-title); font-size: 1.05rem; color: var(--text-ivory); margin-bottom: 0.35rem;">هیچ مدلی یافت نشد</h4>
            <p style="font-size: 0.82rem;">${isSearchMode ? 'با این عبارت مدلی پیدا نشد.' : 'در این دسته‌بندی مدلی ثبت نشده است.'}</p>
          </div>
        `;
        return;
      }

      const activeCatNames = this.getCategories().map((c) => c.name);

      let cardsHtml = '';
      displayShoes.forEach((shoe) => {
        const isEligible = this.isShoeEligible(shoe);
        const thumb = shoe.media?.find((m) => m.isPrimary)?.url || shoe.media?.[0]?.url || 'assets/images/shoes.jpeg';
        const shoeCats = (shoe.categories || []).filter((c) => activeCatNames.includes(c));
        const catLabel = shoeCats.length > 0 ? shoeCats[0] : 'بدون دسته‌بندی';

        cardsHtml += `
          <div class="dyf-picker-shoe-card ${isEligible ? 'is-selected' : ''}" data-shoe-id="${shoe.id}">
            <input type="checkbox" class="dyf-picker-shoe-cb js-shoe-cb" value="${shoe.id}" ${isEligible ? 'checked' : ''}>
            <img src="${thumb}" alt="${shoe.title}" class="dyf-picker-shoe-thumb" loading="lazy">
            <div class="dyf-picker-shoe-info">
              <span class="dyf-picker-shoe-title" title="${shoe.title}">${shoe.title}</span>
              <div class="dyf-picker-shoe-meta">
                <span class="dyf-picker-shoe-code">DYF-${shoe.id}</span>
                ${isSearchMode ? `<span class="dyf-picker-shoe-cat-tag">(${catLabel})</span>` : ''}
              </div>
            </div>
          </div>
        `;
      });

      scrollEl.innerHTML = `<div class="dyf-picker-models-grid">${cardsHtml}</div>`;

      // رویداد کلیک روی چک‌باکس و کارت کفش
      scrollEl.querySelectorAll('.dyf-picker-shoe-card').forEach((card) => {
        const shoeId = parseInt(card.getAttribute('data-shoe-id'), 10);
        const cb = card.querySelector('.js-shoe-cb');

        cb?.addEventListener('click', (e) => {
          e.stopPropagation();
        });

        cb?.addEventListener('change', () => {
          this.toggleShoe(shoeId);
        });

        card.addEventListener('click', (e) => {
          if (e.target === cb) return;
          this.toggleShoe(shoeId);
        });
      });
    },

    updateSummary() {
      const badge = document.getElementById('pickerTotalEligibleBadge');
      const rulesEl = document.getElementById('pickerRulesSummary');

      const allShoes = this.getAllPublishedShoes();
      const eligibleShoes = this.getAllEligibleShoes();
      const activeCats = this.getCategories();

      if (badge) {
        badge.textContent = `${toPersianDigits(eligibleShoes.length)} مدل انتخاب‌شده`;
      }

      if (rulesEl) {
        const allowedCatsCount = Array.from(this.categories).filter((c) => c !== '__uncategorized__').length;
        const uncatAllowed = this.categories.has('__uncategorized__');
        const totalCatsAllowed = allowedCatsCount + (uncatAllowed ? 1 : 0);

        rulesEl.innerHTML = `
          <span>${toPersianDigits(eligibleShoes.length)} از ${toPersianDigits(allShoes.length)} مدل مجاز</span>
          <span class="dyf-dot-sep">•</span>
          <span>${toPersianDigits(totalCatsAllowed)} دسته‌بندی مجاز</span>
          <span class="dyf-dot-sep">•</span>
          <span>${toPersianDigits(this.addModels.size)} مدل افزوده</span>
          <span class="dyf-dot-sep">•</span>
          <span>${toPersianDigits(this.excludeModels.size)} مدل مستثنا</span>
        `;
      }
    },

    confirm() {
      if (typeof this.onConfirmCallback === 'function') {
        const allEligible = this.getAllEligibleShoes().map((s) => s.id);
        this.onConfirmCallback({
          selectedShoeIds: allEligible,
          categories: Array.from(this.categories),
          addModels: Array.from(this.addModels),
          excludeModels: Array.from(this.excludeModels),
        });
      }
      this.close();
    },
  };

  window.DYF_ProductPickerModal = DYF_ProductPickerModal;

  // ==========================================================================
  // ۱۰. ماژول مدیریت مشتریان و دسترسی مستقیم (Task 4: Customers & Direct Access)
  // ==========================================================================
  const CustomersController = {
    customers: [],
    searchQuery: '',
    selectedStatus: 'all', // 'all', 'active', 'inactive'
    viewMode: (typeof window !== 'undefined' && window.innerWidth <= 880) ? 'grid' : 'table', // پیش‌فرض کارتی در موبایل
    currentViewingCustomerId: null,
    currentDirectAccessSelectedShoeIds: [],
    currentDirectAccessCategories: [],
    currentDirectAccessAddModels: [],
    currentDirectAccessExcludeModels: [],

    init() {
      if (typeof window !== 'undefined' && window.innerWidth <= 880) {
        this.viewMode = 'grid';
      }
      this.loadCustomers();
      this.bindEvents();
      this.updateViewModeButtons();
      this.render();
      this.updateGlobalCounters();
    },

    updateViewModeButtons() {
      const gridBtn = document.getElementById('customersViewGridBtn');
      const tableBtn = document.getElementById('customersViewTableBtn');
      if (gridBtn && tableBtn) {
        gridBtn.classList.toggle('is-active', this.viewMode === 'grid');
        tableBtn.classList.toggle('is-active', this.viewMode === 'table');
      }
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
      if (this.customers) {
        this.customers.forEach((c) => {
          if (c.directAccess && c.directAccess.categories) {
            c.directAccess.categories = c.directAccess.categories.map((cat) => cat.replace(/^لاین\s+/, ''));
          }
        });
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
          this.updateViewModeButtons();
          this.render();
        });
        tableBtn.addEventListener('click', () => {
          this.viewMode = 'table';
          this.updateViewModeButtons();
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
      if (modalTitle) modalTitle.textContent = `ویرایش مشخصات مشتری «${cust.nameFa}»`;
      if (idInput) idInput.value = cust.id;

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
      const formIdVal = document.getElementById('customerFormId')?.value;
      const nameFa = document.getElementById('customerFormNameFa')?.value.trim();
      const shop = document.getElementById('customerFormShop')?.value.trim();
      const phoneRaw = document.getElementById('customerFormPhone')?.value.trim();
      const phone = toEnglishDigits(phoneRaw);
      const status = document.querySelector('input[name="customerStatus"]:checked')?.value || 'active';

      if (!nameFa) {
        DYF_Toast.show({ type: 'error', title: 'نام مشتری الزامی است', message: 'لطفاً نام و نام خانوادگی مشتری را وارد کنید.' });
        document.getElementById('customerFormNameFa')?.focus();
        return;
      }

      if (!phone || !phone.match(/^09\d{9}$/)) {
        DYF_Toast.show({ type: 'error', title: 'شماره تلفن نامعتبر', message: 'شماره تلفن همراه باید با ۰۹ شروع شده و ۱۱ رقم باشد.' });
        document.getElementById('customerFormPhone')?.focus();
        return;
      }

      if (mode === 'create') {
        const id = Date.now() % 100000;
        const existsPhone = this.customers.some((c) => c.phone === phone);
        if (existsPhone) {
          DYF_Toast.show({ type: 'error', title: 'شماره تکراری', message: 'مشتری دیگری با این شماره تلفن قبلاً در سامانه ثبت شده است.' });
          return;
        }

        const newCust = {
          id,
          nameFa,
          nameEn: nameFa,
          shop: shop || 'فروشگاه آزاد',
          phone,
          status,
          directAccess: {
            enabled: false,
            categories: ['کفش رسمی و اداری'],
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
          message: `پروفایل «${nameFa}» با موفقیت ایجاد گردید.`,
        });
      } else {
        const id = parseInt(formIdVal, 10);
        const cust = this.customers.find((c) => c.id === id);
        if (cust) {
          cust.nameFa = nameFa;
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
      const durValInput = document.getElementById('directAccessDurationValue');
      const durUnitSelect = document.getElementById('directAccessDurationUnit');
      const ddlValInput = document.getElementById('directAccessDeadlineValue');
      const ddlUnitSelect = document.getElementById('directAccessDeadlineUnit');

      if (toggle) toggle.checked = da.enabled;
      if (label) {
        label.textContent = da.enabled ? 'دسترسی فعال' : 'دسترسی غیرفعال';
        label.style.color = da.enabled ? 'var(--gold-primary)' : 'var(--text-muted)';
      }
      if (controls) {
        controls.style.opacity = da.enabled ? '1' : '0.45';
        controls.style.pointerEvents = da.enabled ? 'all' : 'none';
      }

      const parseTimeSetting = (str, defaultVal, defaultUnit) => {
        if (!str || str === 'unlimited' || str === 'none') {
          return { value: defaultVal, unit: str || defaultUnit };
        }
        const match = String(str).match(/^(\d+)([mhd])$/);
        if (match) {
          return { value: parseInt(match[1], 10), unit: match[2] };
        }
        return { value: defaultVal, unit: defaultUnit };
      };

      const dur = parseTimeSetting(da.duration, 15, 'm');
      if (durValInput) {
        durValInput.value = dur.value;
        durValInput.disabled = dur.unit === 'unlimited';
      }
      if (durUnitSelect) durUnitSelect.value = dur.unit;

      const ddl = parseTimeSetting(da.deadline, 3, 'd');
      if (ddlValInput) {
        ddlValInput.value = ddl.value;
        ddlValInput.disabled = ddl.unit === 'none';
      }
      if (ddlUnitSelect) ddlUnitSelect.value = ddl.unit;

      if (durUnitSelect && !durUnitSelect._hasChangeHandler) {
        durUnitSelect._hasChangeHandler = true;
        durUnitSelect.addEventListener('change', (e) => {
          if (durValInput) durValInput.disabled = e.target.value === 'unlimited';
        });
      }
      if (ddlUnitSelect && !ddlUnitSelect._hasChangeHandler) {
        ddlUnitSelect._hasChangeHandler = true;
        ddlUnitSelect.addEventListener('change', (e) => {
          if (ddlValInput) ddlValInput.disabled = e.target.value === 'none';
        });
      }

      // تعیین و همگام‌سازی قوانین و مدل‌های مجاز جاری برای این مشتری
      const allShoes = (window.ShoesController && window.ShoesController.models) || DEFAULT_SHOES;
      const publishedShoes = allShoes.filter((s) => s.status === 'published');
      const allCats = (window.CategoriesController && window.CategoriesController.categories) || DEFAULT_CATEGORIES;

      this.currentDirectAccessCategories = Array.isArray(da.categories)
        ? [...da.categories]
        : ['__uncategorized__', ...allCats.filter((c) => c.status === 'active').map((c) => c.name)];
      this.currentDirectAccessAddModels = Array.isArray(da.addModels) ? da.addModels.map(Number) : [];
      this.currentDirectAccessExcludeModels = Array.isArray(da.excludeModels) ? da.excludeModels.map(Number) : [];

      // محاسبه دقیق مدل‌های مجاز بر اساس فرمول کاتالوگ
      this.currentDirectAccessSelectedShoeIds = publishedShoes
        .filter((shoe) => {
          if (this.currentDirectAccessExcludeModels.includes(shoe.id)) return false;
          if (this.currentDirectAccessAddModels.includes(shoe.id)) return true;
          const shoeCats = shoe.categories || [];
          if (shoeCats.length === 0) return this.currentDirectAccessCategories.includes('__uncategorized__');
          return shoeCats.some((c) => this.currentDirectAccessCategories.includes(c));
        })
        .map((s) => s.id);

      this.updateDirectAccessProductsSummary();

      // دکمه باز کردن مودال دو‌بخشی انتخاب محصولات
      const openPickerBtn = document.getElementById('btnOpenProductPicker');
      if (openPickerBtn && !openPickerBtn._hasPickerHandler) {
        openPickerBtn._hasPickerHandler = true;
        openPickerBtn.addEventListener('click', () => {
          DYF_ProductPickerModal.open({
            categories: this.currentDirectAccessCategories,
            addModels: this.currentDirectAccessAddModels,
            excludeModels: this.currentDirectAccessExcludeModels,
            selectedShoeIds: this.currentDirectAccessSelectedShoeIds,
            onConfirm: (res) => {
              this.currentDirectAccessSelectedShoeIds = res.selectedShoeIds;
              this.currentDirectAccessCategories = res.categories;
              this.currentDirectAccessAddModels = res.addModels;
              this.currentDirectAccessExcludeModels = res.excludeModels;
              this.updateDirectAccessProductsSummary();
            },
          });
        });
      }

      DYF_Modal.open('modalCustomerDetails');
    },

    updateDirectAccessProductsSummary() {
      const badge = document.getElementById('custDirectProductsBadge');
      const catsSummary = document.getElementById('custDirectCategoriesSummary');
      const allShoes = (window.ShoesController && window.ShoesController.models) || DEFAULT_SHOES;
      const publishedShoes = allShoes.filter((s) => s.status === 'published');
      const allCats = (window.CategoriesController && window.CategoriesController.categories) || DEFAULT_CATEGORIES;

      const selectedIds = this.currentDirectAccessSelectedShoeIds || [];
      const cats = this.currentDirectAccessCategories || [];
      const adds = this.currentDirectAccessAddModels || [];
      const excludes = this.currentDirectAccessExcludeModels || [];

      if (badge) {
        badge.textContent = `${toPersianDigits(selectedIds.length)} مدل مجاز انتخاب شده (از ${toPersianDigits(publishedShoes.length)} مدل)`;
      }

      if (catsSummary) {
        const allowedCats = cats.filter((c) => c !== '__uncategorized__');
        const uncatAllowed = cats.includes('__uncategorized__');
        const parts = [];

        if (allowedCats.length === allCats.length && uncatAllowed) {
          parts.push('تمام دسته‌بندی‌ها (دسترسی کامل)');
        } else if (allowedCats.length > 0 || uncatAllowed) {
          const count = allowedCats.length + (uncatAllowed ? 1 : 0);
          parts.push(`${toPersianDigits(count)} دسته‌بندی مجاز`);
        } else {
          parts.push('بدون دسته‌بندی مجاز');
        }

        if (adds.length > 0) {
          parts.push(`${toPersianDigits(adds.length)} مدل افزوده`);
        }
        if (excludes.length > 0) {
          parts.push(`${toPersianDigits(excludes.length)} مدل مستثنا`);
        }

        catsSummary.textContent = parts.join(' • ');
      }
    },

    handleSaveDirectAccess() {
      const id = this.currentViewingCustomerId;
      const cust = this.customers.find((c) => c.id === id);
      if (!cust) return;

      const enabled = document.getElementById('directAccessToggle')?.checked || false;

      let duration = 'unlimited';
      const durUnit = document.getElementById('directAccessDurationUnit')?.value || 'unlimited';
      if (durUnit !== 'unlimited') {
        const val = parseInt(document.getElementById('directAccessDurationValue')?.value || '15', 10);
        duration = `${Math.max(1, isNaN(val) ? 15 : val)}${durUnit}`;
      }

      let deadline = 'none';
      const ddlUnit = document.getElementById('directAccessDeadlineUnit')?.value || 'none';
      if (ddlUnit !== 'none') {
        const val = parseInt(document.getElementById('directAccessDeadlineValue')?.value || '3', 10);
        deadline = `${Math.max(1, isNaN(val) ? 3 : val)}${ddlUnit}`;
      }

      cust.directAccess = {
        enabled,
        categories: this.currentDirectAccessCategories,
        addModels: this.currentDirectAccessAddModels,
        excludeModels: this.currentDirectAccessExcludeModels,
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

      if (elAll) elAll.textContent = allCount;
      if (elAct) elAct.textContent = activeCount;
      if (elInact) elInact.textContent = inactiveCount;

      // سایدبار
      const navCounter = document.querySelector('a[href="#customers"] .dyf-nav-counter');
      if (navCounter) navCounter.textContent = allCount;

      // داشبورد
      const dashStat = document.querySelectorAll('.dyf-stat-card .dyf-stat-value')[1];
      if (dashStat) dashStat.innerHTML = `${activeCount} <span>مشتری</span>`;
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

      return `
        <article class="dyf-customer-card" data-id="${cust.id}">
          <div class="dyf-customer-header">
            <div style="display: flex; align-items: center; gap: 0.85rem;">
              <div class="dyf-customer-avatar">${initials}</div>
              <div>
                <h3 class="dyf-customer-title">${cust.nameFa}</h3>
              </div>
            </div>
            <div>
              <span class="dyf-badge ${cust.status === 'active' ? 'dyf-badge-active' : 'dyf-badge-disabled'}">
                ${cust.status === 'active' ? 'فعال' : 'مسدود'}
              </span>
            </div>
          </div>

          <div class="dyf-customer-shop" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.25rem;">
            <div style="display: flex; align-items: center; gap: 0.4rem;">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
              <span>${cust.shop || 'فروشگاه آزاد'}</span>
            </div>
            <div style="font-family: var(--font-title); font-size: 0.85rem; font-weight: 700; color: var(--gold-light); direction: ltr;">
              ${cust.phone}
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
          <td>
            <div style="font-weight: 700; color: var(--text-ivory);">${cust.nameFa}</div>
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
  // ۱۱. ماژول مدیریت لینک‌های اختصاصی و ویزارد ۵ مرحله‌ای (Task 5: Access Links)
  // ==========================================================================
  const AccessLinksController = {
    links: [],
    searchQuery: '',
    selectedStatus: 'all', // 'all', 'active', 'pending', 'expired', 'deactivated'
    selectedAuth: 'all', // 'all', 'direct', 'otp'
    viewMode: 'table', // 'grid' or 'table'
    currentStep: 1,
    currentDetailLink: null,
    wizardDraft: {
      recipientType: 'existing',
      customerId: null,
      customer: '',
      recipientFa: '',
      recipientEn: '',
      phone: '',
      authType: 'direct',
      categories: [],
      addModels: [],
      excludeModels: [],
      startDeadline: '3d',
      viewingDuration: '15m',
    },

    init() {
      this.loadLinks();
      this.bindEvents();
      this.render();
      this.updateGlobalCounters();
    },

    formatDuration(dur) {
      if (!dur || dur === 'unlimited') return 'نامحدود';
      const map = {
        '10m': '۱۰ دقیقه',
        '15m': '۱۵ دقیقه',
        '30m': '۳۰ دقیقه',
        '60m': '۱ ساعت',
        '2h': '۲ ساعت',
        '1d': '۱ روز',
      };
      return map[dur] || dur;
    },

    formatDeadline(dl) {
      if (!dl || dl === 'unlimited') return 'نامحدود';
      const map = {
        '24h': '۲۴ ساعت',
        '48h': '۴۸ ساعت',
        '3d': '۳ روز',
        '7d': '۷ روز',
      };
      return map[dl] || dl;
    },

    loadLinks() {
      try {
        const saved = localStorage.getItem('dyf_admin_links_v1');
        if (saved) {
          this.links = JSON.parse(saved);
        } else {
          this.links = [...DEFAULT_ACCESS_LINKS];
          this.saveLinks(false);
        }
      } catch (e) {
        this.links = [...DEFAULT_ACCESS_LINKS];
      }
      if (this.links) {
        this.links.forEach((l) => {
          if (l.categories) {
            l.categories = l.categories.map((cat) => cat.replace(/^لاین\s+/, ''));
          }
        });
      }
    },

    saveLinks(showToast = true) {
      try {
        localStorage.setItem('dyf_admin_links_v1', JSON.stringify(this.links));
        this.updateGlobalCounters();
        if (showToast) {
          DYF_Toast.show({
            type: 'success',
            title: 'به‌روزرسانی لینک‌ها',
            message: 'تغییرات لینک‌های دسترسی اختصاصی با موفقیت ذخیره شد.',
          });
        }
      } catch (e) {
        console.error('Error saving links:', e);
      }
    },

    bindEvents() {
      // جست‌وجوی زنده
      const searchInput = document.getElementById('linkSearchInput');
      if (searchInput) {
        searchInput.addEventListener('input', (e) => {
          this.searchQuery = e.target.value.trim().toLowerCase();
          this.render();
        });
      }

      // فیلتر شیوه ورود
      const authFilter = document.getElementById('linkAuthFilter');
      if (authFilter) {
        authFilter.addEventListener('change', (e) => {
          this.selectedAuth = e.target.value;
          this.render();
        });
      }

      // فیلتر وضعیت
      document.querySelectorAll('[data-link-status]').forEach((tab) => {
        tab.addEventListener('click', () => {
          document.querySelectorAll('[data-link-status]').forEach((t) => t.classList.remove('is-active'));
          tab.classList.add('is-active');
          this.selectedStatus = tab.getAttribute('data-link-status') || 'all';
          this.render();
        });
      });

      // سوئیچ گرید / جدول
      const gridBtn = document.getElementById('linksViewGridBtn');
      const tableBtn = document.getElementById('linksViewTableBtn');
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

      // بازنشانی فیلترها
      const resetBtn = document.getElementById('resetLinkFiltersBtn');
      if (resetBtn) {
        resetBtn.addEventListener('click', () => {
          this.searchQuery = '';
          this.selectedStatus = 'all';
          this.selectedAuth = 'all';
          if (searchInput) searchInput.value = '';
          if (authFilter) authFilter.value = 'all';
          document.querySelectorAll('[data-link-status]').forEach((t) => {
            t.classList.toggle('is-active', t.getAttribute('data-link-status') === 'all');
          });
          this.render();
        });
      }

      // بازکردن ویزارد
      const openWizardBtn = document.getElementById('openCreateLinkWizardBtn');
      if (openWizardBtn) {
        openWizardBtn.addEventListener('click', () => this.openWizard());
      }

      // ذخیره فرم ویرایش لینک
      const saveEditBtn = document.getElementById('saveEditLinkBtn');
      if (saveEditBtn) {
        saveEditBtn.addEventListener('click', () => this.handleSaveEditLink());
      }

      // دکمه‌های ناوبری ویزارد
      const nextBtn = document.getElementById('wizardNextBtn');
      const prevBtn = document.getElementById('wizardPrevBtn');
      const genBtn = document.getElementById('wizardGenerateBtn');

      if (nextBtn) {
        nextBtn.addEventListener('click', () => this.handleWizardNext());
      }
      if (prevBtn) {
        prevBtn.addEventListener('click', () => this.goToStep(this.currentStep - 1));
      }
      if (genBtn) {
        genBtn.addEventListener('click', () => this.generateLink());
      }

      // کپی لینک صادرشده در ویزارد
      const copyGenBtn = document.getElementById('wizardCopyBtn');
      if (copyGenBtn) {
        copyGenBtn.addEventListener('click', () => {
          const url = document.getElementById('wizardGeneratedUrl')?.textContent;
          if (url) this.copyLinkToClipboard(url);
        });
      }

      // کپی در مودال جزئیات
      const detailsCopyBtn = document.getElementById('linkDetailsCopyBtn');
      if (detailsCopyBtn) {
        detailsCopyBtn.addEventListener('click', () => {
          if (this.currentDetailLink) {
            const fullUrl = this.getAbsoluteLinkUrl(this.currentDetailLink.token);
            this.copyLinkToClipboard(fullUrl);
          }
        });
      }
    },

    getAbsoluteLinkUrl(token) {
      const origin = window.location.origin;
      const pathname = window.location.pathname.replace(/admin\.html.*$/, '');
      return `${origin}${pathname}catalog.html?token=${token}`;
    },

    copyLinkToClipboard(url) {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(url).then(() => {
          DYF_Toast.show({
            type: 'success',
            title: 'کپی در کلیپ‌بورد',
            message: 'لینک در کلیپ‌بورد کپی شد',
          });
        }).catch(() => this.fallbackCopy(url));
      } else {
        this.fallbackCopy(url);
      }
    },

    fallbackCopy(text) {
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-9999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      try {
        document.execCommand('copy');
        DYF_Toast.show({
          type: 'success',
          title: 'کپی در کلیپ‌بورد',
          message: 'لینک در کلیپ‌بورد کپی شد',
        });
      } catch (err) {
        DYF_Toast.show({
          type: 'error',
          title: 'خطا در کپی',
          message: 'لطفاً نشانی لینک را به‌صورت دستی انتخاب و کپی فرمایید.',
        });
      }
      document.body.removeChild(textArea);
    },

    openWizard() {
      this.currentStep = 1;
      this.wizardDraft = {
        recipientFa: '',
        startDeadline: '3d',
        viewingDuration: '15m',
        categories: [],
        addModels: [],
        excludeModels: [],
        selectedShoeIds: [],
      };

      // بازیابی نمایش اصلی ویزارد
      const reviewBox = document.getElementById('wizardReviewBox');
      const successResult = document.getElementById('wizardSuccessResult');
      const footer = document.getElementById('wizardModalFooter');
      if (reviewBox) reviewBox.style.display = 'block';
      if (successResult) successResult.style.display = 'none';
      if (footer) footer.style.display = 'flex';

      const faInput = document.getElementById('wizardRecipientFa');
      if (faInput) faInput.value = '';

      // مقداردهی اولیه مدل‌های مجاز ویزارد (پیش‌فرض دسترسی کامل به همه مدل‌های منتشرشده)
      const allShoes = (window.ShoesController && window.ShoesController.models) || DEFAULT_SHOES;
      const publishedShoes = allShoes.filter((s) => s.status === 'published');
      const allCats = (window.CategoriesController && window.CategoriesController.categories) || DEFAULT_CATEGORIES;

      this.wizardDraft.categories = ['__uncategorized__', ...allCats.filter((c) => c.status === 'active').map((c) => c.name)];
      this.wizardDraft.addModels = [];
      this.wizardDraft.excludeModels = [];
      this.wizardDraft.selectedShoeIds = publishedShoes.map((s) => s.id);

      this.updateWizardProductsSummary();

      const openWizardPickerBtn = document.getElementById('btnOpenWizardProductPicker');
      if (openWizardPickerBtn && !openWizardPickerBtn._hasPickerHandler) {
        openWizardPickerBtn._hasPickerHandler = true;
        openWizardPickerBtn.addEventListener('click', () => {
          DYF_ProductPickerModal.open({
            categories: this.wizardDraft.categories,
            addModels: this.wizardDraft.addModels,
            excludeModels: this.wizardDraft.excludeModels,
            selectedShoeIds: this.wizardDraft.selectedShoeIds,
            onConfirm: (res) => {
              this.wizardDraft.selectedShoeIds = res.selectedShoeIds;
              this.wizardDraft.categories = res.categories;
              this.wizardDraft.addModels = res.addModels;
              this.wizardDraft.excludeModels = res.excludeModels;
              this.updateWizardProductsSummary();
            },
          });
        });
      }

      const dlSelect = document.getElementById('wizardStartDeadline');
      const durSelect = document.getElementById('wizardViewingDuration');
      if (dlSelect) dlSelect.value = '3d';
      if (durSelect) durSelect.value = '15m';

      this.goToStep(1);
      DYF_Modal.open('modalCreateLinkWizard');
      if (faInput) setTimeout(() => faInput.focus(), 200);
    },

    updateWizardProductsSummary() {
      const badge = document.getElementById('wizardProductsBadge');
      const catsSummary = document.getElementById('wizardCategoriesSummary');
      const allShoes = (window.ShoesController && window.ShoesController.models) || DEFAULT_SHOES;
      const publishedShoes = allShoes.filter((s) => s.status === 'published');
      const allCats = (window.CategoriesController && window.CategoriesController.categories) || DEFAULT_CATEGORIES;

      const selectedIds = this.wizardDraft.selectedShoeIds || [];
      const cats = this.wizardDraft.categories || [];
      const adds = this.wizardDraft.addModels || [];
      const excludes = this.wizardDraft.excludeModels || [];

      if (badge) {
        badge.textContent = `${toPersianDigits(selectedIds.length)} مدل مجاز انتخاب شده (از ${toPersianDigits(publishedShoes.length)} مدل)`;
      }

      if (catsSummary) {
        const allowedCats = cats.filter((c) => c !== '__uncategorized__');
        const uncatAllowed = cats.includes('__uncategorized__');
        const parts = [];

        if (allowedCats.length === allCats.length && uncatAllowed) {
          parts.push('تمام دسته‌بندی‌ها (دسترسی کامل)');
        } else if (allowedCats.length > 0 || uncatAllowed) {
          const count = allowedCats.length + (uncatAllowed ? 1 : 0);
          parts.push(`${toPersianDigits(count)} دسته‌بندی مجاز`);
        } else {
          parts.push('بدون دسته‌بندی مجاز');
        }

        if (adds.length > 0) {
          parts.push(`${toPersianDigits(adds.length)} مدل افزوده`);
        }
        if (excludes.length > 0) {
          parts.push(`${toPersianDigits(excludes.length)} مدل مستثنا`);
        }

        catsSummary.textContent = parts.join(' • ');
      }
    },

    handleWizardNext() {
      if (this.currentStep === 1) {
        const fa = document.getElementById('wizardRecipientFa')?.value.trim();
        if (!fa) {
          DYF_Toast.show({
            type: 'error',
            title: 'نام گیرنده الزامی است',
            message: 'لطفاً نام و نام خانوادگی گیرنده لینک را وارد فرمایید.',
          });
          document.getElementById('wizardRecipientFa')?.focus();
          return;
        }
        this.wizardDraft.recipientFa = fa;
        this.goToStep(2);
      } else if (this.currentStep === 2) {
        if (!this.wizardDraft.selectedShoeIds || !this.wizardDraft.selectedShoeIds.length) {
          DYF_Toast.show({
            type: 'error',
            title: 'حداقل یک محصول انتخاب شود',
            message: 'لطفاً حداقل یک مدل کفش برای نمایش در این لینک انتخاب فرمایید.',
          });
          return;
        }
        this.goToStep(3);
      } else if (this.currentStep === 3) {
        const dl = document.getElementById('wizardStartDeadline')?.value || '3d';
        const dur = document.getElementById('wizardViewingDuration')?.value || '15m';
        this.wizardDraft.startDeadline = dl;
        this.wizardDraft.viewingDuration = dur;

        this.renderWizardReview();
        this.goToStep(4);
      }
    },

    goToStep(step) {
      this.currentStep = step;

      // نوار مراحل ۴ گانه
      document.querySelectorAll('#linkWizardStepsBar .dyf-wizard-step').forEach((el) => {
        const s = parseInt(el.getAttribute('data-step'), 10);
        el.classList.toggle('is-active', s === step);
        el.classList.toggle('is-done', s < step);
      });

      // پنل‌های ویزارد (۱ تا ۴)
      document.querySelectorAll('#modalCreateLinkWizard .dyf-wizard-panel').forEach((panel, idx) => {
        panel.classList.toggle('is-active', idx + 1 === step);
      });

      const prevBtn = document.getElementById('wizardPrevBtn');
      const nextBtn = document.getElementById('wizardNextBtn');
      const genBtn = document.getElementById('wizardGenerateBtn');

      if (prevBtn) prevBtn.style.display = step > 1 ? 'block' : 'none';
      if (nextBtn) nextBtn.style.display = step < 4 ? 'block' : 'none';
      if (genBtn) genBtn.style.display = step === 4 ? 'flex' : 'none';
    },

    renderWizardReview() {
      const sumEl = document.getElementById('wizardSummaryDetails');
      if (!sumEl) return;

      const d = this.wizardDraft;
      const selectedCount = (d.selectedShoeIds || []).length;

      const deadlineLabels = {
        '24h': '۲۴ ساعت از زمان صدور',
        '3d': '۳ روز آینده',
        '7d': '۱ هفته آینده',
        '30d': '۱ ماه آینده',
        'unlimited': 'نامحدود (بدون انقضای ورود)',
      };

      const durationLabels = {
        '10m': '۱۰ دقیقه پس از اولین ورود',
        '15m': '۱۵ دقیقه پس از اولین ورود',
        '30m': '۳۰ دقیقه پس از اولین ورود',
        '2h': '۲ ساعت پس از اولین ورود',
        '24h': '۲۴ ساعت پس از اولین ورود',
        'unlimited': 'نامحدود (مشاهده دائم)',
      };

      sumEl.innerHTML = `
        <div style="display: flex; justify-content: space-between; border-bottom: 1px solid var(--border-subtle); padding-bottom: 0.5rem;">
          <span style="color: var(--text-dim);">نام گیرنده:</span>
          <span style="font-weight: 700; color: var(--gold-light);">${d.recipientFa}</span>
        </div>
        <div style="display: flex; justify-content: space-between; border-bottom: 1px solid var(--border-subtle); padding-bottom: 0.5rem;">
          <span style="color: var(--text-dim);">شیوه ورود:</span>
          <span class="dyf-badge dyf-badge-published">لینک مستقیم (ورود آنی بدون نیاز به پیامک)</span>
        </div>
        <div style="display: flex; justify-content: space-between; border-bottom: 1px solid var(--border-subtle); padding-bottom: 0.5rem;">
          <span style="color: var(--text-dim);">تعداد مدل‌های انتخابی:</span>
          <span style="font-weight: 800; color: #4cd964;">${toPersianDigits(selectedCount)} مدل کفش</span>
        </div>
        <div style="display: flex; justify-content: space-between; border-bottom: 1px solid var(--border-subtle); padding-bottom: 0.5rem;">
          <span style="color: var(--text-dim);">مهلت شروع دسترسی:</span>
          <span style="color: var(--gold-primary); font-weight: 600;">${deadlineLabels[d.startDeadline] || d.startDeadline}</span>
        </div>
        <div style="display: flex; justify-content: space-between;">
          <span style="color: var(--text-dim);">مدت مشاهده کاتالوگ:</span>
          <span style="color: var(--gold-light); font-weight: 700;">${durationLabels[d.viewingDuration] || d.viewingDuration}</span>
        </div>
      `;
    },

    generateLink() {
      const d = this.wizardDraft;
      const hex = Math.random().toString(36).substring(2, 6) + Math.random().toString(36).substring(2, 6);
      const token = hex.toLowerCase();
      const nextIdNum = 9080 + this.links.length + 1;
      const linkId = `LNK-${nextIdNum}`;

      const today = new Date();
      const createdDate = `${today.getFullYear()}/${today.getMonth() + 1}/${today.getDate()}`;

      const newLink = {
        id: linkId,
        token,
        recipientFa: d.recipientFa,
        recipientEn: '',
        customer: '',
        customerId: null,
        phone: '',
        authType: 'direct',
        categories: d.categories || [],
        addModels: d.addModels || [],
        excludeModels: d.excludeModels || [],
        startDeadline: d.startDeadline,
        viewingDuration: d.viewingDuration,
        createdAt: createdDate,
        status: 'active',
        reason: null,
        views: 0,
        url: `catalog.html?token=${token}`,
      };

      this.links.unshift(newLink);
      this.saveLinks(false);
      this.render();

      const reviewBox = document.getElementById('wizardReviewBox');
      const successResult = document.getElementById('wizardSuccessResult');
      const footer = document.getElementById('wizardModalFooter');
      const urlText = document.getElementById('wizardGeneratedUrl');
      const testLink = document.getElementById('wizardOpenTestLink');

      const absoluteUrl = this.getAbsoluteLinkUrl(token);

      if (reviewBox) reviewBox.style.display = 'none';
      if (successResult) successResult.style.display = 'block';
      if (footer) footer.style.display = 'none';
      if (urlText) urlText.textContent = absoluteUrl;
      if (testLink) testLink.href = `catalog.html?token=${token}`;

      DYF_Toast.show({
        type: 'success',
        title: 'لینک صادر شد',
        message: `لینک اختصاصی ${linkId} با موفقیت ایجاد گردید.`,
      });
    },

    openEditModal(id) {
      const link = this.links.find((l) => l.id === id);
      if (!link) return;

      this.currentEditingLinkId = id;

      const titleEl = document.getElementById('editLinkModalTitle');
      const idInput = document.getElementById('editLinkId');
      const nameInput = document.getElementById('editLinkRecipientFa');
      const startDl = document.getElementById('editLinkStartDeadline');
      const viewDur = document.getElementById('editLinkViewingDuration');

      if (titleEl) titleEl.textContent = `ویرایش لینک اختصاصی (${link.id})`;
      if (idInput) idInput.value = link.id;
      if (nameInput) nameInput.value = link.recipientFa || '';
      if (startDl) startDl.value = link.startDeadline || '3d';
      if (viewDur) viewDur.value = link.viewingDuration || '15m';

      // مقداردهی و همگام‌سازی مدل‌های مجاز لینک
      const allShoes = (window.ShoesController && window.ShoesController.models) || DEFAULT_SHOES;
      const publishedShoes = allShoes.filter((s) => s.status === 'published');
      const allCats = (window.CategoriesController && window.CategoriesController.categories) || DEFAULT_CATEGORIES;

      this.currentEditLinkCategories = Array.isArray(link.categories)
        ? [...link.categories]
        : ['__uncategorized__', ...allCats.filter((c) => c.status === 'active').map((c) => c.name)];
      this.currentEditLinkAddModels = Array.isArray(link.addModels) ? link.addModels.map(Number) : [];
      this.currentEditLinkExcludeModels = Array.isArray(link.excludeModels) ? link.excludeModels.map(Number) : [];

      this.currentEditLinkSelectedShoeIds = publishedShoes
        .filter((shoe) => {
          if (this.currentEditLinkExcludeModels.includes(shoe.id)) return false;
          if (this.currentEditLinkAddModels.includes(shoe.id)) return true;
          const shoeCats = shoe.categories || [];
          if (shoeCats.length === 0) return this.currentEditLinkCategories.includes('__uncategorized__');
          return shoeCats.some((c) => this.currentEditLinkCategories.includes(c));
        })
        .map((s) => s.id);

      this.updateEditLinkProductsSummary();

      // دکمه باز کردن مودال دو‌بخشی انتخاب محصولات در ویرایش لینک
      const openEditPickerBtn = document.getElementById('btnOpenEditLinkProductPicker');
      if (openEditPickerBtn && !openEditPickerBtn._hasPickerHandler) {
        openEditPickerBtn._hasPickerHandler = true;
        openEditPickerBtn.addEventListener('click', () => {
          DYF_ProductPickerModal.open({
            categories: this.currentEditLinkCategories,
            addModels: this.currentEditLinkAddModels,
            excludeModels: this.currentEditLinkExcludeModels,
            selectedShoeIds: this.currentEditLinkSelectedShoeIds,
            onConfirm: (res) => {
              this.currentEditLinkSelectedShoeIds = res.selectedShoeIds;
              this.currentEditLinkCategories = res.categories;
              this.currentEditLinkAddModels = res.addModels;
              this.currentEditLinkExcludeModels = res.excludeModels;
              this.updateEditLinkProductsSummary();
            },
          });
        });
      }

      DYF_Modal.open('modalEditLink');
    },

    updateEditLinkProductsSummary() {
      const badge = document.getElementById('editLinkProductsBadge');
      const catsSummary = document.getElementById('editLinkCategoriesSummary');
      const allShoes = (window.ShoesController && window.ShoesController.models) || DEFAULT_SHOES;
      const publishedShoes = allShoes.filter((s) => s.status === 'published');
      const allCats = (window.CategoriesController && window.CategoriesController.categories) || DEFAULT_CATEGORIES;

      const selectedIds = this.currentEditLinkSelectedShoeIds || [];
      const cats = this.currentEditLinkCategories || [];
      const adds = this.currentEditLinkAddModels || [];
      const excludes = this.currentEditLinkExcludeModels || [];

      if (badge) {
        badge.textContent = `${toPersianDigits(selectedIds.length)} مدل مجاز انتخاب شده (از ${toPersianDigits(publishedShoes.length)} مدل)`;
      }

      if (catsSummary) {
        const allowedCats = cats.filter((c) => c !== '__uncategorized__');
        const uncatAllowed = cats.includes('__uncategorized__');
        const parts = [];

        if (allowedCats.length === allCats.length && uncatAllowed) {
          parts.push('تمام دسته‌بندی‌ها (دسترسی کامل)');
        } else if (allowedCats.length > 0 || uncatAllowed) {
          const count = allowedCats.length + (uncatAllowed ? 1 : 0);
          parts.push(`${toPersianDigits(count)} دسته‌بندی مجاز`);
        } else {
          parts.push('بدون دسته‌بندی مجاز');
        }

        if (adds.length > 0) {
          parts.push(`${toPersianDigits(adds.length)} مدل افزوده`);
        }
        if (excludes.length > 0) {
          parts.push(`${toPersianDigits(excludes.length)} مدل مستثنا`);
        }

        catsSummary.textContent = parts.join(' • ');
      }
    },

    handleSaveEditLink() {
      const id = this.currentEditingLinkId || document.getElementById('editLinkId')?.value;
      const link = this.links.find((l) => l.id === id);
      if (!link) return;

      const nameFa = document.getElementById('editLinkRecipientFa')?.value.trim();
      if (!nameFa) {
        DYF_Toast.show({
          type: 'error',
          title: 'نام گیرنده الزامی است',
          message: 'لطفاً نام گیرنده را وارد فرمایید.',
        });
        document.getElementById('editLinkRecipientFa')?.focus();
        return;
      }

      if (!this.currentEditLinkSelectedShoeIds || !this.currentEditLinkSelectedShoeIds.length) {
        DYF_Toast.show({
          type: 'error',
          title: 'حداقل یک محصول انتخاب شود',
          message: 'لطفاً حداقل یک مدل کفش برای نمایش در این لینک انتخاب کنید.',
        });
        return;
      }

      const startDl = document.getElementById('editLinkStartDeadline')?.value || '3d';
      const viewDur = document.getElementById('editLinkViewingDuration')?.value || '15m';

      link.recipientFa = nameFa;
      link.startDeadline = startDl;
      link.viewingDuration = viewDur;
      link.categories = this.currentEditLinkCategories;
      link.addModels = this.currentEditLinkAddModels;
      link.excludeModels = this.currentEditLinkExcludeModels;

      this.saveLinks();
      this.render();
      DYF_Modal.close('modalEditLink');

      DYF_Toast.show({
        type: 'success',
        title: 'ویرایش انجام شد',
        message: `تغییرات لینک ${link.id} با موفقیت ذخیره گردید.`,
      });
    },

    openDetailsModal(id) {
      const link = this.links.find((l) => l.id === id);
      if (!link) return;

      this.currentDetailLink = link;

      const titleEl = document.getElementById('linkDetailsModalTitle');
      const subEl = document.getElementById('linkDetailsModalSubtitle');
      const bodyEl = document.getElementById('linkDetailsBody');

      if (titleEl) titleEl.textContent = `جزئیات لینک اختصاصی (${link.id})`;
      if (subEl) subEl.textContent = `توکن ورود: ${link.token} | دسترسی مستقیم`;

      const absoluteUrl = this.getAbsoluteLinkUrl(link.token);
      const allShoes = (window.ShoesController && window.ShoesController.models) || DEFAULT_SHOES;
      const publishedShoes = allShoes.filter((s) => s.status === 'published');

      const matchingShoes = publishedShoes.filter((shoe) => {
        if ((link.excludeModels || []).includes(shoe.id)) return false;
        if ((link.addModels || []).includes(shoe.id)) return true;
        return (shoe.categories || []).some((c) => (link.categories || []).includes(c));
      });

      if (bodyEl) {
        bodyEl.innerHTML = `
          <!-- هدر لینک و وضعیت -->
          <div class="dyf-link-details-summary" style="background: var(--bg-surface-elevated); border: 1px solid var(--border-subtle); border-radius: var(--r-md); padding: 1.25rem; margin-bottom: 1.25rem; display: flex; justify-content: space-between; align-items: center;">
            <div>
              <div style="font-size: 1.15rem; font-weight: 800; color: var(--text-ivory); margin-bottom: 0.25rem;">
                ${link.recipientFa}
              </div>
              <div style="font-size: 0.78rem; color: var(--gold-light);">
                شناسه سیستمی: ${link.id}
              </div>
            </div>
            <div style="text-align: left;">
              <span class="dyf-badge ${
                link.status === 'active'
                  ? 'dyf-badge-active'
                  : link.status === 'pending'
                  ? 'dyf-badge-pending'
                  : link.status === 'expired'
                  ? 'dyf-badge-archived'
                  : 'dyf-badge-disabled'
              }">
                ${
                  link.status === 'active'
                    ? 'فعال و آماده ورود'
                    : link.status === 'pending'
                    ? 'در انتظار ورود خریدار'
                    : link.status === 'expired'
                    ? 'منقضی‌شده'
                    : 'غیرفعال توسط مدیر'
                }
              </span>
            </div>
          </div>

          <!-- جعبه نشانی URL و توکن -->
          <div class="dyf-link-url-box" style="padding: 0.75rem 1rem; margin-bottom: 1.25rem;">
            <span class="dyf-link-url-text" style="font-size: 0.8rem;">${absoluteUrl}</span>
            <button type="button" class="dyf-btn dyf-btn-primary dyf-btn-sm js-copy-url" data-url="${absoluteUrl}">
              <span>کپی نشانی</span>
            </button>
          </div>

          <!-- متاداده و تنظیمات -->
          <div class="dyf-link-meta-grid" style="margin-bottom: 1.25rem;">
            <div class="dyf-link-meta-item">
              <span style="color: var(--text-dim);">مهلت شروع دسترسی:</span>
              <span style="color: var(--gold-primary); font-weight: 600;">${this.formatDeadline(link.startDeadline)}</span>
            </div>
            <div class="dyf-link-meta-item">
              <span style="color: var(--text-dim);">مدت زمان مشاهده:</span>
              <span style="color: var(--gold-light); font-weight: 700;">${this.formatDuration(link.viewingDuration)}</span>
            </div>
            <div class="dyf-link-meta-item">
              <span style="color: var(--text-dim);">تاریخ صدور لینک:</span>
              <span style="direction: ltr; text-align: right;">${link.createdAt}</span>
            </div>
            <div class="dyf-link-meta-item">
              <span style="color: var(--text-dim);">تعداد مدل‌های در دسترس:</span>
              <span style="font-weight: 800; color: #4cd964;">${matchingShoes.length} مدل کفش</span>
            </div>
          </div>

          <!-- محصولات مجاز -->
          <div style="background: rgba(36, 30, 25, 0.4); border: 1px solid var(--border-subtle); border-radius: var(--r-sm); padding: 1rem; font-size: 0.8rem; margin-bottom: 1.25rem;">
            <div style="font-weight: 700; color: var(--gold-light); margin-bottom: 0.35rem;">محصولات مجاز:</div>
            <div style="color: var(--text-muted); margin-bottom: 0.3rem;">
              دسته‌بندی‌ها: <strong>${(link.categories || []).join('، ') || 'هیچ'}</strong>
            </div>
            <div style="color: var(--text-dim); font-size: 0.74rem;">
              تعداد مدل‌های اختصاصی: ${(link.addModels || []).length} مدل
            </div>
          </div>

          ${
            link.reason
              ? `
              <div style="padding: 0.75rem 1rem; background: rgba(224, 86, 74, 0.1); border: 1px solid rgba(224, 86, 74, 0.3); border-radius: var(--r-sm); font-size: 0.78rem; color: var(--status-danger); margin-bottom: 1rem;">
                ⚠️ <strong>علت وضعیت:</strong> ${link.reason}
              </div>
            `
              : ''
          }

          <div style="display: flex; gap: 0.75rem; flex-wrap: wrap;">
            <button type="button" class="dyf-btn dyf-btn-primary dyf-btn-sm js-modal-edit-btn" style="flex: 1; justify-content: center;">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/></svg>
              <span>ویرایش مشخصات و محصولات لینک</span>
            </button>
            <a href="catalog.html?token=${link.token}" target="_blank" class="dyf-btn dyf-btn-specular dyf-btn-sm" style="flex: 1; justify-content: center;">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" x2="21" y1="14" y2="3"/></svg>
              <span>مشاهده و تست ورود کاتالوگ</span>
            </a>
          </div>
        `;

        bodyEl.querySelector('.js-copy-url')?.addEventListener('click', () => {
          this.copyLinkToClipboard(absoluteUrl);
        });

        bodyEl.querySelector('.js-modal-edit-btn')?.addEventListener('click', () => {
          DYF_Modal.close('modalLinkDetails');
          this.openEditModal(link.id);
        });
      }

      DYF_Modal.open('modalLinkDetails');
    },

    changeStatus(id, action) {
      const link = this.links.find((l) => l.id === id);
      if (!link) return;

      if (action === 'deactivate') {
        DYF_Modal.confirm({
          title: 'غیرفعال‌سازی لینک اختصاصی',
          message: `
            آیا از غیرفعال‌سازی لینک <strong>«${link.id}»</strong> متعلق به <strong>«${link.recipientFa}»</strong> اطمینان دارید؟<br><br>
            <div style=\"background: rgba(36, 30, 25, 0.6); padding: 0.85rem; border-radius: var(--r-sm); font-size: 0.82rem; color: var(--leather-caramel); line-height: 1.5;\">
              💡 <strong>استقلال لینک‌ها:</strong> این اقدام صرفاً همین لینک موقت را باطل می‌کند. سایر لینک‌های این مشتری یا دسترسی مستقیم او فعال باقی خواهند ماند.
            </div>
          `,
          confirmText: 'غیرفعال‌سازی لینک',
          cancelText: 'انصراف',
          onConfirm: () => {
            link.status = 'deactivated';
            link.reason = 'توسط مدیر غیرفعال شد';
            this.saveLinks();
            this.render();
            DYF_Toast.show({
              type: 'info',
              title: 'لینک غیرفعال شد',
              message: `لینک ${link.id} مسدود گردید و امکان ورود با توکن آن وجود ندارد.`,
            });
          },
        });
      } else if (action === 'activate') {
        DYF_Modal.confirm({
          title: 'فعال‌سازی مجدد لینک',
          message: `
            آیا از فعال‌سازی مجدد لینک <strong>«${link.id}»</strong> اطمینان دارید؟<br><br>
            <div style=\"background: rgba(36, 30, 25, 0.6); padding: 0.85rem; border-radius: var(--r-sm); font-size: 0.82rem; color: #4cd964; line-height: 1.5;\">
              ⚠️ <strong>توجه امنیتی:</strong> با تایید شما، توکن قبلی مجدداً قابل استفاده خواهد شد و دارنده لینک قادر به مشاهده کاتالوگ خواهد بود.
            </div>
          `,
          confirmText: 'فعال‌سازی مجدد',
          cancelText: 'انصراف',
          onConfirm: () => {
            link.status = 'active';
            link.reason = null;
            this.saveLinks();
            this.render();
            DYF_Toast.show({
              type: 'success',
              title: 'لینک فعال شد',
              message: `لینک ${link.id} مجدداً در دسترس قرار گرفت.`,
            });
          },
        });
      }
    },

    updateGlobalCounters() {
      const allCount = this.links.length;
      const activeCount = this.links.filter((l) => l.status === 'active').length;
      const pendingCount = this.links.filter((l) => l.status === 'pending').length;
      const expiredCount = this.links.filter((l) => l.status === 'expired' || l.status === 'deactivated').length;

      const elAll = document.getElementById('countAllLinks');
      const elAct = document.getElementById('countActiveLinks');
      const elPen = document.getElementById('countPendingLinks');
      const elExp = document.getElementById('countExpiredLinks');

      if (elAll) elAll.textContent = allCount;
      if (elAct) elAct.textContent = activeCount;
      if (elPen) elPen.textContent = pendingCount;
      if (elExp) elExp.textContent = expiredCount;

      // سایدبار
      const navCounter = document.querySelector('a[href=\"#access-links\"] .dyf-nav-counter');
      if (navCounter) navCounter.textContent = activeCount;

      // داشبورد کارت لینک‌ها
      const dashStat = document.querySelectorAll('.dyf-stat-card .dyf-stat-value')[2];
      if (dashStat) dashStat.innerHTML = `${activeCount} <span>لینک</span>`;
    },

    getFilteredLinks() {
      return this.links.filter((l) => {
        if (this.searchQuery) {
          const matchFa = (l.recipientFa || '').toLowerCase().includes(this.searchQuery);
          const matchToken = (l.token || '').toLowerCase().includes(this.searchQuery);
          const matchId = (l.id || '').toLowerCase().includes(this.searchQuery);
          if (!matchFa && !matchToken && !matchId) return false;
        }

        if (this.selectedStatus !== 'all') {
          if (this.selectedStatus === 'expired') {
            if (l.status !== 'expired' && l.status !== 'deactivated') return false;
          } else if (l.status !== this.selectedStatus) {
            return false;
          }
        }

        return true;
      });
    },

    render() {
      const filtered = this.getFilteredLinks();
      const gridContainer = document.getElementById('linksGridContainer');
      const tableContainer = document.getElementById('linksTableContainer');
      const tableBody = document.getElementById('linksTableBody');
      const emptyState = document.getElementById('linksEmptyState');

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
          gridContainer.innerHTML = filtered.map((l) => this.renderCardHtml(l)).join('');
          this.bindCardActions(gridContainer);
        }
      } else {
        if (gridContainer) gridContainer.style.display = 'none';
        if (tableContainer && tableBody) {
          tableContainer.style.display = 'block';
          tableBody.innerHTML = filtered.map((l) => this.renderTableRowHtml(l)).join('');
          this.bindCardActions(tableBody);
        }
      }
    },

    renderCardHtml(link) {
      const fullUrl = this.getAbsoluteLinkUrl(link.token);

      const statusBadge =
        link.status === 'active'
          ? '<span class="dyf-badge dyf-badge-active">فعال</span>'
          : link.status === 'pending'
          ? '<span class="dyf-badge dyf-badge-pending">در انتظار</span>'
          : link.status === 'expired'
          ? '<span class="dyf-badge dyf-badge-archived">منقضی</span>'
          : '<span class="dyf-badge dyf-badge-disabled">غیرفعال</span>';

      return `
        <article class="dyf-link-card" data-id="${link.id}">
          <div class="dyf-link-header">
            <div>
              <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.25rem;">
                <span style="font-family: var(--font-title); font-weight: 800; color: var(--gold-light); font-size: 0.92rem; direction: ltr;">${link.id}</span>
              </div>
              <h3 style="font-family: var(--font-title); font-size: 1.05rem; font-weight: 800; color: var(--text-ivory);">${link.recipientFa}</h3>
            </div>
            <div>${statusBadge}</div>
          </div>

          <div class="dyf-link-url-box">
            <span class="dyf-link-url-text">token=${link.token}</span>
            <button type="button" class="dyf-btn dyf-btn-outline dyf-btn-sm js-copy-link" data-url="${fullUrl}" title="کپی لینک">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
              <span>کپی</span>
            </button>
          </div>

          <div class="dyf-link-meta-grid">
            <div class="dyf-link-meta-item">
              <span style="color: var(--text-dim); font-size: 0.7rem;">مهلت شروع:</span>
              <span style="color: var(--gold-primary); font-weight: 600;">${this.formatDeadline(link.startDeadline)}</span>
            </div>
            <div class="dyf-link-meta-item">
              <span style="color: var(--text-dim); font-size: 0.7rem;">مدت مشاهده:</span>
              <span style="color: var(--gold-light); font-weight: 600;">${this.formatDuration(link.viewingDuration)}</span>
            </div>
            <div class="dyf-link-meta-item">
              <span style="color: var(--text-dim); font-size: 0.7rem;">تعداد مدل‌ها:</span>
              <span style="color: #4cd964; font-weight: 700;">${(link.addModels || []).length || 'اختصاصی'} مدل</span>
            </div>
            <div class="dyf-link-meta-item">
              <span style="color: var(--text-dim); font-size: 0.7rem;">تعداد ورود:</span>
              <span style="color: var(--text-muted); font-family: var(--font-title);">${link.views} مرتبه</span>
            </div>
          </div>

          <div class="dyf-link-actions-footer" style="display: flex; align-items: center; justify-content: space-between; gap: 0.5rem; padding-top: 1rem; border-top: 1px solid var(--border-subtle); margin-top: auto;">
            <div style="display: flex; gap: 0.35rem;">
              <button type="button" class="dyf-btn dyf-btn-primary dyf-btn-sm js-view-link" data-id="${link.id}">
                <span>جزئیات</span>
              </button>
              <button type="button" class="dyf-btn dyf-btn-outline dyf-btn-sm js-edit-link" data-id="${link.id}">
                <span>ویرایش</span>
              </button>
            </div>
            <div>
              ${
                link.status === 'active' || link.status === 'pending'
                  ? `<button type="button" class="dyf-btn dyf-btn-outline dyf-btn-sm js-status-link" data-id="${link.id}" data-action="deactivate" style="color: var(--status-danger); border-color: rgba(224, 86, 74, 0.35);">ابطال لینک</button>`
                  : `<button type="button" class="dyf-btn dyf-btn-outline dyf-btn-sm js-status-link" data-id="${link.id}" data-action="activate" style="color: #4cd964; border-color: rgba(76, 217, 100, 0.35);">فعال‌سازی</button>`
              }
            </div>
          </div>
        </article>
      `;
    },

    renderTableRowHtml(link) {
      const fullUrl = this.getAbsoluteLinkUrl(link.token);

      const statusBadge =
        link.status === 'active'
          ? '<span class="dyf-badge dyf-badge-active">فعال</span>'
          : link.status === 'pending'
          ? '<span class="dyf-badge dyf-badge-pending">در انتظار</span>'
          : link.status === 'expired'
          ? '<span class="dyf-badge dyf-badge-archived">منقضی</span>'
          : '<span class="dyf-badge dyf-badge-disabled">غیرفعال</span>';

      return `
        <tr data-id="${link.id}">
          <td>
            <div style="font-family: var(--font-title); font-weight: 700; color: var(--gold-light); direction: ltr; text-align: right;">${link.id}</div>
            <div style="font-family: var(--font-title); font-size: 0.72rem; color: var(--text-dim); direction: ltr; text-align: right;">token: ${link.token}</div>
          </td>
          <td>
            <div style="font-weight: 700; color: var(--text-ivory);">${link.recipientFa}</div>
          </td>
          <td class="dyf-col-deadline" style="font-size: 0.8rem; color: var(--gold-primary); font-weight: 600;">${this.formatDeadline(link.startDeadline)}</td>
          <td class="dyf-col-duration" style="font-size: 0.8rem; color: var(--gold-light); font-weight: 600;">${this.formatDuration(link.viewingDuration)}</td>
          <td>${statusBadge}</td>
          <td>
            <div class="dyf-table-actions">
              <button type="button" class="dyf-btn dyf-btn-primary dyf-btn-sm js-view-link" data-id="${link.id}">جزئیات</button>
              <button type="button" class="dyf-btn dyf-btn-outline dyf-btn-sm js-edit-link" data-id="${link.id}">ویرایش</button>
              <button type="button" class="dyf-btn dyf-btn-outline dyf-btn-sm js-copy-link" data-url="${fullUrl}">کپی</button>
              ${
                link.status === 'active' || link.status === 'pending'
                  ? `<button type="button" class="dyf-btn dyf-btn-outline dyf-btn-sm js-status-link" data-id="${link.id}" data-action="deactivate" style="color: var(--status-danger);">ابطال</button>`
                  : `<button type="button" class="dyf-btn dyf-btn-outline dyf-btn-sm js-status-link" data-id="${link.id}" data-action="activate" style="color: #4cd964;">فعال‌سازی</button>`
              }
            </div>
          </td>
        </tr>
      `;
    },

    bindCardActions(container) {
      container.querySelectorAll('.js-copy-link').forEach((btn) => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          const url = btn.getAttribute('data-url');
          if (url) this.copyLinkToClipboard(url);
        });
      });

      container.querySelectorAll('.js-view-link').forEach((btn) => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          const id = btn.getAttribute('data-id');
          this.openDetailsModal(id);
        });
      });

      container.querySelectorAll('.js-edit-link').forEach((btn) => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          const id = btn.getAttribute('data-id');
          this.openEditModal(id);
        });
      });

      container.querySelectorAll('.js-status-link').forEach((btn) => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          const id = btn.getAttribute('data-id');
          const action = btn.getAttribute('data-action');
          this.changeStatus(id, action);
        });
      });
    },
  };

  window.AccessLinksController = AccessLinksController;

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
    AccessLinksController.init();
    ComponentDemoController.init();
  });
})();
