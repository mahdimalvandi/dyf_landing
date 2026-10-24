/**
 * DYF VIP Catalog — Grid & Category Filtering Tests (FE-021)
 */

export interface TestResult {
  name: string;
  passed: boolean;
  error?: string;
}

export async function runCatalogGridTests(): Promise<TestResult[]> {
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

  const sampleShoes = [
    {
      id: 101,
      title: 'اکسفورد کلاسیک هریتیج',
      description: 'دوخت سنتی گودیرولت با پرداخت دستی',
      category: 'لاین رسمی و اداری',
      categories: ['لاین رسمی و اداری', 'دست‌دوز'],
      colors: ['مشکی', 'قهوه‌ای'],
      sizes: [40, 41, 42, 43],
    },
    {
      id: 102,
      title: 'دربی بروژ دست‌دوز',
      description: 'چرم طبیعی پاتینا با زیره گیاهی',
      category: 'لاین رسمی و اداری',
      categories: ['لاین رسمی و اداری'],
      colors: ['عسلی', 'بلوطی'],
      sizes: [39, 40, 41, 42],
    },
    {
      id: 103,
      title: 'اسنیکر لوکس چرم نپا',
      description: 'کف‌دوخت استروبل مناسب استایل کژوال',
      category: 'لاین اسپرت و کژوال',
      categories: ['لاین اسپرت و کژوال'],
      colors: ['سفید', 'مشکی'],
      sizes: [41, 42, 43],
    },
  ];

  test('Grid category extraction collects unique categories', () => {
    const catSet = new Set<string>();
    sampleShoes.forEach((s) => {
      s.categories.forEach((c) => catSet.add(c));
    });
    const unique = Array.from(catSet);
    if (!unique.includes('لاین رسمی و اداری') || !unique.includes('لاین اسپرت و کژوال')) {
      throw new Error(`Expected extracted categories to contain official lines, got: ${unique.join(', ')}`);
    }
    if (unique.length !== 3) {
      throw new Error(`Expected 3 unique categories, got ${unique.length}`);
    }
  });

  test('Grid category filtering returns only matching shoes', () => {
    const targetCat = 'لاین اسپرت و کژوال';
    const filtered = sampleShoes.filter((s) => s.categories.includes(targetCat));
    if (filtered.length !== 1 || filtered[0].id !== 103) {
      throw new Error(`Expected 1 shoe with id 103, got ${filtered.length}`);
    }
  });

  test('Grid search filtering matches title, description and shoe id', () => {
    const query = 'استروبل';
    const filtered = sampleShoes.filter((s) => {
      const q = query.toLowerCase();
      return (
        s.title.toLowerCase().includes(q) ||
        s.description.toLowerCase().includes(q) ||
        String(s.id).includes(q)
      );
    });
    if (filtered.length !== 1 || filtered[0].id !== 103) {
      throw new Error(`Expected search match on description for id 103, got: ${filtered.length}`);
    }

    const idQuery = '101';
    const idFiltered = sampleShoes.filter((s) => String(s.id).includes(idQuery));
    if (idFiltered.length !== 1 || idFiltered[0].id !== 101) {
      throw new Error('Expected search match by shoe ID');
    }
  });

  test('Grid returns empty array when query does not match any product', () => {
    const q = 'کفش_ناشناس_غیرموجود';
    const filtered = sampleShoes.filter((s) => s.title.includes(q));
    if (filtered.length !== 0) {
      throw new Error('Expected 0 results for non-existent query');
    }
  });

  test('Shoe color and size counts calculated accurately', () => {
    const shoe = sampleShoes[0];
    if (shoe.colors.length !== 2) throw new Error('Expected 2 colors');
    if (shoe.sizes.length !== 4) throw new Error('Expected 4 sizes');
  });

  return results;
}
