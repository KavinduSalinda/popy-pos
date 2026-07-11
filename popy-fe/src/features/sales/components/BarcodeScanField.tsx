import { useCallback, useEffect, useRef } from 'react';
import { InputAdornment, TextField } from '@mui/material';
import QrCodeScanner from '@mui/icons-material/QrCodeScanner';

const EDITABLE_TAGS = new Set(['INPUT', 'TEXTAREA', 'SELECT']);

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
  const inputRef = useRef<HTMLInputElement>(null);
  const valueRef = useRef('');

  const submit = useCallback(async () => {
    const code = valueRef.current.trim();
    if (!code || disabled) return;
    const ok = await onScan(code);
    if (ok !== false) {
      valueRef.current = '';
      if (inputRef.current) inputRef.current.value = '';
    }
    inputRef.current?.focus();
  }, [disabled, onScan]);

  useEffect(() => {
    if (!disabled && !pauseAutoFocus) {
      inputRef.current?.focus();
    }
  }, [disabled, pauseAutoFocus]);

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
        if (pauseAutoFocus || disabled) return;
        window.setTimeout(() => {
          if (
            shouldRetainFocusElsewhere(document.activeElement, inputRef.current)
          ) {
            return;
          }
          inputRef.current?.focus();
        }, 120);
      }}
      helperText="USB scanner: focus this field and scan. Scans also work elsewhere on this page."
    />
  );
};
