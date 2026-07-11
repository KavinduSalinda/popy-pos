import { describe, expect, it } from 'vitest';
import { getErrorMessage, getFieldErrors } from './error';

describe('error utilities', () => {
  it('returns string errors as-is', () => {
    expect(getErrorMessage('Network error')).toBe('Network error');
  });

  it('extracts RTK Query error messages', () => {
    expect(
      getErrorMessage({ status: 400, data: { message: 'Invalid email' } }),
    ).toBe('Invalid email');
  });

  it('returns fallback for unknown errors', () => {
    expect(getErrorMessage({})).toBe('Something went wrong. Please try again.');
  });

  it('extracts field errors from API payload', () => {
    expect(
      getFieldErrors({
        data: { errors: { email: ['Already taken'] } },
      }),
    ).toEqual({ email: ['Already taken'] });
  });
});
