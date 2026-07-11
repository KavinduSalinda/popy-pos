import { Box, Divider, Stack, Typography } from '@mui/material';
import { APP_CONFIG } from '@/constants';
import { formatCurrency, formatDateTime } from '@/utils';
import { formatPaymentMethod, getSalePaymentSummary } from '../utils/receipt';
import type { Sale } from '../types';

export const ReceiptPreview = ({ sale }: { sale: Sale }) => {
  const { amountPaid, change, balanceDue } = getSalePaymentSummary(sale);

  return (
    <Box
      className="receipt-preview"
      sx={{
        fontFamily: 'monospace',
        maxWidth: 320,
        mx: 'auto',
        p: 2,
        border: '1px dashed',
        borderColor: 'divider',
        borderRadius: 2,
      }}
    >
      <Stack alignItems="center" spacing={0.5} mb={1}>
        <Typography variant="subtitle1" fontWeight={800}>
          {APP_CONFIG.name}
        </Typography>
        <Typography variant="caption">Sales Receipt</Typography>
        <Typography variant="caption">{sale.reference}</Typography>
        <Typography variant="caption">
          {formatDateTime(sale.createdAt)}
        </Typography>
      </Stack>
      <Divider sx={{ my: 1 }} />
      <Stack spacing={0.5}>
        {sale.items.map((item) => (
          <Stack
            key={String(item.id)}
            direction="row"
            justifyContent="space-between"
          >
            <Typography variant="caption">
              {item.quantity} × {item.productName}
            </Typography>
            <Typography variant="caption">
              {formatCurrency(item.total)}
            </Typography>
          </Stack>
        ))}
      </Stack>
      <Divider sx={{ my: 1 }} />
      <ReceiptRow label="Subtotal" value={formatCurrency(sale.subtotal)} />
      <ReceiptRow
        label="Discount"
        value={`- ${formatCurrency(sale.discount)}`}
      />
      <ReceiptRow label="Tax" value={formatCurrency(sale.tax)} />
      <Divider sx={{ my: 0.5 }} />
      <ReceiptRow label="Total" value={formatCurrency(sale.total)} bold />
      <ReceiptRow label="Amount paid" value={formatCurrency(amountPaid)} />
      {change > 0 && (
        <ReceiptRow label="Balance" value={formatCurrency(change)} />
      )}
      {balanceDue > 0 && (
        <ReceiptRow label="Balance due" value={formatCurrency(balanceDue)} />
      )}
      <ReceiptRow
        label="Payment"
        value={formatPaymentMethod(sale.paymentMethod)}
      />
      <Divider sx={{ my: 1 }} />
      <Typography variant="caption" display="block" textAlign="center">
        Thank you for your purchase!
      </Typography>
    </Box>
  );
};

const ReceiptRow = ({
  label,
  value,
  bold,
}: {
  label: string;
  value: string;
  bold?: boolean;
}) => (
  <Stack direction="row" justifyContent="space-between">
    <Typography variant="caption" fontWeight={bold ? 700 : 400}>
      {label}
    </Typography>
    <Typography variant="caption" fontWeight={bold ? 700 : 400}>
      {value}
    </Typography>
  </Stack>
);
