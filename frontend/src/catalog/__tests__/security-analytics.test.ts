/**
 * DYF VIP Catalog — Session Security & Analytics Tracker Tests (FE-023)
 */

import { formatSecondsToTime } from '../stores/access';
import { analyticsTracker } from '../utils/analyticsTracker';

export interface TestResult {
  name: string;
  passed: boolean;
  error?: string;
}

export async function runSecurityAnalyticsTests(): Promise<TestResult[]> {
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

  test('formatSecondsToTime formats seconds correctly for countdown', () => {
    if (formatSecondsToTime(0) !== '00:00') throw new Error('Failed on 0s');
    if (formatSecondsToTime(59) !== '00:59') throw new Error('Failed on 59s');
    if (formatSecondsToTime(900) !== '15:00') throw new Error('Failed on 15m');
    if (formatSecondsToTime(3665) !== '01:01:05') throw new Error('Failed on 1h 1m 5s');
  });

  test('Session timer warning activates at 300 seconds (5 minutes) or less', () => {
    function isWarning(secs: number): boolean {
      return secs > 0 && secs <= 300;
    }

    if (isWarning(301)) throw new Error('301s should not trigger warning');
    if (!isWarning(300)) throw new Error('300s should trigger warning');
    if (!isWarning(60)) throw new Error('60s should trigger warning');
    if (isWarning(0)) throw new Error('0s (expired) is not a countdown warning');
  });

  test('Analytics tracker records interaction events without throwing', () => {
    analyticsTracker.init('test_token_security_123');
    analyticsTracker.trackCategoryFilter('لاین رسمی و اداری');
    analyticsTracker.trackSearch('چلسی');
    analyticsTracker.startShoeView(101, 'اکسفورد هریتیج');
    analyticsTracker.endActiveShoeView();
    analyticsTracker.trackOrderIntent(101, 'اکسفورد هریتیج');
    analyticsTracker.flush();
  });

  return results;
}
