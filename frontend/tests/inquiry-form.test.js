import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  normalizeDigits,
  validateIranPhoneNumber,
  formatPhoneNumberForApi,
} from '../src/landing/modules/inquiry-form.js';

describe('B2B Inquiry Form - Input Normalization & Validation', () => {
  describe('normalizeDigits', () => {
    it('should convert Persian digits to English digits', () => {
      const input = '۰۹۱۲۳۴۵۶۷۸۹';
      const output = normalizeDigits(input);
      assert.equal(output, '09123456789');
    });

    it('should convert Arabic digits to English digits', () => {
      const input = '٠٩١٢٣٤٥٦٧٨٩';
      const output = normalizeDigits(input);
      assert.equal(output, '09123456789');
    });

    it('should handle mixed digits and whitespace', () => {
      const input = ' ۰۹۱۲ 345 ۶۷۸۹ ';
      const output = normalizeDigits(input);
      assert.equal(output, '0912 345 6789');
    });

    it('should return empty string for null/undefined/empty input', () => {
      assert.equal(normalizeDigits(''), '');
      assert.equal(normalizeDigits(null), '');
      assert.equal(normalizeDigits(undefined), '');
    });
  });

  describe('validateIranPhoneNumber', () => {
    it('should accept standard 11-digit Iranian mobile numbers starting with 09', () => {
      assert.equal(validateIranPhoneNumber('09123456789'), true);
      assert.equal(validateIranPhoneNumber('09351234567'), true);
      assert.equal(validateIranPhoneNumber('09019998877'), true);
    });

    it('should accept Iranian numbers with Persian digits', () => {
      assert.equal(validateIranPhoneNumber('۰۹۱۲۳۴۵۶۷۸۹'), true);
      assert.equal(validateIranPhoneNumber('۰۹۱۹۸۷۶۵۴۳۲'), true);
    });

    it('should accept numbers with +98 prefix', () => {
      assert.equal(validateIranPhoneNumber('+989123456789'), true);
      assert.equal(validateIranPhoneNumber('+۹۸۹۱۲۳۴۵۶۷۸۹'), true);
    });

    it('should accept numbers with 98 prefix without plus', () => {
      assert.equal(validateIranPhoneNumber('989123456789'), true);
      assert.equal(validateIranPhoneNumber('۹۸۹۱۲۳۴۵۶۷۸۹'), true);
    });

    it('should accept numbers without leading 0 (10 digits starting with 9)', () => {
      assert.equal(validateIranPhoneNumber('9123456789'), true);
    });

    it('should reject invalid mobile numbers', () => {
      assert.equal(validateIranPhoneNumber(''), false);
      assert.equal(validateIranPhoneNumber('12345'), false);
      assert.equal(validateIranPhoneNumber('091234567'), false); // too short
      assert.equal(validateIranPhoneNumber('091234567890'), false); // too long
      assert.equal(validateIranPhoneNumber('02188776655'), false); // landline, not mobile
      assert.equal(validateIranPhoneNumber('08123456789'), false); // invalid prefix
      assert.equal(validateIranPhoneNumber('0912abc6789'), false); // contains letters
    });
  });

  describe('formatPhoneNumberForApi', () => {
    it('should format standard number to 09XXXXXXXXX', () => {
      assert.equal(formatPhoneNumberForApi('09123456789'), '09123456789');
    });

    it('should format Persian numbers to 09XXXXXXXXX', () => {
      assert.equal(formatPhoneNumberForApi('۰۹۱۲۳۴۵۶۷۸۹'), '09123456789');
    });

    it('should convert +98912XXXXXXX to 0912XXXXXXX', () => {
      assert.equal(formatPhoneNumberForApi('+989123456789'), '09123456789');
    });

    it('should convert 98912XXXXXXX to 0912XXXXXXX', () => {
      assert.equal(formatPhoneNumberForApi('989123456789'), '09123456789');
    });

    it('should convert 912XXXXXXX (without 0) to 0912XXXXXXX', () => {
      assert.equal(formatPhoneNumberForApi('9123456789'), '09123456789');
    });

    it('should remove hyphens and spaces', () => {
      assert.equal(formatPhoneNumberForApi('0912-345 6789'), '09123456789');
    });
  });
});
