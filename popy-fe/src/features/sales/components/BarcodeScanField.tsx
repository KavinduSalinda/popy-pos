import { useCallback, useEffect, useRef } from 'react';
import { InputAdornment, TextField, useMediaQuery } from '@mui/material';
import QrCodeScanner from '@mui/icons-material/QrCodeScanner';

/** Match phones / small devices where the on-screen keyboard should not pop open. */
const NARROW_MAX_WIDTH_PX = 768;

const EDITABLE_TAGS = new Set(['INPUT', 'TEXTAREA', 'SELECT']);

const isNarrowViewport = () =>
  typeof window !== 'undefined' && window.innerWidth < NARROW_MAX_WIDTH_PX;

const shouldRetainFocusElsewhere = (
  active: Element | null,
  barcodeInput: HTMLInputElement | null,
): boolean => {
  if (!active || active === barcodeInput) return false;
  if (!(active instanceof HTMLElement)) return false;
  if (active.dataset.barcodeScan === 'true') return false;
  if (active.isContentEditable) return true;
  if (EDITABLE_TAGS.has(active.tagName)) return true;
  if (active.closest('[role="combobox"], [role="listbox"], [role="option"]')) {
    return true;
  }
  if (
    active.closest(
      '.MuiAutocomplete-popper, .MuiPopover-root, .MuiModal-root, .MuiDialog-root',
    )
  ) {
    return true;
  }
  // Product grid / cart interactions — do not yank focus back to the scanner.
  if (active.closest('.MuiDataGrid-root, [data-pos-cart]')) {
    return true;
  }
  return false;
};

interface BarcodeScanFieldProps {
  onScan: (code: string) => void | Promise<boolean>;
  /** When true, do not steal focus back on blur (user is typing elsewhere). */
  pauseAutoFocus?: boolean;
  disabled?: boolean;
}

export const BarcodeScanField = ({
  onScan,
  pauseAutoFocus = false,
  disabled = false,
}: BarcodeScanFieldProps) => {
  const isNarrow = useMediaQuery(`(max-width:${NARROW_MAX_WIDTH_PX - 0.05}px)`, {
    defaultMatches: isNarrowViewport(),
    noSsr: true,
  });
  const autoFocusEnabled = !isNarrow && !pauseAutoFocus && !disabled;
  const autoFocusEnabledRef = useRef(autoFocusEnabled);
  autoFocusEnabledRef.current = autoFocusEnabled;

  const inputRef = useRef<HTMLInputElement>(null);
  const valueRef = useRef('');

  const focusIfAllowed = useCallback(() => {
    if (!autoFocusEnabledRef.current || isNarrowViewport()) return;
    inputRef.current?.focus();
  }, []);

  const submit = useCallback(async () => {
    const code = valueRef.current.trim();
    if (!code || disabled) return;
    const ok = await onScan(code);
    if (ok !== false) {
      valueRef.current = '';
      if (inputRef.current) inputRef.current.value = '';
    }
    focusIfAllowed();
  }, [disabled, focusIfAllowed, onScan]);

  useEffect(() => {
    focusIfAllowed();
  }, [focusIfAllowed, autoFocusEnabled]);

  return (
    <TextField
      inputRef={inputRef}
      size="small"
      label="Scan barcode"
      placeholder="Scan or type SKU / barcode, then Enter"
      disabled={disabled}
      fullWidth
      inputProps={{ 'data-barcode-scan': 'true' }}
      slotProps={{
        input: {
          startAdornment: (
            <InputAdornment position="start">
              <QrCodeScanner fontSize="small" color="action" />
            </InputAdornment>
          ),
        },
      }}
      onChange={(e) => {
        valueRef.current = e.target.value;
      }}
      onKeyDown={(e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          void submit();
        }
      }}
      onBlur={() => {
        if (!autoFocusEnabledRef.current || isNarrowViewport()) return;
        window.setTimeout(() => {
          if (!autoFocusEnabledRef.current || isNarrowViewport()) return;
          if (
            shouldRetainFocusElsewhere(document.activeElement, inputRef.current)
          ) {
            return;
          }
          inputRef.current?.focus();
        }, 120);
      }}
      helperText={
        isNarrow
          ? 'Tap the field to scan or type a SKU / barcode, then press Enter.'
          : 'USB scanner: focus this field and scan. Scans also work elsewhere on this page.'
      }
    />
  );
};
