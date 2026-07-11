import { describe, expect, it } from 'vitest';
import { BARCODE_MAX_LENGTH, generateProductBarcode } from './barcode';

describe('generateProductBarcode', () => {
  it('returns a non-empty code within max length', () => {
    const code = generateProductBarcode();
    expect(code.length).toBeGreaterThan(8);
    expect(code.length).toBeLessThanOrEqual(BARCODE_MAX_LENGTH);
  });

  it('incorporates sku prefix when provided', () => {
    const code = generateProductBarcode('COFFEE-01');
    expect(code.toUpperCase()).toMatch(/^COFFEE/);
  });

  it('generates distinct codes', () => {
    const a = generateProductBarcode('A');
    const b = generateProductBarcode('B');
    expect(a).not.toBe(b);
  });
});
