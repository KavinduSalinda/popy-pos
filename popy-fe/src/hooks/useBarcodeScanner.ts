import { useEffect, useRef } from 'react';

const EDITABLE_TAGS = new Set(['INPUT', 'TEXTAREA', 'SELECT']);

const isBarcodeScanInput = (target: EventTarget | null): boolean =>
  target instanceof HTMLElement && target.dataset.barcodeScan === 'true';

const isOtherEditable = (target: EventTarget | null): boolean => {
  if (!(target instanceof HTMLElement)) return false;
  if (isBarcodeScanInput(target)) return false;
  if (target.isContentEditable) return true;
  return EDITABLE_TAGS.has(target.tagName);
};

export interface UseBarcodeScannerOptions {
  /** Called when a scan completes (Enter after rapid keystrokes). */
  onScan: (code: string) => void;
  /** Disable listener (e.g. payment dialog open). */
  enabled?: boolean;
  /** Max ms between keystrokes to count as one scan. */
  maxGapMs?: number;
  /** Minimum barcode length. */
  minLength?: number;
}

/**
 * Listens for USB barcode wedge scanners (keyboard + Enter).
 * Works when the dedicated scan field is not focused.
 */
export const useBarcodeScanner = ({
  onScan,
  enabled = true,
  maxGapMs = 80,
  minLength = 2,
}: UseBarcodeScannerOptions) => {
  const bufferRef = useRef('');
  const lastKeyTimeRef = useRef(0);
  const onScanRef = useRef(onScan);

  useEffect(() => {
    onScanRef.current = onScan;
  }, [onScan]);

  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (isBarcodeScanInput(event.target) || isOtherEditable(event.target)) {
        return;
      }

      if (event.key === 'Enter') {
        const code = bufferRef.current.trim();
        bufferRef.current = '';
        if (code.length >= minLength) {
          event.preventDefault();
          onScanRef.current(code);
        }
        return;
      }

      if (
        event.key.length === 1 &&
        !event.ctrlKey &&
        !event.metaKey &&
        !event.altKey
      ) {
        const now = Date.now();
        if (now - lastKeyTimeRef.current > maxGapMs) {
          bufferRef.current = '';
        }
        bufferRef.current += event.key;
        lastKeyTimeRef.current = now;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [enabled, maxGapMs, minLength]);
};
