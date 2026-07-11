import { useMemo, useState } from 'react';
import {
  Box,
  Button,
  FormControlLabel,
  MenuItem,
  Stack,
  Switch,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from '@mui/material';
import Print from '@mui/icons-material/Print';
import { toast } from 'react-toastify';
import { Modal } from '@/components/dialogs';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { useGetCustomersQuery } from '@/features/customers/customersApi';
import { useGetPosCheckoutNotificationOptionsQuery } from '@/features/settings/settingsApi';
import { formatCurrency, getErrorMessage } from '@/utils';
import { useCreateSaleMutation } from '../salesApi';
import { clearCart, selectCartTotals, setPaymentMethod } from '../cartSlice';
import { printSaleReceipt } from '../utils/receipt';
import type { CreateSalePayload, PaymentMethod, Sale } from '../types';
import { ReceiptPreview } from './ReceiptPreview';

interface PaymentDialogProps {
  open: boolean;
  onClose: () => void;
}

const PAYMENT_METHODS: { value: PaymentMethod; label: string }[] = [
  { value: 'CASH', label: 'Cash' },
  { value: 'CARD', label: 'Card' },
  { value: 'MOBILE', label: 'Mobile' },
  { value: 'CREDIT', label: 'Credit' },
];

export const PaymentDialog = ({ open, onClose }: PaymentDialogProps) => {
  const dispatch = useAppDispatch();
  const cart = useAppSelector((s) => s.cart);
  const totals = useAppSelector(selectCartTotals);
  const [createSale, { isLoading }] = useCreateSaleMutation();
  const { data: checkoutOptions } = useGetPosCheckoutNotificationOptionsQuery(
    undefined,
    { skip: !open },
  );
  const { data: customers } = useGetCustomersQuery(
    { page: 1, pageSize: 100 },
    { skip: !open },
  );
  const [amountPaid, setAmountPaid] = useState('');
  const [sendEmail, setSendEmail] = useState(false);
  const [sendSms, setSendSms] = useState(false);
  const [completedSale, setCompletedSale] = useState<Sale | null>(null);

  const selectedCustomer = useMemo(
    () => customers?.data.find((c) => c.id === cart.customerId) ?? null,
    [customers?.data, cart.customerId],
  );

  const showEmailOption =
    checkoutOptions?.canSendEmail && Boolean(selectedCustomer?.email);
  const showSmsOption =
    checkoutOptions?.canSendSms && Boolean(selectedCustomer?.phone);

  const resetDialog = () => {
    setAmountPaid('');
    setSendEmail(false);
    setSendSms(false);
    setCompletedSale(null);
  };

  const handleClose = () => {
    resetDialog();
    onClose();
  };

  const displayAmountPaid =
    amountPaid !== '' ? amountPaid : open ? totals.total.toFixed(2) : '';

  const change =
    cart.paymentMethod === 'CASH'
      ? Math.max(0, (Number(displayAmountPaid) || 0) - totals.total)
      : 0;

  const handleConfirm = async () => {
    const payload: CreateSalePayload = {
      customerId: cart.customerId,
      items: cart.items.map((i) => ({
        productId: i.productId,
        quantity: i.quantity,
        unitPrice: i.unitPrice,
      })),
      discount: totals.discount,
      tax: totals.tax,
      paymentMethod: cart.paymentMethod,
      amountPaid: Number(displayAmountPaid) || totals.total,
      sendEmail: showEmailOption ? sendEmail : false,
      sendSms: showSmsOption ? sendSms : false,
    };
    try {
      const sale = await createSale(payload).unwrap();
      setCompletedSale(sale);
      dispatch(clearCart());
      toast.success('Sale completed');
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title={completedSale ? 'Sale complete' : 'Payment'}
      actions={
        completedSale ? (
          <>
            <Button
              startIcon={<Print />}
              onClick={() => completedSale && printSaleReceipt(completedSale)}
            >
              Print
            </Button>
            <Button variant="contained" onClick={handleClose}>
              New sale
            </Button>
          </>
        ) : (
          <>
            <Button color="inherit" onClick={handleClose}>
              Cancel
            </Button>
            <Button
              variant="contained"
              onClick={handleConfirm}
              disabled={isLoading || totals.itemCount === 0}
            >
              Confirm payment
            </Button>
          </>
        )
      }
    >
      {completedSale ? (
        <ReceiptPreview sale={completedSale} />
      ) : (
        <Stack spacing={2}>
          <Box
            sx={{
              textAlign: 'center',
              p: 2,
              borderRadius: 2,
              bgcolor: 'action.hover',
            }}
          >
            <Typography variant="body2" color="text.secondary">
              Amount due
            </Typography>
            <Typography variant="h4" color="primary">
              {formatCurrency(totals.total)}
            </Typography>
          </Box>

          <ToggleButtonGroup
            exclusive
            fullWidth
            value={cart.paymentMethod}
            onChange={(_e, value: PaymentMethod | null) =>
              value && dispatch(setPaymentMethod(value))
            }
          >
            {PAYMENT_METHODS.map((m) => (
              <ToggleButton key={m.value} value={m.value}>
                {m.label}
              </ToggleButton>
            ))}
          </ToggleButtonGroup>

          {cart.paymentMethod === 'CASH' && (
            <>
              <TextField
                select
                size="small"
                label="Quick amount"
                value=""
                onChange={(e) => setAmountPaid(e.target.value)}
              >
                {[totals.total, 50, 100, 200, 500].map((amt, idx) => (
                  <MenuItem key={idx} value={amt.toFixed(2)}>
                    {formatCurrency(amt)}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                size="small"
                type="number"
                label="Amount paid"
                value={displayAmountPaid}
                onChange={(e) => setAmountPaid(e.target.value)}
              />
              <Stack direction="row" justifyContent="space-between">
                <Typography color="text.secondary">Change</Typography>
                <Typography variant="h6">{formatCurrency(change)}</Typography>
              </Stack>
            </>
          )}

          {(showEmailOption || showSmsOption) && (
            <Box
              sx={{
                p: 1.5,
                borderRadius: 2,
                border: '1px solid',
                borderColor: 'divider',
              }}
            >
              <Typography variant="subtitle2" gutterBottom>
                Customer notification
              </Typography>
              <Stack spacing={0.5}>
                {showEmailOption && (
                  <FormControlLabel
                    control={
                      <Switch
                        checked={sendEmail}
                        onChange={(event) => setSendEmail(event.target.checked)}
                      />
                    }
                    label={`Send receipt email to ${selectedCustomer?.email}`}
                  />
                )}
                {showSmsOption && (
                  <FormControlLabel
                    control={
                      <Switch
                        checked={sendSms}
                        onChange={(event) => setSendSms(event.target.checked)}
                      />
                    }
                    label={`Send receipt SMS to ${selectedCustomer?.phone}`}
                  />
                )}
              </Stack>
            </Box>
          )}

          {checkoutOptions?.canSendEmail && !selectedCustomer && (
            <Typography variant="caption" color="text.secondary">
              Select a customer to send receipt email or SMS.
            </Typography>
          )}
        </Stack>
      )}
    </Modal>
  );
};
