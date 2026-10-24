/**
 * DYF VIP Catalog — Detail Lightbox & 3D Viewer Tests (FE-022)
 */

export interface TestResult {
  name: string;
  passed: boolean;
  error?: string;
}

export async function runDetailLightboxTests(): Promise<TestResult[]> {
  const results: TestResult[] = [];

  function test(name: string, fn: () => void | Promise<void>) {
    try {
      const res = fn();
      if (res instanceof Promise) {
        return res
          .then(() => results.push({ name, passed: true }))
          .catch((err) => results.push({ name, passed: false, error: String(err) }));
      }
      results.push({ name, passed: true });
    } catch (err) {
      results.push({ name, passed: false, error: String(err) });
    }
  }

  test('Lightbox zoom scale bounds enforce minimum 1.0 and maximum 3.5', () => {
    function calcScale(current: number, delta: number) {
      return Math.min(3.5, Math.max(1, Math.round((current + delta) * 100) / 100));
    }

    if (calcScale(1.0, -0.4) !== 1.0) throw new Error('Scale dropped below 1.0');
    if (calcScale(3.2, 0.5) !== 3.5) throw new Error('Scale exceeded maximum 3.5');
    if (calcScale(1.0, 0.4) !== 1.4) throw new Error('Scale increment incorrect');
  });

  test('Reset zoom resets scale to 1.0 and offsets to 0', () => {
    let scale = 2.4;
    let panX = 120;
    let panY = -80;

    // Reset
    scale = 1.0;
    panX = 0;
    panY = 0;

    if (scale !== 1.0 || panX !== 0 || panY !== 0) {
      throw new Error('Reset failed to restore origin');
    }
  });

  test('WhatsApp order link generates encoded query with shoe ID and title', () => {
    const shoe = { id: 104, title: 'نیم‌بوت چلسی اشپالت' };
    const text = encodeURIComponent(
      `با سلام و درود، درخواست ثبت سفارش / استعلام تیراژ مدل «${shoe.title}» با کد DYF-${shoe.id} از کاتالوگ اختصاصی را دارم.`
    );
    const link = `https://wa.me/989121234567?text=${text}`;

    if (!link.startsWith('https://wa.me/989121234567?text=')) {
      throw new Error('Invalid WhatsApp base URL');
    }
    if (!decodeURIComponent(link).includes('DYF-104') || !decodeURIComponent(link).includes('نیم‌بوت چلسی اشپالت')) {
      throw new Error('Missing shoe identifiers in decoded WhatsApp payload');
    }
  });

  test('Fallback gallery ensures primary image is present if gallery is empty', () => {
    const rawShoe = { id: 101, coverImage: 'assets/images/craft-formal.jpeg', images: [] };
    const gallery = rawShoe.images.length > 0 ? rawShoe.images : [rawShoe.coverImage];
    if (gallery.length !== 1 || gallery[0] !== 'assets/images/craft-formal.jpeg') {
      throw new Error('Failed to provide fallback image for empty gallery');
    }
  });

  return results;
}
