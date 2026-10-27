import { test } from 'node:test';
import assert from 'node:assert/strict';
import { formatAccessDuration } from '../src/shared/utils/format.js';

test('access times use readable Persian units', () => {
  assert.equal(formatAccessDuration('4320m'), '۳ روز');
  assert.equal(formatAccessDuration('90m'), '۱ ساعت و ۳۰ دقیقه');
  assert.equal(formatAccessDuration('15m'), '۱۵ دقیقه');
  assert.equal(formatAccessDuration('none'), 'نامحدود');
  assert.equal(formatAccessDuration('unlimited'), 'نامحدود');
});
