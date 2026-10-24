-- Clean up tables safely
TRUNCATE "accessLinks", "shoeModels", "categories", "otpVerifications" CASCADE;

-- 1. Admin User
INSERT INTO "adminUsers" ("ID", "firstName", "lastName", "phoneNumber", "isActive")
VALUES (1, 'مهدی', 'مالوندی', '09929972390', true)
ON CONFLICT ("phoneNumber") DO UPDATE 
SET "firstName" = 'مهدی', "lastName" = 'مالوندی', "isActive" = true;

-- 2. Known Active OTP for 09929972390
INSERT INTO "otpVerifications" ("ID", "phoneNumber", "code", "purpose", "expiresAt", "isUsed", "attempts")
VALUES (CAST(EXTRACT(EPOCH FROM NOW()) * 1000000000 AS BIGINT), '09929972390', '12345', 'ADMIN_LOGIN', CAST(EXTRACT(EPOCH FROM NOW()) + 31536000 AS BIGINT), false, 0);

-- 3. Categories
INSERT INTO "categories" ("ID", "title") VALUES
(1, 'کفش رسمی و اداری'),
(2, 'کفش اسپرت و کژوال'),
(3, 'چرم لوکس دست‌دوز'),
(4, 'نیم‌بوت و پوتین کلاسیک'),
(5, 'اکسسوری و کیف سراجی')
ON CONFLICT ("ID") DO UPDATE SET "title" = EXCLUDED."title";

-- 4. Customers
INSERT INTO "customers" ("ID", "firstNameFa", "lastNameFa", "firstNameEn", "lastNameEn", "storeName", "phoneNumber", "isActive")
VALUES 
(1, 'مهدی', 'مالوندی', 'Mehdi', 'Malvandi', 'دفتر مرکزی DYF', '09929972390', true),
(2, 'حاج مصطفی', 'کمالی', 'Mostafa', 'Kamali', 'بازرگانی چرم کمالی', '09121112233', true),
(3, 'مهندس امید', 'شمس', 'Omid', 'Shams', 'فروشگاه‌های زنجیره‌ای سپهر', '09142223344', true),
(4, 'سپهر', 'نوری‌زاده', 'Sepehr', 'Nourizadeh', 'بوتیک‌های چرم پارسیان', '09173334455', true)
ON CONFLICT ("phoneNumber") DO UPDATE SET "isActive" = true;

-- 5. Shoe Models
INSERT INTO "shoeModels" ("ID", "shoeTitle", "description", "coverImage", "colors", "sizes", "images", "videos", "categoryIDs") VALUES
(101, 'کفش رسمی آکسفورد تمام‌چرم دست‌دوز تبریز', 'رویه تمام چرم گاوی دباغی گیاهی درجه یک تبریز، آستر چرم بزی طبیعی ضدتعریق، زیره دایکست میکرولایت با پرداخت واکس دست‌ساز سراجی.', 'assets/images/shoes.jpeg', '["مشکی زغالی", "قهوه‌ای سوخته"]'::jsonb, '[40, 41, 42, 43, 44]'::jsonb, '["assets/images/shoes.jpeg", "assets/images/bag.jpeg", "assets/images/bag2.jpeg"]'::jsonb, '[]'::jsonb, '[1, 3]'::jsonb),
(102, 'اسنیکر چرم کژوال دیفندر سری اسپرت', 'طراحی ارگونومیک برای ساعات طولانی پیاده‌روی، زیره سبک ترمو با گریپ ضدلغزش، کفی طبی تزریق فوم سرد با روکش چرم طبیعی.', 'assets/images/craft-sport.jpg', '["عسلی کاراملی", "سفید عاجی"]'::jsonb, '[40, 41, 42, 43, 44, 45]'::jsonb, '["assets/images/craft-sport.jpg", "assets/images/bag2.jpeg"]'::jsonb, '[]'::jsonb, '[2]'::jsonb),
(103, 'نیم‌بوت چلسی چرم گاوی هورس واکس', 'قالب اختصاصی کلاسیک تبریز با کش دوبل کشسانی بالا، دوخت سراجی تقویت‌شده و پاشنه چرم طبیعی لایه‌ای مناسب جلسات رسمی.', 'assets/images/craft-formal.jpeg', '["مشکی مات", "عسلی روغنی"]'::jsonb, '[40, 41, 42, 43]'::jsonb, '["assets/images/craft-formal.jpeg", "assets/images/shoes.jpeg"]'::jsonb, '[]'::jsonb, '[1, 3, 4]'::jsonb),
(104, 'کفش دربی کلاسیک پنجه ارگونومیک', 'نمونه بهینه‌سازی‌شده کارگاه؛ فرم سرپنجه متناسب با پای پهن با آستر آنتی‌باکتریال و زیره چرمی منعطف.', 'assets/images/shoes.jpeg', '["قهوه‌ای هاوانا", "مشکی"]'::jsonb, '[41, 42, 43, 44, 45]'::jsonb, '["assets/images/shoes.jpeg"]'::jsonb, '[]'::jsonb, '[1]'::jsonb),
(105, 'لوفر اشبالت دست‌ساز ادیشن تابستانه', 'طراحی بدون بند راحت با زیره ژله‌ای سبک و رویه جیر طبیعی مقاوم در برابر رطوبت و تعریق تابستانه.', 'assets/images/craft-sport.jpg', '["خاکی بژ", "سرمه‌ای کلاسیک"]'::jsonb, '[39, 40, 41, 42, 43]'::jsonb, '["assets/images/craft-sport.jpg"]'::jsonb, '[]'::jsonb, '[2, 3]'::jsonb),
(106, 'پوتین سربازی کلاسیک چرم سنگین کانتری', 'چرم ضخیم ۲.۲ میلی‌متری با دوخت سه‌ردیفه نایلونی مقاوم در برابر کشش، سرپنجه سخت تقویت‌شده و زیره عاج‌دار یخ‌شکن.', 'assets/images/craft-formal.jpeg', '["مشکی واکس‌خورده"]'::jsonb, '[41, 42, 43, 44, 45]'::jsonb, '["assets/images/craft-formal.jpeg"]'::jsonb, '[]'::jsonb, '[4]'::jsonb),
(107, 'کفش مانک‌استرپ دوتکه سگک‌دار ایتالیایی', 'رویه چرم بارانی شاین با پرداخت دستی لبه‌ها، سگک‌های استیل ضدزنگ و کفی مموری فوم پرکننده گودی پا.', 'assets/images/shoes.jpeg', '["عنابی تیره", "مشکی براق"]'::jsonb, '[40, 41, 42, 43, 44]'::jsonb, '["assets/images/shoes.jpeg"]'::jsonb, '[]'::jsonb, '[1, 3]'::jsonb),
(108, 'اسلیپر چرم طبیعی خانگی و دفتری VIP', 'کفش راحتی سبک با پاشنه نرم و زیره کائوچوی بی‌صدا برای محیط‌های اداری و استراحت مدیران ارشد.', 'assets/images/craft-sport.jpg', '["قهوه‌ای موکا", "مشکی"]'::jsonb, '[40, 41, 42, 43, 44]'::jsonb, '["assets/images/craft-sport.jpg"]'::jsonb, '[]'::jsonb, '[2]'::jsonb),
(109, 'کفش بروگ تمام‌سوراخ‌کاری چرم دست‌رنگ', 'طرح وینگ‌تیپ انگلیسی اجرا شده توسط استادکاران تبریز با رنگ‌آمیزی پتینه دستی و ماندگاری مادام‌العمر.', 'assets/images/craft-formal.jpeg', '["عسلی کهربایی", "سبز یشمی چرمی"]'::jsonb, '[41, 42, 43, 44]'::jsonb, '["assets/images/craft-formal.jpeg"]'::jsonb, '[]'::jsonb, '[1, 3]'::jsonb),
(110, 'کیف دیپلمات ست چرم لوکس سراجی کارگاه', 'همراه با قفل رمزی برنجی سوییسی، یراق‌آلات آبکاری طلا و بند دوشی قابل تنظیم از چرم دوتکه تقویت‌شده.', 'assets/images/bag.jpeg', '["قهوه‌ای تیره کنیاکی", "مشکی شاین"]'::jsonb, '[]'::jsonb, '["assets/images/bag.jpeg", "assets/images/bag2.jpeg"]'::jsonb, '[]'::jsonb, '[5]'::jsonb);

-- 6. Access Links
INSERT INTO "accessLinks" ("ID", "token", "customerID", "recipientName", "phoneNumber", "authMethod", "shoeIDs", "viewingDurationMinutes", "expiresAt", "firstViewedAt", "viewingExpiresAt", "lastAccessedAt", "isActive", "status") VALUES
(1, 'LNK-9081', 1, 'مهدی مالوندی', '09929972390', 'DIRECT', '[101, 102, 103, 104, 107]'::jsonb, 120, CAST(EXTRACT(EPOCH FROM NOW()) + 86400 * 30 AS BIGINT), CAST(EXTRACT(EPOCH FROM NOW()) AS BIGINT), CAST(EXTRACT(EPOCH FROM NOW()) + 7200 AS BIGINT), CAST(EXTRACT(EPOCH FROM NOW()) AS BIGINT), true, 'ACTIVE'),
(2, 'LNK-9082', 2, 'حاج مصطفی کمالی', '09121112233', 'OTP', '[101, 103, 104, 107]'::jsonb, 60, CAST(EXTRACT(EPOCH FROM NOW()) + 86400 * 14 AS BIGINT), CAST(EXTRACT(EPOCH FROM NOW()) - 3600 AS BIGINT), CAST(EXTRACT(EPOCH FROM NOW()) + 3600 AS BIGINT), CAST(EXTRACT(EPOCH FROM NOW()) - 600 AS BIGINT), true, 'ACTIVE'),
(3, 'LNK-9083', 3, 'مهندس امید شمس', '09142223344', 'DIRECT', '[101, 102, 105, 106, 108, 109]'::jsonb, 0, CAST(EXTRACT(EPOCH FROM NOW()) + 86400 * 7 AS BIGINT), CAST(EXTRACT(EPOCH FROM NOW()) - 7200 AS BIGINT), 0, CAST(EXTRACT(EPOCH FROM NOW()) - 1800 AS BIGINT), true, 'ACTIVE'),
(4, 'LNK-9084', 4, 'سپهر نوری‌زاده', '09173334455', 'OTP', '[102, 105, 108]'::jsonb, 30, CAST(EXTRACT(EPOCH FROM NOW()) + 86400 * 2 AS BIGINT), 0, 0, 0, true, 'PENDING');
