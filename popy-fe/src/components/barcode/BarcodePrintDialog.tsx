import { useMemo } from 'react';
import { Box, Button, Stack, Typography } from '@mui/material';
import Print from '@mui/icons-material/Print';
import { Modal } from '@/components/dialogs';
import {
  getBarcodeLabelDataUrl,
  printBarcodeLabel,
} from '@/utils/printBarcodeLabel';

export interface BarcodePrintDialogProps {
  open: boolean;
  onClose: () => void;
  barcode: string;
  title: string;
  subtitle?: string;
}

export const BarcodePrintDialog = ({
  open,
  onClose,
  barcode,
  title,
  subtitle,
}: BarcodePrintDialogProps) => {
  const dataUrl = useMemo(
    () => (open ? getBarcodeLabelDataUrl(barcode) : null),
    [open, barcode],
  );

  const handlePrint = () => {
    const ok = printBarcodeLabel({ barcode, title, subtitle });
    if (!ok) return;
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Print barcode label"
      maxWidth="xs"
      actions={
        <>
          <Button color="inherit" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="contained"
            startIcon={<Print />}
            disabled={!dataUrl}
            onClick={handlePrint}
          >
            Print
          </Button>
        </>
      }
    >
      <Stack spacing={2} alignItems="center" sx={{ py: 1 }}>
        <Typography variant="subtitle1" fontWeight={600} textAlign="center">
          {title}
        </Typography>
        {subtitle && (
          <Typography variant="body2" color="text.secondary">
            {subtitle}
          </Typography>
        )}
        {dataUrl ? (
          <Box
            component="img"
            src={dataUrl}
            alt={`Barcode ${barcode}`}
            sx={{ maxWidth: '100%', height: 'auto' }}
          />
        ) : (
          <Typography color="error">Invalid or empty barcode</Typography>
        )}
      </Stack>
    </Modal>
  );
};
