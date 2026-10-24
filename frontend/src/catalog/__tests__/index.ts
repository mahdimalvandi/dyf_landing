/**
 * DYF VIP Catalog — Comprehensive Test Suite Runner (FE-019 to FE-023)
 */

import { runCatalogAccessTests } from './access.test';
import { runGateOtpTests } from './gate-otp.test';

export interface CatalogSuiteSummary {
  suite: string;
  total: number;
  passed: number;
  failed: number;
  failures: { name: string; error?: string }[];
}

export async function runAllCatalogTests(): Promise<{
  allPassed: boolean;
  suites: CatalogSuiteSummary[];
}> {
  const suites: CatalogSuiteSummary[] = [];

  const runners = [
    { suite: 'VIP Catalog Access Store & Tokens (FE-019)', fn: runCatalogAccessTests },
    { suite: 'VIP Gate, Passcode & Customer OTP (FE-020)', fn: runGateOtpTests },
  ];

  let allPassed = true;

  for (const r of runners) {
    const results = await r.fn();
    const passed = results.filter((res) => res.passed).length;
    const failed = results.filter((res) => !res.passed).length;
    const failures = results
      .filter((res) => !res.passed)
      .map((res) => ({ name: res.name, error: res.error }));

    if (failed > 0) allPassed = false;

    suites.push({
      suite: r.suite,
      total: results.length,
      passed,
      failed,
      failures,
    });
  }

  return { allPassed, suites };
}
