import { useState } from 'react';
import { Box, Paper } from '@mui/material';
import { useBarcodeScanner } from '@/hooks';
import { OfflineBanner } from '@/offline/components/OfflineBanner';
import { ProductGrid } from '../components/ProductGrid';
import { CartPanel } from '../components/CartPanel';
import { PaymentDialog } from '../components/PaymentDialog';
import { usePosBarcodeScan } from '../hooks/usePosBarcodeScan';

export const PosPage = () => {
  const [paymentOpen, setPaymentOpen] = useState(false);
  const { handleScan } = usePosBarcodeScan();

  useBarcodeScanner({
    onScan: handleScan,
    enabled: !paymentOpen,
  });

  return (
    <Box>
      <OfflineBanner />
      <Box
        sx={{
          display: 'grid',
          gap: 2,
          gridTemplateColumns: { xs: '1fr', md: '1fr 360px' },
          height: { md: 'calc(100vh - 112px)' },
        }}
      >
      <Paper
        variant="outlined"
        sx={{
          p: 2,
          overflow: 'hidden',
          minHeight: 360,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <ProductGrid onBarcodeScan={handleScan} scanDisabled={paymentOpen} />
      </Paper>
      <Paper variant="outlined" sx={{ p: 2, overflow: 'hidden' }}>
        <CartPanel onCheckout={() => setPaymentOpen(true)} />
      </Paper>

      <PaymentDialog open={paymentOpen} onClose={() => setPaymentOpen(false)} />
      </Box>
    </Box>
  );
};

export default PosPage;
