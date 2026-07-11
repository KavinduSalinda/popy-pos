import { useCallback, useState } from 'react';
import {
  Box,
  Button,
  Collapse,
  IconButton,
  Stack,
  Tooltip,
} from '@mui/material';
import QrCodeScanner from '@mui/icons-material/QrCodeScanner';
import AutoFixHigh from '@mui/icons-material/AutoFixHigh';
import Print from '@mui/icons-material/Print';
import type { Control, UseFormSetValue } from 'react-hook-form';
import { toast } from 'react-toastify';
import { FormTextField } from '@/components/forms';
import { BarcodeScanField } from '@/features/sales/components/BarcodeScanField';
import { BarcodePrintDialog } from '@/components/barcode';
import { generateProductBarcode } from '@/utils/barcode';
import type { ProductFormValues } from '../schema';

interface ProductBarcodeFieldProps {
  control: Control<ProductFormValues>;
  setValue: UseFormSetValue<ProductFormValues>;
  barcode: string;
  productName: string;
  sku: string;
}

export const ProductBarcodeField = ({
  control,
  setValue,
  barcode,
  productName,
  sku,
}: ProductBarcodeFieldProps) => {
  const [scanPanelOpen, setScanPanelOpen] = useState(false);
  const [printOpen, setPrintOpen] = useState(false);

  const applyBarcode = useCallback(
    (code: string) => {
      const trimmed = code.trim();
      if (!trimmed) return;
      setValue('barcode', trimmed, { shouldDirty: true, shouldValidate: true });
      toast.success('Barcode set');
      setScanPanelOpen(false);
    },
    [setValue],
  );

  const handleGenerate = () => {
    const code = generateProductBarcode(sku || undefined);
    setValue('barcode', code, { shouldDirty: true, shouldValidate: true });
    toast.success('Unique barcode generated');
  };

  const handlePrintClick = () => {
    if (!(barcode ?? '').trim()) {
      toast.error('Add or generate a barcode before printing');
      return;
    }
    setPrintOpen(true);
  };

  const printTitle = productName.trim() || 'Product';
  const printSubtitle = sku ? `SKU: ${sku}` : undefined;

  return (
    <Box>
      <Stack direction="row" spacing={1} alignItems="flex-start">
        <Box sx={{ flex: 1 }}>
          <FormTextField
            name="barcode"
            control={control}
            label="Barcode"
            placeholder="Scan, generate, or type"
            inputProps={{ 'data-barcode-scan': 'true' }}
          />
        </Box>
        <Stack direction="row" spacing={0.5} pt={0.5}>
          <Tooltip title="Scan with USB barcode reader">
            <IconButton
              size="small"
              color={scanPanelOpen ? 'primary' : 'default'}
              aria-label="Scan barcode"
              onClick={() => setScanPanelOpen((v) => !v)}
            >
              <QrCodeScanner />
            </IconButton>
          </Tooltip>
          <Tooltip title="Generate unique barcode">
            <IconButton
              size="small"
              aria-label="Generate barcode"
              onClick={handleGenerate}
            >
              <AutoFixHigh />
            </IconButton>
          </Tooltip>
          <Tooltip
            title={
              barcode?.trim()
                ? 'Print barcode label'
                : 'Enter a barcode to print'
            }
          >
            <span>
              <IconButton
                size="small"
                aria-label="Print barcode"
                disabled={!barcode?.trim()}
                onClick={handlePrintClick}
              >
                <Print />
              </IconButton>
            </span>
          </Tooltip>
        </Stack>
      </Stack>

      <Collapse in={scanPanelOpen}>
        <Box sx={{ mt: 1.5 }}>
          <BarcodeScanField onScan={applyBarcode} pauseAutoFocus={false} />
          <Button
            size="small"
            color="inherit"
            sx={{ mt: 1 }}
            onClick={() => setScanPanelOpen(false)}
          >
            Close scanner
          </Button>
        </Box>
      </Collapse>

      <BarcodePrintDialog
        open={printOpen}
        onClose={() => setPrintOpen(false)}
        barcode={(barcode ?? '').trim()}
        title={printTitle}
        subtitle={printSubtitle}
      />
    </Box>
  );
};
