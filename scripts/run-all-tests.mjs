import { createServer } from 'vite';

async function main() {
  console.log('--- Starting DYF Full Frontend Test Suite ---');
  const server = await createServer({
    server: { middlewareMode: true },
    appType: 'custom',
  });

  let totalFailed = 0;

  try {
    // 1. Admin Tests
    console.log('\n[1/2] Running Admin Test Suite (Phase 3)...');
    const adminMod = await server.ssrLoadModule('/src/admin/__tests__/index.ts');
    const adminResult = await adminMod.runAllAdminTests();

    for (const s of adminResult.suites) {
      const status = s.failed === 0 ? '✓ PASS' : '✗ FAIL';
      console.log(`  ${status} [${s.passed}/${s.total}] ${s.suite}`);
      if (s.failed > 0) {
        totalFailed += s.failed;
        for (const f of s.failures) {
          console.error(`    - Failure: ${f.name} => ${f.error}`);
        }
      }
    }

    // 2. VIP Catalog Tests
    console.log('\n[2/2] Running VIP Catalog Test Suite (Phase 4)...');
    const catalogMod = await server.ssrLoadModule('/src/catalog/__tests__/index.ts');
    const catalogResult = await catalogMod.runAllCatalogTests();

    for (const s of catalogResult.suites) {
      const status = s.failed === 0 ? '✓ PASS' : '✗ FAIL';
      console.log(`  ${status} [${s.passed}/${s.total}] ${s.suite}`);
      if (s.failed > 0) {
        totalFailed += s.failed;
        for (const f of s.failures) {
          console.error(`    - Failure: ${f.name} => ${f.error}`);
        }
      }
    }
  } catch (err) {
    console.error('Test runner fatal error:', err);
    totalFailed += 1;
  } finally {
    await server.close();
  }

  if (totalFailed > 0) {
    console.error(`\nTest suite finished with ${totalFailed} failure(s).`);
    process.exit(1);
  } else {
    console.log('\n===========================================');
    console.log('✓ All Test Suites Passed Successfully (100%)');
    console.log('===========================================');
    process.exit(0);
  }
}

main();
