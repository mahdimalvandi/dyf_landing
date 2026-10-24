/**
 * DYF Admin — Phase 3 Comprehensive Test Suite Runner
 * Runs all unit and interaction tests across Admin SPA modules.
 */

import { runAdminAuthTests } from './auth-router.test';
import { runDashboardTests } from './dashboard.test';
import { runShoesTests } from './shoes.test';
import { runCategoriesTests } from './categories.test';
import { runLinksWizardTests } from './links-wizard.test';
import { runCustomersTests } from './customers.test';
import { runToastConfirmTests } from './toast-confirm.test';

export interface SuiteSummary {
  suite: string;
  total: number;
  passed: number;
  failed: number;
  failures: { name: string; error?: string }[];
}

export async function runAllAdminTests(): Promise<{
  allPassed: boolean;
  suites: SuiteSummary[];
}> {
  const suites: SuiteSummary[] = [];

  const runners = [
    { suite: 'Auth & Router (FE-011, FE-012)', fn: runAdminAuthTests },
    { suite: 'Dashboard KPI (FE-013)', fn: runDashboardTests },
    { suite: 'Shoes Management (FE-014)', fn: runShoesTests },
    { suite: 'Categories (FE-015)', fn: runCategoriesTests },
    { suite: 'Links Wizard (FE-016)', fn: runLinksWizardTests },
    { suite: 'Customers (FE-017)', fn: runCustomersTests },
    { suite: 'Toast & Confirm (FE-018)', fn: runToastConfirmTests },
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
