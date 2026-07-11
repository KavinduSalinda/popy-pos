import { describe, expect, it, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useBarcodeScanner } from './useBarcodeScanner';

describe('useBarcodeScanner', () => {
  it('calls onScan when Enter follows rapid keystrokes', () => {
    const onScan = vi.fn();
    renderHook(() => useBarcodeScanner({ onScan, maxGapMs: 200 }));

    window.dispatchEvent(
      new KeyboardEvent('keydown', { key: '1', bubbles: true }),
    );
    window.dispatchEvent(
      new KeyboardEvent('keydown', { key: '2', bubbles: true }),
    );
    window.dispatchEvent(
      new KeyboardEvent('keydown', { key: '3', bubbles: true }),
    );
    window.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }),
    );

    expect(onScan).toHaveBeenCalledWith('123');
  });

  it('ignores scans when typing in a normal input', () => {
    const onScan = vi.fn();
    renderHook(() => useBarcodeScanner({ onScan }));

    const input = document.createElement('input');
    document.body.appendChild(input);

    input.dispatchEvent(
      new KeyboardEvent('keydown', {
        key: '1',
        bubbles: true,
        cancelable: true,
      }),
    );
    input.dispatchEvent(
      new KeyboardEvent('keydown', {
        key: 'Enter',
        bubbles: true,
        cancelable: true,
      }),
    );

    expect(onScan).not.toHaveBeenCalled();
    document.body.removeChild(input);
  });
});
